import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CompanyTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const companyIdHeader = request.headers['x-company-id'];
    const userCompanyId = request.user?.companyId;

    if (!companyIdHeader && !userCompanyId) {
      throw new BadRequestException('Multi-Tenant Access Violation: X-Company-ID header is missing');
    }

    if (companyIdHeader && userCompanyId && companyIdHeader !== userCompanyId) {
      throw new BadRequestException('Multi-Tenant Access Violation: Tenant ID mismatch');
    }

    request.companyId = companyIdHeader || userCompanyId;
    return true;
  }
}
