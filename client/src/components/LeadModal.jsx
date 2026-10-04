import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Send, User, Phone, Mail, BookOpen } from 'lucide-react';
import { submitLead } from '../services/api';
import './LeadModal.css';

export const LeadModal = ({ isOpen, onClose, defaultRequirement = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    requirement: defaultRequirement || 'Full Stack Development'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side Validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your name (at least 2 characters).');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.requirement.trim()) {
      setErrorMessage('Please specify your course interest or query.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitLead(formData);
      setSuccessMessage(res.message || 'Thank you! Your enquiry has been received. Our team will contact you shortly.');
      
      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          requirement: 'Full Stack Development'
        });
      }, 1000);
    } catch (err) {
      console.error('Lead submit error:', err);
      setErrorMessage(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Enquire / Get a Callback</h3>
            <p className="modal-subtitle">Fill in your details below and our team will reach out to you.</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {successMessage ? (
          <div className="modal-success-state">
            <CheckCircle2 size={48} className="success-icon" />
            <h4 className="success-title">Enquiry Submitted!</h4>
            <p className="success-text">{successMessage}</p>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="lead-form">
            {errorMessage && (
              <div className="form-error-banner">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name"><User size={14} /> Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone"><Phone size={14} /> Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email"><Mail size={14} /> Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirement"><BookOpen size={14} /> Course / Interest</label>
              <select
                id="requirement"
                name="requirement"
                value={formData.requirement}
                onChange={handleChange}
              >
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Data Science">Data Science</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="General Admission Enquiry">General Admission Enquiry</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Enquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
