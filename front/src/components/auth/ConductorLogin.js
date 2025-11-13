import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './style/auth.css';
import { useNavigate } from 'react-router-dom';

export function ConductorLogin({ onLogin, goToRegistro }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const { loginDriver } = useAuth();
  const navigate = useNavigate();

  const entrar = async () => {
    setError('');
    if (!email || !password) { setError('Completa correo y contraseña.'); return; }
    try {
      const res = await loginDriver(email, password);
      onLogin?.(res);
      navigate('/conductor/solicitudes');
    } catch (e) {
      setError(e.message || 'Error al iniciar sesión.');
    }
  };

  return (
    <div>
      <h2 className="auth-title split-form-title">Iniciar sesión como conductor</h2>
      <div className="auth-subtitle">Accede para publicar viajes y gestionar tus reservas.</div>
      <div className="split-form-content">
        <div className="input-wrap">
          <label className="input-label">Correo</label>
          <input className="split-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </div>
        <div className="input-wrap">
          <label className="input-label">Contraseña</label>
          <input className="split-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" />
        </div>
        <div className="split-actions">
          <button className="split-submit" onClick={entrar}>Entrar</button>
          <div className="link-row">
            <button className="link-btn" onClick={goToRegistro}>Crear cuenta</button>
            <button className="link-btn" onClick={() => navigate('/usuario/auth')}>¿Eres usuario?</button>
          </div>
          {error && <div style={{ color: 'var(--color-accent)', fontSize: 12 }}>{error}</div>}
        </div>
      </div>

    </div>
  );
}