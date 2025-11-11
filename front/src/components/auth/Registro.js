import React from 'react';
import './style/auth.css';
import { useAuth } from '../../context/AuthContext';

export function Registro({ onRegistro, goToLogin }) {
  const [nombreCompleto, setNombreCompleto] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [telefono, setTelefono] = React.useState(''); // opcional
  const [fechaNac, setFechaNac] = React.useState(''); // opcional
  const [error, setError] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { registerUser } = useAuth();

  const crear = async () => {
    setError('');
    if (!nombreCompleto || !email || !password) {
      setError('Completa nombre, correo y contraseña.');
      return;
    }
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) { setError('Correo inválido.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }

    // Separar nombre y apellidos desde nombreCompleto
    const parts = (nombreCompleto || '').trim().split(/\s+/);
    const nombre = parts.shift() || '';
    const apellidos = parts.join(' ') || '';

    try {
      await registerUser({
        email,
        password,
        nombre,
        apellidos,
        telefono, // opcional
        fechaNacimiento: fechaNac, // opcional
      });
      onRegistro?.({ nombre, apellidos, email, telefono, fechaNacimiento: fechaNac });
      goToLogin?.();
    } catch (e) {
      setError(e.message || 'Fallo de red o servidor.');
    }
  };

  return (
    <div className="split-form-content">
      <div className="split-form-title">Nombre completo</div>
      <input
        className="split-input"
        value={nombreCompleto}
        onChange={(e) => setNombreCompleto(e.target.value)}
        placeholder="Ingresa tu nombre completo"
      />
      <div className="split-form-title">Correo</div>
      <input
        className="split-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ingresa tu correo"
      />
      {/* NUEVOS CAMPOS VISIBLES */}
      <div className="split-form-title">Teléfono</div>
      <input
        className="split-input"
        type="tel"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        placeholder="Ingresa tu teléfono"
      />
      <div className="split-form-title">Fecha de nacimiento</div>
      <input
        className="split-input"
        type="date"
        value={fechaNac}
        onChange={(e) => setFechaNac(e.target.value)}
      />
      {/* FIN NUEVOS CAMPOS */}
      <div className="split-form-title">Contraseña</div>
      <input
        className="split-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Ingresa tu contraseña"
      />
      <label className="split-check">
        <input type="checkbox" /> Al crear tu cuenta aceptas <span className="link-inline">Términos y Condiciones</span>
      </label>
      <div className="split-actions">
        <button type="button" className="split-submit" onClick={crear}>Crear cuenta</button>
        <button className="link-btn" onClick={goToLogin}>Iniciar sesión</button>
      </div>
      {error && <div style={{ color: '#f87171', fontSize: 12 }}>{error}</div>}
    </div>
  );
}