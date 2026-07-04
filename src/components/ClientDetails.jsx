import React from 'react';
import { X, Calendar } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import './ClientDetails.css';

const ClientDetails = ({ client, onClose }) => {
  const { fees, getNextPaymentDate } = useClients();

  const clientFees = fees
    .filter(f => f.clientId === client.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
    
  const lastPaidFee = clientFees.find(f => f.status === 'Paid');
  const lastPaymentDate = lastPaidFee ? lastPaidFee.date : 'None';
  const nextPaymentDate = getNextPaymentDate(client.id);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Overdue': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="modal-overlay client-details-modal">
      <div className="modal-content glass-panel animate-fade-in">
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>{client.name}</h2>
            <span className="text-sm text-muted">{client.email} | {client.phone}</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          
          <div className="client-summary">
            <div className="summary-item">
              <span className="label">Package</span>
              <span className="value text-gradient">{client.plan} Plan</span>
            </div>
            <div className="summary-item">
              <span className="label">Last Payment</span>
              <span className="value">{lastPaymentDate}</span>
            </div>
            <div className="summary-item">
              <span className="label">Next Due Date</span>
              <span className="value text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={16} /> {nextPaymentDate}
              </span>
            </div>
          </div>

          <div className="fee-history">
            <h3>Fee Payment History</h3>
            {clientFees.length > 0 ? (
              <div className="history-list">
                {clientFees.map(fee => (
                  <div key={fee.id} className="history-item">
                    <div className="history-info">
                      <span className="history-amount">${Number(fee.amount).toFixed(2)}</span>
                      <span className="history-date">{fee.date} • {fee.paymentMethod}</span>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(fee.status)}`}>
                      {fee.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                No fee history available for this client.
              </div>
            )}
          </div>

        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
