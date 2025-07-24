import { Request, Response, NextFunction } from 'express';

export const createError = (message: string, statusCode: number = 500) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  return error;
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error ${statusCode}: ${message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}; 