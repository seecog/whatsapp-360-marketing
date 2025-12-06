// routes/template.routes.js
import express from "express";
import { verifyUser } from "../middleware/authMiddleware.js";
import {
    createTemplateAtMeta,
    listMetaTemplates,
    saveVerifiedTemplate,
    listLocalTemplates,
    listMetaTemplatesAll,
    getAllTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
} from "../controllers/template.controllers.js";

export const templateRouter = express.Router();

// New CRUD routes for frontend (LOCAL DB)
templateRouter.route("/").get(verifyUser, getAllTemplates);
templateRouter.route("/").post(verifyUser, createTemplate);
templateRouter.route("/:id").put(verifyUser, updateTemplate);
templateRouter.route("/:id").delete(verifyUser, deleteTemplate);

// Meta operations
templateRouter.post("/meta", verifyUser, createTemplateAtMeta);
templateRouter.get("/meta", verifyUser, listMetaTemplates);
templateRouter.get("/meta/all", verifyUser, listMetaTemplatesAll);

// Local (DB) operations (kept for backward compatibility)
templateRouter.post("/verify", verifyUser, saveVerifiedTemplate); // verify @ Meta then save
templateRouter.get("/local", verifyUser, listLocalTemplates);
