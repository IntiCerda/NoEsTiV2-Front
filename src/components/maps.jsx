import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

const MapView = () => {
  const map = useMap(); // 👈 obtiene el mapa cargado

  useEffect(() => {
    if (map) {
      console.log("🗺️ Map loaded:", map);
    }
  }, [map]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Map
        center={{ lat: -29.95332, lng: -71.33947 }}
        zoom={10}
        gestureHandling="greedy"
        disableDefaultUI={false}
        zoomControl={true}
        scrollwheel={true}
        keyboardShortcuts={true}
        clickableIcons={true}
        mapTypeId="roadmap"
      />
    </div>
  );
};

const MapComponent = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MapView />
    </APIProvider>
  );
};

export default MapComponent;
