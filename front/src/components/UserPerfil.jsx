import { useAuth } from '../context/AuthContext';

export default function UserPerfil({ usuario }) {
  const { user } = useAuth();
  const src = usuario || user || null;
  const perfil = src?.profile ?? src;
  const email = src?.user?.email ?? src?.email ?? '—';
  const nombreCompleto = perfil?.nombreCompleto || [perfil?.nombre, perfil?.apellidos].filter(Boolean).join(' ') || null;

  return (
    <div className="page container">
      <div className="app-header"><div className="brand"><h1>Perfil</h1></div></div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 className="section-title">Mi perfil (Usuario)</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Nombre completo:</strong> {nombreCompleto ?? '—'}</div>
          <div><strong>Correo:</strong> {email}</div>
          <div><strong>Teléfono:</strong> {perfil?.telefono ?? '—'}</div>
          <div><strong>Fecha de nacimiento:</strong> {perfil?.fechaNacimiento ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}