import express from "express";
import cors from "cors";
import { helpRequestRoutes } from "./routes/helpRequests.js";
import { reportRoutes } from "./routes/reports.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.VERCEL_FRONTEND_APP!
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

app.use("/api/requests", helpRequestRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

export default app;

// Local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
