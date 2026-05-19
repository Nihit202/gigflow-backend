import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { register, login, refreshToken, getMe } from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { handleValidationErrors } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  registerValidator,
  handleValidationErrors,
  asyncHandler(register)
);

router.post(
  '/login',
  loginValidator,
  handleValidationErrors,
  asyncHandler(login)
);

router.post('/refresh-token', asyncHandler(refreshToken));

router.get('/me', authenticate, asyncHandler(getMe));

export default router;
