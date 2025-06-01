// src/pages/VerVehiculos.jsx
// export default function VerVehiculos() {
//   return <h1 className="text-2xl">Página: Ver Vehículos</h1>;
// }

import { useEffect, useState } from 'react';
import axios from 'axios';
import './VerVehiculos.scss';
import { actualizarVehiculo, eliminarVehiculo } from '../api/vehiculoApi';


export default function VerVehiculos() {
  const [vehiculo, setVehiculo] = useState({
    // idVehiculo: '',
    placaVehiculo: '',
    conductorAsignado: '',
    estado: ''
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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
    const vehiculoAEnviar = {
      ...vehiculo,
      estado: vehiculo.estado === "" ? 0 : Number(vehiculo.estado)
    };
    axios
      .post('http://localhost:5600/api/v1/Vehiculo', vehiculoAEnviar)
      .then(() => {
        setVehiculo({
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

  const handleEliminarVehiculo = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este vehículo?")) {
      eliminarVehiculo(id)
        .then(() => {
          obtenerVehiculos();
          alert("✅ Vehículo eliminado con éxito");
        })
        .catch((err) => {
          alert("Error al eliminar el vehículo");
          console.error(err);
        });
    }
  };

  const handleActualizarDisponibilidad = (id, nuevoEstado) => {
    actualizarVehiculo(id, { estado: Number(nuevoEstado) })
      .then(() => {
        obtenerVehiculos();
        alert("✅ Disponibilidad actualizada");
      })
      .catch((err) => {
        alert("Error al actualizar la disponibilidad");
        console.error(err);
      });
  };

  return (
    <div className="ver-vehiculos">
      <h1>Registrar nuevo vehículo</h1>
      <button
        className="btn-toggle-formulario"
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
        style={{ marginBottom: '1rem' }}
      >
        {mostrarFormulario ? "Cancelar" : "Agregar nuevo vehículo"}
      </button>
      {mostrarFormulario && (
        <div className="tarjeta-agregar-vehiculo">
          <h3 className="titulo-tarjeta-servicio">Agregar nuevo vehículo</h3>
          <hr className="division-tarjeta-servicio" />
          <form onSubmit={handleSubmit} className="formulario-vehiculo">
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
            <div className="form-group">
              <label>Disponibilidad</label>
              <select
                name="estado"
                value={vehiculo.estado}
                onChange={handleChange}
                style={{
                  backgroundColor:
                    vehiculo.estado === 0 || vehiculo.estado === "0"
                      ? "#b2f7b8"
                      : vehiculo.estado === 1 || vehiculo.estado === "1"
                      ? "#ffbdbd"
                      : "white",
                  color: "#222"
                }}
              >
                <option value="">Seleccione disponibilidad</option>
                <option value={0}>Disponible</option>
                <option value={1}>NO disponible</option>
              </select>
            </div>
            <button type="submit">Guardar Vehículo</button>
          </form>
        </div>
      )}

      <h2>Vehículos registrados</h2>
      <table className="tabla-vehiculos">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Conductor Asignado</th>
            <th>Disponibilidad</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v, idx) => (
            <tr key={idx}>
              <td>{v.placaVehiculo}</td>
              <td>{v.conductorAsignado}</td>
              <td>
                <select
                  value={v.estado}
                  onChange={e => handleActualizarDisponibilidad(v._id, e.target.value)}
                  style={{
                    backgroundColor:
                      v.estado === 0 || v.estado === "0"
                        ? "#b2f7b8" // verde claro
                        : v.estado === 1 || v.estado === "1"
                        ? "#ffbdbd" // rojo claro
                        : "white",
                    color: "#222"
                  }}
                >
                  <option value={0}>Disponible</option>
                  <option value={1}>NO disponible</option>
                </select>
              </td>
              <td>

                {/* <button onClick={() => setVehiculoEditando(v)}>Editar</button> */}
                
                <button
                  className="btn-eliminar"
                  style={{ color: "#fff", background: "#e74c3c", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}
                  onClick={() => handleEliminarVehiculo(v._id)}
                >
                  Eliminar
                </button>


              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
