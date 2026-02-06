import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();
export const helpRequestRoutes = Router();

const URGENCY_MAP: Record<string, string> = {
  critical: 'critical',
  urgent: 'urgent',
  standard: 'standard',
  recovery: 'recovery',
};

const CATEGORY_MAP: Record<string, string> = {
  food: 'food',
  shelter: 'shelter',
  reconstruction: 'reconstruction',
  cleanup: 'cleanup',
  tools: 'tools',
  volunteers: 'volunteers',
};

helpRequestRoutes.get('/', async (req, res) => {
  try {
    const { urgency } = req.query;
    const where: { status?: string; urgency?: string } = { status: 'pending' };
    if (urgency && typeof urgency === 'string' && URGENCY_MAP[urgency]) {
      where.urgency = urgency;
    }
    const requests = await prisma.helpRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

helpRequestRoutes.post('/', async (req, res) => {
  try {
    const { urgency, category, description, lat, lng, contact, name } = req.body;
    if (!urgency || !category || !lat || !lng || !contact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const slug = nanoid(10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const request = await prisma.helpRequest.create({
      data: {
        slug,
        urgency: URGENCY_MAP[urgency] || urgency,
        category: CATEGORY_MAP[category] || category,
        description: description || null,
        lat: Number(lat),
        lng: Number(lng),
        contact,
        name: name || null,
        expiresAt,
      },
    });
    res.status(201).json(request);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

helpRequestRoutes.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const request = await prisma.helpRequest.findUnique({
      where: { slug },
      include: { reports: true },
    });
    if (!request) return res.status(404).json({ error: 'Not found' });
    await prisma.helpRequest.update({
      where: { id: request.id },
      data: { views: { increment: 1 } },
    });
    res.json(request);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

helpRequestRoutes.post('/:slug/view', async (req, res) => {
  try {
    const { slug } = req.params;
    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: 'Not found' });
    await prisma.helpRequest.update({
      where: { id: request.id },
      data: { views: { increment: 1 } },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

helpRequestRoutes.post('/:slug/help-click', async (req, res) => {
  try {
    const { slug } = req.params;
    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: 'Not found' });
    await prisma.helpRequest.update({
      where: { id: request.id },
      data: { helpClicks: { increment: 1 } },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to record help click' });
  }
});

helpRequestRoutes.patch('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { status, urgency, category, description } = req.body;
    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: 'Not found' });
    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (urgency) data.urgency = URGENCY_MAP[urgency] || urgency;
    if (category) data.category = CATEGORY_MAP[category] || category;
    if (description !== undefined) data.description = description;
    const updated = await prisma.helpRequest.update({
      where: { id: request.id },
      data,
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

helpRequestRoutes.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: 'Not found' });
    await prisma.helpRequest.update({
      where: { id: request.id },
      data: { status: 'deleted' },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});
