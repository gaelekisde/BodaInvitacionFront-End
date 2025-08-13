import "../styles/DressCodeStyle.css";

const DressCode = () => {
  const suggestedColors = [
    { name: "Lavanda", color: "#956da2" },
    { name: "Color 2", color: "#ded0e9" },
    { name: "Gris", color: "#9dc6e4" },
    { name: "Azul Marino", color: "#c4e3f8" },
    { name: "Dorado", color: "#ffd6de" }
  ];

  return (
    <div className="dresscode-container">
      <div className="dresscode-content">
        {/* Título */}
        <div className="dresscode-header">
          <h1 className="dresscode-title">Dress Code</h1>
          <h2 className="dresscode-subtitle">Formal - Semiformal</h2>
        </div>
        
        {/* Sección de vestimenta */}
        <div className="attire-section">
          {/* Hombres */}
          <div className="attire-column">
            <h3 className="attire-title">Hombres</h3>
            <div className="attire-illustration">
              <img 
                src="/src/images/Icons/MenSuit.png" 
                alt="Traje formal para hombres" 
                className="suit-icon"
              />
            </div>
          </div>
          
          {/* Mujeres */}
          <div className="attire-column">
            <h3 className="attire-title">Mujeres</h3>
            <div className="attire-illustration">
              <img 
                src="/src/images/Icons/WomanSuit.png" 
                alt="Vestido formal para mujeres" 
                className="dress-icon"
              />
            </div>
          </div>
        </div>
        
        {/* Colores sugeridos */}
        <div className="colors-section">
          <h3 className="colors-title">COLORES SUGERIDOS</h3>
          <div className="color-palette">
            {suggestedColors.map((colorItem, index) => (
              <div 
                key={index} 
                className="color-circle"
                style={{ backgroundColor: colorItem.color }}
                title={colorItem.name}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DressCode;