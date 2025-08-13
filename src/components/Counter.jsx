import { useState, useEffect } from "react";
import "../styles/CounterStyle.css";

const Counter = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const weddingDate = new Date('2026-03-28T18:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = weddingDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="counter-container">
      <div className="counter-content">
        <h2 className="counter-title">Te esperamos</h2>
        <p className="counter-subtitle">FALTAN:</p>
        
        <div className="countdown">
          <div className="time-unit">
            <span className="time-number">{timeLeft.days.toString().padStart(3, '0')}</span>
            <span className="time-label">DÍAS</span>
          </div>
          <span className="separator">:</span>
          <div className="time-unit">
            <span className="time-number">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="time-label">HORAS</span>
          </div>
          <span className="separator">:</span>
          <div className="time-unit">
            <span className="time-number">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="time-label">MINUTOS</span>
          </div>
          <div className="time-unit">
            <span className="time-number">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="time-label">SEGUNDOS</span>
          </div>
        </div>

        <div className="rings-container">
          <img src="/images/Icons/FlowerIcon.png" alt="Flores decorativas" className="flower-icon" />
        </div>

        <p className="counter-signature">Con amor, Omar & Karely</p>
      </div>
    </div>
  );
};

export default Counter;