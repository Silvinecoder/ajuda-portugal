import { useState } from 'react';
import { submitReport } from '../api';

const REASONS = [
  { value: 'fake_spam', label: 'Pedido falso/spam' },
  { value: 'money_request', label: 'Pedido de dinheiro' },
  { value: 'inadequate_info', label: 'Informação inadequada' },
  { value: 'duplicate', label: 'Duplicado' },
  { value: 'resolved', label: 'Já foi resolvido' },
  { value: 'other', label: 'Outro' },
];

interface ReportModalProps {
  requestId: string;
  onClose: () => void;
}

export default function ReportModal({ requestId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    try {
      await submitReport({ requestId, reason, details: details.trim() || undefined });
      setSent(true);
    } catch {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal report-received" onClick={(e) => e.stopPropagation()}>
          <h3>Reporte recebido</h3>
          <p>Obrigada. Vamos rever este pedido e tomar medidas se necessário.</p>
          <button className="primary-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal report-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Por que está a denunciar?</h3>
        <form onSubmit={handleSubmit}>
          <div className="report-checklist">
            {REASONS.map((r) => (
              <label key={r.value} className="report-option">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>
          <label>
            Detalhes (opcional)
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Mais informações..."
              rows={3}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn" disabled={!reason || loading}>
              {loading ? 'A enviar...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
