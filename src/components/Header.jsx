import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { clients, getNextPaymentDate } = useClients();
  const [showNotifications, setShowNotifications] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueClients = clients.filter(client => {
    const nextDateStr = getNextPaymentDate(client.id);
    if (!nextDateStr) return false;
    const nextDate = new Date(nextDateStr);
    return nextDate < today;
  });

  return (
    <header className="header glass-panel">
      <div className="header-left">
         <button className="btn-icon mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button> 
        {/* <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search clients, classes..." className="search-input" />
        </div> */}
      </div>
      
      <div className="header-right">
        <div className="position-relative">
          <button className="btn-icon position-relative" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {overdueClients.length > 0 && <span className="notification-dot"></span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown glass-panel animate-fade-in">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <span className="badge badge-danger">{overdueClients.length}</span>
              </div>
              <div className="dropdown-body">
                {overdueClients.length > 0 ? (
                  overdueClients.map(client => (
                    <div key={client.id} className="notification-item">
                      <div className="notification-icon">⚠️</div>
                      <div className="notification-content">
                        <p className="strong">{client.name} is overdue</p>
                        <p className="text-sm text-muted">Due: {getNextPaymentDate(client.id)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile">
          <img src="/avatar.png" alt="Admin" className="avatar" />
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
