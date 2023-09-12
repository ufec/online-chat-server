import { Injectable } from '@nestjs/common';
import type { UserJwtPayload } from 'src/common/types/jwt.types';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  /**
   * 验证用户
   * @param payload
   * @returns
   */
  public async validateUser(payload: UserJwtPayload): Promise<UserJwtPayload | null> {
    const user = await this.userService.validateUser(payload.id, payload.username);
    if (user == null) return null;
    return payload;
  }
}
