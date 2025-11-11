import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './style/auth.css';

export function ConductorLogin({ onLogin, goToRegistro }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const { loginDriver } = useAuth();

  const entrar = async () => {
    setError('');
    if (!email || !password) { setError('Completa correo y contraseña.'); return; }
    try {
      const res = await loginDriver(email, password);
      onLogin?.(res);
    } catch (e) {
      setError(e.message || 'Error al iniciar sesión.');
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Iniciar sesión como conductor</h2>
      <div className="auth-subtitle">Accede para publicar viajes y gestionar tus reservas.</div>
      <div className="auth-form">
        <div className="input-wrap">
          <label className="input-label">Correo</label>
          <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </div>
        <div className="input-wrap">
          <label className="input-label">Contraseña</label>
          <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" />
        </div>
        <button className="auth-btn auth-btn-primary" onClick={entrar}>Entrar</button>
        {error && <div style={{ color: '#dc2626', fontSize: 12 }}>{error}</div>}
      </div>
      <button className="link-btn" onClick={goToRegistro}>Registrarte como conductor</button>
    </div>
  );
}