import React, { useState } from 'react';
import { X } from 'lucide-react';
import './ClientForm.css';

const ClientForm = ({ onClose, onSubmit, existingClient }) => {
  const [formData, setFormData] = useState({
    name: existingClient?.name || '',
    email: existingClient?.email || '',
    phone: existingClient?.phone || '',
    plan: existingClient?.plan || 'Basic'
  });

  const isEditing = !!existingClient;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Client' : 'Add New Client'}</h2>
          <button type="button" className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input required type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input required type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="555-0199" />
            </div>
            <div className="form-group">
              <label className="form-label">Membership Plan</label>
              <select name="plan" className="form-input" value={formData.plan} onChange={handleChange}>
                <option value="Basic">Basic Plan</option>
                <option value="Pro">Pro Plan</option>
                <option value="VIP">VIP Plan</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
