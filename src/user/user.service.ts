import { Injectable, type OnModuleInit } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultDto } from 'src/common/dto/common-result.dto';
import ApiCode from 'src/common/enums/ApiCode.enum';
import { hashPassword, randomString } from 'src/common/utils/utils';
import { Like, Repository, In } from 'typeorm';
import {
  type UserLoginDto,
  type UserLoginSuccessDto,
  type CreateUserDto,
  type SearchUserDto,
  type TokenDto,
  PublicUserInfoDto,
} from './dto/user.dto';
import type { UserJwtPayload } from 'src/common/types/jwt.types';
import { UserEntity } from './entities/User.entity';
import { DEFAULT_SLOGAN } from 'src/common/constants';
import { selectFields } from './constants';
import { FriendService } from 'src/friend/friend.service';
import { plainToInstance } from 'class-transformer';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class UserService implements OnModuleInit {
  private friendService!: FriendService;
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly moduleRef: ModuleRef,
    private readonly jwtService: JwtService
  ) {}

  onModuleInit() {
    this.friendService = this.moduleRef.get(FriendService);
  }

  /**
   * 用户注册
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto): Promise<ResultDto> {
    // 防止重复注册
    if ((await this.findOneByUsername(createUserDto.username)) != null) {
      return ResultDto.fail(ApiCode.USER_EXIST_CODE, ApiCode.USER_EXIST_MSG);
    }
    const user = this.repo.create({
      ...createUserDto,
      slogan: createUserDto?.slogan ? createUserDto.slogan : DEFAULT_SLOGAN,
      salt: randomString(),
    });
    if (createUserDto?.gender !== undefined && [0, 1, 2].includes(createUserDto.gender)) {
      user.gender = createUserDto.gender;
    }
    user.password = hashPassword(createUserDto.password, user.salt); // 密码加密
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    user.avatar = createUserDto.avatar || 'default';
    const result = await this.repo.save(user); // 保存到数据库
    if (result == null) {
      return ResultDto.fail(ApiCode.USER_CREATE_ERR_CODE, ApiCode.USER_CREATE_ERR_MSG);
    }
    return ResultDto.ok(ApiCode.OK_CODE, '注册成功');
  }

  /**
   * 用户登录
   * @param user
   */
  async login(user: UserLoginDto): Promise<ResultDto<any | UserEntity>> {
    const userRecord = await this.findOneByUsername(user.username);
    // 用户不存在
    if (userRecord == null) {
      return ResultDto.fail(ApiCode.INVALID_USERNAME_CODE, ApiCode.INVALID_USERNAME_MSG);
    }
    // 密码错误
    if (userRecord.password !== hashPassword(user.password, userRecord.salt)) {
      return ResultDto.fail(ApiCode.INVALID_PASSWORD_CODE, ApiCode.INVALID_PASSWORD_MSG);
    }
    // 生成访问Token
    const accessToken = this.generateJwtToken<UserJwtPayload>({
      id: userRecord.id,
      username: userRecord.username,
    });
    // 生成刷新Token
    const refreshToken = this.generateJwtToken<UserJwtPayload>(
      {
        id: userRecord.id,
        username: userRecord.username,
      },
      { expiresIn: '2h' }
    );
    // 登录成功
    const result = Object.assign(plainToInstance(PublicUserInfoDto, userRecord), {
      token: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
    return ResultDto.ok<UserLoginSuccessDto>(result, '登录成功');
  }

  /**
   * 刷新用户token
   * @param user
   * @returns
   */
  refreshToken(user: UserJwtPayload | null): TokenDto | null {
    if (user == null) {
      return null;
    }
    const accessToken = this.generateJwtToken<UserJwtPayload>({
      id: user.id,
      username: user.username,
    });
    const refreshToken = this.generateJwtToken<UserJwtPayload>(
      {
        id: user.id,
        username: user.username,
      },
      { expiresIn: '2h' }
    );
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * 通过用户ID查找用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async findOneById(id: number) {
    return await this.repo.findOne({
      select: selectFields,
      where: { id },
    });
  }

  /**
   * 通过用户名查找用户 查找部分信息以及密码和盐(登陆需要用于验证)
   * @param username
   * @returns
   */
  async findOneByUsername(username: string) {
    return await this.repo.findOne({
      where: { username },
    });
  }

  /**
   * 通过用户名查找用户(模糊查询)
   * @param username 用户名
   * @returns 用户信息列表
   */
  async findByUsername(username: string): Promise<UserEntity[] | []> {
    return await this.repo.find({
      select: selectFields,
      where: { username: Like(`%${username}%`) },
    });
  }

  /**
   * 通过用户ID查找用户 返回公开信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  async getUserPublicInfo(userId: number) {
    return (await this.repo.findOne({
      select: selectFields,
      where: { id: userId },
    })) as PublicUserInfoDto;
  }

  /**
   * 通过用户ID列表查找用户 返回公开信息
   * @param userIds 用户ID列表
   * @returns 用户信息列表
   */
  async getUserPublicInfoList(userIds: number[]) {
    return (await this.repo.find({
      select: selectFields,
      where: { id: In(userIds) },
    })) as PublicUserInfoDto[];
  }

  /**
   * 通过用户名查找用户 返回部分信息
   * @param loginUser 当前登录用户
   * @param userDto 搜索条件
   * @returns 用户信息
   */
  async searchUser(loginUser: UserJwtPayload, userDto: SearchUserDto): Promise<UserEntity[] | []> {
    let users: UserEntity[] = [];

    if (userDto == null) {
      return users;
    } else if (userDto?.id !== undefined) {
      const tempUser = await this.findOneById(userDto.id);
      if (tempUser != null) {
        users.push(tempUser);
      }
    } else if (userDto?.username !== undefined) {
      users = await this.findByUsername(userDto.username);
    }
    // 查看当前登录用户被那些用户发起过好友申请
    for (let i = 0; i < users.length; i++) {
      if (Array.isArray(users[i].fromFriendRequests) && users[i].fromFriendRequests.length > 0) {
        users[i].fromFriendRequests = users[i].fromFriendRequests.filter(
          (item) => item.fromUserId === loginUser.id
        );
      } else {
        users[i].fromFriendRequests = await this.friendService.getFriendRequestsByFromUserId(
          loginUser.id
        );
      }
    }
    return users;
  }

  /**
   * 验证用户
   * @param id 用户id
   * @param username 用户名
   * @returns
   */
  async validateUser(id: string | number, username: string): Promise<UserEntity | null> {
    const userId = typeof id === 'string' ? parseInt(id, 10) : typeof id === 'number' ? id : null;
    if (userId == null) {
      return null;
    }
    const user = await this.repo.findOne({ where: { username, id: userId } });
    if (user != null && user.id !== userId) {
      return null;
    }
    return user;
  }

  /**
   * 生成JwtToken
   * @param payload 通过载荷生成token
   * @returns accessToken
   */
  generateJwtToken<T extends object = any>(payload: T, options?: JwtSignOptions): string {
    if (options != null) {
      return this.jwtService.sign(payload, options);
    }
    return this.jwtService.sign(payload);
  }

  /**
   * 校验token
   * @param token
   * @returns
   */
  verifyToken(token: string): UserJwtPayload | null {
    try {
      return this.jwtService.verify<UserJwtPayload>(token);
    } catch (error) {
      // TODO: 错误处理 verifyTokenError
      return null;
    }
  }
}
