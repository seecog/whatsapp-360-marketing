import express from "express";
import { createCampaign, listCampaigns, getCampaignById, updateCampaign, deleteCampaign, sendCampaign } from "../controllers/campaign.controllers.js";

import { verifyUser } from "../middleware/authMiddleware.js";

export const campaignRouter = express.Router();
campaignRouter.post("/", verifyUser, createCampaign);
campaignRouter.get("/", verifyUser, listCampaigns);
campaignRouter.get("/:id", verifyUser, getCampaignById);
campaignRouter.put("/:id", verifyUser, updateCampaign);
campaignRouter.delete("/:id", verifyUser, deleteCampaign);
campaignRouter.post("/:id/send", verifyUser, sendCampaign);
