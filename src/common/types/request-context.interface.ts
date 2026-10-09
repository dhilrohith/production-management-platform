import { Request } from 'express';
import { AuthenticatedUser } from './tenant.interface';

export interface AppRequest extends Request {
  companyId?: string;
  user?: AuthenticatedUser;
  correlationId?: string;
}
