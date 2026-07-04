import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings, Dumbbell, X, CreditCard } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand flex-between">
          <div className="flex-align-center" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <Dumbbell className="brand-icon" size={32} />
            <span className="brand-text text-gradient">FitBox</span>
          </div>
          {/* <button className="btn-icon mobile-close-btn" onClick={onClose}>
            <X size={24} />
          </button> */}
        </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/clients" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Clients</span>
        </NavLink>
        <NavLink to="/fees" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>Fees</span>
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {/* <div className="footer-card">
          <h4>Pro Plan</h4>
          <p>Get more features</p>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Upgrade</button>
        </div> */}
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
