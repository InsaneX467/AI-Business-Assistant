import React from 'react';
import { MapPin, Phone, Mail, Clock, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';
import './BusinessInfoCard.css';

export const BusinessInfoCard = ({ businessInfo, onSelectCourse }) => {
  if (!businessInfo) return null;

  return (
    <div className="business-info-container">
      {/* Hero Overview */}
      <div className="card info-hero-card">
        <span className="badge badge-primary">{businessInfo.category}</span>
        <h2 className="info-title">{businessInfo.name}</h2>
        <p className="info-description">{businessInfo.description}</p>

        <div className="info-meta-grid">
          <div className="meta-item">
            <MapPin size={16} className="meta-icon" />
            <span>{businessInfo.location}</span>
          </div>
          <div className="meta-item">
            <Clock size={16} className="meta-icon" />
            <span>{businessInfo.workingHours}</span>
          </div>
          <div className="meta-item">
            <Phone size={16} className="meta-icon" />
            <span>{businessInfo.phone}</span>
          </div>
          <div className="meta-item">
            <Mail size={16} className="meta-icon" />
            <span>{businessInfo.email}</span>
          </div>
        </div>
      </div>

      {/* Courses Offered */}
      <div className="courses-section">
        <h3 className="section-title">
          <BookOpen size={18} /> Featured Courses & Training Programs
        </h3>

        <div className="courses-grid">
          {businessInfo.services.map((course, index) => (
            <div key={index} className="card course-card">
              <div className="course-header">
                <h4 className="course-name">{course.name}</h4>
                <span className="course-price">{course.price}</span>
              </div>
              <p className="course-desc">{course.description}</p>
              <div className="course-meta">
                <span className="course-badge">Duration: {course.duration}</span>
                <span className="course-badge">Mode: {course.mode}</span>
              </div>
              <button
                className="btn btn-course-enquire"
                onClick={() => onSelectCourse(course.name)}
              >
                Enquire for {course.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="card facilities-card">
        <h3 className="section-title"><CheckCircle size={18} /> Key Features & Facilities</h3>
        <ul className="facilities-list">
          {businessInfo.facilities.map((fac, idx) => (
            <li key={idx} className="facility-item">
              <CheckCircle size={15} className="check-icon" />
              <span>{fac}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FAQs */}
      <div className="card faqs-card">
        <h3 className="section-title"><HelpCircle size={18} /> Frequently Asked Questions</h3>
        <div className="faqs-list">
          {businessInfo.faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <h4 className="faq-question">Q: {faq.question}</h4>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
