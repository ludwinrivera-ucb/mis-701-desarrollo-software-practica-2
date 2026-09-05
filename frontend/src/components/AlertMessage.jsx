import React from 'react';

export function AlertMessage({ type = 'danger', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show shadow-sm border-0 mb-4`} role="alert">
      <i className={`bi bi-${type === 'danger' ? 'exclamation-triangle-fill' : 'check-circle-fill'} me-2`}></i>
      {message}
      {onClose && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
      )}
    </div>
  );
}
