import { Router } from 'express';
import {
    createLeaveType, listLeaveTypes, getLeaveTypeById,
    updateLeaveType, deleteLeaveType, restoreLeaveType, hardDeleteLeaveType
} from '../controllers/leaveTypes.controller.js';

const router = Router();
// router.use(requireAuth) // add your auth if needed

router.post('/', createLeaveType);
router.get('/', listLeaveTypes);
router.get('/:id', getLeaveTypeById);
router.patch('/:id', updateLeaveType);
router.delete('/:id', deleteLeaveType);
router.post('/:id/restore', restoreLeaveType);
router.delete('/:id/hard', hardDeleteLeaveType);

export { router as leaveTypesRoutes };
