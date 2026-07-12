import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import FeeManagement from './pages/FeeManagement';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { ClientProvider } from './context/ClientContext';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ClientProvider>
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />
        <main className="main-content">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/fees" element={<FeeManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={
                <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
                  <h2 className="text-gradient">Module Coming Soon</h2>
                  <p className="text-muted mt-2">This feature is currently under development.</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </ClientProvider>
  );
};

export default App;
