import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebaseClient';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

const ClientContext = createContext();

export const useClients = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchFees();
  }, []);

  const fetchClients = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'clients'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Loaded clients:', data.map(c => ({ id: c.id, name: c.name, member_id: c.member_id })));

      // Backfill member_id for clients that don't have one yet (in-memory only)
      let counter = 1;
      const withIds = data.map(client => {
        if (client.member_id) return client;
        const id = `FBX-${String(counter++).padStart(4, '0')}`;
        return { ...client, member_id: id };
      });
      setClients(withIds);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchFees = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'fees'));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Loaded fees:', data.map(f => ({ id: f.id, clientId: f.clientId, amount: f.amount })));
      setFees(data);
    } catch (error) {
      console.error("Error fetching fees:", error);
    }
  };

  const generateMemberId = (existingClients) => {
    // Find the highest existing FBX number
    const nums = existingClients
      .map(c => c.member_id)
      .filter(id => id && id.startsWith('FBX-'))
      .map(id => parseInt(id.replace('FBX-', ''), 10))
      .filter(n => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `FBX-${String(next).padStart(4, '0')}`;
  };

  const addClient = async (client) => {
    try {
      const member_id = generateMemberId(clients);
      const newClient = {
        ...client,
        member_id,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      const docRef = await addDoc(collection(db, 'clients'), newClient);
      setClients(prev => [...prev, { id: docRef.id, ...newClient }]);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const updateClient = async (id, updatedClient) => {
    try {
      await updateDoc(doc(db, 'clients', id), updatedClient);
      setClients(prev =>
        prev.map(c => c.id === id ? { ...c, ...updatedClient } : c)
      );
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const deleteClient = async (id) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const addFee = async (fee) => {
    try {
      // Attach client name and member_id to the fee so we never need a lookup
      const client = clients.find(c => c.id === fee.clientId);
      const enrichedFee = {
        ...fee,
        clientName: client?.name || '',
        member_id: client?.member_id || ''
      };
      const docRef = await addDoc(collection(db, 'fees'), enrichedFee);
      setFees(prev => [...prev, { id: docRef.id, ...enrichedFee }]);
    } catch (error) {
      console.error("Error adding fee:", error);
    }
  };


  const updateFee = async (id, updatedFee) => {
    try {
      await updateDoc(doc(db, 'fees', id), updatedFee);
      setFees(prev =>
        prev.map(f => f.id === id ? { ...f, ...updatedFee } : f)
      );
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };

  const deleteFee = async (id) => {
    try {
      await deleteDoc(doc(db, 'fees', id));
      setFees(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error("Error deleting fee:", error);
    }
  };

  const planDurations = {
    'Basic': 1, // 1 month
    'Pro': 3,   // 3 months
    'VIP': 6    // 6 months
  };

  const getNextPaymentDate = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const clientFees = fees.filter(f =>
      (f.client_id === clientId || f.clientId === clientId) && f.status === 'Paid'
    );
    let baseDate;

    if (clientFees.length > 0) {
      clientFees.sort((a, b) => new Date(b.date) - new Date(a.date));
      baseDate = new Date(clientFees[0].date);
    } else {
      baseDate = new Date(client.joinDate || client.join_date);
    }

    const durationMonths = planDurations[client.plan] || 1;
    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + durationMonths);

    return nextDate.toISOString().split('T')[0];
  };

  const [sendingReminder, setSendingReminder] = useState(null);

  const sendFeeReminder = (client) => {
    setSendingReminder(client.id);

    const dueDate = getNextPaymentDate(client.id);

    const clientFees = fees.filter(f => f.client_id === client.id || f.clientId === client.id);
    clientFees.sort((a, b) => new Date(b.date) - new Date(a.date));
    const feeAmount = clientFees.length > 0 ? clientFees[0].amount : 0;

    // Clean phone number and add India country code if missing
    const cleanPhone = (client.phone || '').replace(/\D/g, '');
    const toPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    // Read settings from localStorage (set in Settings page)
    const gymName = localStorage.getItem('settings_gym_name') || 'FitBox Gym';
    const template = localStorage.getItem('settings_msg_template') ||
      `Hello {name},\n\nThis is a friendly reminder that your gym fee of ₹{fee_amount} is due on {due_date}. Please make the payment at your earliest convenience.\n\nThank you!\n{gym_name}`;

    // Replace placeholders with actual values
    const message = template
      .replace(/{name}/g, client.name)
      .replace(/{fee_amount}/g, feeAmount)
      .replace(/{due_date}/g, dueDate || 'TBD')
      .replace(/{gym_name}/g, gymName);

    // Open WhatsApp with pre-filled message — user sends it manually
    const whatsappUrl = `https://wa.me/${toPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setSendingReminder(null);
  };

  return (
    <ClientContext.Provider value={{
      clients, addClient, updateClient, deleteClient,
      fees, addFee, updateFee, deleteFee,
      getNextPaymentDate,
      sendFeeReminder, sendingReminder
    }}>
      {children}
    </ClientContext.Provider>
  );
};
