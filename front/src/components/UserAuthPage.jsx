import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Login } from './auth/Login';
import { Registro } from './auth/Registro';

export default function UserAuthPage() {
  const { user, userSession, logoutUser } = useAuth();
  const [view, setView] = useState('login');

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Usuario</h1></div></div>

      {/* Estado de sesión */}
      <div className="card">
        {user ? (
          <div>
            <div>Sesión activa: {user?.nombreCompleto || user?.email}</div>
            <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>Conectado</div>
            <button className="btn" onClick={logoutUser}>Cerrar sesión</button>
          </div>
        ) : (
          <div>No hay sesión de usuario</div>
        )}
      </div>

      {/* Split: izquierda registro, derecha login, sin pestañas arriba */}
      <div className={`split-auth ${view === 'login' ? 'show-login' : 'show-register'}`}>
        {/* Panel izquierdo: Registro */}
        <div className="split-left">
          <div className="mask coral-mask"></div>
          <div className="panel">
            <Registro goToLogin={() => setView('login')} />
          </div>
        </div>

        {/* Panel derecho: Login */}
        <div className="split-right">
          <div className="mask navy-mask"></div>
          <div className="panel">
            <Login goToRegistro={() => setView('registro')} />
          </div>
        </div>
      </div>
    </div>
  );
}