import { useState } from 'react';
import type { HelpRequest } from '../types';
import { CATEGORY_LABELS, URGENCY_LABELS } from '../types';
import { recordHelpClick } from '../api';
import OfferHelpModal from './OfferHelpModal';
import ReportModal from './ReportModal';

const urgencyColors: Record<string, string> = {
  Critico: '#dc2626',
  urgent: '#ea580c',
  standard: '#eab308',
  recovery: '#22c55e',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diff < 1) return 'Há poucos minutos';
  if (diff < 24) return `Há ${diff} hora${diff > 1 ? 's' : ''}`;
  const days = Math.floor(diff / 24);
  return `Há ${days} dia${days > 1 ? 's' : ''}`;
}

interface PinCardProps {
  request: HelpRequest;
  compact?: boolean;
  onShowFull?: () => void;
}

export default function PinCard({ request, compact, onShowFull }: PinCardProps) {
  const [showOffer, setShowOffer] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleOfferHelp = () => {
    recordHelpClick(request.slug);
    setShowOffer(true);
  };

  const color = urgencyColors[request.urgency] || urgencyColors.standard;

  if (compact) {
    return (
      <div className="pin-card compact">
        <span className="pin-urgency" style={{ color }}>
          {URGENCY_LABELS[request.urgency as keyof typeof URGENCY_LABELS]}
        </span>
        <span className="pin-category">{CATEGORY_LABELS[request.category as keyof typeof CATEGORY_LABELS]}</span>
        {request.description && <p className="pin-desc">{request.description}</p>}
        <button onClick={onShowFull}>Ver mais</button>
      </div>
    );
  }

  return (
    <>
      <div className="pin-card">
        <span className="pin-urgency" style={{ color }}>
          {URGENCY_LABELS[request.urgency as keyof typeof URGENCY_LABELS]}
        </span>
        <span className="pin-category">{CATEGORY_LABELS[request.category as keyof typeof CATEGORY_LABELS]}</span>
        {request.description && <p className="pin-desc">{request.description}</p>}
        <p className="pin-meta">Publicado {formatDate(request.createdAt)}</p>
        <div className="pin-actions">
          <button className="offer-btn" onClick={handleOfferHelp}>
            Oferecer ajuda via WhatsApp
          </button>
          <button className="report-btn" onClick={() => setShowReport(true)}>
            Denunciar este pedido
          </button>
        </div>
      </div>

      {showOffer && (
        <OfferHelpModal
          request={request}
          onClose={() => setShowOffer(false)}
        />
      )}
      {showReport && (
        <ReportModal
          requestId={request.slug}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}