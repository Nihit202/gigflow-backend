import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const validationErrors = Object.values(
      (err as mongoose.Error.ValidationError).errors
    ).map((e: mongoose.Error.ValidatorError | mongoose.Error.CastError) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, validationErrors);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 'Invalid ID format', 400);
    return;
  }

  if ((err as { code?: string }).code === '11000') {
    sendError(res, 'Duplicate key error — resource already exists', 409);
    return;
  }

  sendError(res, 'Internal server error', 500);
};

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
