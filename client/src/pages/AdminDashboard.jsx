import React, { useState, useEffect } from 'react';
import { fetchLeads, updateLeadStatus } from '../services/api';
import {
  Users,
  Calendar,
  Database,
  RefreshCw,
  Search,
  Phone,
  Mail,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  Tag,
  Filter
} from 'lucide-react';
import './AdminDashboard.css';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Converted', 'Not Interested'];

export const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    callbackRequests: 0,
    todayLeads: 0,
    dbStatus: 'checking...'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('admin_api_key') || '');
  const [inputKey, setInputKey] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const loadLeads = async (keyOverride) => {
    const keyToUse = keyOverride !== undefined ? keyOverride : adminKey;
    setLoading(true);
    setError(null);
    setIsUnauthorized(false);
    try {
      const data = await fetchLeads(keyToUse);
      if (data.success) {
        setLeads(data.leads || []);
        setStats(data.stats || { totalLeads: 0, todayLeads: 0, dbStatus: 'connected' });
        if (keyToUse) {
          sessionStorage.setItem('admin_api_key', keyToUse);
          setAdminKey(keyToUse);
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
      if (err.status === 401) {
        setIsUnauthorized(true);
        setError('Authentication Required: Please enter valid Admin Secret Key.');
      } else {
        setError(err.message || 'Could not connect to backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleKeySubmit = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      loadLeads(inputKey.trim());
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    if (!leadId || !newStatus) return;
    setUpdatingId(leadId);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await updateLeadStatus(leadId, newStatus, adminKey);
      if (res.success) {
        setSuccessMessage(`Lead status updated to '${newStatus}' successfully!`);
        // Update local state dynamically
        setLeads((prevLeads) =>
          prevLeads.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
        );
        // Recalculate stats
        setStats((prevStats) => {
          const updatedLeads = leads.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l));
          return {
            ...prevStats,
            newLeads: updatedLeads.filter((l) => (l.status || 'New') === 'New').length,
            contactedLeads: updatedLeads.filter((l) => l.status === 'Contacted').length,
            convertedLeads: updatedLeads.filter((l) => l.status === 'Converted').length
          };
        });

        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
      setError(err.message || 'Failed to update lead status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const isCallbackRequest = (requirementStr) => {
    if (!requirementStr) return false;
    const reqLower = requirementStr.toLowerCase();
    return (
      reqLower.includes('callback') ||
      reqLower.includes('call back') ||
      reqLower.includes('phone') ||
      reqLower.includes('contact desk') ||
      reqLower.includes('counselor')
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      lead.name?.toLowerCase().includes(q) ||
      lead.phone?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.requirement?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || (lead.status || 'New') === statusFilter;

    return matchesSearch && matchesStatus;
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
      {/* Demo Mode Alert Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-700 text-[18px]">verified_user</span>
          <span>
            <strong>DEMO MODE ACTIVE:</strong> Fictional demonstration leads for ABC Academy (NEET & JEE Coaching). Test records allow live demonstration of lead status updates (<strong>New</strong> ➔ <strong>Contacted</strong> ➔ <strong>Qualified</strong> ➔ <strong>Converted</strong>).
          </span>
        </div>
        <span className="self-start sm:self-auto px-2 py-0.5 rounded bg-amber-200/80 font-bold uppercase text-[10px] tracking-wider text-amber-950 shrink-0">
          Demo Environment
        </span>
      </div>

      {/* Top Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">ABC Academy — Admissions Lead Dashboard</h1>
          <p className="admin-subtitle">
            Track student NEET & JEE course enquiries, callback requests from the AI assistant, and update admission conversion statuses.
          </p>
        </div>
        <button className="btn btn-secondary btn-refresh" onClick={() => loadLeads()} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper primary">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Leads</span>
            <span className="stat-value">{stats.totalLeads}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper new">
            <Tag size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">New Leads</span>
            <span className="stat-value">{stats.newLeads || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper callback">
            <PhoneCall size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Callback Requests</span>
            <span className="stat-value">{stats.callbackRequests || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper contacted">
            <UserCheck size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Contacted</span>
            <span className="stat-value">{stats.contactedLeads || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper converted">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Converted</span>
            <span className="stat-value">{stats.convertedLeads || 0}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="admin-controls">
        <div className="controls-left">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by customer name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={16} className="text-gray-400" />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses ({leads.length})</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st} ({leads.filter((l) => (l.status || 'New') === st).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          Database Status: <span className="stat-value-sm">{stats.dbStatus}</span>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="success-banner">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
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
            <RefreshCw size={24} className="animate-spin text-blue-600" />
            <p>Fetching leads from database...</p>
          </div>
        ) : isUnauthorized ? (
          <div className="table-empty py-10 px-4">
            <AlertCircle size={40} className="empty-icon text-amber-500" />
            <h4 className="text-lg font-bold text-gray-800 mt-2">Admin Authentication Required</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
              Access to lead management is restricted. Please enter the Admin API Key.
            </p>
            <form onSubmit={handleKeySubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto w-full">
              <input
                type="password"
                className="search-input flex-1 px-4 py-2 border rounded-lg"
                placeholder="Enter Admin Secret Key..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap px-4 py-2">
                Unlock Leads
              </button>
            </form>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="table-empty">
            <Users size={40} className="empty-icon" />
            <h4>No leads found</h4>
            <p>
              {searchQuery || statusFilter !== 'ALL'
                ? 'No customer leads match your current search/filter criteria.'
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
                  <th>Requirement / Enquiry</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => {
                  const currentStatus = lead.status || 'New';
                  const isCallback = isCallbackRequest(lead.requirement);
                  const isUpdating = updatingId === lead._id;

                  return (
                    <tr key={lead._id || index} className="animate-fade-in">
                      <td className="col-index">{index + 1}</td>
                      <td className="col-name">
                        <div className="customer-name-wrapper">
                          <span className="customer-avatar">
                            {lead.name ? lead.name[0].toUpperCase() : 'U'}
                          </span>
                          <span className="customer-name">{lead.name}</span>
                        </div>
                      </td>
                      <td className="col-contact">
                        <div className="contact-details">
                          <span className="contact-item">
                            <Phone size={13} /> {lead.phone}
                          </span>
                          <span className="contact-item">
                            <Mail size={13} /> {lead.email}
                          </span>
                        </div>
                      </td>
                      <td className="col-requirement">
                        <span className="badge badge-primary inline-flex items-center gap-1">
                          <BookOpen size={12} /> {lead.requirement}
                        </span>
                        {isCallback && (
                          <span className="callback-pill">
                            <PhoneCall size={11} /> Callback
                          </span>
                        )}
                      </td>
                      <td className="col-status">
                        <span className={`status-badge ${currentStatus.replace(' ', '-')}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="col-date">{formatDate(lead.createdAt)}</td>
                      <td className="col-action">
                        <select
                          className="status-select"
                          value={currentStatus}
                          onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                          disabled={isUpdating}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              Set: {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
