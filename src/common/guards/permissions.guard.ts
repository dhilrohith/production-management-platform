import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    // Administrator bypasses granular checks
    if (user.role?.name === 'Administrator' || user.role === 'Administrator') {
      return true;
    }

    const userPermissions: { module: string; actions: string[] }[] =
      user.role?.permissions || user.permissions || [];

    for (const required of requiredPermissions) {
      const modulePerm = userPermissions.find(
        (p) => p.module.toLowerCase() === required.module.toLowerCase(),
      );
      if (!modulePerm || !modulePerm.actions.includes(required.action)) {
        throw new ForbiddenException(
          `Access denied: Missing permission '${required.module}:${required.action}'`,
        );
      }
    }

    return true;
  }
}
