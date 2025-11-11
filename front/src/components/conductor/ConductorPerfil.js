
import { useAuth } from '../../context/AuthContext';
export function ConductorPerfil({ conductor }) {
  const { driver } = useAuth();
  const src = conductor || (driver ? { user: driver, profile: { nombreCompleto: driver.nombreCompleto, telefono: driver.telefono, fechaNacimiento: driver.fechaNacimiento } } : null);
  const perfil = src?.profile ?? src;
  const email = src?.user?.email ?? src?.email ?? '—';

  return (
    <div className="card">
      <h2 className="section-title">Mi perfil (Conductor)</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <div><strong>Nombre completo:</strong> {perfil?.nombreCompleto ?? '—'}</div>
        <div><strong>Correo:</strong> {email}</div>
        <div><strong>Teléfono:</strong> {perfil?.telefono ?? '—'}</div>
        <div><strong>Fecha de nacimiento:</strong> {perfil?.fechaNacimiento ?? '—'}</div>
        <div><strong>INE:</strong> {perfil?.ine ?? '—'}</div>
        <div><strong>Licencia de conducir:</strong> {perfil?.licencia ?? '—'}</div>
        <div><strong>Tarjeta de circulación:</strong> {perfil?.tarjetaCirculacion ?? '—'}</div>
        <div><strong>Seguro del vehículo:</strong> {perfil?.seguro ?? '—'}</div>
        <div><strong>Cuenta bancaria:</strong> {perfil?.cuentaBancaria ?? '—'}</div>
      </div>
    </div>
  );
}