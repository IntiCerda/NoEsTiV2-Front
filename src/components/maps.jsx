import { APIProvider, Map } from "@vis.gl/react-google-maps";

const MapComponent = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ height: "100vh", width: "100vw" }}

        zoom={10}
        gestureHandling="greedy"       
        scrollwheel={true}             
        draggable={true}               
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeId="roadmap"
      />
    </APIProvider>
  );
};

export default MapComponent;
