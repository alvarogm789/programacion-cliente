//color unico a todos los servicios
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import './VerProgramacion.scss';

// export default function VerProgramacion() {
//   const [formulario, setFormulario] = useState({
//     idServicio: '',
//     placaVehiculoAsignado: '',
//     descripcionServicio: '',
//     fechaInicioDeServicio: '',
//     fechaFinDeServicio: ''
//   });

//   const [programaciones, setProgramaciones] = useState([]);

//   const [mesSeleccionado, setMesSeleccionado] = useState(5); // Junio (0 = Enero)
//   const [anioSeleccionado, setAnioSeleccionado] = useState(2025);

//   useEffect(() => {
//     axios
//       .get('http://localhost:5600/api/v1/Servicio')
//       .then((res) => {
//         setProgramaciones(Array.isArray(res.data) ? res.data : res.data.msg);
//       })
//       .catch((err) => {
//         console.error('Error al obtener programaciones:', err);
//         setProgramaciones([]);
//       });
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormulario({ ...formulario, [name]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     axios
//       .post('http://localhost:5600/api/v1/Servicio', formulario)
//       .then(() => {
//         setFormulario({
//           idServicio: '',
//           placaVehiculoAsignado: '',
//           descripcionServicio: '',
//           fechaInicioDeServicio: '',
//           fechaFinDeServicio: ''
//         });
//         return axios.get('http://localhost:5600/api/v1/Servicio');
//       })
//       .then((res) => setProgramaciones(Array.isArray(res.data) ? res.data : res.data.msg))
//       .catch((err) => console.error('Error al guardar o recargar:', err));
//   };

//   const generarDiasDelMes = (anio, mes) => {
//     const dias = [];
//     const fecha = new Date(anio, mes, 1);
//     while (fecha.getMonth() === mes) {
//       dias.push(new Date(fecha));
//       fecha.setDate(fecha.getDate() + 1);
//     }
//     return dias;
//   };

//   const normalizarFecha = (fecha) => {
//     const f = new Date(fecha);
//     f.setHours(0, 0, 0, 0);
//     return f;
//   };

//   const diasDelMes = generarDiasDelMes(anioSeleccionado, mesSeleccionado);

//   const meses = [
//     'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
//     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
//   ];

//   return (
//     <div className="page-container">
//       <h1>Programar un nuevo servicio</h1>
//       <form onSubmit={handleSubmit} className="formulario-servicio">
//         <div className="form-group">
//           <label>ID del Servicio</label>
//           <input
//             type="text"
//             name="idServicio"
//             value={formulario.idServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Placa</label>
//           <input
//             type="text"
//             name="placaVehiculoAsignado"
//             value={formulario.placaVehiculoAsignado}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Descripción</label>
//           <input
//             type="text"
//             name="descripcionServicio"
//             value={formulario.descripcionServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Fecha de Inicio</label>
//           <input
//             type="date"
//             name="fechaInicioDeServicio"
//             value={formulario.fechaInicioDeServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Fecha de Fin</label>
//           <input
//             type="date"
//             name="fechaFinDeServicio"
//             value={formulario.fechaFinDeServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <button type="submit">Guardar Servicio</button>
//       </form>

//       <div className="filtros-fecha">
//         <label>Mes:</label>
//         <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}>
//           {meses.map((mes, i) => (
//             <option key={i} value={i}>{mes}</option>
//           ))}
//         </select>

//         <label>Año:</label>
//         <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}>
//           {[2024, 2025, 2026].map((anio) => (
//             <option key={anio} value={anio}>{anio}</option>
//           ))}
//         </select>
//       </div>

//       <h2>Programación de {meses[mesSeleccionado]} {anioSeleccionado}</h2>

//       <div className="tabla-scroll">
//         <table className="tabla-programacion">
//           <thead>
//             <tr>
//               <th>Placa</th>
//               <th>ID Servicio</th>
//               <th>Descripción</th>
//               {diasDelMes.map((dia, i) => (
//                 <th key={i}>{dia.getDate()}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {programaciones
//               .filter((servicio) => {
//                 if (!servicio.fechaInicioDeServicio || !servicio.fechaFinDeServicio) return false;

//                 const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
//                 const fin = normalizarFecha(servicio.fechaFinDeServicio);

//                 const inicioDelMes = new Date(anioSeleccionado, mesSeleccionado, 1);
//                 const finDelMes = new Date(anioSeleccionado, mesSeleccionado + 1, 0);

//                 return inicio <= finDelMes && fin >= inicioDelMes;
//               })
//               .map((servicio, index) => (
//                 <tr key={index}>
//                   <td>{servicio.placaVehiculoAsignado}</td>
//                   <td>{servicio.idServicio}</td>
//                   <td>{servicio.descripcionServicio}</td>
//                   {diasDelMes.map((dia, i) => {
//                     const fechaDia = normalizarFecha(dia);
//                     const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
//                     const fin = normalizarFecha(servicio.fechaFinDeServicio);
//                     const estaAsignado = inicio <= fechaDia && fin >= fechaDia;
//                     return (
//                       <td key={i} style={{ backgroundColor: estaAsignado ? '#00aaff' : '' }}>
//                         {estaAsignado ? "✔️" : ""}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }










// //Coloca un color diferente a cada programacion cada que se recarga la pagina - sin informacion de dia
// import { useEffect, useMemo, useState } from 'react';
// import axios from 'axios';
// import './VerProgramacion.scss';

// export default function VerProgramacion() {
//   const [formulario, setFormulario] = useState({
//     idServicio: '',
//     placaVehiculoAsignado: '',
//     descripcionServicio: '',
//     fechaInicioDeServicio: '',
//     fechaFinDeServicio: ''
//   });

//   const [programaciones, setProgramaciones] = useState([]);
//   const [mesSeleccionado, setMesSeleccionado] = useState(4); // Mayo (0 = Enero)
//   const [anioSeleccionado, setAnioSeleccionado] = useState(2025);

//   useEffect(() => {
//     axios
//       .get('http://localhost:5600/api/v1/Servicio')
//       .then((res) => {
//         const data = Array.isArray(res.data) ? res.data : res.data.msg;
//         setProgramaciones(data);
//       })
//       .catch((err) => {
//         console.error('Error al obtener programaciones:', err);
//         setProgramaciones([]);
//       });
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormulario({ ...formulario, [name]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     axios
//       .post('http://localhost:5600/api/v1/Servicio', formulario)
//       .then(() => {
//         setFormulario({
//           idServicio: '',
//           placaVehiculoAsignado: '',
//           descripcionServicio: '',
//           fechaInicioDeServicio: '',
//           fechaFinDeServicio: ''
//         });
//         return axios.get('http://localhost:5600/api/v1/Servicio');
//       })
//       .then((res) => {
//         const data = Array.isArray(res.data) ? res.data : res.data.msg;
//         setProgramaciones(data);
//       })
//       .catch((err) => console.error('Error al guardar o recargar:', err));
//   };

//   const generarDiasDelMes = (anio, mes) => {
//     const dias = [];
//     const fecha = new Date(anio, mes, 1);
//     while (fecha.getMonth() === mes) {
//       dias.push(new Date(fecha));
//       fecha.setDate(fecha.getDate() + 1);
//     }
//     return dias;
//   };

//   const normalizarFecha = (fecha) => {
//     const f = new Date(fecha);
//     f.setHours(0, 0, 0, 0);
//     return f;
//   };

//   const diasDelMes = generarDiasDelMes(anioSeleccionado, mesSeleccionado);

//   const generarColorAleatorio = () => {
//     const letras = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//       color += letras[Math.floor(Math.random() * 16)];
//     }
//     return color;
//   };

//   const coloresPorServicio = useMemo(() => {
//     const colores = {};
//     programaciones.forEach(servicio => {
//       colores[servicio.idServicio] = generarColorAleatorio();
//     });
//     return colores;
//   }, [programaciones]);

//   const meses = [
//     'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
//     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
//   ];

//   // Filtrar solo los servicios que tienen actividad en el mes seleccionado
//   const serviciosFiltrados = programaciones.filter(servicio => {
//     const inicio = new Date(servicio.fechaInicioDeServicio);
//     const fin = new Date(servicio.fechaFinDeServicio);
//     return (
//       (inicio.getFullYear() === anioSeleccionado && inicio.getMonth() <= mesSeleccionado) &&
//       (fin.getFullYear() === anioSeleccionado && fin.getMonth() >= mesSeleccionado)
//     );
//   });

//   return (
//     <div className="page-container">
//       <h1>Programar un nuevo servicio</h1>
//       <form onSubmit={handleSubmit} className="formulario-servicio">
//         <div className="form-group">
//           <label>ID del Servicio</label>
//           <input
//             type="text"
//             name="idServicio"
//             value={formulario.idServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Placa</label>
//           <input
//             type="text"
//             name="placaVehiculoAsignado"
//             value={formulario.placaVehiculoAsignado}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Descripción</label>
//           <input
//             type="text"
//             name="descripcionServicio"
//             value={formulario.descripcionServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Fecha de Inicio</label>
//           <input
//             type="date"
//             name="fechaInicioDeServicio"
//             value={formulario.fechaInicioDeServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Fecha de Fin</label>
//           <input
//             type="date"
//             name="fechaFinDeServicio"
//             value={formulario.fechaFinDeServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <button type="submit">Guardar Servicio</button>
//       </form>

//       <div className="filtros-fecha">
//         <label>Mes:</label>
//         <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}>
//           {meses.map((mes, i) => (
//             <option key={i} value={i}>{mes}</option>
//           ))}
//         </select>

//         <label>Año:</label>
//         <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}>
//           {[2024, 2025, 2026].map((anio) => (
//             <option key={anio} value={anio}>{anio}</option>
//           ))}
//         </select>
//       </div>

//       <h2>Programación de {meses[mesSeleccionado]} {anioSeleccionado}</h2>

//       <div className="tabla-scroll">
//         <table className="tabla-programacion">
//           <thead>
//             <tr>
//               <th>Placa</th>
//               <th>ID Servicio</th>
//               <th>Descripción</th>
//               {diasDelMes.map((dia, i) => (
//                 <th key={i}>{dia.getDate()}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {serviciosFiltrados.map((servicio, index) => (
//               <tr key={index}>
//                 <td>{servicio.placaVehiculoAsignado}</td>
//                 <td>{servicio.idServicio}</td>
//                 <td>{servicio.descripcionServicio}</td>
//                 {diasDelMes.map((dia, i) => {
//                   const fechaDia = normalizarFecha(dia);
//                   const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
//                   const fin = normalizarFecha(servicio.fechaFinDeServicio);
//                   const estaAsignado = inicio <= fechaDia && fin >= fechaDia;
//                   const color = coloresPorServicio[servicio.idServicio];
//                   return (
//                     <td key={i} style={{ backgroundColor: estaAsignado ? color : '' }}>
//                       {estaAsignado ? "✔️" : ""}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }












// funciona con fechas rodadas rodada un dia hacia atras tanto de inicio como de final
// import { useEffect, useMemo, useState } from 'react';
// import axios from 'axios';
// import './VerProgramacion.scss';

// export default function VerProgramacion() {
//   const [formulario, setFormulario] = useState({
//     idServicio: '',
//     placaVehiculoAsignado: '',
//     descripcionServicio: '',
//     fechaInicioDeServicio: '',
//     fechaFinDeServicio: ''
//   });

//   const [programaciones, setProgramaciones] = useState([]);
//   const [mesSeleccionado, setMesSeleccionado] = useState(4); // Mayo
//   const [anioSeleccionado, setAnioSeleccionado] = useState(2025);

//   const [diaSeleccionado, setDiaSeleccionado] = useState(null);
//   const [serviciosDelDia, setServiciosDelDia] = useState([]);

//   useEffect(() => {
//     axios
//       .get('http://localhost:5600/api/v1/Servicio')
//       .then((res) => {
//         const data = Array.isArray(res.data) ? res.data : res.data.msg;
//         setProgramaciones(data);
//       })
//       .catch((err) => {
//         console.error('Error al obtener programaciones:', err);
//         setProgramaciones([]);
//       });
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormulario({ ...formulario, [name]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     axios
//       .post('http://localhost:5600/api/v1/Servicio', formulario)
//       .then(() => {
//         setFormulario({
//           idServicio: '',
//           placaVehiculoAsignado: '',
//           descripcionServicio: '',
//           fechaInicioDeServicio: '',
//           fechaFinDeServicio: ''
//         });
//         return axios.get('http://localhost:5600/api/v1/Servicio');
//       })
//       .then((res) => {
//         const data = Array.isArray(res.data) ? res.data : res.data.msg;
//         setProgramaciones(data);
//       })
//       .catch((err) => console.error('Error al guardar o recargar:', err));
//   };

//   const generarDiasDelMes = (anio, mes) => {
//     const dias = [];
//     const fecha = new Date(anio, mes, 1);
//     while (fecha.getMonth() === mes) {
//       dias.push(new Date(fecha));
//       fecha.setDate(fecha.getDate() + 1);
//     }
//     return dias;
//   };

//   const normalizarFecha = (fecha) => {
//     const f = new Date(fecha);
//     f.setHours(0, 0, 0, 0);
//     return f;
//   };

//   const diasDelMes = generarDiasDelMes(anioSeleccionado, mesSeleccionado);

//   const generarColorAleatorio = () => {
//     const letras = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//       color += letras[Math.floor(Math.random() * 16)];
//     }
//     return color;
//   };

//   const coloresPorServicio = useMemo(() => {
//     const colores = {};
//     programaciones.forEach(servicio => {
//       colores[servicio.idServicio] = generarColorAleatorio();
//     });
//     return colores;
//   }, [programaciones]);

//   const meses = [
//     'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
//     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
//   ];

//   const serviciosFiltrados = programaciones.filter(servicio => {
//     const inicio = new Date(servicio.fechaInicioDeServicio);
//     const fin = new Date(servicio.fechaFinDeServicio);
//     return (
//       (inicio.getFullYear() === anioSeleccionado && inicio.getMonth() <= mesSeleccionado) &&
//       (fin.getFullYear() === anioSeleccionado && fin.getMonth() >= mesSeleccionado)
//     );
//   });

//   const manejarClickEnDia = (dia) => {
//     const diaNormalizado = normalizarFecha(dia);
//     const serviciosActivos = serviciosFiltrados.filter(servicio => {
//       const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
//       const fin = normalizarFecha(servicio.fechaFinDeServicio);
//       return inicio <= diaNormalizado && diaNormalizado <= fin;
//     });
//     setDiaSeleccionado(diaNormalizado);
//     setServiciosDelDia(serviciosActivos);
//   };

//   return (
//     <div className="page-container">
//       <h1>Programar un nuevo servicio</h1>
//       <form onSubmit={handleSubmit} className="formulario-servicio">
//         <div className="form-group">
//           <label>ID del Servicio</label>
//           <input
//             type="text"
//             name="idServicio"
//             value={formulario.idServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Placa</label>
//           <input
//             type="text"
//             name="placaVehiculoAsignado"
//             value={formulario.placaVehiculoAsignado}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Descripción</label>
//           <input
//             type="text"
//             name="descripcionServicio"
//             value={formulario.descripcionServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Fecha de Inicio</label>
//           <input
//             type="date"
//             name="fechaInicioDeServicio"
//             value={formulario.fechaInicioDeServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Fecha de Fin</label>
//           <input
//             type="date"
//             name="fechaFinDeServicio"
//             value={formulario.fechaFinDeServicio}
//             onChange={handleChange}
//           />
//         </div>

//         <button type="submit">Guardar Servicio</button>
//       </form>

//       <div className="filtros-fecha">
//         <label>Mes:</label>
//         <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}>
//           {meses.map((mes, i) => (
//             <option key={i} value={i}>{mes}</option>
//           ))}
//         </select>

//         <label>Año:</label>
//         <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}>
//           {[2024, 2025, 2026].map((anio) => (
//             <option key={anio} value={anio}>{anio}</option>
//           ))}
//         </select>
//       </div>

//       <h2>Programación de {meses[mesSeleccionado]} {anioSeleccionado}</h2>

//       <div className="tabla-scroll">
//         <table className="tabla-programacion">
//           <thead>
//             <tr>
//               <th className="sticky-col">Placa</th>
//               <th>ID Servicio</th>
//               <th>Descripción</th>
//               {diasDelMes.map((dia, i) => (
//                 <th
//                   key={i}
//                   onClick={() => manejarClickEnDia(dia)}
//                   style={{ cursor: 'pointer', backgroundColor: '#f0f0f0' }}
//                   title="Ver servicios de este día"
//                 >
//                   {dia.getDate()}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {serviciosFiltrados.map((servicio, index) => (
//               <tr key={index}>
//                 <td className="sticky-col">{servicio.placaVehiculoAsignado}</td>
//                 <td>{servicio.idServicio}</td>
//                 <td>{servicio.descripcionServicio}</td>
//                 {diasDelMes.map((dia, i) => {
//                   const fechaDia = normalizarFecha(dia);
//                   const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
//                   const fin = normalizarFecha(servicio.fechaFinDeServicio);
//                   const estaAsignado = inicio <= fechaDia && fin >= fechaDia;
//                   const color = coloresPorServicio[servicio.idServicio];
//                   return (
//                     <td key={i} style={{ backgroundColor: estaAsignado ? color : '' }}>
//                       {estaAsignado ? "✔️" : ""}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>



//       {/* dia seleccionado de la tabla */}
//       {diaSeleccionado && (
//         <div className="servicios-dia">
//           <h3>Servicios activos el {diaSeleccionado.toLocaleDateString()}</h3>
//           {serviciosDelDia.length > 0 ? (
//             <ul>
//               {serviciosDelDia.map((serv, idx) => (
//                 <li key={idx}>
//                   <strong>{serv.placaVehiculoAsignado}</strong> - {serv.descripcionServicio} ({serv.idServicio})
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No hay servicios activos en este día.</p>
//           )}
//           <button onClick={() => setDiaSeleccionado(null)}>Cerrar</button>
//         </div>
//       )}
//     </div>
//   );
// }




































//funciona sin scroll horizontal y vertical en la tabla
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './VerProgramacion.scss';

export default function VerProgramacion() {
  const [formulario, setFormulario] = useState({
    idServicio: '',
    placaVehiculoAsignado: '',
    descripcionServicio: '',
    fechaInicioDeServicio: '',
    fechaFinDeServicio: ''
  });

  const [vehiculos, setVehiculos] = useState([]); //obteniendo informacion de vehiculos registrados
  const [programaciones, setProgramaciones] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(4); // Mayo
  const [anioSeleccionado, setAnioSeleccionado] = useState(2025);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [serviciosDelDia, setServiciosDelDia] = useState([]);

  useEffect(() => {
    //obteniendo servicios
    axios
      .get('http://localhost:5600/api/v1/Servicio')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.msg;
        setProgramaciones(data);
      })
      .catch((err) => {
        console.error('Error al obtener programaciones:', err);
        setProgramaciones([]);
      });

    // Obtener vehículos y placas
    axios.get('http://localhost:5600/api/v1/Vehiculo')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.msg;
        setVehiculos(data);
      })
      .catch((err) => {
        console.error('Error al obtener vehículos:', err);
        setVehiculos([]);
      });

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };


  const verificarDisponibilidadPlaca = () => { //verificando si en el rango ya la placa tiene servicio
    const inicioNuevo = new Date(formulario.fechaInicioDeServicio);
    const finNuevo = new Date(formulario.fechaFinDeServicio);

    return programaciones.some(servicio => {
      if (servicio.placaVehiculoAsignado === formulario.placaVehiculoAsignado) {
        const inicioExistente = new Date(servicio.fechaInicioDeServicio);
        const finExistente = new Date(servicio.fechaFinDeServicio);

        return (inicioNuevo <= finExistente && finNuevo >= inicioExistente);
      }
      return false;
    });
    };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificarDisponibilidadPlaca()) {
      alert("🚫 No se puede guardar el servicio: la placa ya está asignada en el rango de fechas.");
      return;
    }
    axios
      .post('http://localhost:5600/api/v1/Servicio', formulario)
      .then(() => {
        setFormulario({
          idServicio: '',
          placaVehiculoAsignado: '',
          descripcionServicio: '',
          fechaInicioDeServicio: '',
          fechaFinDeServicio: ''
        });
        return axios.get('http://localhost:5600/api/v1/Servicio');
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.msg;
        setProgramaciones(data);
        alert("✅ Servicio guardado con éxito");
      })
      .catch((err) => console.error('Error al guardar o recargar:', err));
  };

  const generarDiasDelMes = (anio, mes) => {
    const dias = [];
    const fecha = new Date(anio, mes, 1);
    while (fecha.getMonth() === mes) {
      dias.push(new Date(fecha));
      fecha.setDate(fecha.getDate() + 1);
    }
    return dias;
  };

  const normalizarFecha = (fecha) => {
    if (!fecha) return null;
    const f = new Date(fecha);
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
  };

  const diasDelMes = generarDiasDelMes(anioSeleccionado, mesSeleccionado);

  const generarColorAleatorio = () => {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const coloresPorServicio = useMemo(() => {
    const colores = {};
    programaciones.forEach(servicio => {
      colores[servicio.idServicio] = generarColorAleatorio();
    });
    return colores;
  }, [programaciones]);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const serviciosFiltrados = programaciones.filter(servicio => {
    const inicio = new Date(servicio.fechaInicioDeServicio);
    const fin = new Date(servicio.fechaFinDeServicio);
    return (
      (inicio.getFullYear() === anioSeleccionado && inicio.getMonth() <= mesSeleccionado) &&
      (fin.getFullYear() === anioSeleccionado && fin.getMonth() >= mesSeleccionado)
    );
  });

  const manejarClickEnDia = (dia) => {
    const diaNormalizado = normalizarFecha(dia);
    const serviciosActivos = serviciosFiltrados.filter(servicio => {
      const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
      const fin = normalizarFecha(servicio.fechaFinDeServicio);
      return inicio <= diaNormalizado && diaNormalizado <= fin;
    });
    setDiaSeleccionado(diaNormalizado);
    setServiciosDelDia(serviciosActivos);
  };

  return (
    <div className="page-container">
      <h1>Programar un nuevo servicio</h1>
      <form onSubmit={handleSubmit} className="formulario-servicio">
        <div className="form-group">
          <label>ID del Servicio</label>
          <input
            type="text"
            name="idServicio"
            value={formulario.idServicio}
            onChange={handleChange}
          />
        </div>

        {/* <div className="form-group">
          <label>Placa</label>
          <input
            type="text"
            name="placaVehiculoAsignado"
            value={formulario.placaVehiculoAsignado}
            onChange={handleChange}
          />
        </div> */}

        <div className="form-group">
          <label>Placa</label>
          <p>Los vehiculos Inactivos no se muestran en esta lista</p>
          <select name="placaVehiculoAsignado" value={formulario.placaVehiculoAsignado} onChange={handleChange}>
            <option value="">Seleccione una placa</option>
            {vehiculos.map((vehiculo, index) => (
              <option key={index} value={vehiculo.placaVehiculo}>
                {vehiculo.placaVehiculo}
              </option>
            ))}
          </select>
        </div>


        <div className="form-group">
          <label>Descripción</label>
          <input
            type="text"
            name="descripcionServicio"
            value={formulario.descripcionServicio}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Fecha de Inicio</label>
          <input
            type="date"
            name="fechaInicioDeServicio"
            value={formulario.fechaInicioDeServicio}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Fecha de Fin</label>
          <input
            type="date"
            name="fechaFinDeServicio"
            value={formulario.fechaFinDeServicio}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Guardar Servicio</button>
      </form>

      <div className="filtros-fecha">
        <label>Mes:</label>
        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}>
          {meses.map((mes, i) => (
            <option key={i} value={i}>{mes}</option>
          ))}
        </select>

        <label>Año:</label>
        <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}>
          {[2024, 2025, 2026].map((anio) => (
            <option key={anio} value={anio}>{anio}</option>
          ))}
        </select>
      </div>

      <h2>Programación de {meses[mesSeleccionado]} {anioSeleccionado}</h2>

      <div className="tabla-scroll">
        <table className="tabla-programacion">
          <thead>
            <tr>
              <th className="sticky-col">Placa</th>
              <th>ID Servicio</th>
              <th>Descripción</th>
              {diasDelMes.map((dia, i) => (
                <th
                  key={i}
                  onClick={() => manejarClickEnDia(dia)}
                  style={{ cursor: 'pointer', backgroundColor: '#f0f0f0' }}
                  title="Ver servicios de este día"
                >
                  {dia.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {serviciosFiltrados.map((servicio, index) => (
              <tr key={index}>
                <td className="sticky-col">{servicio.placaVehiculoAsignado}</td>
                <td>{servicio.idServicio}</td>
                <td>{servicio.descripcionServicio}</td>
                {diasDelMes.map((dia, i) => {
                  const fechaDia = normalizarFecha(dia);
                  const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
                  const fin = normalizarFecha(servicio.fechaFinDeServicio);
                  const estaAsignado = inicio <= fechaDia && fechaDia <= fin;
                  const color = coloresPorServicio[servicio.idServicio];
                  return (
                    <td
                      key={i}
                      style={{ backgroundColor: estaAsignado ? color : '' }}
                      title={estaAsignado ? servicio.descripcionServicio : ''}
                    >
                      {estaAsignado ? "✔️" : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {diaSeleccionado && (
        <div className="servicios-dia">
          <h3>Servicios activos el {diaSeleccionado.toLocaleDateString()}</h3>
          {serviciosDelDia.length > 0 ? (
            <ul>
              {serviciosDelDia.map((serv, idx) => (
                <li key={idx}>
                  <strong>{serv.placaVehiculoAsignado}</strong> - {serv.descripcionServicio} ({serv.idServicio})
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay servicios activos en este día.</p>
          )}
          <button onClick={() => setDiaSeleccionado(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}
