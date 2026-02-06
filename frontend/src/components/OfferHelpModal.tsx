import { useState } from 'react';
import type { HelpRequest } from '../types';
import { CATEGORY_LABELS, URGENCY_LABELS } from '../types';

const TEMPLATE = `Olá, vi o seu pedido de ajuda na plataforma Ajuda Portugal.

Pedido: {category} - {urgency}
Recursos: {description}

Posso ajudar com:
{what}

Onde podemos combinar a entrega?`;

interface OfferHelpModalProps {
  request: HelpRequest;
  onClose: () => void;
}

export default function OfferHelpModal({ request, onClose }: OfferHelpModalProps) {
  const [what, setWhat] = useState('');

  const category = CATEGORY_LABELS[request.category as keyof typeof CATEGORY_LABELS];
  const urgency = URGENCY_LABELS[request.urgency as keyof typeof URGENCY_LABELS];
  const description = request.description || 'Ver pedido';

  const message = TEMPLATE
    .replace('{category}', category)
    .replace('{urgency}', urgency)
    .replace('{description}', description)
    .replace('{what}', what || '(o que pode oferecer)');

  const whatsappUrl = `https://wa.me/${request.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  const openWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal offer-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Contactar via WhatsApp</h3>
        <p>Vai abrir o WhatsApp com uma mensagem pré-escrita.</p>

        <div className="modal-warning">
          <strong>Aviso:</strong>
          <ul>
            <li>Nunca peça dinheiro</li>
            <li>Seja claro sobre o que pode oferecer</li>
            <li>Coordene local seguro para entrega</li>
          </ul>
        </div>

        <label>
          Posso ajudar com:
          <textarea
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="O que pode oferecer..."
            rows={3}
          />
        </label>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-btn" onClick={openWhatsApp}>
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
