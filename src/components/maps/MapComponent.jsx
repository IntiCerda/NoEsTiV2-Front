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
  const [initialCenter, setInitialCenter] = useState({ lat: -29.95332, lng: -71.33947 });
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocating(false);
        },
        (err) => {
          console.warn(`Error de geolocalización (${err.code}): ${err.message}`);
          setLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      
    } else {
      console.warn("La geolocalización no está soportada por este navegador");
      setLocating(false);
    }
  }, []);

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
      directionsRendererRef.current = new google.maps.DirectionsRenderer({ map: mapInstance, suppressMarkers: false });
    }
    if (window.google) {
      mapInstance.setOptions({ disableDoubleClickZoom: true });
      window.google.maps.event.addListener(mapInstance, 'dblclick', (e) => {
        setNewMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
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
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(18);
        setSearchResults({
          position: { lat: location.lat(), lng: location.lng() },
          name: searchText,
          address: results[0].formatted_address
        });
      } else {
        alert('No pudimos encontrar esa ubicación.');
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
        }
        directionsRendererRef.current.setDirections(result);
      } else {
        setDirectionsError("No se pudo trazar una ruta. Intente nuevamente.");
      }
    });
  }, [map]);

  const sendMarkerToBackend = async (position, markerData) => {
    const graphqlUrl = import.meta.env.VITE_BACKEND_URL;
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
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.createLocation;
  };

  const centerOnCurrentLocation = useCallback(() => {
    if (navigator.geolocation && map) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(currentPos);
          map.setZoom(17);
          setLocating(false);
        },
        (err) => {
          alert("No se pudo obtener la ubicación.");
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [map]);

  if (error) {
    return <div>Error al cargar el mapa: {error}</div>;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
        <Sidebar onSearch={handleSearch} onDirections={handleDirections} />
        <Map
          defaultCenter={initialCenter}
          defaultZoom={15}
          mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
          onLoad={() => setIsLoading(false)}
          options={{ disableDoubleClickZoom: true }}
        >
          <MapController onMapReady={handleMapReady} />

          {data.map((loc) => (
            <AdvancedMarker
              key={loc.id}
              position={{ lat: loc.latitude, lng: loc.longitude }}
              onClick={() => setSelectedPlace({
                position: { lat: loc.latitude, lng: loc.longitude },
                title: loc.title,
                category: loc.category,
                address: loc.comment
              })}
            >
              <CategoryMarker color={getColorByCategory(loc.category)} />
            </AdvancedMarker>
          ))}

          {selectedPlace && (
            <InfoWindow position={selectedPlace.position} onCloseClick={() => setSelectedPlace(null)}>
              <div>
                <h4>{selectedPlace.title}</h4>
                <p>{selectedPlace.address}</p>
              </div>
            </InfoWindow>
          )}
        </Map>

        {newMarkerPosition && (
          <div style={{
            position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)",
            backgroundColor: "white", padding: "20px", borderRadius: "10px", zIndex: 999
          }}>
            <h4>Nuevo Punto</h4>
            <input
              type="text"
              placeholder="Título"
              value={newMarkerData.title}
              onChange={(e) => setNewMarkerData({ ...newMarkerData, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Comentario"
              value={newMarkerData.comment}
              onChange={(e) => setNewMarkerData({ ...newMarkerData, comment: e.target.value })}
            />
            <select
              value={newMarkerData.category}
              onChange={(e) => setNewMarkerData({ ...newMarkerData, category: e.target.value })}
            >
              <option value="comida">Comida</option>
              <option value="pacos">Pacos</option>
              <option value="peligro">Peligro</option>
            </select>
            <button
              onClick={async () => {
                if (!newMarkerData.title || !newMarkerData.comment) {
                  alert("Ingresa título y comentario.");
                  return;
                }
                setSubmitting(true);
                try {
                  await sendMarkerToBackend(newMarkerPosition, newMarkerData);
                  setNewMarkerPosition(null);
                  setNewMarkerData({ title: "", comment: "", category: "peligro" });
                  await fetchData();
                  if (onDataChange) onDataChange();
                } catch (error) {
                  alert("Error al guardar.");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setNewMarkerPosition(null)}>Cancelar</button>
          </div>
        )}
      </div>
    </APIProvider>
  );
};

export default MapComponent;
