import React from 'react';

export function LoadingSpinner({ message = 'Cargando datos...' }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="text-muted fw-semibold">{message}</p>
    </div>
  );
}
