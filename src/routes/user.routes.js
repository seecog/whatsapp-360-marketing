import express from 'express';
import { loginUser, logoutUser } from '../controllers/user/login.js';
import register from '../controllers/user/register.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { refresh } from '../controllers/user/refreshToken.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
router.post("/refresh", refresh);
router.post('/logout', verifyUser, logoutUser);

export default router;