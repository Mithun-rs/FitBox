import React, { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown, User } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import './FeeForm.css';

const FeeForm = ({ onClose, onSubmit }) => {
  const { clients } = useClients();
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    paymentMethod: 'Card'
  });

  const [clientSearch, setClientSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const dropdownRef = useRef(null);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.member_id || '').toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setFormData(prev => ({ ...prev, clientId: client.id }));
    setClientSearch('');
    setDropdownOpen(false);
  };

  const handleChange = (e) => {
    const value = e.target.name === 'amount'
      ? Number(e.target.value)
      : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId) return;
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
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">

            {/* Searchable Client Dropdown */}
            <div className="form-group">
              <label className="form-label">Client</label>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                {/* Trigger button */}
                <button
                  type="button"
                  className="form-input"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '0.5rem'
                  }}
                >
                  {selectedClient ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} style={{ color: 'var(--accent-neon)', flexShrink: 0 }} />
                      <span>{selectedClient.name}</span>
                      {selectedClient.member_id && (
                        <span style={{
                          fontSize: '0.68rem',
                          background: 'rgba(0,255,136,0.1)',
                          border: '1px solid rgba(0,255,136,0.25)',
                          borderRadius: '4px',
                          padding: '0.05rem 0.35rem',
                          color: 'var(--accent-neon)',
                          fontFamily: 'monospace'
                        }}>{selectedClient.member_id}</span>
                      )}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Select a client...</span>
                  )}
                  <ChevronDown size={16} style={{
                    color: 'var(--text-muted)',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s'
                  }} />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: '#181b21',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    zIndex: 9999,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                    maxHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Search box */}
                    <div style={{
                      padding: '0.6rem 0.75rem',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search by name or ID..."
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          width: '100%'
                        }}
                      />
                    </div>

                    {/* Client list */}
                    <div style={{ overflowY: 'auto', maxHeight: '200px', background: '#181b21' }}>
                      {filteredClients.length === 0 ? (
                        <div style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: '#888',
                          fontSize: '0.85rem'
                        }}>
                          No clients found
                        </div>
                      ) : (
                        filteredClients.map(client => (
                          <div
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            style={{
                              padding: '0.6rem 0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              transition: 'background 0.15s',
                              background: selectedClient?.id === client.id
                                ? 'rgba(0,255,136,0.08)'
                                : '#181b21',
                              borderLeft: selectedClient?.id === client.id
                                ? '2px solid #00ff88'
                                : '2px solid transparent'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = selectedClient?.id === client.id ? 'rgba(0,255,136,0.08)' : '#181b21'}
                          >
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: 'rgba(0,255,136,0.12)',
                              border: '1px solid rgba(0,255,136,0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: 'var(--accent-neon)',
                              flexShrink: 0
                            }}>
                              {client.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                                {client.name}
                              </div>
                              {client.member_id && (
                                <div style={{ fontSize: '0.7rem', color: '#00ff88', fontFamily: 'monospace' }}>
                                  {client.member_id}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input required type="number" name="amount" className="form-input" value={formData.amount} onChange={handleChange} placeholder="1000" min="0" step="0.01" />
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
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!formData.clientId}>
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeForm;
