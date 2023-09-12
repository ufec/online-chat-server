import { ChannelsService } from '@/channels/channels.service';
import { type ChannelType } from '@/channels/interface/channel.interface';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ONLINE_USER_REDIS_KEY_PREFIX } from 'src/common/constants';
import { type OnlineUserDto } from 'src/common/dto/online-user.dto';
import { RedisClientService } from 'src/common/libs/redis/redis.service';
import { FriendService } from 'src/friend/friend.service';
import { UserService } from 'src/user/user.service';
import { Not } from 'typeorm';

@Injectable()
export class ChatService implements OnModuleInit {
  private userService!: UserService;
  private channelsService!: ChannelsService;

  constructor(
    private readonly module: ModuleRef,
    private readonly redisService: RedisClientService,
    private readonly friendService: FriendService
  ) {}

  onModuleInit() {
    this.userService = this.module.get(UserService, { strict: false });
    this.channelsService = this.module.get(ChannelsService, { strict: false });
  }

  /**
   * 获取当前用户是否有未接收的好友请求
   * @param userId 用户id
   * @returns
   */
  async hasFriendRequest(userId: number) {
    return await this.friendService.getFriendRequestsByToUserId(userId);
  }

  /**
   * 校验token
   * @param token token 字符串
   * @returns 返回用户信息
   */
  verifyToken(token: string) {
    return this.userService?.verifyToken(token) ?? null;
  }

  /**
   * 新增在线用户
   * @param clientId
   * @returns
   */
  async addOnlineUser(userId: string | number, data: OnlineUserDto) {
    return await this.redisService.set(
      `${ONLINE_USER_REDIS_KEY_PREFIX}${userId}`,
      JSON.stringify(data)
    );
  }

  /**
   * 删除在线用户
   * @param clientId
   * @returns
   */
  async removeOnlineUser(userId: string | number) {
    return await this.redisService.del(`${ONLINE_USER_REDIS_KEY_PREFIX}${userId}`);
  }

  /**
   * 获取频道内其他成员
   * @param channelId 频道id
   * @param creatorId 创建者id
   * @param channelType 频道类型
   * @returns
   */
  async getChannelsOtherMember(channelId: string, creatorId: number, channelType: ChannelType) {
    return await this.channelsService.queryChannelMembersInfo({
      where: {
        channelId,
        channelType,
        memberId: Not(creatorId), // 推送给频道内除了发起通话者的其他人
      },
    });
  }
}
