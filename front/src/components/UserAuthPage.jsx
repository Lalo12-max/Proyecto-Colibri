import React, { useState } from 'react';
import { Login } from './auth/Login';
import { Registro } from './auth/Registro';

export default function UserAuthPage() {
  const [view, setView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      return v === 'registro' ? 'registro' : 'login';
    } catch { return 'login'; }
  });

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Usuario</h1></div></div>
      {view === 'login' ? (
        <div className="panel">
          <h2 className="split-side-title">Iniciar sesión</h2>
          <Login goToRegistro={() => setView('registro')} />
        </div>
      ) : (
        <div className="panel">
          <h2 className="split-side-title">Crear cuenta</h2>
          <Registro goToLogin={() => setView('login')} />
        </div>
      )}
    </div>
  );
}