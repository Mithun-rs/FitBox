import React, { useState } from 'react';
import { useClients } from '../context/ClientContext';
import { Plus, Edit, Trash2, Eye, Bell, Loader } from 'lucide-react';
import ClientForm from '../components/ClientForm';
import ClientDetails from '../components/ClientDetails';
import './ClientList.css';

// Avatar with initials fallback
const Avatar = ({ name }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const colors = [
    '#00ff88', '#00e5ff', '#a855f7', '#f59e0b', '#ef4444',
    '#10b981', '#3b82f6', '#ec4899', '#f97316', '#06b6d4'
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const bg = colors[colorIndex];

  return (
    <div
      className="member-avatar"
      style={{
        background: `linear-gradient(135deg, ${bg}33, ${bg}66)`,
        border: `1.5px solid ${bg}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.78rem',
        color: bg,
        letterSpacing: '0.03em',
        flexShrink: 0
      }}
    >
      {initials}
    </div>
  );
};

const ClientList = () => {
  const { clients, deleteClient, addClient, updateClient, getNextPaymentDate, fees, sendFeeReminder, sendingReminder } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.member_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || (c.plan || '').toLowerCase() === planFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || (c.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleEditSubmit = (formData) => {
    updateClient(editingClient.id, formData);
    setEditingClient(null);
  };

  const handleDelete = (client) => {
    setDeletingClient(client);
  };

  const confirmDelete = () => {
    if (deletingClient) {
      deleteClient(deletingClient.id);
      setDeletingClient(null);
    }
  };

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
            placeholder="Search by name, email, phone or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '320px' }}
          />
          <div className="filter-group">
            <select className="form-input" style={{ width: 'auto' }} value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="all">All Plans</option>
              <option value="Basic">Basic Plan</option>
              <option value="Pro">Pro Plan</option>
              <option value="VIP">VIP Plan</option>
            </select>
            <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Member ID</th>
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
                      <Avatar name={client.name} />
                      <span className="strong">{client.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="member-id-badge">{client.member_id || '—'}</span>
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
                      <button
                        className="btn-icon"
                        onClick={() => sendFeeReminder(client)}
                        title="Send WhatsApp Reminder"
                        disabled={sendingReminder === client.id}
                        style={{ opacity: sendingReminder === client.id ? 0.5 : 1 }}
                      >
                        {sendingReminder === client.id ? <Loader size={16} /> : <Bell size={16} style={{ color: 'var(--warning, #f59e0b)' }} />}
                      </button>
                      <button className="btn-icon" onClick={() => setSelectedClient(client)} title="View Profile"><Eye size={16} /></button>
                      <button className="btn-icon" onClick={() => setEditingClient(client)} title="Edit Client"><Edit size={16} style={{ color: 'var(--accent-blue)' }} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(client)} title="Delete Client"><Trash2 size={16} className="text-danger" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
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
      {editingClient && (
        <ClientForm
          onClose={() => setEditingClient(null)}
          onSubmit={handleEditSubmit}
          existingClient={editingClient}
        />
      )}
      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingClient && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '420px' }}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {/* Avatar */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(255,71,87,0.12)',
                border: '2px solid rgba(255,71,87,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)'
              }}>
                {deletingClient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Delete Client?</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                You're about to permanently delete
              </p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                {deletingClient.name}
                {deletingClient.member_id && (
                  <span style={{
                    marginLeft: '0.5rem',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '0.78rem',
                    color: 'var(--accent-neon)',
                    background: 'rgba(0,255,136,0.08)',
                    border: '1px solid rgba(0,255,136,0.25)',
                    borderRadius: '5px',
                    padding: '0.1rem 0.45rem',
                  }}>{deletingClient.member_id}</span>
                )}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                This action <strong style={{ color: 'var(--danger)' }}>cannot be undone</strong>. All data associated with this client will be removed.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setDeletingClient(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
