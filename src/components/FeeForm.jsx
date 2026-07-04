import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import './FeeForm.css'; // We can reuse similar styling

const FeeForm = ({ onClose, onSubmit }) => {
  const { clients } = useClients();
  const [formData, setFormData] = useState({
    clientId: clients.length > 0 ? clients[0].id : '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    paymentMethod: 'Card'
  });

  const handleChange = (e) => {
    const value = e.target.name === 'clientId' || e.target.name === 'amount' 
      ? Number(e.target.value) 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in">
        <div className="modal-header">
          <h2>Log Payment</h2>
          <button type="button" className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Client</label>
            <select required name="clientId" className="form-input" value={formData.clientId} onChange={handleChange}>
              <option value="" disabled>Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input required type="number" name="amount" className="form-input" value={formData.amount} onChange={handleChange} placeholder="50" min="0" step="0.01" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input required type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-input" value={formData.status} onChange={handleChange}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select name="paymentMethod" className="form-input" value={formData.paymentMethod} onChange={handleChange}>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="modal-footer flex-between mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeForm;
