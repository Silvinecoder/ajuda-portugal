import { Router } from "express";
import { prisma } from "../../prisma/prisma";
import { nanoid } from "nanoid";
import { encrypt, decrypt } from "../utils/encryption";

export const helpRequestRoutes = Router();

const URGENCY_MAP: Record<string, string> = {
  critical: "critical",
  urgent: "urgent",
  standard: "standard",
  recovery: "recovery",
};

const CATEGORY_MAP: Record<string, string> = {
  food: "food",
  shelter: "shelter",
  reconstruction: "reconstruction",
  cleanup: "cleanup",
  tools: "tools",
  volunteers: "volunteers",
};

// ------------------------
// GET all requests
// ------------------------
helpRequestRoutes.get("/", async (req, res) => {
  try {
    const { urgency } = req.query;

    const whereClause: any = { status: "pending" };
    if (urgency && typeof urgency === "string" && URGENCY_MAP[urgency]) {
      whereClause.urgency = URGENCY_MAP[urgency];
    }

    const requests = await prisma.helpRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const decryptedRequests = requests.map(r => ({
      ...r,
      contact: decrypt(r.contact),
      name: r.name ? decrypt(r.name) : null,
    }));

    res.json(decryptedRequests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// ------------------------
// CREATE new request
// ------------------------
helpRequestRoutes.post("/", async (req, res) => {
  try {
    const { urgency, category, description, lat, lng, contact, name } = req.body;

    if (!urgency || !category || !lat || !lng || !contact) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slug = nanoid(10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const createdRequest = await prisma.helpRequest.create({
      data: {
        slug,
        urgency: URGENCY_MAP[urgency] || urgency,
        category: CATEGORY_MAP[category] || category,
        description: description || null,
        lat: Number(lat),
        lng: Number(lng),
        contact: encrypt(contact),
        name: name ? encrypt(name) : null,
        expiresAt,
      },
    });

    // Decrypt before sending response
    const response = {
      ...createdRequest,
      contact: decrypt(createdRequest.contact),
      name: createdRequest.name ? decrypt(createdRequest.name) : null,
    };

    res.status(201).json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create request" });
  }
});

// ------------------------
// GET request by slug
// ------------------------
helpRequestRoutes.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: "Not found" });

    const reports = await prisma.report.findMany({ where: { requestId: request.id } });

    await prisma.helpRequest.update({
      where: { id: request.id },
      data: { views: { increment: 1 } },
    });

    const decryptedRequest = {
      ...request,
      contact: decrypt(request.contact),
      name: request.name ? decrypt(request.name) : null,
      reports,
    };

    res.json(decryptedRequest);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch request" });
  }
});

// ------------------------
// RECORD a view
// ------------------------
helpRequestRoutes.post("/:slug/view", async (req, res) => {
  try {
    const { slug } = req.params;

    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: "Not found" });

    await prisma.helpRequest.update({
      where: { id: request.id },
      data: { views: { increment: 1 } },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to record view" });
  }
});

// ------------------------
// RECORD a help click
// ------------------------
helpRequestRoutes.post("/:slug/help-click", async (req, res) => {
  try {
    const { slug } = req.params;

    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: "Not found" });

    await prisma.helpRequest.update({
      where: { id: request.id },
      data: { helpClicks: { increment: 1 } },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to record help click" });
  }
});

// ------------------------
// UPDATE a request
// ------------------------
helpRequestRoutes.patch("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { status, urgency, category, description, contact, name } = req.body;

    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: "Not found" });

    const data: any = {};
    if (status) data.status = status;
    if (urgency) data.urgency = URGENCY_MAP[urgency] || urgency;
    if (category) data.category = CATEGORY_MAP[category] || category;
    if (description !== undefined) data.description = description;
    if (contact) data.contact = encrypt(contact);
    if (name) data.name = encrypt(name);

    await prisma.helpRequest.update({ where: { id: request.id }, data });

    const updated = await prisma.helpRequest.findUnique({ where: { slug } });

    const decryptedUpdated = {
      ...updated,
      contact: decrypt(updated!.contact),
      name: updated!.name ? decrypt(updated!.name) : null,
    };

    res.json(decryptedUpdated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update request" });
  }
});

// ------------------------
// DELETE a request (soft delete)
// ------------------------
helpRequestRoutes.delete("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const request = await prisma.helpRequest.findUnique({ where: { slug } });
    if (!request) return res.status(404).json({ error: "Not found" });

    await prisma.helpRequest.update({ where: { id: request.id }, data: { status: "deleted" } });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete request" });
  }
});
