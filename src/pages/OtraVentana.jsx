import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

const VEHICULOS = [
  {
    tipo: "Bus",
    capacidades: [
      { capacidad: 40, valorBase: 10000, valorPorKm: 3500 },
      { capacidad: 50, valorBase: 12000, valorPorKm: 4000 },
    ],
  },
  {
    tipo: "Buseta",
    capacidades: [
      { capacidad: 30, valorBase: 8000, valorPorKm: 3000 },
      { capacidad: 25, valorBase: 7000, valorPorKm: 2500 },
    ],
  },
  {
    tipo: "Microbús",
    capacidades: [
      { capacidad: 19, valorBase: 6000, valorPorKm: 2000 },
      { capacidad: 16, valorBase: 5500, valorPorKm: 1800 },
    ],
  },
];

export default function OtraVentana() {
  const [tipoVehiculo, setTipoVehiculo] = useState(VEHICULOS[0].tipo);
  const [capacidad, setCapacidad] = useState(VEHICULOS[0].capacidades[0].capacidad);
  const [soloIda, setSoloIda] = useState(true);

  // Configuración editable
  const [valorBase, setValorBase] = useState(VEHICULOS[0].capacidades[0].valorBase);
  const [valorPorKm, setValorPorKm] = useState(VEHICULOS[0].capacidades[0].valorPorKm);
  const [retenes, setRetenes] = useState(0);
  const [valorPorReten, setValorPorReten] = useState(0);

  const [inicio, setInicio] = useState(null);
  const [fin, setFin] = useState(null);
  const [rutas, setRutas] = useState([]);
  const [nombreRuta, setNombreRuta] = useState("");
  const [rutaIda, setRutaIda] = useState(null);
  const [rutaVuelta, setRutaVuelta] = useState(null);
  const [origenTexto, setOrigenTexto] = useState("");
  const [destinoTexto, setDestinoTexto] = useState("");
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);

  // Actualiza valores base y por km al cambiar tipo/capacidad
  useEffect(() => {
    const vehiculoSeleccionado = VEHICULOS.find(v => v.tipo === tipoVehiculo);
    const capacidadSeleccionada = vehiculoSeleccionado.capacidades.find(c => c.capacidad === Number(capacidad));
    setValorBase(capacidadSeleccionada.valorBase);
    setValorPorKm(capacidadSeleccionada.valorPorKm);
  }, [tipoVehiculo, capacidad]);

  function calcularDistanciaRuta(ruta) {
    if (!ruta || ruta.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < ruta.length; i++) {
      total += calcularDistancia(ruta[i - 1], ruta[i]);
    }
    return total;
  }

  function calcularDistancia(p1, p2) {
    if (!p1 || !p2) return 0;
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Distancias reales
  const distanciaIda = rutaIda ? calcularDistanciaRuta(rutaIda) : calcularDistancia(inicio, fin);
  const distanciaVuelta = rutaVuelta ? calcularDistanciaRuta(rutaVuelta) : (soloIda ? 0 : calcularDistancia(fin, inicio));
  const distanciaTotal = soloIda ? distanciaIda : distanciaIda + distanciaVuelta;

  // Suma el valor de los retenes al valor estimado
  const valorEstimado = valorBase + Math.round(distanciaTotal * valorPorKm) + (retenes * valorPorReten);

  // Guardar ruta predeterminada
  const guardarRuta = () => {
    if (inicio && fin && nombreRuta) {
      setRutas([
        ...rutas,
        {
          nombre: nombreRuta,
          inicio,
          fin,
          tipoVehiculo,
          capacidad,
          soloIda,
          valorBase,
          valorPorKm,
        },
      ]);
      setNombreRuta("");
    }
  };

  const cargarRuta = (ruta) => {
    setInicio(ruta.inicio);
    setFin(ruta.fin);
    setTipoVehiculo(ruta.tipoVehiculo);
    setCapacidad(ruta.capacidad);
    setSoloIda(ruta.soloIda);
    if (ruta.valorBase) setValorBase(ruta.valorBase);
    if (ruta.valorPorKm) setValorPorKm(ruta.valorPorKm);
  };

  // Obtener rutas reales de ida y vuelta
  async function obtenerRutaReal(p1, p2, setRuta) {
    if (!p1 || !p2) return;
    const apiKey = "5b3ce3597851110001cf62487b7959070c7d4e169fdcd6d5e502de1b";
    const perfilRuta = tipoVehiculo === "Bus" ? "driving-hgv" : "driving-car";
    const url = `https://api.openrouteservice.org/v2/directions/${perfilRuta}/geojson`;
    const body = {
      coordinates: [
        [p1.lng, p1.lat],
        [p2.lng, p2.lat]
      ]
    };
    try {
      const res = await axios.post(url, body, {
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json"
        }
      });
      setRuta(res.data.features[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng })));
    } catch (err) {
      setRuta(null);
    }
  }

  useEffect(() => {
    if (inicio && fin) {
      obtenerRutaReal(inicio, fin, setRutaIda);
      if (!soloIda) {
        obtenerRutaReal(fin, inicio, setRutaVuelta);
      } else {
        setRutaVuelta(null);
      }
    } else {
      setRutaIda(null);
      setRutaVuelta(null);
    }
  }, [inicio, fin, soloIda]);

  const buscarSugerencias = async (texto, setSugerencias) => {
    if (!texto) {
      setSugerencias([]);
      return;
    }
    const apiKey = "5b3ce3597851110001cf62487b7959070c7d4e169fdcd6d5e502de1b";
    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(texto)}&boundary.country=CO`;
    try {
      const res = await axios.get(url);
      setSugerencias(res.data.features || []);
    } catch {
      setSugerencias([]);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl">Página: cálculo de valor de viaje</h1>

      <section style={{ margin: "20px 0" }}>
        <h2>Configuración Precoltur</h2>
        <label>
          Tipo de vehículo:{" "}
          <select
            value={tipoVehiculo}
            onChange={e => {
              setTipoVehiculo(e.target.value);
              const nuevo = VEHICULOS.find(v => v.tipo === e.target.value);
              setCapacidad(nuevo.capacidades[0].capacidad);
            }}
            style={{ marginRight: 10 }}
          >
            {VEHICULOS.map((v, idx) => (
              <option key={idx} value={v.tipo}>{v.tipo}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 10 }}>
          Capacidad:{" "}
          <select
            value={capacidad}
            onChange={e => setCapacidad(Number(e.target.value))}
            style={{ marginRight: 10 }}
          >
            {VEHICULOS.find(v => v.tipo === tipoVehiculo).capacidades.map((c, idx) => (
              <option key={idx} value={c.capacidad}>{c.capacidad} pasajeros</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 10 }}>
          Servicio:{" "}
          <select
            value={soloIda ? "ida" : "ida_vuelta"}
            onChange={e => setSoloIda(e.target.value === "ida")}
          >
            <option value="ida">Solo ida</option>
            <option value="ida_vuelta">Ida y vuelta</option>
          </select>
        </label>
        <label style={{ marginLeft: 10 }}>
          Valor base:{" "}
          <input
            type="number"
            value={valorBase}
            onChange={e => setValorBase(Number(e.target.value))}
            style={{ width: 100 }}
          />
        </label>
        <label style={{ marginLeft: 10 }}>
          Valor por km:{" "}
          <input
            type="number"
            value={valorPorKm}
            onChange={e => setValorPorKm(Number(e.target.value))}
            style={{ width: 100 }}
          />
        </label>
        <label style={{ marginLeft: 10 }}>
          Retenes:{" "}
          <input
            type="number"
            min={0}
            value={retenes}
            onChange={e => setRetenes(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </label>
        <label style={{ marginLeft: 10 }}>
          Valor por retén:{" "}
          <input
            type="number"
            min={0}
            value={valorPorReten}
            onChange={e => setValorPorReten(Number(e.target.value))}
            style={{ width: 100 }}
          />
        </label>
      </section>

      <section style={{ margin: "20px 0" }}>
        <h2>Selecciona inicio y fin en el mapa</h2>
        <MapContainer
          center={[6.2442, -75.5812]}
          zoom={13}
          style={{ height: 500, width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationSelector
            onSelect={(latlng) => {
              if (!inicio) setInicio(latlng);
              else if (!fin) setFin(latlng);
              else {
                setInicio(latlng);
                setFin(null);
              }
            }}
          />
          {inicio && <Marker position={inicio} />}
          {fin && <Marker position={fin} />}
          {rutaIda && <Polyline positions={rutaIda} color="blue" />}
          {rutaVuelta && <Polyline positions={rutaVuelta} color="red" />}
        </MapContainer>
        <div style={{ marginTop: 10 }}>
          <button onClick={() => { setInicio(null); setFin(null); }}>
            Limpiar puntos
          </button>
        </div>
      </section>

      <section>
        <h2>Resultado</h2>
        <p>
          Distancia estimada: <b>{distanciaTotal.toFixed(2)} km</b>
        </p>
        <p>
          Valor estimado: <b>${valorEstimado.toLocaleString()}</b>
        </p>
        {!soloIda && (
          <div style={{ color: "#888" }}>
            <span>Azul: ida &nbsp;&nbsp; Rojo: regreso</span>
          </div>
        )}
        {retenes > 0 && (
          <div style={{ color: "#888" }}>
            <span>Incluye {retenes} reten(es) x ${valorPorReten.toLocaleString()} = ${(
              retenes * valorPorReten
            ).toLocaleString()}</span>
          </div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Guardar ruta predeterminada</h2>
        <input
          type="text"
          placeholder="Nombre de la ruta"
          value={nombreRuta}
          onChange={(e) => setNombreRuta(e.target.value)}
        />
        <button onClick={guardarRuta} style={{ marginLeft: 10 }}>
          Guardar ruta
        </button>
        <ul>
          {rutas.map((ruta, idx) => (
            <li key={idx}>
              <button onClick={() => cargarRuta(ruta)}>
                {ruta.nombre} ({ruta.inicio.lat.toFixed(4)},{ruta.inicio.lng.toFixed(4)} → {ruta.fin.lat.toFixed(4)},{ruta.fin.lng.toFixed(4)})
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ margin: "20px 0" }}>
        <h2>Buscar origen y destino</h2>
        <div>
          <input
            type="text"
            placeholder="Escribe el origen"
            value={origenTexto}
            onChange={e => {
              setOrigenTexto(e.target.value);
              buscarSugerencias(e.target.value, setSugerenciasOrigen);
            }}
            style={{ width: 250, marginRight: 10 }}
          />
          {sugerenciasOrigen.length > 0 && (
            <ul style={{ background: "#fff", border: "1px solid #ccc", position: "absolute", zIndex: 10, width: 250 }}>
              {sugerenciasOrigen.map((s, idx) => (
                <li
                  key={idx}
                  style={{ cursor: "pointer", padding: 4 }}
                  onClick={() => {
                    setInicio({ lat: s.geometry.coordinates[1], lng: s.geometry.coordinates[0] });
                    setOrigenTexto(s.properties.label);
                    setSugerenciasOrigen([]);
                  }}
                >
                  {s.properties.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            type="text"
            placeholder="Escribe el destino"
            value={destinoTexto}
            onChange={e => {
              setDestinoTexto(e.target.value);
              buscarSugerencias(e.target.value, setSugerenciasDestino);
            }}
            style={{ width: 250, marginRight: 10 }}
          />
          {sugerenciasDestino.length > 0 && (
            <ul style={{ background: "#fff", border: "1px solid #ccc", position: "absolute", zIndex: 10, width: 250 }}>
              {sugerenciasDestino.map((s, idx) => (
                <li
                  key={idx}
                  style={{ cursor: "pointer", padding: 4 }}
                  onClick={() => {
                    setFin({ lat: s.geometry.coordinates[1], lng: s.geometry.coordinates[0] });
                    setDestinoTexto(s.properties.label);
                    setSugerenciasDestino([]);
                  }}
                >
                  {s.properties.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}