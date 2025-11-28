import { useAuth } from '../context/AuthContext';

export default function UserPerfil({ usuario }) {
  const { user } = useAuth();
  const src = usuario || user || null;
  const perfil = src?.profile ?? src;
  const email = src?.user?.email ?? src?.email ?? '—';
  const nombreCompleto = perfil?.nombreCompleto || [perfil?.nombre, perfil?.apellidos].filter(Boolean).join(' ') || null;
  const avatar = perfil?.fotoUrl || perfil?.avatarUrl || 'https://placehold.co/120x120?text=X';

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Perfil</h1></div></div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 className="section-title">Mi perfil (Usuario)</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={avatar} alt="Foto del usuario" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color, #e5e5e5)' }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{nombreCompleto ?? '—'}</div>
              <div style={{ color: 'var(--color-muted)' }}>{email}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{perfil?.telefono ?? '—'}</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><th style={{ textAlign: 'left', padding: 8, width: 220 }}>Fecha de nacimiento</th><td style={{ padding: 8 }}>{perfil?.fechaNacimiento ?? '—'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}