import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <header>
      {/* Top Bar Header */}
      <div className="top-bar justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <div className="banner-logo">I</div>
          <span className="brand-title">Librería Ideas</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          {user && <span className="text-muted small">{user.fullName || user.email}</span>}
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
            <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="nav-ideas">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link-ideas ${isActive ? 'active' : ''}`}
        >
          Inicio
        </NavLink>
        <NavLink
          to="/productos"
          end
          className={({ isActive }) => `nav-link-ideas ${isActive ? 'active' : ''}`}
        >
          Productos
        </NavLink>
        <NavLink
          to="/productos/nuevo"
          className={({ isActive }) => `nav-link-ideas ${isActive ? 'active' : ''}`}
        >
          Registrar producto
        </NavLink>
        <NavLink
          to="/ventas"
          end
          className={({ isActive }) => `nav-link-ideas ${isActive ? 'active' : ''}`}
        >
          Ventas
        </NavLink>
        <NavLink
          to="/ventas/nueva"
          className={({ isActive }) => `nav-link-ideas ${isActive ? 'active' : ''}`}
        >
          Registrar venta
        </NavLink>
      </nav>
    </header>
  );
}
