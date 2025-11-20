import React, { useState } from 'react';
import { ConductorLogin } from './auth/ConductorLogin';
import { ConductorRegistro } from './auth/ConductorRegistro';

export default function DriverAuthPage() {
  const [view, setView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      return v === 'registro' ? 'registro' : 'login';
    } catch { return 'login'; }
  });

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Conductor</h1></div></div>
      {view === 'login' ? (
        <div className="panel">
          <ConductorLogin goToRegistro={() => setView('registro')} />
        </div>
      ) : (
        <div className="panel">
          <h2 className="split-side-title">Registrarte como conductor</h2>
          <ConductorRegistro goToLogin={() => setView('login')} />
        </div>
      )}
    </div>
  );
}