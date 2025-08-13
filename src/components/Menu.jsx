import "../styles/MenuStyle.css";

const Menu = () => {
  // Función para hacer scroll suave a una sección
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const menuItems = [
    {
      id: 1,
      title: "Invitación",
      icon: "👰‍♀️",
      action: () => scrollToSection("invitation")
    },
    {
      id: 3,
      title: "Dress code",
      icon: "👗",
      action: () => scrollToSection("dresscode")
    },
    {
  id: 6,
      title: "Cuenta regresiva",
      icon: "🥂",
      action: () => scrollToSection("counter")
    },
    {
      id: 4,
      title: "Confirma tu asistencia",
      icon: "✉️",
      action: () => scrollToSection("confirmation")
    },
    {
      id: 5,
      title: "Ubicación",
      icon: "📍",
      action: () => scrollToSection("ubication")
    },
    {
      id: 7,
      title: "Enviar mensaje",
      icon: "💌",
      action: () => scrollToSection("send-message")
    }
  ];

  return (
    <div className="menu-container">
      <div className="menu-header">
        <img 
          src="/images/Icons/Initials.png" 
          alt="Iniciales de la pareja" 
          className="menu-monogram-image"
        />
      </div>
      
      <div className="menu-grid">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className="menu-item"
            onClick={item.action}
          >
            <div className="menu-icon-circle">
              <span className="menu-icon">{item.icon}</span>
            </div>
            <p className="menu-title">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
