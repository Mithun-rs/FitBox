import React, { createContext, useState, useContext } from 'react';

const ClientContext = createContext();

export const useClients = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex.j@example.com', phone: '555-0101', plan: 'Pro', joinDate: '2023-01-15', status: 'Active' },
    { id: 2, name: 'Maria Garcia', email: 'maria.g@example.com', phone: '555-0102', plan: 'Basic', joinDate: '2023-03-22', status: 'Active' },
    { id: 3, name: 'James Smith', email: 'james.s@example.com', phone: '555-0103', plan: 'Pro', joinDate: '2023-06-10', status: 'Inactive' },
    { id: 4, name: 'Linda Williams', email: 'linda.w@example.com', phone: '555-0104', plan: 'Basic', joinDate: '2023-08-05', status: 'Active' },
  ]);

  const [fees, setFees] = useState([
    { id: 1, clientId: 1, amount: 50, date: '2023-09-01', status: 'Paid', paymentMethod: 'Card' },
    { id: 2, clientId: 2, amount: 30, date: '2023-09-02', status: 'Paid', paymentMethod: 'Cash' },
  ]);

  const addClient = (client) => {
    setClients([...clients, { ...client, id: Date.now(), status: 'Active', joinDate: new Date().toISOString().split('T')[0] }]);
  };

  const updateClient = (id, updatedClient) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...updatedClient } : c));
  };

  const deleteClient = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const addFee = (fee) => {
    setFees([...fees, { ...fee, id: Date.now() }]);
  };

  const updateFee = (id, updatedFee) => {
    setFees(fees.map(f => f.id === id ? { ...f, ...updatedFee } : f));
  };

  const deleteFee = (id) => {
    setFees(fees.filter(f => f.id !== id));
  };

  const planDurations = {
    'Basic': 1, // 1 month
    'Pro': 3,   // 3 months
    'VIP': 6    // 6 months
  };

  const getNextPaymentDate = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const clientFees = fees.filter(f => f.clientId === clientId && f.status === 'Paid');
    let baseDate;
    
    if (clientFees.length > 0) {
      // Sort to get the most recent paid fee
      clientFees.sort((a, b) => new Date(b.date) - new Date(a.date));
      baseDate = new Date(clientFees[0].date);
    } else {
      // Fallback to join date if no fees paid yet
      baseDate = new Date(client.joinDate);
    }

    const durationMonths = planDurations[client.plan] || 1;
    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + durationMonths);
    
    return nextDate.toISOString().split('T')[0];
  };

  return (
    <ClientContext.Provider value={{ 
      clients, addClient, updateClient, deleteClient,
      fees, addFee, updateFee, deleteFee,
      getNextPaymentDate
    }}>
      {children}
    </ClientContext.Provider>
  );
};
