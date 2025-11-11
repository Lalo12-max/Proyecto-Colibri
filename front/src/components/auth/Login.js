import React from 'react';
import './style/auth.css';

import { useAuth } from '../../context/AuthContext';

export function Login({ goToRegistro, onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const { loginUser } = useAuth();

  const entrar = async () => {
    setError('');
    if (!email || !password) { setError('Completa correo y contraseña.'); return; }
    try {
      const res = await loginUser(email, password);
      onLogin?.(res);
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
        <button className="split-submit" onClick={entrar}>Iniciar sesión</button>
        <button className="link-btn" onClick={goToRegistro}>Crear cuenta</button>
      </div>
      {error && <div style={{ color: '#f87171', fontSize: 12 }}>{error}</div>}
    </div>
  );
}