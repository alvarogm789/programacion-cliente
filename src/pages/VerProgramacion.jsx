// VerProgramacion.jsx
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './VerProgramacion.scss';
import { obtenerServicios, guardarServicio, eliminarServicio } from '../api/servicioApi';
import { obtenerVehiculos } from '../api/vehiculoApi';
import Modal from '../components/ModalDia';

// import * as XLSX from 'xlsx';
import * as XLSX from 'xlsx-js-style';




export default function VerProgramacion() {
  

  const exportarExcelDelDia = () => {
    const coloresClientes = {};
    let colorIndex = 0;

    // Generar colores únicos por cliente
    const generarColor = () => {
      const colores = [
        "#F28B82", "#FBBC04", "#FFF475", "#CCFF90", "#A7FFEB", "#CBF0F8",
        "#AECBFA", "#D7AEFB", "#FDCFE8", "#E6C9A8", "#E8EAED"
      ];
      return colores[colorIndex++ % colores.length];
    };

    // Agrupar por cliente los servicios del día
    const serviciosAgrupados = serviciosDelDia.map(serv => {
      if (!coloresClientes[serv.cliente]) {
        coloresClientes[serv.cliente] = generarColor();
      }

      return {
        Estado: "OCUPADO",
        Cliente: serv.cliente,
        Placa: serv.placaVehiculoAsignado,
        Descripción: serv.descripcionServicio,
        Inicio: new Date(serv.fechaInicioDeServicio).toLocaleString(),
        Fin: new Date(serv.fechaFinDeServicio).toLocaleString(),
        Color: coloresClientes[serv.cliente],
      };
    });

    const disponibles = vehiculosFiltrados.map(v => ({
      Estado: "DISPONIBLE",
      Cliente: "",
      Placa: v.placaVehiculo,
      Descripción: v.conductorAsignado || "",
      Inicio: "",
      Fin: "",
      Color: "#C6EFCE" // verde claro para disponibles
    }));

    const hojaDatos = [...serviciosAgrupados, ...disponibles];

    const wsData = [
      ["Estado", "Cliente", "Placa", "Descripción", "Inicio", "Fin"],
      ...hojaDatos.map(item => [
        item.Estado,
        item.Cliente,
        item.Placa,
        item.Descripción,
        item.Inicio,
        item.Fin
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Estilizar filas
    hojaDatos.forEach((item, idx) => {
      const row = idx + 1; // +1 porque headers están en fila 0
      const fill = {
        patternType: "solid",
        fgColor: { rgb: item.Color.replace("#", "") }
      };

      for (let col = 0; col < 6; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cell]) continue;
        ws[cell].s = {
          fill,
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Servicios del Día");

    const fecha = diaSeleccionado?.toLocaleDateString().replace(/\//g, '-');
    XLSX.writeFile(wb, `Servicios-${fecha}.xlsx`);
  };













  const hoy = new Date();

  // Leer del localStorage o usar el mes/año actual
  const mesInicial = localStorage.getItem('mesSeleccionado');
  const anioInicial = localStorage.getItem('anioSeleccionado');

  const [formulario, setFormulario] = useState({
    cliente: '', // antes idServicio
    placaVehiculoAsignado: '',
    descripcionServicio: '',
    fechaInicioDeServicio: '',
    horaInicioDeServicio: '',
    fechaFinDeServicio: '',
    valorServicio: ''
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [programaciones, setProgramaciones] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    mesInicial !== null ? parseInt(mesInicial) : hoy.getMonth()
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    anioInicial !== null ? parseInt(anioInicial) : hoy.getFullYear()
  );
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [serviciosDelDia, setServiciosDelDia] = useState([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busquedaVehiculo, setBusquedaVehiculo] = useState('');

  useEffect(() => {
    obtenerServicios()
      .then(setProgramaciones)
      .catch((err) => {
        console.error('Error al obtener programaciones:', err);
        setProgramaciones([]);
      });

    obtenerVehiculos()
      .then(setVehiculos)
      .catch((err) => {
        console.error('Error al obtener vehículos:', err);
        setVehiculos([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const verificarDisponibilidadPlaca = () => {
    const inicioNuevo = new Date(`${formulario.fechaInicioDeServicio}T${formulario.horaInicioDeServicio}`);
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

    if (!formulario.fechaInicioDeServicio || !formulario.horaInicioDeServicio) {
      alert("Debes ingresar tanto la fecha como la hora de inicio.");
      return;
    }

    const fechaHoraInicio = new Date(`${formulario.fechaInicioDeServicio}T${formulario.horaInicioDeServicio}`);

    // Si el usuario no especifica hora de fin, por defecto será 23:55
    let fechaFin;
    if (formulario.fechaFinDeServicio) {
      fechaFin = new Date(`${formulario.fechaFinDeServicio}T23:55:00`);
    } else {
      fechaFin = new Date(fechaHoraInicio); // fallback
    }

    // Validar que no se inicie en domingo
    if (fechaHoraInicio.getDay() === 0) {
      alert("🚫 No se pueden iniciar servicios en domingo.");
      return;
    }

    if (verificarDisponibilidadPlaca()) {
      alert("🚫 No se puede guardar el servicio: la placa ya está asignada en el rango de fechas.");
      return;
    }

    const datosAEnviar = {
      ...formulario,
      fechaInicioDeServicio: fechaHoraInicio.toISOString(),
      fechaFinDeServicio: fechaFin.toISOString()
    };

    guardarServicio(datosAEnviar)
      .then(() => {
        setFormulario({
          cliente: '',
          placaVehiculoAsignado: '',
          descripcionServicio: '',
          fechaInicioDeServicio: '',
          horaInicioDeServicio: '',
          fechaFinDeServicio: '',
          valorServicio: ''
        });
        return obtenerServicios();
      })
      .then(setProgramaciones)
      .then(() => alert("✅ Servicio guardado con éxito"))
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
      colores[servicio._id] = generarColorAleatorio();
    });
    return colores;
  }, [programaciones]);

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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

    // Calcular placas disponibles
    const placasOcupadas = serviciosActivos.map(s => s.placaVehiculoAsignado);
    const disponibles = vehiculos.filter(
      v => !placasOcupadas.includes(v.placaVehiculo)
    );
    setVehiculosDisponibles(disponibles);
  };

  const exportarAExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Servicios');

    // Letras de los días
    const letrasDias = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    // Cabeceras: Placa, ID, Descripción, Día (ej: L 1, M 2, ...)
    const headers = [
      "Placa",
      "Cliente",
      "Descripción",
      "Fecha y hora de inicio",
      "Fecha de fin",
      ...diasDelMes.map((dia) => `${letrasDias[dia.getDay()]} ${dia.getDate()}`)
    ];
    const headerRow = worksheet.addRow(headers);

    // Colorea los domingos en la cabecera
    diasDelMes.forEach((dia, i) => {
      if (dia.getDay() === 0) {
        // +6 porque ahora hay 5 columnas fijas antes de los días
        headerRow.getCell(i + 6).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE6E6' }
        };
        headerRow.getCell(i + 6).font = { color: { argb: 'FFC0392B' }, bold: true };
      }
    });

    // Filas de servicios
    serviciosFiltrados.forEach((servicio) => {
      const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
      const fin = normalizarFecha(servicio.fechaFinDeServicio);
      let color = coloresPorServicio[servicio._id] || "#FFFFFF";
      if (color.startsWith("#")) color = "FF" + color.slice(1);

      // Formatea fecha y hora de inicio
      const fechaHoraInicio = new Date(servicio.fechaInicioDeServicio);
      const fechaInicioStr = fechaHoraInicio.toLocaleDateString();
      const horaInicioStr = fechaHoraInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fechaFinStr = new Date(servicio.fechaFinDeServicio).toLocaleDateString();

      const row = [
        servicio.placaVehiculoAsignado,
        servicio.cliente,
        servicio.descripcionServicio,
        `${fechaInicioStr} ${horaInicioStr}`,
        fechaFinStr,
        ...diasDelMes.map((dia) => {
          const fechaDia = normalizarFecha(dia);
          return (inicio <= fechaDia && fechaDia <= fin) ? "✔️" : "";
        })
      ];
      const excelRow = worksheet.addRow(row);

      // Colorear las celdas de los días asignados
      diasDelMes.forEach((dia, i) => {
        const fechaDia = normalizarFecha(dia);
        if (inicio <= fechaDia && fechaDia <= fin) {
          excelRow.getCell(i + 6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          };
        }
        if (dia.getDay() === 0) {
          excelRow.getCell(i + 6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE6E6' }
          };
          excelRow.getCell(i + 6).font = { color: { argb: 'FFC0392B' } };
        }
      });
    });

    // Ajustar ancho de columnas
    worksheet.columns.forEach((col, i) => {
      col.width = i < 5 ? 18 : 5; // Ahora las primeras 5 columnas son datos fijos
    });

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Programacion_${meses[mesSeleccionado]}_${anioSeleccionado}.xlsx`);
  };

  const handleEliminarServicio = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este servicio?")) {
      eliminarServicio(id)
        .then(() => obtenerServicios())
        .then(setProgramaciones)
        .then(() => alert("✅ Servicio eliminado"))
        .catch(err => {
          alert("Error al eliminar el servicio");
          console.error(err);
        });
    }
  };

  const handleSeleccionarVehiculo = (placaVehiculo) => {
    setFormulario({
      ...formulario,
      placaVehiculoAsignado: placaVehiculo,
      fechaInicioDeServicio: diaSeleccionado
        ? new Date(diaSeleccionado).toISOString().slice(0, 10)
        : ""
    });
    setMostrarFormulario(true);
    setDiaSeleccionado(null);
  };

  const clientesOpciones = [
    "CCF COMFENALCO ANTIOQUIA",
    "INSTITUCIÒN UNIVERSITARIA COLEGIO MAYOR DE ANTIOQUIA",
    "ASOCIACION PADRES DE FAMILIA IE MATER DEI",
    "COOPERATIVA DE TRANSPORTADORES CONTRATISTAS",
    "SISTEMAS EN PROTECCION CONTRA INCENDIOS SAS",
    "ARQUITECTURA Y CONCRETO",
    "COOPERATIVA MULTIACTIVA DE MILITARES EN RETIRO DE ANTIOQUIA"
  ];

  const vehiculosFiltrados = vehiculosDisponibles
    .filter(v => v.estado === 0)
    .filter(v =>
      v.placaVehiculo.toLowerCase().includes(busquedaVehiculo.toLowerCase()) ||
      (v.conductorAsignado && v.conductorAsignado.toLowerCase().includes(busquedaVehiculo.toLowerCase()))
    );

  // Guarda en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('mesSeleccionado', mesSeleccionado);
  }, [mesSeleccionado]);

  useEffect(() => {
    localStorage.setItem('anioSeleccionado', anioSeleccionado);
  }, [anioSeleccionado]);

  return (
    <div className="page-container">
      <h1 className='programacion-titulo'>Programación de Servicios</h1>

      <button className="btn-toggle-formulario"
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
        style={{ marginBottom: '1rem' }}
      >
        {mostrarFormulario ? "Cancelar" : "Agregar nuevo servicio"}
      </button>

      {mostrarFormulario && (
        <div className="tarjeta-agregar-servicio">
          <h3 className="titulo-tarjeta-servicio">Agregar nuevo servicio</h3>
          <hr className="division-tarjeta-servicio" />
          <form onSubmit={handleSubmit} className="formulario-servicio">
            
            <div className="form-group">
              <label>Placa</label>
              <select
                className="select-placa"
                name="placaVehiculoAsignado"
                value={formulario.placaVehiculoAsignado}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una placa</option>
                {vehiculos
                  .filter(vehiculo => vehiculo.estado === 0) // Solo disponibles
                  .map((vehiculo, index) => (
                    <option key={index} value={vehiculo.placaVehiculo}>
                      {vehiculo.conductores ? `${vehiculo.placaVehiculo} - ${vehiculo.conductores}` : vehiculo.placaVehiculo}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descripción (Origen/Destino)</label>
              <input
                type="text"
                name="descripcionServicio"
                value={formulario.descripcionServicio}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Cliente</label>
              <input
                list="clientes-list"
                name="cliente"
                value={formulario.cliente}
                onChange={handleChange}
                placeholder="Seleccione o escriba un cliente"
                autoComplete="off"
              />
              <datalist id="clientes-list">
                {clientesOpciones.map((cliente, idx) => (
                  <option key={idx} value={cliente} />
                ))}
              </datalist>
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
              <label>Hora de Inicio</label>
              <input
                type="time"
                name="horaInicioDeServicio"
                value={formulario.horaInicioDeServicio}
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

            <div className="form-group">
              <label>Valor del Servicio</label>
              <input
                type="text"
                name="valorServicio"
                value={formulario}
                onChange={handleChange}
              />
            </div>


            <button type="submit">Guardar Servicio</button>
          </form>
        </div>
      )}

      <div className="filtros-fecha">
        <label>Mes:</label>
        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}>
          {meses.map((mes, i) => (
            <option key={i} value={i}>{mes}</option>
          ))}
        </select>

        <label>Año:</label>
        <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}>
          {[...Array(10)].map((_, i) => {
            const anio = 2024 + i;
            return <option key={anio} value={anio}>{anio}</option>;
          })}
        </select>
      </div>

      <h2>Programación de {meses[mesSeleccionado]} {anioSeleccionado}</h2>

      <button className="btn-exportar-excel" onClick={exportarAExcel} >
        📤 Exportar a Excel
      </button>

      <div className="tabla-scroll">
        <table className="tabla-programacion">
          <thead>
            <tr>
              <th className="sticky-col">Placa</th>
              <th>Cliente</th>
              <th>Descripción</th>
              {diasDelMes.map((dia, i) => {
                const letrasDias = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
                const esDomingo = dia.getDay() === 0;
                return (
                  <th
                    key={i}
                    onClick={() => manejarClickEnDia(dia)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: esDomingo ? '#ffe6e6' : '#f0f0f0', // color especial para domingo
                      color: esDomingo ? '#c0392b' : undefined // texto rojo para domingo
                    }}
                    title={esDomingo ? "Domingo (no hay servicios)" : "Ver servicios de este día"}
                  >
                    {letrasDias[dia.getDay()]} {dia.getDate()}
                  </th>
                );
              })}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {serviciosFiltrados.map((servicio, index) => (
              <tr key={index}>
                <td className="sticky-col">{servicio.placaVehiculoAsignado}</td>
                <td>{servicio.cliente}</td>
                <td>{servicio.descripcionServicio}</td>
                {diasDelMes.map((dia, i) => {
                  const fechaDia = normalizarFecha(dia);
                  const inicio = normalizarFecha(servicio.fechaInicioDeServicio);
                  const fin = normalizarFecha(servicio.fechaFinDeServicio);
                  const estaAsignado = inicio <= fechaDia && fechaDia <= fin;
                  const color = coloresPorServicio[servicio._id];
                  const esDomingo = dia.getDay() === 0;
                  return (
                    <td
                      key={i}
                      style={{
                        backgroundColor: esDomingo
                          ? '#ffe6e6'
                          : estaAsignado
                          ? color
                          : '',
                        color: esDomingo ? '#c0392b' : undefined
                      }}
                      title={esDomingo ? "Domingo (no hay servicios)" : estaAsignado ? servicio.descripcionServicio : ''}
                    >
                      {estaAsignado ? "✔️" : ""}
                    </td>
                  );
                })}
                <td>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminarServicio(servicio._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!diaSeleccionado} onClose={() => setDiaSeleccionado(null)}>
        <h2 className="modal-title">
          Detalle del día {diaSeleccionado?.toLocaleDateString()}
        </h2>
        <div>
          <h3 className="modal-section-title">Servicios activos</h3>
          {serviciosDelDia.length > 0 ? (
            <ul className="modal-servicios-list">
              {serviciosDelDia.map((serv, idx) => (
                <li className="modal-servicio-item" key={idx}>
                  <span className="modal-servicio-placa">{serv.placaVehiculoAsignado}</span>
                  <span className="modal-servicio-desc">{serv.descripcionServicio}</span>
                  <span className="modal-servicio-id">Cliente: {serv.cliente}</span>
                  <span className="modal-servicio-fechas">
                    <br />
                    <strong>Inicio:</strong> {new Date(serv.fechaInicioDeServicio).toLocaleString()}<br />
                    <strong>Fin:</strong> {new Date(serv.fechaFinDeServicio).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="modal-vacio">No hay servicios activos en este día.</p>
          )}
        </div>
        <div>
          <h3 className="modal-section-title modal-section-title-green">Vehículos disponibles</h3>
          <h5 className="explicacion-vehiculos-disponibles">Seleccione el vehiculo que desea enviar a servicio en este dia</h5> 
          <input
            type="text"
            className="input-buscar-vehiculo"
            placeholder="Buscar por placa o conductor..."
            value={busquedaVehiculo}
            onChange={e => setBusquedaVehiculo(e.target.value)}
            autoComplete="off"
          />
          {vehiculosFiltrados.length > 0 ? (
            <ul className="modal-vehiculos-list">
              {vehiculosFiltrados
                .map((v, idx) => (
                  <li
                    className="modal-vehiculo-item"
                    key={idx}
                    style={{ cursor: "pointer", background: "#e8f5e9" }}
                    title="Programar un servicio con este vehículo"
                    onClick={() => handleSeleccionarVehiculo(v.placaVehiculo)}
                  >
                    {v.placaVehiculo}
                    {v.conductorAsignado && (
                      <span style={{ color: "#888", marginLeft: 8 }}>
                        — {v.conductorAsignado}
                      </span>
                    )}
                  </li>
                ))}

                <button className="btn-export-dia" onClick={exportarExcelDelDia}>
                  📤 Exportar Excel del Día
                </button>

            </ul>
            
          ) : (
            <ul className="modal-vehiculos-list" style={{ minHeight: 80 }}>
              <li className="modal-vacio">No hay vehículos disponibles que coincidan.</li>
            </ul>

          



          )}
        </div>
      </Modal>
    </div>
  );
}


