import { type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { type FastifyRequest as Request } from 'fastify';
import { ALLOW_ANON_KEY } from 'src/common/decorators/AllowAnon.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isAllowAnon = this.reflector.getAllAndOverride<boolean>(ALLOW_ANON_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isAllowAnon) return true; // allow anonymous access
    const req = ctx.switchToHttp().getRequest<Request>();
    if (req.headers?.authorization === undefined) {
      throw new ForbiddenException('请先登录');
    }
    return await (super.canActivate(ctx) as Promise<boolean>);
  }
}
