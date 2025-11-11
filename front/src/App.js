import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import UserAuthPage from './components/UserAuthPage';
import DriverAuthPage from './components/DriverAuthPage';
import ViajesPage from './components/ViajesPage';
import SolicitudesPage from './components/SolicitudesPage';
import BuscarPage from './components/BuscarPage';
import MisViajesPage from './components/MisViajesPage';
import MisSolicitudesPage from './components/MisSolicitudesPage';
import './App.css';

import { BuscarFormulario } from './components/viajes/BuscarFormulario';
import { ListaViajes } from './components/viajes/ListaViajes';
import { ResumenCliente } from './components/cliente/ResumenCliente';
import { useViajes } from './hooks/useViajes';
import { BuscarReserva } from './components/reserva/BuscarReserva';
import { ResumenReserva } from './components/reserva/ResumenReserva';
import { Login } from './components/auth/Login';
import { Registro } from './components/auth/Registro';
import { ConductorLogin } from './components/auth/ConductorLogin';
import { ConductorRegistro } from './components/auth/ConductorRegistro';
import { ConductorPerfil } from './components/conductor/ConductorPerfil';
import { GenerarPuntoViaje } from './components/conductor/GenerarPuntoViaje';
import { useConductor } from './hooks/useConductor';
import { RequisitosConductor } from './components/conductor/RequisitosConductor';
import { useSolicitudes } from './hooks/useSolicitudes';

// Menú tipo panel desplegable (hamburguesa)
function MenuPanel({ open, onClose }) {
    return (
      <div className={`menu-panel ${open ? 'open' : ''}`}>
        <div className="menu-header-row">
          <span className="menu-title">Menu</span>
          <button className="menu-close" onClick={onClose} aria-label="Cerrar">✖</button>
        </div>
        <nav className="menu-list">
          <Link to="/" className="menu-item" onClick={onClose}><span className="icon">🏠</span><span>Inicio</span></Link>
          <Link to="/viajes" className="menu-item" onClick={onClose}><span className="icon">🧳</span><span>Viajes</span></Link>
          <Link to="/solicitudes" className="menu-item" onClick={onClose}><span className="icon">🚀</span><span>Solicitudes</span></Link>
          <Link to="/mis-viajes" className="menu-item" onClick={onClose}><span className="icon">🌍</span><span>Mis Viajes</span></Link>
          <Link to="/mis-solicitudes" className="menu-item" onClick={onClose}><span className="icon">✉️</span><span>Mis Solicitudes</span></Link>
          <Link to="/usuario" className="menu-item" onClick={onClose}><span className="icon">👤</span><span>Usuario</span></Link>
          <Link to="/conductor" className="menu-item" onClick={onClose}><span className="icon">🚗</span><span>Conductor</span></Link>
        </nav>
      </div>
    );
}

function App() {
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
      <AuthProvider>
        <BrowserRouter>
          <header className="menu-header">
            <div className="brand"><h1>Colibrí</h1></div>
            <button
              className="menu-toggle"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span></span><span></span><span></span>
            </button>
            <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
          </header>

          <Routes>
            <Route path="/" element={<BuscarPage />} />
            <Route path="/usuario" element={<UserAuthPage />} />
            <Route path="/conductor" element={<DriverAuthPage />} />
            <Route path="/viajes" element={<ViajesPage />} />
            <Route path="/solicitudes" element={<SolicitudesPage />} />
            <Route path="/mis-viajes" element={<MisViajesPage />} />
            <Route path="/mis-solicitudes" element={<MisSolicitudesPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
}

export default App;
