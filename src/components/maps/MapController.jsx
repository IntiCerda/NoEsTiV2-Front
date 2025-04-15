import { useEffect, useCallback } from "react";
import { useMap } from "@vis.gl/react-google-maps";

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

export default MapController;