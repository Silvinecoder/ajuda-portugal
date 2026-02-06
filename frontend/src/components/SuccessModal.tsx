import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { HelpRequest } from '../types';

interface SuccessModalProps {
  request: HelpRequest;
  onClose: () => void;
}

export default function SuccessModal({ request, onClose }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/pedido/${request.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="success-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Pedido publicado</h2>
        <p>Seu pedido está agora visível no mapa. Voluntários podem contactá-lo via WhatsApp.</p>

        <div className="success-important">
          <strong>Importante</strong> Guarde este link:
          <div className="link-box">
            <code>{link}</code>
            <button onClick={copyLink}>{copied ? 'Copiado!' : 'Copiar link'}</button>
          </div>
          <p>Com este link você pode:</p>
          <ul>
            <li>marcar como resolvido</li>
            <li>Atualizar informações</li>
            <li>Apagar o pedido</li>
          </ul>
        </div>

        <p className="success-expiry">Seu pedido expira em 14 dias</p>

        <div className="success-warning">
          <strong>⚠️ LEMBRE-SE:</strong>
          <ul>
            <li>Nunca pague por ajuda</li>
            <li>Partilhe morada exata só via WhatsApp com quem vai ajudar</li>
            <li>Denuncie comportamento suspeito</li>
          </ul>
        </div>

        <button className="success-btn" onClick={onClose}>
          Ver no Mapa
        </button>
      </div>
    </div>
  );
}
