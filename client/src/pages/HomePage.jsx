import React, { useState, useEffect } from 'react';
import { ChatBot } from '../components/ChatBot';
import { BusinessInfoCard } from '../components/BusinessInfoCard';
import { LeadModal } from '../components/LeadModal';
import { getBusinessInfo } from '../services/api';
import { Sparkles, MessageSquare, BookOpen } from 'lucide-react';
import './HomePage.css';

export const HomePage = () => {
  const [businessData, setBusinessData] = useState(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getBusinessInfo();
        if (res.success) {
          setBusinessData(res.data);
        }
      } catch (err) {
        console.error('Failed to load business info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleOpenLeadModal = (courseName = '') => {
    setSelectedCourse(courseName);
    setIsLeadModalOpen(true);
  };

  return (
    <main className="homepage-container container">
      {/* Hero Banner */}
      <div className="home-hero">
        <div className="hero-content">
          <span className="badge badge-primary">
            <Sparkles size={14} /> AI-Powered Customer Assistant
          </span>
          <h1 className="hero-title">Welcome to ABC Academy</h1>
          <p className="hero-subtitle">
            Explore technical courses, get instant answers from our AI Business Assistant, or request a personalized call back.
          </p>
        </div>
      </div>

      {/* Main Split Layout: Left side Business Info, Right side AI Chatbot */}
      <div className="home-grid">
        <div className="grid-left">
          {loading ? (
            <div className="loading-card card">
              <p>Loading business details...</p>
            </div>
          ) : (
            <BusinessInfoCard
              businessInfo={businessData}
              onSelectCourse={(course) => handleOpenLeadModal(course)}
            />
          )}
        </div>

        <div className="grid-right">
          <div className="sticky-chatbot">
            <ChatBot onOpenLeadForm={() => handleOpenLeadModal('')} />
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        defaultRequirement={selectedCourse}
      />
    </main>
  );
};
