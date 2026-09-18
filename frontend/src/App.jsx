import React, { useState, useEffect } from 'react';
import './App.css';

const ROLES = [
  'AI Engineer',
  'Backend Developer',
  'Business Analyst',
  'Chartered Accountant',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Financial Analyst',
  'Frontend Developer',
  'HR Manager',
  'Marketing Manager',
  'Product Manager',
  'Software Engineer'
];

const CITIES = [
  'Bangalore',
  'Delhi NCR',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Remote'
];

const INDUSTRIES = [
  'Product Based',
  'FinTech',
  'E-Commerce',
  'EdTech',
  'IT Services',
  'Consulting',
  'Manufacturing'
];

const EDUCATIONS = ['BTech', 'MTech', 'MBA', 'PhD'];
const COLLEGE_TIERS = ['Tier 1', 'Tier 2', 'Tier 3'];
const COMPANY_SIZES = ['MNC', 'Mid-size', 'Startup'];

const PRESETS = [
  {
    title: '🚀 SDE 1 (Tier 1 Grad)',
    data: {
      job_role: 'Software Engineer',
      city: 'Bangalore',
      education: 'BTech',
      college_tier: 'Tier 1',
      industry: 'Product Based',
      company_size: 'MNC',
      years_experience: 1.0,
      performance_rating: 4.2,
      num_skills: 6
    }
  },
  {
    title: '🧠 Senior Data Scientist',
    data: {
      job_role: 'Data Scientist',
      city: 'Bangalore',
      education: 'MTech',
      college_tier: 'Tier 1',
      industry: 'FinTech',
      company_size: 'MNC',
      years_experience: 5.5,
      performance_rating: 4.4,
      num_skills: 9
    }
  },
  {
    title: '⚡ Lead AI Engineer',
    data: {
      job_role: 'AI Engineer',
      city: 'Remote',
      education: 'MTech',
      college_tier: 'Tier 1',
      industry: 'Product Based',
      company_size: 'MNC',
      years_experience: 7.0,
      performance_rating: 4.7,
      num_skills: 10
    }
  },
  {
    title: '📊 Product Manager',
    data: {
      job_role: 'Product Manager',
      city: 'Delhi NCR',
      education: 'MBA',
      college_tier: 'Tier 1',
      industry: 'FinTech',
      company_size: 'Startup',
      years_experience: 4.0,
      performance_rating: 4.0,
      num_skills: 7
    }
  }
];

export default function App() {
  const [apiUrl, setApiUrl] = useState('https://salary-prediction-api-rv5j.onrender.com');
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [formData, setFormData] = useState({
    job_role: 'Software Engineer',
    city: 'Bangalore',
    education: 'BTech',
    college_tier: 'Tier 1',
    industry: 'Product Based',
    company_size: 'MNC',
    years_experience: 3.5,
    performance_rating: 4.0,
    num_skills: 6
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check health on load and when apiUrl changes
  useEffect(() => {
    checkHealth();
  }, [apiUrl]);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${apiUrl}/`);
      if (res.ok) {
        setIsApiOnline(true);
      } else {
        setIsApiOnline(false);
      }
    } catch {
      setIsApiOnline(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const applyPreset = (presetData) => {
    setFormData(presetData);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      years_experience: parseFloat(formData.years_experience),
      performance_rating: parseFloat(formData.performance_rating),
      num_skills: parseInt(formData.num_skills, 10)
    };

    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${response.status})`);
      }

      const data = await response.json();
      setPrediction(data);
      setIsApiOnline(true);
    } catch (err) {
      setError(
        err.message ||
        'Failed to connect to the backend server. Make sure uvicorn is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Currency helpers
  const formatInLakhs = (amt) => {
    if (!amt) return '';
    const inLakhs = amt / 100000;
    if (inLakhs >= 100) {
      return `₹${(inLakhs / 100).toFixed(2)} Cr`;
    }
    return `₹${inLakhs.toFixed(2)} LPA`;
  };

  const formatRupees = (amt) => {
    if (!amt) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const monthlyGross = prediction ? Math.round(prediction.predicted_total_ctc / 12) : 0;
  const estimatedInHand = prediction ? Math.round((prediction.predicted_total_ctc * 0.75) / 12) : 0;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Salaria ML</h1>
            <p className="brand-subtitle">India Tech & Executive Compensation Estimator</p>
          </div>
        </div>

        <div className="header-status">
          <span className={`status-dot ${isApiOnline ? 'online' : 'offline'}`} />
          <span>{isApiOnline ? 'Backend API Active' : 'Backend Disconnected'}</span>
        </div>
      </header>

      {/* Endpoint Bar */}
      <div className="endpoint-bar">
        <span>Backend Endpoint:</span>
        <input
          type="text"
          className="endpoint-input"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="http://localhost:8000"
        />
        <button className="endpoint-btn" onClick={checkHealth}>
          Test Ping
        </button>
      </div>

      {/* Quick Presets */}
      <div className="presets-section">
        <div className="presets-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Presets
        </div>
        <div className="presets-grid">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="preset-btn"
              onClick={() => applyPreset(p.data)}
              type="button"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form & Output */}
      <div className="main-grid">
        {/* Left Side: Input Form */}
        <div className="form-card">
          <h2 className="card-title">Candidate & Role Profile</h2>
          <p className="card-desc">
            Adjust candidate credentials, skill depth, and organization attributes to evaluate market benchmark CTC.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Target Job Role</label>
                <div className="select-wrapper">
                  <select
                    value={formData.job_role}
                    onChange={(e) => handleInputChange('job_role', e.target.value)}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Base Location</label>
                <div className="select-wrapper">
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Highest Education</label>
                <div className="select-wrapper">
                  <select
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                  >
                    {EDUCATIONS.map((edu) => (
                      <option key={edu} value={edu}>
                        {edu}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Alma Mater Tier</label>
                <div className="select-wrapper">
                  <select
                    value={formData.college_tier}
                    onChange={(e) => handleInputChange('college_tier', e.target.value)}
                  >
                    {COLLEGE_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Industry Domain</label>
                <div className="select-wrapper">
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Company Classification</label>
                <div className="select-wrapper">
                  <select
                    value={formData.company_size}
                    onChange={(e) => handleInputChange('company_size', e.target.value)}
                  >
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>
            </div>

            <div className="form-section-title">Metrics & Quantitative Parameters</div>

            {/* Experience Slider */}
            <div className="range-container">
              <div className="field-label">
                <span>Years of Professional Experience</span>
                <span className="field-badge">{formData.years_experience} Years</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={formData.years_experience}
                onChange={(e) => handleInputChange('years_experience', e.target.value)}
              />
              <div className="range-labels">
                <span>Fresher (0)</span>
                <span>Mid (10)</span>
                <span>Senior/Staff (25)</span>
              </div>
            </div>

            {/* Performance Rating Slider */}
            <div className="range-container">
              <div className="field-label">
                <span>Performance Rating</span>
                <span className="field-badge">{formData.performance_rating} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={formData.performance_rating}
                onChange={(e) => handleInputChange('performance_rating', e.target.value)}
              />
              <div className="range-labels">
                <span>1.0 (Low)</span>
                <span>3.0 (Meets Expectations)</span>
                <span>5.0 (Top Exceeds)</span>
              </div>
            </div>

            {/* Num Skills Slider */}
            <div className="range-container">
              <div className="field-label">
                <span>Core Technical / Domain Skills Count</span>
                <span className="field-badge">{formData.num_skills} Skills</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={formData.num_skills}
                onChange={(e) => handleInputChange('num_skills', e.target.value)}
              />
              <div className="range-labels">
                <span>1 Skill</span>
                <span>7 Skills</span>
                <span>15+ Skills</span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Computing Prediction Pipeline...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Predict Expected Total CTC</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Prediction Output */}
        <div className="results-card">
          <h2 className="card-title">Estimated Compensation</h2>

          {error && (
            <div className="error-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>{error}</div>
            </div>
          )}

          {prediction ? (
            <>
              <div className="results-hero">
                <div className="results-badge">
                  <span className="status-dot online" /> Model Forecast
                </div>
                <div className="salary-main-val">
                  {formatInLakhs(prediction.predicted_total_ctc)}
                </div>
                <div className="salary-sub-val">
                  {formatRupees(prediction.predicted_total_ctc)} / year
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <div className="breakdown-label">Gross Monthly</div>
                  <div className="breakdown-value">{formatRupees(monthlyGross)}</div>
                  <div className="breakdown-hint">Before statutory deductions</div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label">Estimated In-Hand</div>
                  <div className="breakdown-value">{formatRupees(estimatedInHand)}</div>
                  <div className="breakdown-hint">Approx ~75% take-home</div>
                </div>
              </div>

              {/* Note from Model */}
              <div className="model-info-box">
                <strong>Model Note:</strong>{' '}
                {prediction.note ||
                  'Prediction reflects standard compensation packages. High-equity or outlier compensation structures are out of scope.'}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <div className="empty-title">No Prediction Yet</div>
              <div className="empty-desc">
                Select your profile details on the left and click &quot;Predict Expected Total CTC&quot; to run the machine learning model.
              </div>
            </div>
          )}

          {/* Architecture / Pipeline info */}
          <div className="model-info-box">
            <div>
              <strong>Architecture:</strong> Scikit-learn Pipeline with ColumnTransformer (OneHotEncoder for categorical features, OrdinalEncoder for education & tier) + Linear Regression fitted on log1p-transformed target.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
