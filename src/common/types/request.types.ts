import type { UserJwtPayload } from './jwt.types';
import type { FastifyRequest } from 'fastify';
export type ReqType = FastifyRequest & { user: UserJwtPayload };
