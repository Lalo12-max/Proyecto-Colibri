export function RequisitosConductor() {
  return (
    <div className="card">
      <h2 className="section-title">Requisitos para conducir (demostración)</h2>
      <div style={{ textAlign: 'left', display: 'grid', gap: 8 }}>
        <div><strong>INE:</strong> Identificación oficial vigente.</div>
        <div><strong>Licencia de conducir:</strong> Vigente y compatible con el vehículo.</div>
        <div><strong>Tarjeta de circulación:</strong> Documentos del vehículo al día.</div>
        <div><strong>Seguro del vehículo:</strong> Cobertura de responsabilidad civil como mínimo.</div>
        <div><strong>Revisión mecánica:</strong> Mantenimiento y pruebas de seguridad actualizadas.</div>
        <div><strong>Cuenta bancaria para pagos:</strong> Para depósitos y cobros.</div>
        <div><strong>Etc.:</strong> Cualquier otro documento requerido por la normativa local.</div>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8 }}>
          Nota: Esta sección es solo demostrativa, no guarda información en la base de datos.
        </p>
      </div>
    </div>
  );
}