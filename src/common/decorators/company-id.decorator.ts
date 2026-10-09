import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const CompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'] || request.user?.companyId;

    if (!companyId) {
      throw new BadRequestException('X-Company-ID header or token company identification is required');
    }
    return companyId as string;
  },
);
