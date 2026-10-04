import React from 'react';
import { Bot, LayoutDashboard, UserPlus, Sparkles, School } from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ activeTab, setActiveTab, onOpenLeadForm }) => {
  return (
    <header className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand" onClick={() => setActiveTab('home')}>
          <div className="brand-logo">
            <School size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">ABC Academy</span>
            <span className="brand-tag">AI Business Assistant</span>
          </div>
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Bot size={18} />
            <span>AI Assistant & Courses</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <LayoutDashboard size={18} />
            <span>Admin Dashboard</span>
          </button>
        </nav>

        <div className="navbar-actions">
          <button className="btn btn-primary" onClick={onOpenLeadForm}>
            <UserPlus size={16} />
            <span>Enquire / Get Call Back</span>
          </button>
        </div>
      </div>
    </header>
  );
};
