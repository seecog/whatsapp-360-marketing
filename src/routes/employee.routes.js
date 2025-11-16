import { Router } from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats,
    bulkImportEmployees
} from '../controllers/employee.controllers.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyUser);

// Employee CRUD routes
router.post('/', createEmployee);
router.get('/', getAllEmployees);
router.get('/stats', getEmployeeStats);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/bulk-import', bulkImportEmployees);

export { router as employeeRouter };
