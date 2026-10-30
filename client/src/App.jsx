import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LeadModal } from './components/LeadModal';
import { getBusinessInfo } from './services/api';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [businessProfile, setBusinessProfile] = useState(null);

  useEffect(() => {
    getBusinessInfo()
      .then((res) => {
        if (res.success && res.data) {
          setBusinessProfile(res.data);
        }
      })
      .catch((err) => {
        console.warn('[App] Could not fetch business info:', err.message);
      });
  }, []);

  const handleOpenLeadForm = (courseName = '') => {
    setSelectedCourse(courseName);
    setIsLeadModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLeadForm={() => handleOpenLeadForm('')}
        businessProfile={businessProfile}
      />

      {/* Main Single-Frame Page Content */}
      <div className="app-content">
        {activeTab === 'chat' && (
          <HomePage onNavigate={setActiveTab} businessProfile={businessProfile} />
        )}
        {activeTab === 'courses' && (
          <CoursesPage onSelectCourse={handleOpenLeadForm} businessProfile={businessProfile} />
        )}
        {activeTab === 'admin' && <AdminDashboard />}
      </div>

      {/* Global Lead Modal */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        defaultRequirement={selectedCourse}
      />
    </div>
  );
}

export default App;
