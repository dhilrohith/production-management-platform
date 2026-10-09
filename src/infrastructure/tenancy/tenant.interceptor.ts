import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantContextService: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const companyId =
      (request.headers['x-company-id'] as string) ||
      request.user?.companyId ||
      request.companyId;

    const userId = request.user?.id || request.user?.sub;
    const correlationId = (request.headers['x-correlation-id'] as string) || undefined;

    if (companyId) {
      request.companyId = companyId;
      return new Observable((subscriber) => {
        this.tenantContextService.run(
          { companyId, userId, correlationId },
          () => {
            next.handle().subscribe({
              next: (val) => subscriber.next(val),
              error: (err) => subscriber.error(err),
              complete: () => subscriber.complete(),
            });
          },
        );
      });
    }

    return next.handle();
  }
}
