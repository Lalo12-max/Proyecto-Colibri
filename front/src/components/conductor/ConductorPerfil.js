
import { useAuth } from '../../context/AuthContext';
export function ConductorPerfil({ conductor }) {
  const { driver } = useAuth();
  const src = conductor || driver || null;
  const perfil = src?.profile ?? src;
  const email = src?.user?.email ?? src?.email ?? '—';
  const avatar = perfil?.fotoUrl || perfil?.avatarUrl || 'https://placehold.co/120x120?text=X';

  return (
    <div className="card">
      <h2 className="section-title">Mi perfil (Conductor)</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={avatar} alt="Foto del conductor" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color, #e5e5e5)' }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{perfil?.nombreCompleto ?? '—'}</div>
            <div style={{ color: 'var(--color-muted)' }}>{email}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{perfil?.telefono ?? '—'}</div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><th style={{ textAlign: 'left', padding: 8, width: 220 }}>Fecha de nacimiento</th><td style={{ padding: 8 }}>{perfil?.fechaNacimiento ?? '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>INE</th><td style={{ padding: 8 }}>{perfil?.ine ?? '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Licencia de conducir</th><td style={{ padding: 8 }}>{perfil?.licencia ?? '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Tarjeta de circulación</th><td style={{ padding: 8 }}>{perfil?.tarjetaCirculacion ?? '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Seguro del vehículo</th><td style={{ padding: 8 }}>{perfil?.seguro ?? '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Cuenta bancaria</th><td style={{ padding: 8 }}>{perfil?.cuentaBancaria ?? '—'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}