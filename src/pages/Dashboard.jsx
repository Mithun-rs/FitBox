import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, CreditCard, Plus, Bell, Loader, X } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import ClientForm from '../components/ClientForm';
import './Dashboard.css';

const StatCard = ({ title, value, icon: Icon, trend, isPositive }) => (
  <div className="stat-card glass-panel">
    <div className="stat-header">
      <div className="stat-icon-wrapper">
        <Icon className="stat-icon" size={24} />
      </div>
      {trend && (
        <span className={`stat-trend ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? '+' : '-'}{trend}%
        </span>
      )}
    </div>
    <div className="stat-body">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

const ReminderRow = ({ client, getNextPaymentDate, sendFeeReminder, sendingReminder }) => {
  const dueDate = getNextPaymentDate(client.id);
  const diffDays = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  
  return (
    <div className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <div className="activity-dot" style={{ backgroundColor: isOverdue ? 'var(--danger)' : 'var(--warning)', marginTop: 0, flexShrink: 0 }}></div>
        <div className="activity-text" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <p className="strong" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</p>
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            Due: {dueDate} {isOverdue ? `(Overdue by ${Math.abs(diffDays)} days)` : `(In ${diffDays} days)`}
          </p>
        </div>
      </div>
      <button 
        className="btn btn-outline btn-sm" 
        onClick={() => sendFeeReminder(client)} 
        disabled={sendingReminder === client.id}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          borderColor: 'rgba(245, 158, 11, 0.3)', 
          color: 'var(--warning, #f59e0b)',
          opacity: sendingReminder === client.id ? 0.6 : 1,
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        {sendingReminder === client.id ? <Loader size={16} /> : <Bell size={16} />}
        {sendingReminder === client.id ? 'Sending...' : 'Send Reminder'}
      </button>
    </div>
  );
};

const Dashboard = () => {
  const { clients, addClient, getNextPaymentDate, sendFeeReminder, sendingReminder } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  const upcomingReminders = clients.filter(client => {
    const dueDate = getNextPaymentDate(client.id);
    if (!dueDate) return false;
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Due date exceeded (diffDays <= 0) or within 3 days (diffDays <= 3)
    return diffDays <= 3;
  }).sort((a, b) => new Date(getNextPaymentDate(a.id)) - new Date(getNextPaymentDate(b.id)));

  return (
    <div className="dashboard animate-fade-in">
      <div className="hero-section" style={{ backgroundImage: 'linear-gradient(to right, rgba(15, 17, 21, 0.9), rgba(15, 17, 21, 0.4)), url(/hero-bg.png)' }}>
        <div className="hero-content">
          <h1>Welcome back, Admin!</h1>
          <p>Here's what's happening at FitBox today.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center' }}>
              <Plus size={18} style={{ marginRight: '8px' }} /> Add New Client
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Members" value="1,248" icon={Users} trend="12" isPositive={true} />
        <StatCard title="Monthly Revenue" value="$42,500" icon={CreditCard} trend="2" isPositive={true} />
      </div>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="recent-activity glass-panel">
          <div className="flex-between mb-4">
            <h2>Recent Activity</h2>
            <button className="btn btn-outline btn-sm">View All</button>
          </div>
          <div className="activity-list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-text">
                  <p className="strong">New member registered</p>
                  <p className="text-sm text-muted">John Doe joined the Pro Plan • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="upcoming-reminders glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-between mb-4">
            <h2>Fee Reminders</h2>
            {upcomingReminders.length > 4 && (
              <button className="btn btn-outline btn-sm" onClick={() => setIsRemindersModalOpen(true)}>View All</button>
            )}
          </div>
          <div className="activity-list">
            {upcomingReminders.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem 0' }}>No clients have upcoming or overdue fees right now.</p>
            ) : upcomingReminders.slice(0, 4).map((client) => (
              <ReminderRow 
                key={client.id} 
                client={client} 
                getNextPaymentDate={getNextPaymentDate} 
                sendFeeReminder={sendFeeReminder} 
                sendingReminder={sendingReminder} 
              />
            ))}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ClientForm 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addClient} 
        />
      )}
      {isRemindersModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2>All Fee Reminders</h2>
              <button type="button" className="btn-icon" onClick={() => setIsRemindersModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div className="activity-list" style={{ gap: '1.5rem' }}>
                {upcomingReminders.map(client => (
                  <ReminderRow 
                    key={client.id} 
                    client={client} 
                    getNextPaymentDate={getNextPaymentDate} 
                    sendFeeReminder={sendFeeReminder} 
                    sendingReminder={sendingReminder} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
