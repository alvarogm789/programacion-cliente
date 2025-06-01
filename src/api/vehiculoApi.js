import axios from 'axios';

export const obtenerVehiculos = async () => {
  const res = await axios.get('http://localhost:5600/api/v1/Vehiculo');
  return Array.isArray(res.data) ? res.data : res.data.msg;
};

export const eliminarVehiculo = async (id) => {
  return axios.delete(`http://localhost:5600/api/v1/Vehiculo/${id}`);
};

export const actualizarVehiculo = async (_id, update) => {
  return axios.put('http://localhost:5600/api/v1/Vehiculo', { _id, update });
};
