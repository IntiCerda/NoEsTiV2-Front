import { useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, Map, InfoWindow, AdvancedMarker } from "@vis.gl/react-google-maps";
import Sidebar from "./Sidebar";
import MapController from "./MapController";

import { fetchData } from "../../services/archivo";

const getColorByCategory = (category) => {
  switch (category) {
    case "comida":
      return "#FFD700";
    case "pacos":
      return "#007BFF";
    case "peligro":
      return "#8e44ad";
    default:
      return "#8e44ad";
  }
};

const CategoryMarker = ({ color }) => (
  <div style={{
    width: "14px",
    height: "14px",
    backgroundColor: color,
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 0 3px rgba(0,0,0,0.5)",
    transform: "translate(-50%, -100%)"
  }} />
);

const MapComponent = ({ data, setData, onDataChange }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newMarkerPosition, setNewMarkerPosition] = useState(null);
  const [newMarkerData, setNewMarkerData] = useState({ title: "", comment: "", category: "peligro" });
  const [submitting, setSubmitting] = useState(false);
  const directionsRendererRef = useRef(null);
  const geocoderRef = useRef(null);
  const [directionsError, setDirectionsError] = useState(null);



  useEffect(() => {
    if (!apiKey) {
      setError("API Key no encontrada");
    } else {
      fetchData(); 
    }
  }, [apiKey]);
  

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleMapReady = useCallback((mapInstance) => {
    setMap(mapInstance);

    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    if (!directionsRendererRef.current && window.google && mapInstance) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
      });
    }

    if (window.google) {
      mapInstance.setOptions({ disableDoubleClickZoom: true });
      window.google.maps.event.addListener(mapInstance, 'dblclick', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setNewMarkerPosition({ lat, lng });
      });
    }
  }, []);

  const handleSearch = useCallback((searchText) => {
    if (!map || !geocoderRef.current) return;
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }
    setDirectionsError(null);

    geocoderRef.current.geocode({ address: searchText + ', Región de Coquimbo, Chile' }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(18);
        setSearchResults({
          position: { lat: location.lat(), lng: location.lng() },
          name: searchText,
          address: results[0].formatted_address
        });
      } else {
        alert('No pudimos encontrar esa ubicación. Por favor, intente con otra dirección.');
      }
    });
  }, [map]);

  const handleDirections = useCallback((origin, destination) => {
    if (!map || !window.google) return;
    setSearchResults(null);
    setDirectionsError(null);

    const directionsService = new google.maps.DirectionsService();

    directionsService.route({
      origin: origin + ', Región de Coquimbo, Chile',
      destination: destination + ', Región de Coquimbo, Chile',
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK') {
        if (!directionsRendererRef.current) {
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            polylineOptions: { strokeColor: '#FF0000', strokeOpacity: 0.7, strokeWeight: 4 }
          });
        } else {
          directionsRendererRef.current.setOptions({
            polylineOptions: { strokeColor: '#FF0000', strokeOpacity: 0.7, strokeWeight: 4 }
          });
          directionsRendererRef.current.setDirections(result);
        }
      } else {
        setDirectionsError(
          status === "REQUEST_DENIED"
            ? "Error: La API key no tiene habilitado el servicio de Directions API."
            : "No pudimos encontrar una ruta. Revise las direcciones e intente nuevamente."
        );
      }
    });
  }, [map]);

  const sendMarkerToBackend = async (position, markerData) => {
    const graphqlUrl = import.meta.env.VITE_BACKEND_URL;
    if (!graphqlUrl) {
      console.error("URL de GraphQL no definida");
      throw new Error("URL de GraphQL no definida en las variables de entorno");
    }
    
    console.log("Enviando a:", graphqlUrl); 
    
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation CreateLocation($latitude: Float!, $longitude: Float!, $comment: String, $category: String, $title: String) {
            createLocation(latitude: $latitude, longitude: $longitude, comment: $comment, category: $category, title: $title) {
              id
              latitude
              longitude
              comment
              category
              title
              createdAt
            }
          }
        `,
        variables: {
          latitude: position.lat,
          longitude: position.lng,
          comment: markerData.comment,
          category: markerData.category,
          title: markerData.title
        }
      })
    });
    
    const result = await response.json();
    console.log("Resultado de la mutación:", result);

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
  
    return result.data.createLocation;
  };

  const mapOptions = {
    mapTypeId: "roadmap",
    zoomControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    disableDoubleClickZoom: true
  };

  if (error) {
    return (
      <div style={{
        height: "100vh", width: "100vw", display: "flex",
        justifyContent: "center", alignItems: "center",
        backgroundColor: "#f0f0f0", color: "red",
        padding: "20px", textAlign: "center"
      }}>
        <div>
          <h2>Error al cargar el mapa</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <div style={{ height: "100vh", width: "100vw", display: "flex", position: "relative" }}>
        <Sidebar onSearch={handleSearch} onDirections={handleDirections} />
        <div style={{ flex: 1, position: "relative" }}>
          {isLoading && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(255,255,255,0.8)",
              display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10
            }}>
              <div>Cargando mapa...</div>
            </div>
          )}

          {directionsError && (
            <div style={{
              position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
              backgroundColor: "#f8d7da", color: "#721c24",
              padding: "10px 15px", borderRadius: "5px", zIndex: 5,
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)", maxWidth: "80%", textAlign: "center"
            }}>
              {directionsError}
              <button
                onClick={() => setDirectionsError(null)}
                style={{ marginLeft: "10px", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
              >
                ×
              </button>
            </div>
          )}

          <Map
            defaultCenter={{ lat: -29.95332, lng: -71.33947 }}
            defaultZoom={14}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            options={mapOptions}
            mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
            onLoad={() => {
              console.log("Mapa cargado inicialmente");
              setTimeout(() => setIsLoading(false), 500);
            }}
            onDblClick={(e) => {
              const lat = e.detail.latLng.lat();
              const lng = e.detail.latLng.lng();
              setNewMarkerPosition({ lat, lng });
            }}
          >
            <MapController onMapReady={handleMapReady} />

            {searchResults && (
              <AdvancedMarker
                position={searchResults.position}
                onClick={() => setSelectedPlace(searchResults)}
              >
                <CategoryMarker color="#000000" />
              </AdvancedMarker>
            )}

            {data.map((loc) => (
              <AdvancedMarker
                key={loc.id}
                position={{ lat: loc.latitude, lng: loc.longitude }}
                onClick={() =>
                  setSelectedPlace({
                    position: { lat: loc.latitude, lng: loc.longitude },
                    title: loc.title || "Reporte sin título",
                    category: loc.category || "Sin categoría",
                    address: loc.comment
                  })
                }
              >
                <CategoryMarker color={getColorByCategory(loc.category)} />
              </AdvancedMarker>
            ))}

            {selectedPlace && (
              <InfoWindow
                position={selectedPlace.position}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div style={{ maxWidth: "240px", fontFamily: "sans-serif" }}>
                  <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "6px", color: "#000" }}>
                    {selectedPlace.title || "Sin título"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.4 }}>
                    {selectedPlace.address}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>

          {/* Formulario de creación */}
          {newMarkerPosition && (
            <div style={{
              position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)",
              backgroundColor: "white", padding: "20px", borderRadius: "10px",
              boxShadow: "0px 2px 10px rgba(0,0,0,0.3)", zIndex: 999
            }}>
              <h4 style={{ marginBottom: "10px" }}>Nuevo Punto de Interés</h4>
              <input
                type="text"
                placeholder="Título"
                value={newMarkerData.title}
                onChange={(e) => setNewMarkerData({ ...newMarkerData, title: e.target.value })}
                style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
              />
              <input
                type="text"
                placeholder="Comentario"
                value={newMarkerData.comment}
                onChange={(e) => setNewMarkerData({ ...newMarkerData, comment: e.target.value })}
                style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
              />
              <select
                value={newMarkerData.category}
                onChange={(e) => setNewMarkerData({ ...newMarkerData, category: e.target.value })}
                style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
              >
                <option value="comida">Comida</option>
                <option value="pacos">Pacos</option>
                <option value="peligro">Peligro</option>
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={async () => {
                    if (!newMarkerData.title || !newMarkerData.comment) {
                      alert("Por favor ingrese un título y un comentario");
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const categoryToKeep = newMarkerData.category;
                      
                      await sendMarkerToBackend(newMarkerPosition, newMarkerData);
                      
                      setNewMarkerPosition(null);
                      setNewMarkerData({ title: "", comment: "", category: categoryToKeep });
                      
                      await fetchData();
                      
                      if (onDataChange) {
                        onDataChange();
                      }
                    } catch (error) {
                      console.error("Error al enviar el marcador", error);
                      alert("Hubo un error. Intenta de nuevo.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  style={{ flex: 1, padding: "8px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px" }}
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => setNewMarkerPosition(null)}
                  style={{ flex: 1, padding: "8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </APIProvider>
  );
};

export default MapComponent;