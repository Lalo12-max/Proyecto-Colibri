import React from 'react';
import './style/auth.css';
import { useAuth } from '../../context/AuthContext';

export function ConductorRegistro({ onRegistro, goToLogin }) {
  const [nombreCompleto, setNombreCompleto] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [fechaNac, setFechaNac] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const { registerDriver } = useAuth();

  return (
    <div>
      <h2 className="auth-title split-form-title">Crear cuenta de conductor</h2>
      <div className="auth-subtitle">Completa tus datos para comenzar a conducir.</div>
      <form
        className="split-form-content"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            const res = await registerDriver({
              nombreCompleto,
              email,
              telefono,
              fechaNacimiento: fechaNac,
              password,
            });
            onRegistro?.(res);
          } catch (e) {
            setError(e.message || 'Error en el registro.');
          }
        }}
      >
        <div className="input-wrap">
          <label className="input-label">Nombre completo</label>
          <input className="split-input" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div className="input-wrap">
          <label className="input-label">Correo</label>
          <input className="split-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </div>
        <div className="input-wrap">
          <label className="input-label">Teléfono</label>
          <input className="split-input" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+34 600 000 000" />
        </div>
        <div className="input-wrap">
          <label className="input-label">Fecha de nacimiento</label>
          <input className="split-input" type="date" value={fechaNac} onChange={(e) => setFechaNac(e.target.value)} />
        </div>
        <div className="input-wrap">
          <label className="input-label">Contraseña</label>
          <input className="split-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
        </div>
        <div className="split-actions">
          <button type="submit" className="split-submit">Crear cuenta</button>
          <div className="link-row">
        <button className="link-btn" onClick={goToLogin}>Ya tengo cuenta</button>
      </div>
          {error && <div style={{ color: 'var(--color-accent)', fontSize: 12 }}>{error}</div>}
        </div>
      </form>
      
    </div>

    
  );
}