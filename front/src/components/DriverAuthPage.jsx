import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConductorLogin } from './auth/ConductorLogin';
import { ConductorRegistro } from './auth/ConductorRegistro';

export default function DriverAuthPage() {
  const { driver, driverSession, logoutDriver } = useAuth();
  const [view, setView] = useState('login');

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Conductor</h1></div></div>

      <div className="card">
        {driver ? (
          <div>
            <div>Sesión activa: {driver?.nombreCompleto || driver?.email}</div>
            <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>Conectado</div>
            <button className="btn" onClick={logoutDriver}>Cerrar sesión</button>
          </div>
        ) : (
          <div>No hay sesión de conductor</div>
        )}
      </div>

      {/* Layout en dos columnas con pestañas */}
      <div className="auth-grid">
        {/* Panel informativo */}
        <div>
          <div className="card">
            <h2 className="section-title">¿Quieres conducir en Colibrí?</h2>
            <div style={{ color: 'var(--color-muted)', marginBottom: 12 }}>
              Regístrate y publica tus viajes. Gana dinero moviendo personas de forma segura.
            </div>
            {/* Muestra requisitos como guía visual */}
            {/* Puedes esconder este bloque si ya tienes sesión */}
          </div>
          {/* Requisitos en su propia tarjeta */}
          <div className="card" style={{ marginTop: 12 }}>
            <h3 className="section-title">Requisitos</h3>
            <div style={{ display: 'grid', gap: 8, textAlign: 'left' }}>
              <div>INE vigente • Licencia • Seguro • Mantenimiento • Cuenta bancaria</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                Esta sección es demostrativa, no guarda información en la base de datos.
              </div>
            </div>
          </div>
        </div>

        {/* Panel de autenticación con pestañas */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="tab-group">
              <button
                className={`tab-btn ${view === 'login' ? 'active' : ''}`}
                onClick={() => setView('login')}
              >
                Iniciar sesión
              </button>
              <button
                className={`tab-btn ${view === 'registro' ? 'active' : ''}`}
                onClick={() => setView('registro')}
              >
                Registrarte
              </button>
            </div>
          </div>

          {view === 'registro' ? (
            <ConductorRegistro goToLogin={() => setView('login')} />
          ) : (
            <ConductorLogin goToRegistro={() => setView('registro')} />
          )}
        </div>
      </div>
    </div>
  );
}