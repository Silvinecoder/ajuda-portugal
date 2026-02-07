import type { HelpRequest } from './types';

const API = 'process.env.VITE_API_URL'

export async function fetchRequests(urgency?: string): Promise<HelpRequest[]> {
  const url = urgency ? `${API}/requests?urgency=${urgency}` : `${API}/requests`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function createRequest(data: {
  urgency: string;
  category: string;
  description?: string;
  lat: number;
  lng: number;
  contact: string;
  name?: string;
}): Promise<HelpRequest> {
  const res = await fetch(`${API}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create');
  }
  return res.json();
}

export async function fetchRequest(slug: string): Promise<HelpRequest> {
  const res = await fetch(`${API}/requests/${slug}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function recordHelpClick(slug: string): Promise<void> {
  await fetch(`${API}/requests/${slug}/help-click`, { method: 'POST' });
}

export async function updateRequest(
  slug: string,
  data: { status?: string; urgency?: string; category?: string; description?: string }
): Promise<HelpRequest> {
  const res = await fetch(`${API}/requests/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

export async function deleteRequest(slug: string): Promise<void> {
  const res = await fetch(`${API}/requests/${slug}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
}

export async function submitReport(data: {
  requestId: string;
  reason: string;
  details?: string;
}): Promise<void> {
  const res = await fetch(`${API}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit report');
}
