// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VerProgramacion from './pages/VerProgramacion';
import VerVehiculos from './pages/VerVehiculos';
import OtraVentana from './pages/OtraVentana';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<VerProgramacion />} />
          <Route path="/vehiculos" element={<VerVehiculos />} />
          <Route path="/otra" element={<OtraVentana />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
