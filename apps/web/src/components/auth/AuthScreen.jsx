import React, { useEffect, useMemo, useState } from 'react';
import Field from '../common/Field.jsx';
import { Building2 } from "lucide-react";
import { api } from "../../services/api";
import { validateEmail, validatePassword, validateConfirmPassword } from "../../validators/auth.validator.js";

export default function AuthScreen({ mode: initialMode, onSession }) {
    const [mode, setMode] = useState(initialMode || 'login');
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
      setMode(initialMode || 'login');
      setError('');
      setForm({ name: '', email: '', password: '', confirmPassword: '' });
    }, [initialMode]);

    async function submit(event) {
      event.preventDefault();
      setError('');

      const emailErr = validateEmail(form.email);
      if (emailErr) {
        setError(emailErr);
        return;
      }

      const passErr = validatePassword(form.password);
      if (passErr) {
        setError(passErr);
        return;
      }

      if (mode === 'signup') {
        const confirmErr = validateConfirmPassword(form.password, form.confirmPassword);
        if (confirmErr) {
          setError(confirmErr);
          return;
        }
      }

      try {
        const payload = await api(`/auth/${mode === 'login' ? 'login' : 'signup'}`, {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (mode === 'login') {
          if (rememberMe) {
            localStorage.setItem('authSession', JSON.stringify(payload));
          } else {
            localStorage.removeItem('authSession');
          }
        }
        onSession(payload);
      } catch (err) {
        setError(err.message);
      }
    }

    return (
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand"><Building2 /> <strong>AuditExpress</strong></div>
        {mode === 'signup' && <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
        <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {mode === 'signup' && <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} />}
        {error && <p className="error">{error}</p>}
        {mode === 'login' && (
          <div className="remember-me" style={{ marginBottom: '10px' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
            <label htmlFor="rememberMe" style={{ marginLeft: '4px' }}>Remember me</label>
          </div>
        )}
        <button className="primary">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
        <button type="button" className="link-button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </form>
    );
}