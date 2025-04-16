import './App.css'
import MapComponent from './components/maps'

function App() {
  return (
    <div className="app-container">
      {/* Encabezado con logo + título */}
      <header className="app-header">
        <h1 className="app-title">Peruvian Waze</h1>
        <img src="/favicon.png" alt="Peruvian Waze Logo" className="logo" />
      </header>

      {/* Mapa */}
      <main className="map-section">
        <MapComponent />
      </main>
    </div>
  )
}

export default App