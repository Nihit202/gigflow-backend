import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/lead.controller';
import {
  createLeadValidator,
  updateLeadValidator,
  getLeadsValidator,
  leadIdValidator,
} from '../validators/lead.validator';
import { handleValidationErrors } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', asyncHandler(getLeadStats));

router.get(
  '/export',
  asyncHandler(exportLeadsCSV)
);

router.get(
  '/',
  getLeadsValidator,
  handleValidationErrors,
  asyncHandler(getLeads)
);

router.get(
  '/:id',
  leadIdValidator,
  handleValidationErrors,
  asyncHandler(getLeadById)
);

router.post(
  '/',
  createLeadValidator,
  handleValidationErrors,
  asyncHandler(createLead)
);

router.patch(
  '/:id',
  updateLeadValidator,
  handleValidationErrors,
  asyncHandler(updateLead)
);

router.delete(
  '/:id',
  leadIdValidator,
  handleValidationErrors,
  authorize('admin', 'sales'),
  asyncHandler(deleteLead)
);

export default router;
