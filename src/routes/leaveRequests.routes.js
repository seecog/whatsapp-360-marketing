import { Router } from 'express';
import {
    createLeaveRequest, listLeaveRequests, getLeaveRequestById,
    updateLeaveRequest, deleteLeaveRequest,
    approveLeaveRequest, rejectLeaveRequest, cancelLeaveRequest
} from '../controllers/leaveRequests.controller.js';

const router = Router();
// router.use(requireAuth)

router.post('/', createLeaveRequest);
router.get('/', listLeaveRequests);
router.get('/:id', getLeaveRequestById);
router.patch('/:id', updateLeaveRequest);
router.delete('/:id', deleteLeaveRequest);

router.post('/:id/approve', approveLeaveRequest);
router.post('/:id/reject', rejectLeaveRequest);
router.post('/:id/cancel', cancelLeaveRequest);

export { router as leaveRequestsRoutes };
