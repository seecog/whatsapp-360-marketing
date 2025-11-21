// src/routes/employee.routes.js
import express from 'express';
import {
    renderEmployeesPage,
    listEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
} from '../controllers/employee.controllers.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// HTML page
router.get('/employees', verifyUser, renderEmployeesPage);

// JSON APIs
router.get('/api/v1/employees', verifyUser, listEmployees);
router.post('/api/v1/employees', verifyUser, createEmployee);
router.get('/api/v1/employees/:id', verifyUser, getEmployeeById);
router.put('/api/v1/employees/:id', verifyUser, updateEmployee);
router.delete('/api/v1/employees/:id', verifyUser, deleteEmployee);

export default router;
