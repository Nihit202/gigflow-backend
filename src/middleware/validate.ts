import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: import('express-validator').ValidationError) => ({
      field: error.type === 'field' ? (error as import('express-validator').FieldValidationError).path : 'unknown',
      message: error.msg as string,
    }));
    sendError(res, 'Validation failed', 400, formattedErrors);
    return;
  }

  next();
};
