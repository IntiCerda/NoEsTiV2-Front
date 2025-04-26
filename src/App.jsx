import { useEffect, useState } from 'react';
import './App.css';
import MapComponent from './components/maps';
import { fetchData as fetchLocations } from './services/archivo';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const result = await fetchLocations();
        console.log('Datos recibidos:', result);

        if (result && result.locations) {
          setData(result.locations);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    getLocations();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Peruvian Waze</h1>
        <img src="/favicon.png" alt="Peruvian Waze Logo" className="logo" />
      </header>

      <main className="map-section">
        <MapComponent data={data} />
      </main>
    </div>
  );
}

export default App;
