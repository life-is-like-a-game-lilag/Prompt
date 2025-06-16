import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import promptsRouter from "./prompts";
import recommendRouter from "./recommend";
import templatesRouter from "./templates";
import { setupSwagger } from "./swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Backend API is running");
});

app.get("/ping", async (_req, res) => {
  try {
    const { pingDB } = await import("./db");
    const result = await pingDB();
    res.json({ success: true, time: result.now });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.use("/prompts", promptsRouter);
app.use("/recommend", recommendRouter);
app.use("/templates", templatesRouter);

// Swagger 문서 설정
setupSwagger(app);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
}); 