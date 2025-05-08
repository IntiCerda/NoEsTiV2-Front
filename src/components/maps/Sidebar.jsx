import { useState, useEffect, useRef } from "react";

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
      backgroundColor: "#191717",
      padding: "15px",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      zIndex: 1,
      alignItems: "center",
      justifyContent: "flex-start"
    }}>
      <div style={{ marginTop: "80%", width: "100%" }}>
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
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
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
            <div style={{ marginBottom: "15px", marginRight: "1rem" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
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
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "white" }}>
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
    </div>
  );
  
};

export default Sidebar;