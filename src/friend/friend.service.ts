import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  DEFAULT_SLOGAN,
  FriendRequestsStatusEnum,
  GenderEnum,
  ONLINE_USER_REDIS_KEY_PREFIX,
  MsgTypeEnum,
  MsgStatusEnum,
  MsgFromTypeEnum,
  DEFAULT_APPLY_MSG,
  MsgIsApplyEnum,
  DEFAULT_ACCEPT_MSG,
  MsgIsReplyEnum,
} from 'src/common/constants';
import { PaginatedDto } from 'src/common/dto/common-data.dto';
import { ResultDto } from 'src/common/dto/common-result.dto';
import ApiCode from 'src/common/enums/ApiCode.enum';
import {
  type FriendRequestsDto,
  FriendRequestsRecordDto,
  type AcceptFriendRequestsBodyDto,
  type CreateFriendDto,
  type FriendDto,
} from './dto/friends.dto';
import { PublicUserInfoDto } from 'src/user/dto/user.dto';
import { type EntityManager, Repository, In } from 'typeorm';
import { FriendRequestsEntity } from './entities/FriendRequests.entity';
import { FriendsEntity } from './entities/Friends.entity';
import { RedisClientService } from 'src/common/libs/redis/redis.service';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ChannelsService } from '@/channels/channels.service';
import { ChannelRole, ChannelType } from '@/channels/interface/channel.interface';
import { UserService } from '@/user/user.service';
import { ModuleRef } from '@nestjs/core';
import { type CreateMessageDto } from '@/message/dto/create-message.dto';
import { MessageService } from '@/message/message.service';
import { getFriendUniqueID } from '@/common/utils/utils';

@Injectable()
export class FriendService implements OnModuleInit {
  private userService!: UserService;
  private channelService!: ChannelsService;
  private messageService!: MessageService;

  constructor(
    @InjectRepository(FriendRequestsEntity)
    private readonly friendRequestRepo: Repository<FriendRequestsEntity>,
    @InjectRepository(FriendsEntity)
    private readonly friendsRepository: Repository<FriendsEntity>,
    private readonly module: ModuleRef,
    private readonly redisService: RedisClientService,
    private readonly chatGateway: ChatGateway
  ) {}

  onModuleInit() {
    this.userService = this.module.get(UserService, { strict: false });
    this.channelService = this.module.get(ChannelsService, { strict: false });
    this.messageService = this.module.get(MessageService, { strict: false });
  }

  // 创建好友申请
  async createFriendRequest(
    fromUserId: number,
    friendRequestDto: FriendRequestsDto
  ): Promise<ResultDto> {
    // 指定的待确认的好友申请记录是否已存在
    let record = await this.getFriendRequests(fromUserId, friendRequestDto?.toUserId);
    // TODO: 检查插入或新增是否成功
    if (record !== null) {
      switch (record.status) {
        case FriendRequestsStatusEnum.PENDING:
          // 如果已经存在待确认的好友申请记录，则直接返回
          return ResultDto.fail(
            ApiCode.FRIEND_REQUESTS_IS_PENDING_CODE,
            ApiCode.FRIEND_REQUESTS_IS_PENDING_MSG
          );
        case FriendRequestsStatusEnum.ACCEPTED:
          if (record.deletedAt === null) {
            // 如果已经存在已确认且没有被软删除的好友申请记录，则直接返回
            return ResultDto.fail(ApiCode.IS_ALREADY_FRIEND_CODE, ApiCode.IS_ALREADY_FRIEND_MSG);
          }
          // 软删除的跟拒绝的处理逻辑一样
          break;
        case FriendRequestsStatusEnum.REJECTED:
          // 如果已经存在已拒绝的好友申请记录，则继续执行
          break;
        default:
          // 如果已经存在其他状态的好友申请记录，则直接返回状态码错误
          return ResultDto.fail(
            ApiCode.INVALID_FRIEND_REQUESTS_STATUS_CODE,
            ApiCode.INVALID_FRIEND_REQUESTS_STATUS_MSG
          );
      }
    }
    // 不存在的好友申请或已拒绝的好友申请处理逻辑
    // 开启事务
    const queryRunner = this.friendRequestRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (record !== null) {
        if (record.deletedAt) {
          record.deletedAt = null; // 恢复软删除的好友申请记录
        }
        // 软删除或者拒绝的好友申请记录，则更新为待确认的好友申请记录
        record.status = FriendRequestsStatusEnum.PENDING;
        record.extra = friendRequestDto.extra;
        record.remark = friendRequestDto.remark;
        record = await queryRunner.manager.save(record);
      } else {
        // 不存在的好友申请记录，则新增一条待确认的好友申请记录
        const friendRequestEntity = this.friendRequestRepo.create({
          ...friendRequestDto,
          fromUserId,
          status: FriendRequestsStatusEnum.PENDING,
        });
        record = await queryRunner.manager.save(friendRequestEntity);
      }
      // 组装通知结果
      const friendRequest = plainToInstance(FriendRequestsRecordDto, record);
      const fromUserInfo = await this.userService?.getUserPublicInfo(fromUserId);
      if (!fromUserInfo) {
        return ResultDto.fail(ApiCode.USER_NOT_FOUND_CODE, ApiCode.USER_NOT_FOUND_MSG);
      }
      friendRequest.fromUser = {
        ...fromUserInfo,
        slogan: fromUserInfo.slogan ?? DEFAULT_SLOGAN,
        gender: fromUserInfo.gender ?? GenderEnum.UNKNOWN,
      };
      // 发送通知
      await this.chatGateway.notifyClient(
        friendRequestDto.toUserId,
        'pending_friend_request_list',
        [friendRequest]
      );
      await queryRunner.commitTransaction();
      return ResultDto.ok();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return ResultDto.fail(
        ApiCode.CREATE_FRIEND_REQUESTS_FAIL_CODE,
        ApiCode.CREATE_FRIEND_REQUESTS_FAIL_MSG
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取指定的好友申请 所有状态
   * @param fromUserId 发起申请的用户ID
   * @param toUserId 接收申请的用户ID
   * @returns
   */
  async getFriendRequests(
    fromUserId: number,
    toUserId: number
  ): Promise<FriendRequestsEntity | null> {
    // 在 fromUserId 和 toUserId 固定的情况下，status 只能是 0 或 1
    return await this.friendRequestRepo.findOne({
      // 这里要注意，fromUserId 和 toUserId 的顺序不影响查询结果，因为这里的设计是避免冗余数据
      where: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
      withDeleted: true, // 一并查询软删除的数据 软删除逻辑需要处理
    });
  }

  /**
   * 获取指定用户的好友申请列表
   * @param fromUserId 发起申请的用户ID
   * @param status 好友申请状态 0: 待处理 1: 已同意 2: 已拒绝
   * @returns
   */
  async getFriendRequestsByFromUserId(
    fromUserId: number,
    status: FriendRequestsStatusEnum = FriendRequestsStatusEnum.PENDING
  ): Promise<FriendRequestsEntity[]> {
    const records = await this.friendRequestRepo.find({
      where: {
        fromUserId,
        status, // 指定状态
      },
    });
    if (records.length === 0) {
      return [];
    }
    const toUserIds = records.map((record) => record.toUserId);
    const toUsers = await this.userService?.getUserPublicInfoList(toUserIds);
    if (!toUsers) {
      return records;
    }
    return records.map((record) => {
      const toUser = toUsers.find((user) => user.id === record.toUserId);
      if (toUser === undefined) {
        return record;
      }
      record.toUser = toUser;
      return record;
    });
  }

  /**
   * 获取指定用户的好友申请列表
   * @param toUserId 接收申请的用户ID
   * @param status 好友申请状态 0: 待处理 1: 已同意 2: 已拒绝
   * @returns
   */
  async getFriendRequestsByToUserId(
    toUserId: number,
    status: FriendRequestsStatusEnum = FriendRequestsStatusEnum.PENDING
  ): Promise<FriendRequestsRecordDto[]> {
    const result = await this.friendRequestRepo.find({
      where: {
        toUserId,
        status, // 指定状态
      },
    });
    const fromUserIds = result.map((record) => record.fromUserId);
    const fromUsers = await this.userService?.getUserPublicInfoList(fromUserIds);
    if (!fromUsers) {
      return result as FriendRequestsRecordDto[];
    }
    return result.map((record) => {
      const fromUser = fromUsers.find((user) => user.id === record.fromUserId);
      if (fromUser === undefined) {
        return record;
      }
      record.fromUser = fromUser;
      return record;
    }) as FriendRequestsRecordDto[];
  }

  /**
   * 通过ID获取好友申请记录
   * @param id 好友申请记录ID
   * @returns 好友申请记录
   */
  async getFriendRequestsById(id: number): Promise<FriendRequestsEntity | null> {
    const record = await this.friendRequestRepo.findOne({
      where: {
        id,
      },
    });
    if (!record) {
      return null;
    }
    // TODO: 这里的逻辑可以优化减少一次查询
    const fromUser = await this.userService?.getUserPublicInfo(record.fromUserId);
    const toUser = await this.userService?.getUserPublicInfo(record.toUserId);
    if (!fromUser || !toUser) {
      return record;
    }
    record.fromUser = fromUser;
    record.toUser = toUser;
    return record;
  }

  /**
   * 接受好友请求
   * @param loginUserId 登录用户ID
   * @param acceptBody 接受好友请求的参数
   * @param friendRequestRecord 好友申请记录
   */
  async acceptFriendRequest(
    loginUserId: number,
    acceptBody: AcceptFriendRequestsBodyDto,
    friendRequestRecord: FriendRequestsEntity
  ) {
    // 防止用户不登陆，直接调用接口
    const redisKey = `${ONLINE_USER_REDIS_KEY_PREFIX}${loginUserId}`;
    if ((await this.redisService.exists(redisKey)) === 0) {
      return ResultDto.fail(ApiCode.USER_IS_OFFLINE_CODE, ApiCode.USER_IS_OFFLINE_MSG); // 用户不在线 接受不了好友请求
    }
    // 更新好友申请记录 开启事务
    const queryRunner = this.friendsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (friendRequestRecord.fromUserId === loginUserId) {
        return ResultDto.fail(ApiCode.FRIEND_REQUESTS_SELF_CODE, ApiCode.FRIEND_REQUESTS_SELF_MSG);
      }
      friendRequestRecord.status = FriendRequestsStatusEnum.ACCEPTED;
      await queryRunner.manager.save(friendRequestRecord);
      const uniqueId = getFriendUniqueID(friendRequestRecord.fromUserId, loginUserId);
      // 查询好友关系是否已经存在
      const friendRecord = await this.getFriendRecordByUniqueId(uniqueId);
      if (friendRecord === null) {
        // 没有好友关系，创建好友关系
        const friendEntity = this.friendsRepository.create({
          ownerUserId: friendRequestRecord.fromUserId,
          friendUserId: loginUserId,
          ownerRemark: friendRequestRecord.remark,
          friendRemark: acceptBody.remark !== '' ? acceptBody.remark : friendRequestRecord.extra, // 如果没有备注，则使用申请时的附加信息
          uniqueId,
        });
        await queryRunner.manager.save(friendEntity);
      } else {
        // 存在好友关系
        if (friendRecord.deletedAt) {
          // 软删除的好友关系，恢复好友关系
          friendRecord.deletedAt = null;
          await queryRunner.manager.save(friendRecord);
        } else {
          // 已经存在且没有被软删除好友关系
          return ResultDto.fail(ApiCode.IS_ALREADY_FRIEND_CODE, ApiCode.IS_ALREADY_FRIEND_MSG);
        }
      }

      let channel = await this.channelService.queryChannelInfo({
        where: {
          channelType: ChannelType.FRIEND,
          friendUniqueId: uniqueId,
        },
        withDeleted: true,
      });

      if (channel === null) {
        // 创建频道
        channel = await this.channelService.createChannel({
          channelName: `${friendRequestRecord?.fromUser.nickname}和${friendRequestRecord?.toUser.nickname}的聊天`,
          channelType: ChannelType.FRIEND, // 好友聊天
          friendUniqueId: uniqueId,
        });
        if (channel == null) {
          throw new Error(`create channel error: ${friendRequestRecord.fromUserId} ${loginUserId}`);
        }
      } else {
        if (channel.deletedAt) {
          // 软删除的频道，恢复频道
          channel.deletedAt = null;
          channel = await queryRunner.manager.save(channel);
        }
      }
      // 查询频道成员
      let channelMember = await this.channelService.queryChannelMembersByChannelId(channel.id);
      if (channelMember.length === 0) {
        // 创建频道成员
        channelMember = await this.channelService.createChannelMember([
          {
            channelId: channel.id,
            memberId: friendRequestRecord.fromUserId,
            role: ChannelRole.OWNER, // 发起者是群主
            aliasChannelName: friendRequestRecord.remark ?? friendRequestRecord?.toUser.nickname, // 如果没有备注，则使用接受方的昵称
            aliasMemberName: friendRequestRecord?.fromUser.nickname, // 默认是发起者的昵称
            channelType: channel.channelType,
          },
          {
            channelId: channel.id,
            memberId: loginUserId,
            role: ChannelRole.MEMBER, // 接受者是群成员
            aliasChannelName: acceptBody.remark ?? friendRequestRecord?.fromUser.nickname, // 如果没有备注，则使用申请方的昵称
            aliasMemberName: friendRequestRecord?.toUser.nickname, // 默认是接受者的昵称
            channelType: channel.channelType,
          },
        ]);
        // 好友频道一定是两个人
        if (channelMember.length !== 2) {
          throw new Error(
            `create channel member error: ${friendRequestRecord.fromUserId} ${loginUserId}`
          );
        }
      } else {
        const hasSoftDeletedMember = channelMember.some((member) => member.deletedAt);
        if (hasSoftDeletedMember) {
          channelMember.forEach((member) => {
            member.deletedAt = null;
          });
          channelMember = await queryRunner.manager.save(channelMember);
        }
      }
      // 组装频道原始基础信息
      for (let i = 0; i < channelMember.length; i++) {
        channelMember[i].channel = channel;
      }
      await this.channelService.noticeChannelMember(channelMember);

      // 申请方要发送的消息
      const applyMsg: CreateMessageDto = {
        authorId: friendRequestRecord.fromUserId,
        content: friendRequestRecord.extra ?? DEFAULT_APPLY_MSG,
        msgType: MsgTypeEnum.TEXT,
        msgStatus: MsgStatusEnum.UNREAD,
        msgFromType: MsgFromTypeEnum.USER,
        isApply: MsgIsApplyEnum.YES,
        isReply: MsgIsReplyEnum.NO,
        mentionEveryone: 0,
        channelId: channel.id,
      };
      // 接受方要发送的消息
      const acceptMsg: CreateMessageDto = {
        authorId: loginUserId,
        content: DEFAULT_ACCEPT_MSG,
        msgType: MsgTypeEnum.TEXT,
        msgStatus: MsgStatusEnum.UNREAD,
        msgFromType: MsgFromTypeEnum.USER,
        isApply: MsgIsApplyEnum.YES,
        isReply: MsgIsReplyEnum.NO,
        mentionEveryone: 0,
        channelId: channel.id,
      };
      // 插入消息
      (await Promise.all(this.messageService.batchCreate([applyMsg, acceptMsg]))).forEach(
        (message) => {
          if (message == null) {
            throw new Error(
              `create message error: ${friendRequestRecord.fromUserId} ${loginUserId}`
            );
          }
          // 发送消息 申请者的消息双方都要通知，接受者的消息只通知申请者

          // 申请者的消息双方都要通知
          if (message.authorId === friendRequestRecord.fromUserId) {
            // 发送给申请者
            this.chatGateway.sendMessagesToChannelMember(message.authorId, {
              ...message,
              author: friendRequestRecord.fromUser,
            });
            // 发送给接受者
            this.chatGateway.sendMessagesToChannelMember(friendRequestRecord.toUserId, {
              ...message,
              author: friendRequestRecord.fromUser,
            });
          } else {
            // 接受者的消息只通知申请者
            this.chatGateway.sendMessagesToChannelMember(message.authorId, {
              ...message,
              author: friendRequestRecord.toUser,
            });
          }
        }
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log('accept friend request error:', error);
      return ResultDto.fail(
        ApiCode.FRIEND_REQUESTS_ACCEPT_FAIL_CODE,
        ApiCode.FRIEND_REQUESTS_ACCEPT_FAIL_MSG
      );
    } finally {
      await queryRunner.release();
    }
    return ResultDto.ok();
  }

  /**
   * 拒绝好友请求
   * @param loginUserId 登录用户ID
   * @param friendRequestRecord 好友申请记录
   * @returns
   * @memberof FriendRequestsService
   */
  async rejectFriendRequest(friendRequestRecord: FriendRequestsEntity) {
    // 更新好友申请记录
    friendRequestRecord.status = FriendRequestsStatusEnum.REJECTED;
    return await this.friendRequestRepo.save(friendRequestRecord);
  }

  /**
   * 创建好友关系
   * @param friend 创建好友关系的数据
   * @returns 创建好友关系的结果
   */
  async createFriend(friend: CreateFriendDto) {
    if (friend.ownerUserId === friend.friendUserId) {
      return null;
    }
    const uniqueId =
      friend.ownerUserId < friend.friendUserId
        ? `${friend.ownerUserId}-${friend.friendUserId}`
        : `${friend.friendUserId}-${friend.ownerUserId}`;
    const friendRecord = await this.getFriendRecordByUniqueId(uniqueId);
    if (friendRecord != null) {
      // 已经存在的好友关系
      return null;
    }
    friend.uniqueId = uniqueId;
    // 开启事务
    const queryRunner = this.friendsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.manager.insert(FriendsEntity, friend);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 通过uniqueId获取好友关系
   * @param uniqueId 唯一id
   * @returns 好友关系
   */
  async getFriendRecordByUniqueId(uniqueId: string) {
    return await this.friendsRepository.findOne({
      where: {
        uniqueId,
      },
      withDeleted: true, // 包含软删除的数据
    });
  }

  /**
   * 通过用户id获取好友列表
   * @param userId 用户id
   * @returns 好友列表
   */
  async getFriendListByUserId(
    userId: number,
    page: number | string = 1,
    pageSize: number | string = 10
  ) {
    typeof page === 'string' && (page = parseInt(page, 10));
    typeof pageSize === 'string' && (pageSize = parseInt(pageSize, 10));
    // 获取好友列表 分页
    const [list, total] = await this.friendsRepository.findAndCount({
      where: [
        {
          ownerUserId: userId,
        },
        {
          friendUserId: userId,
        },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const friendList = await this.transformFriendList(list, userId);
    return ResultDto.ok(new PaginatedDto<FriendDto[]>(total, friendList));
  }

  async deleteFriend(ownerUserId: number, friendUserId: number) {
    // 首先查询好友关系
    const friendUnique = getFriendUniqueID(ownerUserId, friendUserId);
    const friendRecord = await this.getFriendRecordByUniqueId(friendUnique);
    if (friendRecord == null) {
      return ResultDto.fail(ApiCode.FRIEND_SHIP_NOT_EXIST_CODE, ApiCode.FRIEND_SHIP_NOT_EXIST_MSG);
    }
    // 开启事务
    const queryRunner = this.friendsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 为什么下面都要用软删除？
      //   被删除方没有删除会话重新添加好友，聊天会话窗口因该要能保持
      // 软删除好友关系
      await queryRunner.manager.softDelete(FriendsEntity, friendRecord);
      // 软删除好友申请记录
      await this.deleteFriendRequest(ownerUserId, friendUserId);
      // 获取频道id
      const channelId = await this.channelService.queryFriendChannelId(ownerUserId, friendUserId);
      if (!channelId) {
        return ResultDto.fail(ApiCode.FRIEND_DELETE_FAIL_CODE, ApiCode.FRIEND_DELETE_FAIL_MSG);
      }
      // 软删除频道成员
      await this.channelService.deleteChannelMember(channelId, ownerUserId);
      await this.channelService.deleteChannelMember(channelId, friendUserId);
      // 软删除频道
      await this.channelService.deleteChannel(channelId);
      // 删掉频道内的消息(这个要硬删除)
      await this.messageService.deleteMessageByChannelId(channelId);
      await queryRunner.commitTransaction();
      return ResultDto.ok();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return ResultDto.fail(ApiCode.FRIEND_DELETE_FAIL_CODE, ApiCode.FRIEND_DELETE_FAIL_MSG);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 更新指定用户的好友申请记录
   * @param fromUserId 申请者ID
   * @param toUserId 接受者ID
   * @param updateData 更新的数据
   * @param needSoftDelete 是否需要软删除
   * @returns
   */
  async updateFriendRequest(
    fromUserId: number,
    toUserId: number,
    updateData: Parameters<EntityManager['update']>['2'],
    needSoftDelete = false
  ) {
    // 开启事务
    const queryRunner = this.friendRequestRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 先软删除在更新，如果用户点击删除好友的瞬间重新刷新页面，要删除的好友申请记录不会被过滤掉
      if (needSoftDelete) {
        // 软删除好友申请记录
        await queryRunner.manager.softDelete(FriendRequestsEntity, {
          fromUserId,
          toUserId,
        });
      }
      // 更新好友申请记录
      await queryRunner.manager.update(
        FriendRequestsEntity,
        {
          fromUserId,
          toUserId,
        },
        updateData
      );
      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return false;
    }
  }

  /**
   * 删除好友申请记录， 用户id顺序不影响删除
   * @param fromUserId 用户id
   * @param toUserId 用户id
   * @param isSoftDelete 是否软删除 默认软删除
   * @returns
   */
  async deleteFriendRequest(fromUserId: number, toUserId: number, isSoftDelete = true) {
    const friendRequest = await this.getFriendRequests(fromUserId, toUserId);
    if (friendRequest === null) {
      return null;
    }
    if (isSoftDelete) {
      return await this.friendRequestRepo.softDelete({
        id: friendRequest.id,
      });
    }
    return await this.friendRequestRepo.delete({
      id: friendRequest.id,
    });
  }

  /**
   * 解决了数据冗余，但也带来了关系查询的复杂性
   * @param list 好友列表
   * @param loginUserId 登录用户id
   * @returns 好友列表
   */
  private async transformFriendList(list: FriendsEntity[], loginUserId: number) {
    // 获取好友id列表
    const friendIds: number[] = [];
    const uniqueIds: string[] = [];
    list.forEach((item) => {
      uniqueIds.push(item.uniqueId);
      if (item.ownerUserId === loginUserId) {
        friendIds.push(item.friendUserId);
      } else {
        friendIds.push(item.ownerUserId);
      }
    });
    if (friendIds.length === 0) {
      return [];
    }
    // 获取好友信息
    const friendInfoList = await this.userService?.getUserPublicInfoList(friendIds.map((id) => id));
    if (!friendInfoList) {
      return [];
    }
    const channelList = await this.channelService.queryChannelList({
      where: {
        friendUniqueId: In(uniqueIds),
        channelType: ChannelType.FRIEND,
      },
      select: ['id', 'friendUniqueId'],
      withDeleted: true,
    });
    // 成为好友的那一刻一定有频道，且没有被软删除，因为软删除是在删除好友的时候才会发生
    if (channelList.length === 0) {
      return [];
    }
    const friendList: FriendDto[] = [];
    // 填充好友信息
    list.forEach((item) => {
      const channelId = channelList.find((channel) => channel.friendUniqueId === item.uniqueId)?.id;
      const originFriendInfo = friendInfoList.find((info) => {
        if (item.ownerUserId === loginUserId) {
          return info.id === item.friendUserId;
        }
        return info.id === item.ownerUserId;
      });
      const friendInfo = plainToInstance(PublicUserInfoDto, originFriendInfo);
      if (friendInfo && channelId) {
        friendList.push({
          friendInfo,
          remark: item.friendRemark ?? friendInfo.nickname,
          groupId: item.friendGroup ?? 0,
          createdAt: item.createdAt,
          channelId,
        });
      }
    });
    return friendList;
  }
}
