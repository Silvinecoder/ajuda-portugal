import { useState } from "react";
import infoIcon from "../assets/information.png"

export default function InfoPanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        className="info-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar informações" : "Abrir informações"}
      >
        {isOpen ? (
          "✕"
        ) : (
          <img 
            src={infoIcon}
            alt="Info" 
            className="info-icon-img"
          />
        )}
      </button>

      <div className={`info-panel ${isOpen ? "open" : "closed"}`}>
        <div className="info-content">
          <h2>O que é Ajuda Portugal?</h2>
          
          <div className="info-section">
            <p>
              Ajuda Portugal une pessoas que precisam de ajuda com quem quer 
              ajudar. É simples, rápido e seguro.
            </p>
          </div>

          <div className="info-section">
            <h3>Precisa de ajuda?</h3>
            <p>
              Preencha um formulário rápido: diga-nos o quão urgente é, que tipo 
              de ajuda precisa, onde está e deixe o seu WhatsApp. Depois de publicar, 
              vai receber um link para poder editar o pedido sempre que precisar. 
              O pedido fica ativo durante 14 dias.
            </p>
          </div>

          <div className="info-section">
            <h3>Quer ajudar?</h3>
            <p>
              Explore o mapa e veja onde a sua ajuda é necessária. Filtre por 
              urgência ou tipo de ajuda, clique num pino para ver os detalhes e 
              conecte-se diretamente por WhatsApp. Se encontrar algo suspeito, 
              pode denunciar.
            </p>
          </div>

          <div className="info-section">
            <h3>A sua privacidade está protegida</h3>
            <p>
              Toda a comunicação é encriptada. Os contactos guardados na nossa 
              base de dados são eliminados automaticamente após 14 dias.
            </p>
          </div>

          <div className="info-section">
            <h3>Níveis de urgência</h3>
            <div className="urgency-levels">
              <div className="urgency-item">
                <span className="urgency-dot" style={{ background: "#dc2626" }}></span>
                <span><strong>Crítico</strong></span>
              </div>
              <div className="urgency-item">
                <span className="urgency-dot" style={{ background: "#ea580c" }}></span>
                <span><strong>Urgente</strong></span>
              </div>
              <div className="urgency-item">
                <span className="urgency-dot" style={{ background: "#eab308" }}></span>
                <span><strong>Normal</strong></span>
              </div>
              <div className="urgency-item">
                <span className="urgency-dot" style={{ background: "#22c55e" }}></span>
                <span><strong>Recuperação</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}