import React from 'react';
import './style/auth.css';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login({ goToRegistro, onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = React.useState(null);

  const normalizeEmail = (str) => (str || '').trim().toLowerCase();
  const domainFixes = React.useMemo(() => ({
    'gnmail.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'hotmial.com': 'hotmail.com',
    'outllok.com': 'outlook.com',
    'yaho.com': 'yahoo.com',
  }), []);
  React.useEffect(() => {
    const val = normalizeEmail(email);
    const parts = val.split('@');
    if (parts.length === 2) {
      const [local, domain] = parts;
      if (domainFixes[domain]) {
        setSuggestion(`${local}@${domainFixes[domain]}`);
        return;
      }
    }
    setSuggestion(null);
  }, [email, domainFixes]);

  const aplicarSugerencia = () => {
    if (suggestion) {
      setEmail(suggestion);
      setSuggestion(null);
    }
  };

  const entrar = async () => {
    setError('');
    const safeEmail = normalizeEmail(email);
    if (!safeEmail || !password) { setError('Completa correo y contraseña.'); return; }
    if (suggestion) {
      setError(`¿Quisiste decir ${suggestion}? Corrige el correo o pulsa "Usar sugerencia".`);
      return;
    }
    try {
      const res = await loginUser(safeEmail, password);
      onLogin?.(res);
      navigate('/');
    } catch (e) {
      setError(e.message || 'Fallo de red o servidor.');
    }
  };

  return (
    <div className="split-form-content">
      <div className="split-form-title">Correo</div>
      <input
        className="split-input"
        type="email"
        placeholder="Ingresa tu correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="split-form-title">Contraseña</div>
      <input
        className="split-input"
        type="password"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="split-actions">
        {suggestion && (
          <div className="hint" style={{ color: '#c47', fontSize: 12 }}>
            ¿Quisiste decir <strong>{suggestion}</strong>?
            <button type="button" onClick={aplicarSugerencia} style={{ marginLeft: 8 }}>
              Usar sugerencia
            </button>
          </div>
        )}
        {error && <div className="error" style={{ color: 'var(--color-accent)', fontSize: 12 }}>{error}</div>}
        <button className="split-submit" onClick={entrar}>Iniciar sesión</button>
        <button className="link-btn" onClick={goToRegistro}>Crear cuenta</button>
        <button className="link-btn" onClick={() => navigate('/conductor')}>¿Eres conductor?</button>
      </div>
      {error && <div style={{ color: 'var(--color-accent)', fontSize: 12 }}>{error}</div>}
    </div>
  );
}