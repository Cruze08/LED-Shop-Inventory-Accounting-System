import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/layout.css';

export default function MainLayout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-navbar">
          <h2>LED Shop System</h2>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
