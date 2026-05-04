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

export function requireAuth(minRole: UserRole = 'Viewer') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: { message: 'Authentication required. Please provide X-API-KEY header.' } });
    }

    let role: UserRole | null = null;
    if (apiKey === ADMIN_KEY) role = 'Admin';
    else if (apiKey === VOLUNTEER_KEY) role = 'Volunteer';

    if (!role) {
      return res.status(403).json({ error: { message: 'Invalid API key.' } });
    }

    // Role Hierarchy: Admin (2) > Volunteer (1) > Viewer (0)
    const roleWeight = { Admin: 2, Volunteer: 1, Viewer: 0 };
    if (roleWeight[role] < roleWeight[minRole]) {
      return res.status(403).json({ error: { message: `Insufficient permissions. ${minRole} role required.` } });
    }

    req.user = { role, id: role.toLowerCase() };
    next();
  };
}
