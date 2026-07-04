import React, { useState } from 'react';
import { useClients } from '../context/ClientContext';
import { Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import ClientForm from '../components/ClientForm';
import ClientDetails from '../components/ClientDetails';
import './ClientList.css';

const ClientList = () => {
  const { clients, deleteClient, addClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="client-list-page animate-fade-in">
      <div className="page-header flex-between mb-6">
        <div>
          <h1>Client Management</h1>
          <p>Manage your gym members and their subscriptions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Client
        </button>
      </div>

      <div className="glass-panel">
        <div className="table-controls">
          <input 
            type="text" 
            className="form-input search-input" 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <div className="filter-group">
            <select className="form-input" style={{ width: 'auto' }}>
              <option value="all">All Plans</option>
              <option value="pro">Pro Plan</option>
              <option value="basic">Basic Plan</option>
            </select>
            <select className="form-input" style={{ width: 'auto' }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="member-cell">
                      <img src="/avatar.png" alt={client.name} className="member-avatar" />
                      <span className="strong">{client.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <span>{client.email}</span>
                      <span className="text-sm text-muted">{client.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-warning">{client.plan}</span>
                  </td>
                  <td>{client.joinDate}</td>
                  <td>
                    <span className={`badge ${client.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon" onClick={() => setSelectedClient(client)} title="View Profile"><Eye size={16} /></button>
                      <button className="btn-icon"><Edit size={16} /></button>
                      <button className="btn-icon" onClick={() => deleteClient(client.id)}><Trash2 size={16} className="text-danger" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <ClientForm 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addClient} 
        />
      )}
      {selectedClient && (
        <ClientDetails 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}
    </div>
  );
};

export default ClientList;
