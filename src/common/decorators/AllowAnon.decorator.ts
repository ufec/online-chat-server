import { SetMetadata } from '@nestjs/common';
export const ALLOW_ANON_KEY = 'allowAnon';
/**
 * 允许接口不校验token
 */
export const AllowAnon = () => SetMetadata(ALLOW_ANON_KEY, true);
