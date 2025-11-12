import React from 'react';
import './style/auth.css';
import { useAuth } from '../../context/AuthContext';

export function Registro({ onRegistro, goToLogin }) {
  const [nombre, setNombre] = React.useState('');
  const [apellidos, setApellidos] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [telefono, setTelefono] = React.useState('');
  const [fechaNac, setFechaNac] = React.useState('');
  const [error, setError] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { registerUser } = useAuth();

  const crear = async () => {
    setError('');
    if (!nombre || !apellidos || !email || !password) {
      setError('Completa nombre, apellidos, correo y contraseña.');
      return;
    }
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) { setError('Correo inválido.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }

    try {
      await registerUser({
        email,
        password,
        nombre,
        apellidos,
        telefono,
        fechaNacimiento: fechaNac,
      });
      onRegistro?.({ nombre, apellidos, email, telefono, fechaNacimiento: fechaNac });
      goToLogin?.();
    } catch (e) {
      setError(e.message || 'Fallo de red o servidor.');
    }
  };

  return (
    <div className="split-form-content">
      <div className="split-form-title">Nombre</div>
      <input
        className="split-input"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Ingresa tu nombre"
      />
      <div className="split-form-title">Apellidos</div>
      <input
        className="split-input"
        value={apellidos}
        onChange={(e) => setApellidos(e.target.value)}
        placeholder="Ingresa tus apellidos"
      />
      <div className="split-form-title">Correo</div>
      <input
        className="split-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ingresa tu correo"
      />
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
      <div className="split-form-title">Contraseña</div>
      <input
        className="split-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Ingresa tu contraseña"
      />
      <label className="split-check">
        <input type="checkbox" /> Al crear tu cuenta aceptas <a className="link-inline" href="https://politicas-de-privasidad.onrender.com/" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
      </label>
      <div className="split-actions">
        <button type="button" className="split-submit" onClick={crear}>Crear cuenta</button>
        <div className="link-row">
        <button type="button" className="link-btn" onClick={goToLogin}>Ya tengo una cuenta</button>
      </div>
      </div>
      
      {error && <div style={{ color: 'var(--color-accent)', fontSize: 12 }}>{error}</div>}
    </div>
  );
}