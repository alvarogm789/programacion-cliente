import axios from 'axios';

export const obtenerServicios = async () => {
  const res = await axios.get('http://localhost:5600/api/v1/Servicio');
  return Array.isArray(res.data) ? res.data : res.data.msg;
};

export const guardarServicio = async (datos) => {
  return axios.post('http://localhost:5600/api/v1/Servicio', datos);
};


// import axios from 'axios';

// export const eliminarServicio = async (id) => {
//   // El backend espera POST y el id en el body
//   return axios.post('http://localhost:5600/api/v1/Servicio/delete', { id });
// };

// export const eliminarServicio = async (id) => {
//   return axios.delete(`http://localhost:5600/api/v1/Servicio/${id}`);
// };



export const eliminarServicio = async (id) => {
  return axios.delete(`http://localhost:5600/api/v1/Servicio/${id}`);
};