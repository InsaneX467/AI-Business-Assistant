import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LeadModal } from './components/LeadModal';
import { School, Heart } from 'lucide-react';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLeadForm={() => setIsLeadModalOpen(true)}
      />

      {/* Main Page Area */}
      <div className="app-content">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'admin' && <AdminDashboard />}
      </div>

      {/* Global Lead Modal */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="container footer-container">
          <div className="footer-left">
            <School size={18} className="footer-icon" />
            <span>ABC Academy • AI Business Assistant MVP</span>
          </div>
          <div className="footer-right">
            <span>Powered by Node.js, Express, React, MongoDB & Gemini LLM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
