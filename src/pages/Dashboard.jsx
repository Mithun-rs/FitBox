import React, { useState } from 'react';
import { Users, Calendar, CreditCard, Plus, Bell, Loader, X } from 'lucide-react';
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
        <div className="activity-text" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <p className="strong" style={{ margin: 0 }}>{client.name}</p>
            {client.member_id && (
              <span style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--accent-neon)',
                background: 'rgba(0,255,136,0.07)',
                border: '1px solid rgba(0,255,136,0.25)',
                borderRadius: '5px',
                padding: '0.1rem 0.45rem',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap'
              }}>
                {client.member_id}
              </span>
            )}
          </div>
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
  const { clients, fees, addClient, getNextPaymentDate, sendFeeReminder, sendingReminder } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  // Real stats
  const totalMembers = clients.length;
  const activeMembers = clients.filter(c => c.status === 'Active').length;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlyRevenue = fees
    .filter(f => {
      const d = new Date(f.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear && f.status === 'Paid';
    })
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  // Real recent activity — last 4 paid fees
  const recentActivity = [...fees]
    .filter(f => f.status === 'Paid')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const getClientName = (clientId) => {
    const c = clients.find(cl => cl.id === clientId || cl.id === (clientId));
    return c ? c.name : 'Unknown';
  };

  const upcomingReminders = clients.filter(client => {
    const dueDate = getNextPaymentDate(client.id);
    if (!dueDate) return false;
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).sort((a, b) => new Date(getNextPaymentDate(a.id)) - new Date(getNextPaymentDate(b.id)));

  const gymName = localStorage.getItem('settings_gym_name') || 'FitBox';

  return (
    <div className="dashboard animate-fade-in">
      <div className="hero-section" style={{ backgroundImage: 'linear-gradient(to right, rgba(15,17,21,0.92) 30%, rgba(15,17,21,0.55) 100%), url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-content">
          <h1>Welcome back, Admin!</h1>
          <p>Here's what's happening at {gymName} today.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center' }}>
              <Plus size={18} style={{ marginRight: '8px' }} /> Add New Client
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Members" value={totalMembers} icon={Users} />
        <StatCard title="Active Members" value={activeMembers} icon={Calendar} trend={totalMembers > 0 ? Math.round((activeMembers/totalMembers)*100) : 0} isPositive={true} />
        <StatCard title="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString('en-IN')}`} icon={CreditCard} />
      </div>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="recent-activity glass-panel">
          <div className="flex-between mb-4">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem 0' }}>No payment activity yet.</p>
            ) : recentActivity.map((fee) => (
              <div key={fee.id} className="activity-item">
                <div className="activity-dot" style={{ backgroundColor: 'var(--success)' }}></div>
                <div className="activity-text">
                  <p className="strong">Payment received</p>
                  <p className="text-sm text-muted">
                    {getClientName(fee.clientId || fee.client_id)} paid ₹{Number(fee.amount).toLocaleString('en-IN')} • {fee.date}
                  </p>
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
