import express from "express";
import { verifyWebhook, receiveWebhook } from "../controllers/wa.controllers.js";

export const waRouter = express.Router();
// public (Meta must access without auth)
waRouter.get("/webhook", verifyWebhook);
waRouter.post("/webhook", express.json({ limit: "1mb" }), receiveWebhook);
