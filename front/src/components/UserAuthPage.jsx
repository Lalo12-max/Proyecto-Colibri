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
      {/* Pantalla de autenticación sin controles de cerrar sesión (se mueve al menú) */}

      {/* Split: izquierda registro, derecha login, con máscara deslizante */}
      <div className={`split-auth ${view === 'login' ? 'show-login' : 'show-register'}`}>
        {/* Máscara animada global */}
        <div className={`moving-mask ${view === 'login' ? 'pos-left' : 'pos-right'}`}></div>

        {/* CONTENIDO SOBRE LA MÁSCARA (para que el área azul no esté vacía) */}
        <div className={`mask-content ${view === 'login' ? 'pos-left' : 'pos-right'}`}>
          <h2 className="mask-title">{view === 'login' ? '¡Bienvenido de vuelta!' : '¡Encantado de verte!'}</h2>
          <p className="mask-subtitle">
            {view === 'login'
              ? 'Accede para reservar viajes y gestionar tus solicitudes.'
              : 'Crea tu cuenta para reservar, guardar rutas y recibir novedades.'}
          </p>
        </div>

        {/* Panel izquierdo: Registro */}
        <div className="split-left">
          <div className="panel">
            <h2 className="split-side-title">Crear cuenta</h2>
            <Registro goToLogin={() => setView('login')} />
          </div>
        </div>

        {/* Panel derecho: Login */}
        <div className="split-right">
          <div className="panel">
            <h2 className="split-side-title">Iniciar sesión</h2>
            <Login goToRegistro={() => setView('registro')} />
          </div>
        </div>
      </div>
    </div>
  );
}