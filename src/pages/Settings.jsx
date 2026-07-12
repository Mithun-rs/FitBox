import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Dumbbell, MessageSquare, CheckCircle } from 'lucide-react';
import './Settings.css';

const DEFAULT_GYM_NAME = 'FitBox Gym';
const DEFAULT_TEMPLATE = `Hello {name},

This is a friendly reminder that your gym fee of ₹{fee_amount} is due on {due_date}. Please make the payment at your earliest convenience.

Thank you!
{gym_name}`;

const Settings = () => {
  const [gymName, setGymName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGymName(localStorage.getItem('settings_gym_name') || DEFAULT_GYM_NAME);
    setMessageTemplate(localStorage.getItem('settings_msg_template') || DEFAULT_TEMPLATE);
  }, []);

  const handleSave = () => {
    localStorage.setItem('settings_gym_name', gymName.trim() || DEFAULT_GYM_NAME);
    localStorage.setItem('settings_msg_template', messageTemplate.trim() || DEFAULT_TEMPLATE);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setGymName(DEFAULT_GYM_NAME);
    setMessageTemplate(DEFAULT_TEMPLATE);
  };

  // Live preview: replace placeholders
  const preview = messageTemplate
    .replace(/{name}/g, 'Rahul Kumar')
    .replace(/{fee_amount}/g, '1500')
    .replace(/{due_date}/g, '2026-08-01')
    .replace(/{gym_name}/g, gymName || DEFAULT_GYM_NAME);

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header flex-between mb-6">
        <div>
          <h1>Settings</h1>
          <p>Customize your gym profile and WhatsApp reminder message.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleReset}>
            <RotateCcw size={16} /> Reset to Default
          </button>
          <button className={`btn ${saved ? 'btn-saved' : 'btn-primary'}`} onClick={handleSave}>
            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Gym Profile */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header">
            <Dumbbell size={20} className="settings-icon" />
            <h3>Gym Profile</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Gym Name</label>
            <input
              type="text"
              className="form-input"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              placeholder="e.g. FitBox Gym"
            />
            <p className="settings-hint">This name appears at the bottom of every reminder message.</p>
          </div>
        </div>

        {/* Message Template */}
        <div className="glass-panel settings-card">
          <div className="settings-card-header">
            <MessageSquare size={20} className="settings-icon" />
            <h3>WhatsApp Reminder Template</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Message Template</label>
            <textarea
              className="form-input settings-textarea"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={9}
            />
          </div>
          <div className="placeholder-tags">
            <span className="placeholder-tag">{'{name}'}</span>
            <span className="placeholder-tag">{'{fee_amount}'}</span>
            <span className="placeholder-tag">{'{due_date}'}</span>
            <span className="placeholder-tag">{'{gym_name}'}</span>
          </div>
          <p className="settings-hint" style={{ marginTop: '0.5rem' }}>
            Use the tags above in your template — they get replaced automatically when sending a reminder.
          </p>
        </div>

        {/* Live Preview */}
        <div className="glass-panel settings-card settings-preview-card">
          <div className="settings-card-header">
            <span className="preview-badge">PREVIEW</span>
            <h3>Message Preview</h3>
          </div>
          <div className="whatsapp-bubble">
            <pre className="preview-text">{preview}</pre>
            <span className="bubble-time">13:45 ✓✓</span>
          </div>
          <p className="settings-hint" style={{ marginTop: '1rem' }}>
            This is how your reminder message will look in WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
