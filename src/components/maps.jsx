import { APIProvider, Map } from "@vis.gl/react-google-maps";

const MapComponent = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div style={{ height: "100%", width: "100%" }}>
        <Map
          center={{ lat: -29.95332, lng: -71.33947 }} 
          zoom={10}
          gestureHandling="greedy"  
          disableDefaultUI={false}
        />
      </div>
    </APIProvider>
  );
};

export default MapComponent;
