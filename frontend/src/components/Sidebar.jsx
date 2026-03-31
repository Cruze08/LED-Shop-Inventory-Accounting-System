import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        ⚡ LED Shop App
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink 
          to="/inventory" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Package size={20} />
          Inventory
        </NavLink>
        <NavLink 
          to="/sales" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} />
          Sales
        </NavLink>
      </nav>
      <div style={{ marginTop: 'auto', padding: '1rem' }}>
        <button className="btn btn-outline" style={{width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'white'}}>
          <Settings size={16} style={{marginRight: '0.5rem'}} /> Settings
        </button>
      </div>
    </div>
  );
}
