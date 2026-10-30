import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Send, User, Phone, Mail, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';
import { submitLead } from '../services/api';
import './LeadModal.css';

export const LeadModal = ({ isOpen, onClose, defaultRequirement = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    requirement: defaultRequirement || 'NEET-UG 2-Year Medical Master (Class 11 & 12)',
    learningMode: 'Classroom Coaching',
    callbackSlot: 'Morning'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage(null);
  };

  const validatePhone = (phoneStr) => {
    const cleanPhone = phoneStr.trim();
    // Validates 10-digit Indian phone numbers starting with 6, 7, 8, or 9 (with optional +91 prefix)
    const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side Validation Rules
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrorMessage('Invalid Phone Number! Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210 or +91 9876543210).');
      return;
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.requirement.trim()) {
      setErrorMessage('Please select a course interest.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        requirement: `${formData.requirement} [Mode: ${formData.learningMode}, Slot: ${formData.callbackSlot}]`
      };

      const res = await submitLead(payload);
      setSuccessMessage(res.message || 'Thank you! Your enquiry has been received. Expect a callback within 15 minutes.');
      
      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          requirement: 'NEET-UG 2-Year Medical Master (Class 11 & 12)',
          learningMode: 'Classroom Coaching',
          callbackSlot: 'Morning'
        });
      }, 3000);
    } catch (err) {
      console.error('Lead submit error:', err);
      setErrorMessage(err.message || 'Failed to submit enquiry. Please check your phone number and email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stitch-modal-backdrop" onClick={onClose}>
      <div className="stitch-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button aria-label="Close dialog" className="stitch-modal-close" onClick={onClose} type="button">
          <X size={18} />
        </button>

        {/* Left Column: Trust & Perks Sidebar */}
        <aside className="stitch-modal-sidebar">
          <div className="stitch-ambient-glow-1"></div>
          <div className="stitch-ambient-glow-2"></div>

          <div className="stitch-sidebar-content">
            <div className="stitch-sidebar-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }}>
              <span className="stitch-pulse-dot" style={{ backgroundColor: '#d97706' }}></span>
              Demo Mode • ABC Academy Admissions
            </div>

            <h3 className="stitch-sidebar-headline">
              Begin your journey to top Medical & Engineering colleges.
            </h3>
            <p className="stitch-sidebar-desc">
              Connect with our senior academic counselor for batch timings, scholarship eligibility (up to 90% via ATSE), and fee installment options.
            </p>

            <ul className="stitch-perks-list">
              <li>
                <span className="stitch-check-badge">✓</span>
                <span><strong>2 Free Trial / Demo Classes</strong> with senior IITian & Doctor faculty.</span>
              </li>
              <li>
                <span className="stitch-check-badge">✓</span>
                <span><strong>Up to 90% Merit Scholarship</strong> based on ATSE admission aptitude test.</span>
              </li>
              <li>
                <span className="stitch-check-badge">✓</span>
                <span><strong>Daily 1-on-1 Doubt Desks</strong> available 8:00 AM – 8:00 PM on campus.</span>
              </li>
              <li>
                <span className="stitch-check-badge">✓</span>
                <span><strong>All-India Test Series (AITS)</strong> with NTA CBT computer simulation.</span>
              </li>
            </ul>
          </div>

          <div className="stitch-sidebar-footer">
            <div className="stitch-helpline-box">
              <div className="stitch-helpline-icon">📞</div>
              <div>
                <p className="stitch-helpline-label">Direct Admissions Helpline</p>
                <a className="stitch-helpline-number" href="tel:+919876543210">+91 98765 43210</a>
                <p className="stitch-response-time">
                  <span className="stitch-online-dot"></span>
                  Avg. response time: &lt; 15 mins
                </p>
              </div>
            </div>

            <div className="stitch-privacy-guarantee">
              <ShieldCheck size={14} />
              <span>100% Privacy Protected. Strictly no unsolicited spam.</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Enquiry Form Section */}
        <section className="stitch-modal-main">
          <header className="stitch-form-header">
            <div className="stitch-form-badge">
              <Sparkles size={13} className="text-blue-600 animate-spin" />
              <span>Guaranteed Response &lt; 15 Mins</span>
            </div>
            <h2 className="stitch-form-title">Enquire / Get a Callback</h2>
            <p className="stitch-form-subtitle">
              Fill in your details below and our academic admissions team will reach out with customized curriculum details, fee plans, and free demo access.
            </p>
          </header>

          {successMessage ? (
            <div className="stitch-success-banner">
              <CheckCircle2 size={36} className="stitch-success-icon" />
              <div>
                <h4 className="stitch-success-title">Enquiry Submitted Successfully!</h4>
                <p className="stitch-success-desc">{successMessage}</p>
              </div>
              <button className="btn btn-primary mt-3" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="stitch-enquiry-form">
              {errorMessage && (
                <div className="stitch-error-banner">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="stitch-form-field">
                <label htmlFor="fullName">
                  <User size={13} /> Full Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="stitch-form-field">
                <label htmlFor="phoneNumber">
                  <Phone size={13} /> Phone Number (WhatsApp updates enabled) <span className="req-star">*</span>
                </label>
                <div className="stitch-phone-input-wrap">
                  <span className="stitch-country-prefix">🇮🇳 +91</span>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="stitch-form-field">
                <label htmlFor="emailAddress">
                  <Mail size={13} /> Email Address <span className="req-star">*</span>
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Course Selection */}
              <div className="stitch-form-field">
                <label htmlFor="courseInterest">
                  <BookOpen size={13} /> Course / Interest <span className="req-star">*</span>
                </label>
                <select
                  id="courseInterest"
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                >
                  <option value="NEET-UG 2-Year Medical Master (Class 11 & 12)">NEET-UG 2-Year Medical Master (Class 11 & 12) — [Sample Fee: ₹1,35,000/yr]</option>
                  <option value="JEE (Main + Advanced) 2-Year Integrated (Class 11 & 12)">JEE (Main + Advanced) 2-Year Integrated (Class 11 & 12) — [Sample Fee: ₹1,45,000/yr]</option>
                  <option value="NEET-UG 1-Year Dropper / Repeater Achiever Batch">NEET-UG 1-Year Dropper / Repeater Achiever Batch — [Sample Fee: ₹90,000]</option>
                  <option value="JEE 1-Year Dropper / Repeater Rank Booster Cohort">JEE 1-Year Dropper / Repeater Rank Booster Cohort — [Sample Fee: ₹95,000]</option>
                  <option value="Foundation & Olympiad Program (Class 9 & 10)">Foundation & Olympiad Program (Class 9 & 10) — [Sample Fee: ₹48,000/yr]</option>
                  <option value="ATSE Scholarship Registration & Counseling">ATSE Scholarship Registration & Counseling</option>
                  <option value="General Admission Enquiry">General Admission Enquiry</option>
                </select>
              </div>

              {/* Interactive Chips: Learning Mode & Callback Slot */}
              <div className="stitch-chips-grid">
                <div>
                  <span className="stitch-chips-label">Preferred Mode</span>
                  <div className="stitch-chips-row">
                    <button
                      type="button"
                      className={`stitch-chip ${formData.learningMode === 'Classroom Coaching' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, learningMode: 'Classroom Coaching' })}
                    >
                      🏫 Classroom
                    </button>
                    <button
                      type="button"
                      className={`stitch-chip ${formData.learningMode === 'Hybrid (Live + Recorded)' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, learningMode: 'Hybrid (Live + Recorded)' })}
                    >
                      💻 Hybrid
                    </button>
                  </div>
                </div>

                <div>
                  <span className="stitch-chips-label">Preferred Callback Time</span>
                  <div className="stitch-chips-row">
                    <button
                      type="button"
                      className={`stitch-chip ${formData.callbackSlot === 'Morning' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, callbackSlot: 'Morning' })}
                    >
                      ☀️ Morning (9AM-1PM)
                    </button>
                    <button
                      type="button"
                      className={`stitch-chip ${formData.callbackSlot === 'Evening' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, callbackSlot: 'Evening' })}
                    >
                      🌙 Evening (4PM-8PM)
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="stitch-form-actions">
                <button type="button" className="stitch-cancel-btn" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="stitch-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="stitch-spinner"></span>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Callback Request</span>
                      <Send size={16} className="stitch-send-icon" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

