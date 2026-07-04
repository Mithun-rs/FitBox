import React, { useState } from 'react';
import { useClients } from '../context/ClientContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FeeForm from '../components/FeeForm';
import './FeeManagement.css';

const FeeManagement = () => {
  const { fees, clients, deleteFee, addFee } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map clientId to client name
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const filteredFees = fees.filter(fee => {
    const clientName = getClientName(fee.clientId).toLowerCase();
    const matchesSearch = clientName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Overdue': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="fee-management-page animate-fade-in">
      <div className="page-header flex-between mb-6">
        <div>
          <h1>Fee Management</h1>
          <p>Track and manage client payments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Log Payment
        </button>
      </div>

      <div className="glass-panel">
        <div className="table-controls">
          <input 
            type="text" 
            className="form-input search-input" 
            placeholder="Search by client name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <div className="filter-group">
            <select 
              className="form-input" 
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map(fee => (
                <tr key={fee.id}>
                  <td>
                    <div className="member-cell">
                      <span className="strong">{getClientName(fee.clientId)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="strong">${Number(fee.amount).toFixed(2)}</span>
                  </td>
                  <td>{fee.date}</td>
                  <td>{fee.paymentMethod}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(fee.status)}`}>
                      {fee.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon" onClick={() => deleteFee(fee.id)}>
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    No fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <FeeForm 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addFee} 
        />
      )}
    </div>
  );
};

export default FeeManagement;
