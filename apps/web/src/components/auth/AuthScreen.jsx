import React from "react";
import Field from '../common/Field.jsx';
import { Building2 } from "lucide-react";

export default function AuthScreen({ mode: initialMode, onSession }) {
    const [mode, setMode] = useState(initialMode || 'login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    useEffect(() => {
      setMode(initialMode || 'login');
      setError('');
    }, [initialMode]);

    async function submit(event) {
      event.preventDefault();
      setError('');
      try {
        const payload = await api(`/auth/${mode === 'login' ? 'login' : 'signup'}`, {
          method: 'POST',
          body: JSON.stringify(form)
        });
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
        {error && <p className="error">{error}</p>}
        <button className="primary">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
        <button type="button" className="link-button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </form>
    );
}