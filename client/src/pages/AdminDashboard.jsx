import React, { useState, useEffect } from 'react';
import { fetchLeads } from '../services/api';
import { Users, Calendar, Database, RefreshCw, Search, Phone, Mail, BookOpen, AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ totalLeads: 0, todayLeads: 0, dbStatus: 'checking...' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeads();
      if (data.success) {
        setLeads(data.leads || []);
        setStats(data.stats || { totalLeads: 0, todayLeads: 0, dbStatus: 'connected' });
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
      setError(err.message || 'Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(q) ||
      lead.phone?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.requirement?.toLowerCase().includes(q)
    );
  });

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="admin-container container">
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Lead Management Dashboard</h1>
          <p className="admin-subtitle">View and manage captured customer leads from your website chatbot.</p>
        </div>
        <button className="btn btn-secondary btn-refresh" onClick={loadLeads} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-pulse' : ''} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper primary">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Leads</span>
            <span className="stat-value">{stats.totalLeads}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper success">
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Today's Leads</span>
            <span className="stat-value">{stats.todayLeads}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper warning">
            <Database size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Database Status</span>
            <span className="stat-value-sm">{stats.dbStatus}</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Row */}
      <div className="admin-controls">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search leads by name, phone, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error state if API fails */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Leads Table Card */}
      <div className="card table-card">
        {loading ? (
          <div className="table-loading">
            <RefreshCw size={24} className="animate-pulse" />
            <p>Fetching leads from database...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="table-empty">
            <Users size={40} className="empty-icon" />
            <h4>No leads found</h4>
            <p>
              {searchQuery
                ? 'No customer leads match your search query.'
                : 'No enquiries submitted yet. Interact with the chatbot or enquiry form to test lead creation.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Requirement / Interest</th>
                  <th>Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr key={lead._id || index} className="animate-fade-in">
                    <td className="col-index">{index + 1}</td>
                    <td className="col-name">
                      <div className="customer-name-wrapper">
                        <span className="customer-avatar">{lead.name ? lead.name[0].toUpperCase() : 'U'}</span>
                        <span className="customer-name">{lead.name}</span>
                      </div>
                    </td>
                    <td className="col-contact">
                      <div className="contact-details">
                        <span className="contact-item"><Phone size={13} /> {lead.phone}</span>
                        <span className="contact-item"><Mail size={13} /> {lead.email}</span>
                      </div>
                    </td>
                    <td className="col-requirement">
                      <span className="badge badge-primary">
                        <BookOpen size={12} /> {lead.requirement}
                      </span>
                    </td>
                    <td className="col-date">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
