// src/routes/department.routes.js
import { Router } from "express";
import {
    createDepartment,
    listDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    restoreDepartment,
} from "../controllers/department.controller.js";

const router = Router();

// CRUD
router.post("/", createDepartment);
router.get("/", listDepartments);
router.get("/:id", getDepartmentById);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

// Optional: restore a soft-deleted record
router.post("/:id/restore", restoreDepartment);

export { router as departmentRouter };
