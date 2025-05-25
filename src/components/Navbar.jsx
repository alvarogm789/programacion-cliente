// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

// export default function Navbar() {
//   return (
//     <nav className="bg-blue-600 text-white p-4 shadow-md">
//       <ul className="flex space-x-4">
//         <li><Link to="/">Programación</Link></li>
//         <li><Link to="/vehiculos">Ver Vehículos</Link></li>
//         <li><Link to="/otra">Otra Ventana</Link></li>
//       </ul>
//     </nav>
//   );
// }



// import './Navbar.scss'; // o './Navbar.css'

// export default function Navbar() {
//   return (
//     <nav className="navbar">
//       <a href="/">Programación</a>
//       <a href="/vehiculos">Vehículos</a>
//       <a href="/otra">Otra Ventana</a>
//     </nav>
//   );
// }


import { NavLink } from 'react-router-dom';
import './Navbar.scss';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => isActive ? 'activo' : ''}>
        Programación
      </NavLink>
      <NavLink to="/vehiculos" className={({ isActive }) => isActive ? 'activo' : ''}>
        Vehículos
      </NavLink>
      <NavLink to="/otra" className={({ isActive }) => isActive ? 'activo' : ''}>
        Otra Ventana
      </NavLink>
    </nav>
  );
}
