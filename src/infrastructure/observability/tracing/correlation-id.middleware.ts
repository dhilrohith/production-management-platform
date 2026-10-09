import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationHeader = req.headers['x-correlation-id'];
    const correlationId = (Array.isArray(correlationHeader) ? correlationHeader[0] : correlationHeader) || randomUUID();

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    (req as any).correlationId = correlationId;

    next();
  }
}
