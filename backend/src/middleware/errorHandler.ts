import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  // Handle Prisma Known Errors (e.g. Unique constraint violation P2002)
  if (err?.code === 'P2002') {
    res.status(409).json({
      error: 'A record with that unique identifier already exists.'
    });
    return;
  }

  // Handle Custom Status Errors
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected internal server error occurred.'
    : err.message || 'An unexpected error occurred.';

  // Safe server log without leaking credentials or tokens
  console.error(`[API Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${err.message || err}`);

  res.status(statusCode).json({
    error: message
  });
}
