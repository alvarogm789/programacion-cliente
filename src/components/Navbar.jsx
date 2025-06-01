// src/components/Navbar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.scss';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo">Precoltur</div>
      <button
        className="navbar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
      >
        <span className="navbar-toggle-bar"></span>
        <span className="navbar-toggle-bar"></span>
        <span className="navbar-toggle-bar"></span>
      </button>
      <div className={`navbar-links${open ? ' open' : ''}`}>
        <NavLink to="/" className={({ isActive }) => isActive ? 'activo' : ''} onClick={() => setOpen(false)}>
          Programación
        </NavLink>
        <NavLink to="/vehiculos" className={({ isActive }) => isActive ? 'activo' : ''} onClick={() => setOpen(false)}>
          Vehículos
        </NavLink>
        <NavLink to="/otra" className={({ isActive }) => isActive ? 'activo' : ''} onClick={() => setOpen(false)}>
          Otra Ventana
        </NavLink>
      </div>
    </nav>
  );
}
