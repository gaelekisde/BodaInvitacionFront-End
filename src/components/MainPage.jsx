import { useState, useEffect } from "react";
import "../styles/MainPageStyle.css";
import Menu from "./Menu";
import Invitation from "./Invitation";
import DressCode from "./DressCode";
import Counter from "./Counter";
import Confirmation from "./Confirmation";
import Ubication from "./Ubication";
import SendMessage from "./SendMessage";
import apiUtils from "../utils/apiUtils";

const Invitacion = () => {
  const [familiaApellido, setFamiliaApellido] = useState("...");

  useEffect(() => {
    const cargarDatosFamilia = async () => {
      const result = await apiUtils.getFamilia();
      if (result?.apellido) setFamiliaApellido(result.apellido);
    };

    cargarDatosFamilia();
  }, []);

  return (
    <div className="page-container">
      <div id="invitacion" className="invitacion-container">
        <div className="header">
          <h1 className="titulo">Hola familia {familiaApellido} <br />Nos casamos</h1>
        </div>
        
        <div className="contenido">
          <div className="film-strip">
            <div className="film-holes-left"></div>
            <div className="fotos-container">
              <div className="foto foto-1">
                <img src="/images/People/WhatsApp Image 2025-06-10 at 3.36.32 PM.jpeg" alt="Foto 1" />
              </div>
              <div className="foto foto-2">
                <img src="/images/People/WhatsApp Image 2025-06-10 at 3.36.32 PM (1).jpeg" alt="Foto 2" />
              </div>
              <div className="foto foto-3">
                <img src="/images/People/WhatsApp Image 2025-06-10 at 3.36.32 PM (2).jpeg" alt="Foto 3" />
              </div>
            </div>
            <div className="film-holes-right"></div>
          </div>
          
          <div className="fecha-container">
            <div className="fecha-numero">06</div>
            <div className="fecha-numero">05</div>
            <div className="fecha-numero">25</div>
          </div>
        </div>
      </div>
      
      <div id="menu">
        <Menu />
      </div>
      <div id="invitation">
        <Invitation />
      </div>
      <div id="dresscode">
        <DressCode />
      </div>
      <div id="confirmation">
        <Confirmation />
      </div>
      <div id="ubication">
        <Ubication />
      </div>
      <div id="counter">
        <Counter />
      </div>
      <div id="send-message">
        <SendMessage />
      </div>
    </div>
  );
};

export default Invitacion;
