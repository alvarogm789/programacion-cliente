// src/pages/VerVehiculos.jsx
// export default function VerVehiculos() {
//   return <h1 className="text-2xl">Página: Ver Vehículos</h1>;
// }

import { useEffect, useState } from 'react';
import axios from 'axios';
import './VerVehiculos.scss';

export default function VerVehiculos() {
  const [vehiculo, setVehiculo] = useState({
    // idVehiculo: '',
    placaVehiculo: '',
    conductorAsignado: '',
    estado: ''
  });

  const [vehiculos, setVehiculos] = useState([]);

  useEffect(() => {
    obtenerVehiculos();
  }, []);

  const obtenerVehiculos = () => {
    axios
      .get('http://localhost:5600/api/v1/Vehiculo')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.msg;
        setVehiculos(data);
      })
      .catch((err) => {
        console.error('Error al obtener vehículos:', err);
        setVehiculos([]);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehiculo({ ...vehiculo, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:5600/api/v1/Vehiculo', vehiculo)
      .then(() => {
        setVehiculo({
          // idVehiculo: '',
          placaVehiculo: '',
          conductorAsignado: '',
          estado: ''
        });
        obtenerVehiculos();
        alert("✅ Vehículo guardado con éxito");
        console.log("vehiculo guardado con exito")
      })
      .catch((err) => console.error('Error al guardar vehículo:', err));
  };

  return (
    <div className="ver-vehiculos">
      <h1>Registrar nuevo vehículo</h1>
      <form onSubmit={handleSubmit} className="formulario-vehiculo">

        {/* <div className="form-group">
          <label>ID Vehículo</label>
          <input
            type="text"
            name="idVehiculo"
            value={vehiculo.idVehiculo}
            onChange={handleChange}
          />
        </div> */}

        <div className="form-group">
          <label>Placa</label>
          <input
            type="text"
            name="placaVehiculo"
            value={vehiculo.placaVehiculo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Conductor Asignado</label>
          <input
            type="text"
            name="conductorAsignado"
            value={vehiculo.conductorAsignado}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Guardar Vehículo</button>
        
      </form>

      <h2>Vehículos registrados</h2>
      <table className="tabla-vehiculos">
        <thead>
          <tr>
            {/* <th>ID Vehículo</th> */}
            <th>Placa</th>
            <th>Conductor Asignado</th>
            <th>Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v, idx) => (
            <tr key={idx}>
              {/* <td>{v.idVehiculo || '-'}</td> */}
              <td>{v.placaVehiculo}</td>
              <td>{v.conductorAsignado}</td>
              {/* <td>{v.estado}</td> */}
              {/* <td>{v.estado === 0 ? "Disponible" : "NO disponible"}</td> */}

              <td style={{ backgroundColor: v.estado === 1 ? "red" : "transparent", color: v.estado === 1 ? "white" : "black" }}>
                {v.estado === 0 ? "Disponible" : "NO disponible"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
