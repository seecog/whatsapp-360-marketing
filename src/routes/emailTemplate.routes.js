// src/routes/emailTemplate.routes.js
import { Router } from 'express';
import {
  renderEmailTemplatesPage,
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplateById,
  getEmailTemplateByKey,
  getDefaultEmailTemplateForDocumentType,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '../controllers/emailTemplate.controller.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = Router();

/* ========= PAGE ROUTE ========= */
/**
 * GET /email-templates
 * Renders the HBS page
 */
router.get('/email-templates', verifyUser, renderEmailTemplatesPage);

/* ========= API ROUTES ========= */
/**
 * These are ABSOLUTE paths (because in app.js you do app.use('/', emailTemplateRoutes))
 * Final URLs:
 *   GET    /api/v1/email-templates
 *   POST   /api/v1/email-templates
 *   GET    /api/v1/email-templates/:id
 *   PUT    /api/v1/email-templates/:id
 *   DELETE /api/v1/email-templates/:id
 *   GET    /api/v1/email-templates/by-key/:templateKey
 *   GET    /api/v1/email-templates/default/document-type/:documentTypeId
 */

router.get('/api/v1/email-templates', verifyUser, getEmailTemplates);

router.get(
  '/api/v1/email-templates/by-key/:templateKey',
  verifyUser,
  getEmailTemplateByKey
);

router.get(
  '/api/v1/email-templates/default/document-type/:documentTypeId',
  verifyUser,
  getDefaultEmailTemplateForDocumentType
);

router.get('/api/v1/email-templates/:id', verifyUser, getEmailTemplateById);

router.post('/api/v1/email-templates', verifyUser, createEmailTemplate);

router.put('/api/v1/email-templates/:id', verifyUser, updateEmailTemplate);

router.delete('/api/v1/email-templates/:id', verifyUser, deleteEmailTemplate);

export default router;
