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
  
  export default MarkerPin;