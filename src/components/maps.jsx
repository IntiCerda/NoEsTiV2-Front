import { useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, Map, useMap, AdvancedMarker, Marker, InfoWindow } from "@vis.gl/react-google-maps";

const Sidebar = ({ onSearch, onDirections }) => {
  const [searchValue, setSearchValue] = useState("");
  const [originValue, setOriginValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);
  
  const searchInputRef = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  
  const searchAutocompleteRef = useRef(null);
  const originAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    const autocompleteOptions = {
      componentRestrictions: { country: "cl" },
      fields: ["address_components", "geometry", "formatted_address", "name"],
      strictBounds: false,
      types: ["geocode", "establishment"],
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(-32.2, -72.0), 
        new google.maps.LatLng(-29.1, -69.5)  
      )
    };

    if (searchInputRef.current && !searchAutocompleteRef.current) {
      searchAutocompleteRef.current = new google.maps.places.Autocomplete(
        searchInputRef.current,
        autocompleteOptions
      );
      
      searchAutocompleteRef.current.addListener("place_changed", () => {
        const place = searchAutocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
          setSearchValue(place.formatted_address);
          onSearch(place.formatted_address);
        }
      });
    }

    if (originInputRef.current && !originAutocompleteRef.current) {
      originAutocompleteRef.current = new google.maps.places.Autocomplete(
        originInputRef.current,
        autocompleteOptions
      );
      
      originAutocompleteRef.current.addListener("place_changed", () => {
        const place = originAutocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
          setOriginValue(place.formatted_address);
        }
      });
    }

    if (destinationInputRef.current && !destinationAutocompleteRef.current) {
      destinationAutocompleteRef.current = new google.maps.places.Autocomplete(
        destinationInputRef.current,
        autocompleteOptions
      );
      
      destinationAutocompleteRef.current.addListener("place_changed", () => {
        const place = destinationAutocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
          setDestinationValue(place.formatted_address);
        }
      });
    }

    return () => {
      if (searchAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(searchAutocompleteRef.current);
      }
      if (originAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(originAutocompleteRef.current);
      }
      if (destinationAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(destinationAutocompleteRef.current);
      }
    };
  }, [onSearch, isDirectionsMode]); 

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleDirections = (e) => {
    e.preventDefault();
    onDirections(originValue, destinationValue);
  };

  return (
    <div style={{
      width: "300px",
      height: "100%",
      backgroundColor: "white",
      padding: "15px",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      zIndex: 1
    }}>
      <h2 style={{ margin: "0 0 15px 0", textAlign: "center" }}>Mapa de la Región de Coquimbo</h2>
      
      <div style={{ display: "flex", gap: "10px" }}>
        <button 
          onClick={() => setIsDirectionsMode(false)}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: !isDirectionsMode ? "#3498db" : "#e0e0e0",
            color: !isDirectionsMode ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Buscar
        </button>
        <button 
          onClick={() => setIsDirectionsMode(true)}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: isDirectionsMode ? "#3498db" : "#e0e0e0",
            color: isDirectionsMode ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Rutas
        </button>
      </div>

      {!isDirectionsMode ? (
        <form onSubmit={handleSearch}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Buscar ubicación:
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Ingrese una dirección"
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 15px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Buscar
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleDirections}>
          <div style={{ marginBottom: "10px", marginRight: "1rem" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "black" }}>
              Origen:
            </label>
            <input
              ref={originInputRef}
              type="text"
              value={originValue}
              onChange={(e) => setOriginValue(e.target.value)}
              placeholder="Dirección de origen"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            />
          </div>
          <div style={{ marginBottom: "15px", marginRight: "1rem" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "black" }}>
              Destino:
            </label>
            <input
              ref={destinationInputRef}
              type="text"
              value={destinationValue}
              onChange={(e) => setDestinationValue(e.target.value)}
              placeholder="Dirección de destino"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Obtener Ruta
          </button>
        </form>
      )}
    </div>
  );
};

const MarkerPin = () => (
  <div style={{ 
    width: "24px",
    height: "36px",
    transform: "translate(-50%, -100%)", 
    position: "absolute",
    cursor: "pointer"
  }}>
    <svg viewBox="0 0 24 36" width="24" height="36">
      <path 
        d="M12 0C5.373 0 0 5.373 0 12c0 7.019 12 24 12 24s12-16.981 12-24c0-6.627-5.373-12-12-12z" 
        fill="#3498db"
      />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>
  </div>
);

const MapController = ({ onMapReady }) => {
  const map = useMap();
  
  const handleMapIdle = useCallback(() => {
    if (!map) return;
    
    const newCenter = map.getCenter();
    const newZoom = map.getZoom();
    
    if (newCenter && newZoom) {
      console.log("Mapa actualizado:", {
        centro: `${newCenter.lat()}, ${newCenter.lng()}`,
        zoom: newZoom
      });
    }
  }, [map]);
  
  useEffect(() => {
    if (!map) return;
    
    const idleListener = map.addListener("idle", handleMapIdle);
    
    if (onMapReady) {
      onMapReady(map);
    }
    
    return () => {
      if (idleListener) {
        google.maps.event.removeListener(idleListener);
      }
    };
  }, [map, handleMapIdle, onMapReady]);
  
  return null;
};

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
    
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    
    if (!directionsRendererRef.current) {
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
        map.setZoom(15);
        
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
    if (!map) return;
    
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