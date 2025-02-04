import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  userId: string;
}

export const validateUserId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  req.userId = userId;
  next();
};
