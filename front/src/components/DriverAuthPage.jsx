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

      {/* Pantalla de autenticación de conductor, sin controles de cerrar sesión (se mueve al menú) */}

      {/* Mismo diseño split que la pantalla de Usuario */}
      <div className={`split-auth ${view === 'login' ? 'show-login' : 'show-register'}`}>
        {/* Máscara animada */}
        <div className={`moving-mask ${view === 'login' ? 'pos-left' : 'pos-right'}`}></div>

        {/* Contenido sobre la máscara */}
        <div className={`mask-content ${view === 'login' ? 'pos-left' : 'pos-right'}`}>
          <h2 className="mask-title">{view === 'login' ? '¡Bienvenido de vuelta!' : '¡Encantado de verte!'}</h2>
          <p className="mask-subtitle">
            {view === 'login'
              ? 'Accede para publicar viajes y gestionar tus reservas.'
              : 'Crea tu cuenta de conductor para publicar viajes.'}
          </p>
        </div>

        {/* Panel izquierdo: Registro de conductor */}
        <div className="split-left">
          <div className="panel">
            <h2 className="split-side-title">Registrarte como conductor</h2>
            <ConductorRegistro goToLogin={() => setView('login')} />
          </div>
        </div>

        {/* Panel derecho: Login de conductor */}
        <div className="split-right">
          <div className="panel">
            <ConductorLogin goToRegistro={() => setView('registro')} />
          </div>
        </div>
      </div>
    </div>
  );
}