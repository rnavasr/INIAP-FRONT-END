import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import MostrarSolicitudPendienteAdmin from './MostrarSolicitudDetallePendienteAdmin';
import ListarSolicitudesAceptadasAdmin from './ListarSolicitudesAceptadoAdmin';
import ListarSolicitudesCanceladasAdmin from './ListarSolicitudesCanceladaAdmin';
import API_URL from '../../../Config';

const ListarSolicitudesPendientesAdmin = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showMostrarSolicitud, setShowMostrarSolicitud] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
  const [view, setView] = useState('pendientes');

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const id_usuario = storedUser.usuario.id_usuario;
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      const url = `${API_URL}/Informes/listar-solicitudes-pendientes-admin/${id_usuario}/`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener solicitudes');

      const data = await response.json();
      setSolicitudes(data.solicitudes);
      setFilteredSolicitudes(data.solicitudes);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(event.target.value);

    const filtered = solicitudes.filter(
      (solicitud) =>
        solicitud['Codigo de Solicitud'].toLowerCase().includes(searchValue) ||
        solicitud['Fecha Solicitud'].toLowerCase().includes(searchValue) ||
        solicitud['Motivo'].toLowerCase().includes(searchValue) ||
        solicitud['Estado'].toLowerCase().includes(searchValue)
    );

    setFilteredSolicitudes(filtered);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredSolicitudes(solicitudes);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSolicitudes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSolicitudes.length / itemsPerPage);

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleVer = async (id_solicitud) => {
    // Cambiar el estado de la solicitud a "en revisión"
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const id_usuario = storedUser.usuario.id_usuario;
      const token = localStorage.getItem('token');
      const url = `${API_URL}/Informes/cambiar-estado-solicitud-revision/${id_solicitud}/`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al cambiar el estado de la solicitud');

      // Actualizar la lista de solicitudes
      fetchSolicitudes();

      // Mostrar la solicitud seleccionada
      setSelectedSolicitudId(id_solicitud);
      setShowMostrarSolicitud(true);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCloseMostrarSolicitud = () => {
    setShowMostrarSolicitud(false);
    setSelectedSolicitudId(null);
  };

  if (view === 'aceptadas') {
    return <ListarSolicitudesAceptadasAdmin />;
  }

  if (view === 'canceladas') {
    return <ListarSolicitudesCanceladasAdmin />;
  }

  const handleViewChange = (event) => {
    setView(event.target.value);
  };

  return (
    <div className="p-4">
      {showMostrarSolicitud && selectedSolicitudId && (
        <MostrarSolicitudPendienteAdmin id_solicitud={selectedSolicitudId} onClose={handleCloseMostrarSolicitud} />
      )}
      {!showMostrarSolicitud && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-light">Gestión de Solicitudes</h1>
            <div className="flex items-center flex-1 justify-center">
              <label htmlFor="view-select" className="mr-2 text-lg font-light">Ver:</label>
              <select
                id="view-select"
                value={view}
                onChange={handleViewChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="pendientes">Solicitudes Pendientes</option>
                <option value="aceptadas">Solicitudes Aceptadas</option>
                <option value="canceladas">Solicitudes Canceladas</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Buscar por número, motivo o estado"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
                onClick={handleClear}
                style={{ minWidth: '80px' }}
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Vista en tarjetas para dispositivos móviles */}
          <div className="block md:hidden">
            {currentItems.map((solicitud) => (
              <div key={solicitud['Codigo de Solicitud']} className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
                <div className="font-bold mb-2">Código de Solicitud: {solicitud['Codigo de Solicitud']}</div>
                <div className="mb-2">Fecha Solicitud: {solicitud['Fecha Solicitud']}</div>
                <div className="mb-2">Motivo Movilización: {solicitud['Motivo']}</div>
                <div className="mb-2">Estado Solicitud: {solicitud['Estado']}</div>
                <div className="text-right">
                  <button
                    className="p-2 bg-blue-500 text-white rounded-full"
                    title="Ver Solicitud de Movilización"
                    onClick={() => handleVer(solicitud.id)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista en tabla para pantallas grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Código de Solicitud</th>
                  <th className="py-3 px-6 text-left">Fecha Solicitud</th>
                  <th className="py-3 px-6 text-left">Motivo Movilización</th>
                  <th className="py-3 px-6 text-left">Estado Solicitud</th>
                  <th className="py-3 px-6 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {currentItems.map((solicitud) => (
                  <tr key={solicitud['Codigo de Solicitud']} className="border-b border-gray-300 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{solicitud['Codigo de Solicitud']}</td>
                    <td className="py-3 px-6 text-left">{solicitud['Fecha Solicitud']}</td>
                    <td className="py-3 px-6 text-left">{solicitud['Motivo']}</td>
                    <td className="py-3 px-6 text-left">{solicitud['Estado']}</td>
                    <td className="py-3 px-6 text-left">
                      {(solicitud["Estado"] !== "en revisión" && solicitud["Estado"] !== "en edición") && (
                        <button
                          className="p-2 bg-blue-500 text-white rounded-full"
                          title="Ver Solicitud de Movilización"
                          onClick={() => handleVer(solicitud.id)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center mt-4">
            <div>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handleClick(index + 1)}
                  className={`px-3 py-1 border ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div>
              Mostrando {currentItems.length} de {filteredSolicitudes.length} solicitudes
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListarSolicitudesPendientesAdmin;
