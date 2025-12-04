import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import UserAuthPage from './components/UserAuthPage';
import DriverAuthPage from './components/DriverAuthPage';
import SolicitudesPage from './components/SolicitudesPage';
import BuscarPage from './components/BuscarPage';
import MisViajesPage from './components/MisViajesPage';
// import MisSolicitudesPage from './components/MisSolicitudesPage';
import DriverPuntosPage from './components/DriverPuntosPage';
import UserMisViajesPage from './components/UserMisViajesPage';
import UserPerfil from './components/UserPerfil';
import { ConductorPerfil } from './components/conductor/ConductorPerfil';
import TurismoPage from './components/TurismoPage';
import './App.css';


// Menú tipo panel desplegable (hamburguesa)
function MenuPanel({ open, onClose }) {
    const { user, driver, logoutUser, logoutDriver } = useAuth();
    return (
      <div className={`menu-panel ${open ? 'open' : ''}`}>
        <div className="menu-header-row">
          <span className="menu-title">Menu</span>
          <button className="menu-close" onClick={onClose} aria-label="Cerrar">✖</button>
        </div>
        <nav className="menu-list">
          {user && (
            <>
              <Link to="/" className="menu-item" onClick={onClose}><span className="icon">🏠</span><span>Inicio</span></Link>
              <Link to="/usuario/mis-viajes" className="menu-item" onClick={onClose}><span className="icon">🌍</span><span>Mis Viajes</span></Link>
              <Link to="/usuario/mis-solicitudes" className="menu-item" onClick={onClose}><span className="icon">✉</span><span>Mis Solicitudes</span></Link>
              <Link to="/usuario/turismo" className="menu-item" onClick={onClose}><span className="icon">🏞</span><span>Turismo</span></Link>
              <Link to="/usuario" className="menu-item" onClick={onClose}><span className="icon">👤</span><span>Perfil</span></Link>
              <button className="menu-item" onClick={() => { logoutUser(); onClose?.(); }}><span className="icon">🚪</span><span>Cerrar sesión</span></button>
            </>
          )}
          {driver && (
            <>
              <Link to="/conductor/puntos" className="menu-item" onClick={onClose}><span className="icon">📍</span><span>Mis Puntos</span></Link>
              <Link to="/conductor/mis-viajes" className="menu-item" onClick={onClose}><span className="icon">🧾</span><span>Historial de viajes</span></Link>
              <Link to="/conductor/solicitudes" className="menu-item" onClick={onClose}><span className="icon">🚀🚀</span><span>Solicitudes (Uber)</span></Link>
              <Link to="/conductor/perfil" className="menu-item" onClick={onClose}><span className="icon">🚗</span><span>Perfil</span></Link>
              <button className="menu-item" onClick={() => { logoutDriver(); onClose?.(); }}><span className="icon">🚪</span><span>Cerrar sesión</span></button>
            </>
          )}
          {!user && !driver && (
            <>
              <Link to="/" className="menu-item" onClick={onClose}><span className="icon">🏠</span><span>Inicio</span></Link>
              <Link to="/usuario/auth?view=login" className="menu-item" onClick={onClose}><span className="icon">🔑</span><span>Iniciar sesión</span></Link>
              <Link to="/usuario/auth?view=registro" className="menu-item" onClick={onClose}><span className="icon">🆕</span><span>Crear cuenta</span></Link>
            </>
          )}
        </nav>
      </div>
    );
}

function DesktopNav() {
  const { user, driver, logoutUser, logoutDriver } = useAuth();
  return (
    <nav className="desktop-nav">
      {user && (
        <>
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/usuario/mis-viajes" className="nav-link">Mis Viajes</Link>
          <Link to="/usuario/mis-solicitudes" className="nav-link">Mis Solicitudes</Link>
          <Link to="/usuario/turismo" className="nav-link">Turismo</Link>
          <Link to="/usuario" className="nav-link">Perfil</Link>
          <Link to="/usuario" className="nav-link" onClick={logoutUser}>Cerrar sesión</Link>
        </>
      )}
      {driver && !user && (
        <>
          <Link to="/conductor/solicitudes" className="nav-link">Solicitudes</Link>
          <Link to="/conductor/puntos" className="nav-link">Mis Puntos</Link>
          <Link to="/conductor/mis-viajes" className="nav-link">Mis Viajes</Link>
          <Link to="/conductor/perfil" className="nav-link">Perfil</Link>
          <Link to="/conductor" className="nav-link" onClick={logoutDriver}>Cerrar sesión</Link>
        </>
      )}
      {!user && !driver && (
        <>
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/usuario/auth?view=login" className="nav-link">Iniciar sesión</Link>
        </>
      )}
    </nav>
  );
}

function HomeRoute() {
  const { user } = useAuth();
  return user ? <BuscarPage mode="cliente" /> : <BuscarPage />;
}

function App() {
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
      <AuthProvider>
        <BrowserRouter>
          <header className="menu-header">
            <div className="brand"><h1>Colibrí</h1></div>
            <DesktopNav />
            <button
              className="menu-toggle"
              aria-label="Abrir menú"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </header>

          {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}
          <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />

          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/usuario" element={<UserPerfil />} />
            <Route path="/usuario/auth" element={<UserAuthPage />} />
            <Route path="/usuario/mis-viajes" element={<UserMisViajesPage />} />
            <Route path="/usuario/mis-solicitudes" element={<SolicitudesPage mode="cliente" />} />
            <Route path="/usuario/turismo" element={<TurismoPage />} />
            <Route path="/conductor" element={<DriverAuthPage />} />
            <Route path="/conductor/perfil" element={<ConductorPerfil />} />
            <Route path="/conductor/mis-viajes" element={<MisViajesPage />} />
            <Route path="/conductor/solicitudes" element={<SolicitudesPage mode="conductor" />} />
            <Route path="/conductor/puntos" element={<DriverPuntosPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
}

export default App;
