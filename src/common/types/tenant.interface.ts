export interface TenantContextData {
  companyId: string;
  userId?: string;
  roles?: string[];
  correlationId?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  companyId: string;
  role: string | { id: string; name: string };
  permissions?: { module: string; actions: string[] }[];
}
