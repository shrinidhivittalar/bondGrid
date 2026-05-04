import { Request, Response, NextFunction } from 'express';

export type UserRole = 'Admin' | 'Volunteer' | 'Viewer';

export interface AuthenticatedRequest extends Request {
  user?: {
    role: UserRole;
    id: string;
  };
}

const ADMIN_KEY = process.env.ADMIN_API_KEY || 'admin-secret';
const VOLUNTEER_KEY = process.env.VOLUNTEER_API_KEY || 'volunteer-secret';
const VIEWER_KEY = process.env.VIEWER_API_KEY || 'viewer-secret';

export function requireAuth(minRole: UserRole = 'Viewer') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      res.status(401).json({ error: { message: 'Authentication required. Please provide X-API-KEY header.' } });
      return;
    }

    let role: UserRole | null = null;
    if (apiKey === ADMIN_KEY) role = 'Admin';
    else if (apiKey === VOLUNTEER_KEY) role = 'Volunteer';
    else if (apiKey === VIEWER_KEY) role = 'Viewer';

    if (!role) {
      res.status(403).json({ error: { message: 'Invalid API key.' } });
      return;
    }

    // Role Hierarchy: Admin (2) > Volunteer (1) > Viewer (0)
    const roleWeight = { Admin: 2, Volunteer: 1, Viewer: 0 };
    if (roleWeight[role] < roleWeight[minRole]) {
      res.status(403).json({ error: { message: `Insufficient permissions. ${minRole} role required.` } });
      return;
    }

    req.user = { role, id: role.toLowerCase() };
    next();
  };
}
