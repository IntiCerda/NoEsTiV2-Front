import { useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, Map, InfoWindow, Marker } from "@vis.gl/react-google-maps";
import Sidebar from "./Sidebar";
import MapController from "./MapController";

const MapComponent = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const directionsRendererRef = useRef(null);
  const geocoderRef = useRef(null);
  const [directionsError, setDirectionsError] = useState(null);
  
  useEffect(() => {
    if (!apiKey) {
      setError("API Key no encontrada");
    }
  }, [apiKey]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
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
            polylineOptions: { 
              strokeColor: '#FF0000', 
              strokeOpacity: 0.7,
              strokeWeight: 4
            }
          });
        } else {
          directionsRendererRef.current.setOptions({
            polylineOptions: {
              strokeColor: '#FF0000', 
              strokeOpacity: 0.7,
              strokeWeight: 4
            }
          });
          directionsRendererRef.current.setDirections(result);
        }
      } else {
        console.error("Error en el servicio de direcciones:", status);
        setDirectionsError(
          status === "REQUEST_DENIED" 
            ? "Error: La API key no tiene habilitado el servicio de Directions API. Por favor, habilítala en la consola de Google Cloud."
            : "No pudimos encontrar una ruta. Por favor, revise las direcciones e intente nuevamente."
        );
      }
    });
  }, [map]);

  useEffect(() => {
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100vw", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        color: "red",
        padding: "20px",
        textAlign: "center"
      }}>
        <div>
          <h2>Error al cargar el mapa</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const coquimboRegionBounds = {
    north: -29.1, 
    south: -32.2, 
    east: -69.5,  
    west: -72.0   
  };

  const mapOptions = {
    mapTypeId: "roadmap",
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: 1, 
      position: 1 
    },
    zoomControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    restriction: {
      latLngBounds: coquimboRegionBounds,
      strictBounds: false 
    }
  };

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <div style={{ height: "100vh", width: "100vw", display: "flex", position: "relative" }}>
        <Sidebar onSearch={handleSearch} onDirections={handleDirections} />
        
        <div style={{ flex: 1, position: "relative" }}>
          {isLoading && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10
            }}>
              <div style={{ textAlign: "center" }}>
                <div>Cargando mapa...</div>
                <div style={{ 
                  width: "50px", 
                  height: "50px", 
                  border: "5px solid #f3f3f3",
                  borderTop: "5px solid #3498db",
                  borderRadius: "50%",
                  margin: "10px auto",
                  animation: "spin 1s linear infinite"
                }}></div>
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `
                }} />
              </div>
            </div>
          )}
          
          {directionsError && (
            <div style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px 15px",
              borderRadius: "5px",
              zIndex: 5,
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              maxWidth: "80%",
              textAlign: "center"
            }}>
              {directionsError}
              <button
                onClick={() => setDirectionsError(null)}
                style={{
                  marginLeft: "10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                ×
              </button>
            </div>
          )}
          
          <Map
            defaultCenter={{ lat: -29.9027, lng: -71.2522 }} 
            defaultZoom={14} 
            gestureHandling="cooperative"
            disableDefaultUI={false}
            options={mapOptions}
            onLoad={() => {
              console.log("Mapa cargado inicialmente");
              setTimeout(() => setIsLoading(false), 500);
            }}
          >
            <MapController onMapReady={handleMapReady} />
            
            {searchResults && (
              <Marker
                position={searchResults.position}
                onClick={() => setSelectedPlace(searchResults)}
              />
            )}

            {selectedPlace && (
              <InfoWindow
                position={selectedPlace.position}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div style={{ padding: "5px" }}>
                  <h3 style={{ margin: "0 0 5px 0" }}>{selectedPlace.name}</h3>
                  <p style={{ margin: 0 }}>{selectedPlace.address}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </div>
    </APIProvider>
  );
};

export default MapComponent;