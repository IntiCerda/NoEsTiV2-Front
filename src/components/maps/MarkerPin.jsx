const MarkerPin = ({ onClick }) => (
  <div 
    onClick={onClick}
    style={{
      width: "10px",
      height: "10px",
      transform: "translate(-50%, -50%)",
      position: "absolute",
      cursor: "pointer",
      backgroundColor: "#e74c3c",
      borderRadius: "50%",
      border: "3px solid white",
      boxShadow: "0 0 6px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{
      width: "10px",
      height: "10px",
      backgroundColor: "white",
      borderRadius: "50%"
    }}></div>
  </div>
);

export default MarkerPin;
