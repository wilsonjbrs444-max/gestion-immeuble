import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: '📊' },
  { path: '/immeubles', label: 'Immeubles', icon: '🏢' },
  { path: '/studios', label: 'Studios', icon: '🚪' },
  { path: '/locataires', label: 'Locataires', icon: '👥' },
  { path: '/paiements', label: 'Paiements', icon: '💰' },
  { path: '/eau', label: 'Eau', icon: '💧' },
  { path: '/depenses', label: 'Dépenses', icon: '📝' },
  { path: '/rapports', label: 'Rapports', icon: '📄' },
  { path: '/profil', label: 'Profil', icon: '⚙️' },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar desktop */}
      <div style={{
        width: '240px',
        background: '#1a1a2e',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        left: menuOpen ? 0 : '-240px',
        transition: 'left 0.3s',
      }}
        className="sidebar"
      >
        <div style={{ padding: '24px 16px', borderBottom: '1px solid #ffffff20' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>🏢 GestImmo</h2>
        </div>
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleNav(item.path)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: location.pathname === item.path ? '#0f3460' : 'transparent',
                borderLeft: location.pathname === item.path ? '4px solid #e94560' : '4px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '15px',
                transition: 'background 0.2s'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          background: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 98
        }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ☰
          </button>
          <h3 style={{ margin: 0, color: '#1a1a2e' }}>
            {menuItems.find(m => m.path === location.pathname)?.label || 'GestImmo'}
          </h3>
        </div>

        {/* Page content */}
        <div style={{ padding: '20px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
