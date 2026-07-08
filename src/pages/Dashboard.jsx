import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, CreditCard, Plus } from 'lucide-react';
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

const Dashboard = () => {
  const { addClient } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      <div className="dashboard-content">
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
      </div>
      {isModalOpen && (
        <ClientForm 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addClient} 
        />
      )}
    </div>
  );
};

export default Dashboard;
