import { Router } from 'express';
import { prisma } from '../../prisma/prisma'

export const reportRoutes = Router();

const REASON_MAP: Record<string, string> = {
  fake_spam: 'fake_spam',
  money_request: 'money_request',
  inadequate_info: 'inadequate_info',
  duplicate: 'duplicate',
  resolved: 'resolved',
  other: 'other',
};

reportRoutes.post('/', async (req, res) => {
  try {
    const { requestId, reason, details } = req.body;
    if (!requestId || !reason) {
      return res.status(400).json({ error: 'Missing requestId or reason' });
    }
    const request = await prisma.helpRequest.findFirst({
      where: { slug: requestId },
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    await prisma.report.create({
      data: {
        requestId: request.id,
        reason: REASON_MAP[reason] || reason,
        details: details || null,
      },
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});
