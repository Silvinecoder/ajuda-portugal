import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRequest, updateRequest, deleteRequest } from '../api';
import type { HelpRequest } from '../types';
import { CATEGORY_LABELS, URGENCY_LABELS } from '../types';

const urgencyEmoji: Record<string, string> = {
  Critico: '🔴',
  urgent: '🟠',
  standard: '🟡',
  recovery: '🟢',
};

const statusLabels: Record<string, string> = {
  pending: 'Aguardando Ajuda',
  helped: 'Recebeu Ajuda',
  resolved: 'Resolvido',
  deleted: 'Apagado',
};

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return 'Há poucos minutos';
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Há ${days} dia${days > 1 ? 's' : ''}`;
}

function formatExpiry(expiresAt: string) {
  const d = new Date(expiresAt);
  const now = new Date();
  const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  return days > 0 ? `${days} dias` : 'Expirado';
}

export default function ManageRequest() {
  const { slug } = useParams<{ slug: string }>();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetchRequest(slug)
      .then(setRequest)
      .catch(() => setError('Pedido não encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleMarkHelped = async () => {
    if (!request) return;
    try {
      const updated = await updateRequest(request.slug, { status: 'helped' });
      setRequest(updated);
    } catch {
      setError('Erro ao atualizar');
    }
  };

  const handleDelete = async () => {
    if (!request || !confirm('Tem certeza que deseja apagar este pedido?')) return;
    try {
      await deleteRequest(request.slug);
      setRequest(null);
    } catch {
      setError('Erro ao apagar');
    }
  };

  if (loading) return <div className="manage-loading">A carregar...</div>;
  if (error || !request) {
    return (
      <div className="manage-error">
        <p>{error || 'Pedido não encontrado'}</p>
        <Link to="/">Voltar ao mapa</Link>
      </div>
    );
  }

  if (request.status === 'deleted') {
    return (
      <div className="manage-page">
        <p>Este pedido foi apagado.</p>
        <Link to="/">Voltar ao mapa</Link>
      </div>
    );
  }

  const category = CATEGORY_LABELS[request.category as keyof typeof CATEGORY_LABELS];
  const urgency = URGENCY_LABELS[request.urgency as keyof typeof URGENCY_LABELS];
  const emoji = urgencyEmoji[request.urgency] || '🟡';

  return (
    <div className="manage-page">
      <h1>📝 Gerir Seu Pedido</h1>

      <div className="manage-card">
        <h2>
          {emoji} {category} - {request.urgency.toUpperCase()}
        </h2>
        <p className="manage-meta">Publicado {formatTimeAgo(request.createdAt)}</p>

        <p className="manage-status">
          Estado Atual: {urgencyEmoji[request.status] || '🔴'} {statusLabels[request.status] || request.status}
        </p>

        <p className="manage-question">Já recebeu ajuda?</p>

        <div className="manage-checklist">
          <button className="check-item" onClick={handleMarkHelped}>
            ✅ Marcar Como Ajudado
          </button>
          <button className="check-item" disabled>
            📝 Atualizar Pedido (em breve)
          </button>
          <button className="check-item delete" onClick={handleDelete}>
            🗑️ Apagar Pedido
          </button>
        </div>

        <div className="manage-activity">
          <p>📊 Atividade:</p>
          <ul>
            <li>{request.views} pessoas viram</li>
            <li>{request.helpClicks} clicaram "Oferecer Ajuda"</li>
          </ul>
          <p>⏰ Expira em: {formatExpiry(request.expiresAt)}</p>
        </div>
      </div>

      <Link to="/" className="manage-back">
        Ver no Mapa
      </Link>
    </div>
  );
}
