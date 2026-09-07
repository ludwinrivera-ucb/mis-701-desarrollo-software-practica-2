import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertMessage } from '../components/AlertMessage';

export function LoginPage() {
  const [email, setEmail] = useState('admin@email.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left split banner */}
      <div className="login-banner">
        <div className="banner-logo mb-3">I</div>
        <p className="brand-title text-primary mb-2">Librería Ideas</p>
        <h1 className="display-5 fw-bold mb-3">Gestión de inventarios y ventas.</h1>
        <p className="lead text-muted">
          Tú pones las ideas y nosotros los materiales para que tu proyecto sea un éxito.
        </p>
      </div>

      {/* Right login form */}
      <div className="login-form-container">
        <div className="login-card">
          <p className="text-muted text-uppercase fw-bold mb-1 small">Bienvenido</p>
          <h2 className="fw-bold mb-4">Iniciar sesión</h2>

          <AlertMessage type="danger" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo electrónico</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 fw-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
