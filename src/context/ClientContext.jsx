import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

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
    const { data, error } = await supabase.from('clients').select('*');
    if (error) console.error("Error fetching clients:", error);
    else {
      const mappedData = data.map(client => ({
        ...client,
        joinDate: client.joinDate || client.join_date
      }));
      setClients(mappedData);
    }
  };

  const fetchFees = async () => {
    const { data, error } = await supabase.from('fees').select('*');
    if (error) console.error("Error fetching fees:", error);
    else {
      const mappedData = data.map(fee => ({
        ...fee,
        clientId: fee.clientId || fee.client_id,
        paymentMethod: fee.paymentMethod || fee.payment_method
      }));
      setFees(mappedData);
    }
  };

  const addClient = async (client) => {
    const newClient = { ...client, status: 'Active', joinDate: new Date().toISOString().split('T')[0] };
    const { data, error } = await supabase.from('clients').insert([newClient]).select();
    if (error) {
      console.error("Error adding client:", error);
    } else if (data) {
      setClients([...clients, { ...data[0], joinDate: data[0].joinDate || data[0].join_date }]);
    }
  };

  const updateClient = async (id, updatedClient) => {
    const { data, error } = await supabase.from('clients').update(updatedClient).eq('id', id).select();
    if (error) {
      console.error("Error updating client:", error);
    } else if (data) {
      setClients(clients.map(c => c.id === id ? { ...data[0], joinDate: data[0].joinDate || data[0].join_date } : c));
    }
  };

  const deleteClient = async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.error("Error deleting client:", error);
    } else {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const addFee = async (fee) => {
    const dbFee = { ...fee };
    if (dbFee.clientId) {
      dbFee.client_id = dbFee.clientId;
      delete dbFee.clientId;
    }
    const { data, error } = await supabase.from('fees').insert([dbFee]).select();
    if (error) {
      console.error("Error adding fee:", error);
    } else if (data) {
      const insertedFee = {
        ...data[0],
        clientId: data[0].clientId || data[0].client_id,
        paymentMethod: data[0].paymentMethod || data[0].payment_method
      };
      setFees([...fees, insertedFee]);
    }
  };

  const updateFee = async (id, updatedFee) => {
    const dbFee = { ...updatedFee };
    if (dbFee.clientId) {
      dbFee.client_id = dbFee.clientId;
      delete dbFee.clientId;
    }
    const { data, error } = await supabase.from('fees').update(dbFee).eq('id', id).select();
    if (error) {
      console.error("Error updating fee:", error);
    } else if (data) {
      const updatedData = {
        ...data[0],
        clientId: data[0].clientId || data[0].client_id,
        paymentMethod: data[0].paymentMethod || data[0].payment_method
      };
      setFees(fees.map(f => f.id === id ? updatedData : f));
    }
  };

  const deleteFee = async (id) => {
    const { error } = await supabase.from('fees').delete().eq('id', id);
    if (error) {
      console.error("Error deleting fee:", error);
    } else {
      setFees(fees.filter(f => f.id !== id));
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

    const clientFees = fees.filter(f => (f.client_id === clientId || f.clientId === clientId) && f.status === 'Paid');
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

    // Same message format as before
    const message = `Hello ${client.name},\n\nThis is a friendly reminder that your gym fee of ₹${feeAmount} is due on ${dueDate || 'TBD'}. Please make the payment at your earliest convenience.\n\nThank you!\nFitBox Gym`;

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

