import { SnowflakeService } from '@/common/services/snowflake.service';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type CreateMessageDto } from './dto/create-message.dto';
import { MessageEntity } from './entities/Message.entity';
import { AttachmentService } from '@/attachment/attachment.service';
import { type PageQueryDto } from '@/common/dto/common.dto';
import { UserService } from '@/user/user.service';
import { type ChannelIdMapMessageListDto } from './dto/result.message.dto';
import { MsgTypeEnum } from '@/common/constants';
import { type PublicUserInfoDto } from '@/user/dto/user.dto';
import { type AttachmentEntity } from '@/attachment/entities/Attachment.entity';
import { ModuleRef } from '@nestjs/core';
import { ChannelsService } from '@/channels/channels.service';
import { ResultDto } from '@/common/dto/common-result.dto';
import ApiCode from '@/common/enums/ApiCode.enum';

@Injectable()
export class MessageService implements OnModuleInit {
  private userService!: UserService;
  private channelService!: ChannelsService;

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly snowflakeService: SnowflakeService,
    private readonly attachmentService: AttachmentService,
    private readonly moduleRef: ModuleRef
  ) {}

  onModuleInit() {
    this.userService = this.moduleRef.get(UserService, { strict: false });
    this.channelService = this.moduleRef.get(ChannelsService, { strict: false });
  }

  async create(createMessageDto: CreateMessageDto) {
    const { attachmentIds = [], mentionIds = [], ...other } = createMessageDto;
    const messageId = this.snowflakeService.nextId();
    const messageEntity = this.messageRepository.create({
      ...other,
      id: messageId,
      mentionUserIds: mentionIds.join(','), // mentions是数组，需要转换成字符串
      attachmentIds: attachmentIds.join(','), // attachments是数组，需要转换成字符串
    });
    // 开启事务
    const queryRunner = this.messageRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 新增消息
      const message = await queryRunner.manager.save(messageEntity);
      await queryRunner.commitTransaction();
      return message;
    } catch (err) {
      console.trace('err', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return null;
  }

  /**
   * 批量新增消息
   * @param createMessageDtos
   * @returns
   */
  batchCreate(createMessageDtos: CreateMessageDto[]) {
    try {
      return createMessageDtos.map(async (item) => await this.create(item));
    } catch (err) {
      throw new Error(err as string);
    }
  }

  /**
   * 分页查询频道消息
   * @param channelId 频道id
   * @param query 分页参数
   * @returns 消息列表
   */
  async queryMessageByChannelId(channelId: string, query: PageQueryDto) {
    const { page = 1, pageSize = 10 } = query;
    const messageList = await this.messageRepository.find({
      where: { channelId },
      // order: { createdAt: 'DESC' }, // 按照创建时间倒序排列
      order: { id: 'DESC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    const userIds: number[] = []; // 记录所有出现过的用户id
    const attachmentIds: string[] = []; // 记录所有消息的附件id
    const mentionMap: Record<string, number[]> = {}; // 记录所有消息的@用户id

    messageList.forEach((message) => {
      userIds.push(message.authorId); // 记录所有消息的作者id
      if (message.mentionUserIds && message.mentionUserIds !== '') {
        // 如果消息中有@的用户，记录下来
        const mentionUserIds = message.mentionUserIds
          .split(',')
          .map(Number)
          .filter((item) => !isNaN(item));
        userIds.push(...mentionUserIds); // 因为都是用户id，
        mentionMap[message.id] = mentionUserIds; // 查询到用户信息后，需要把用户信息放到对应的消息中
      }
      if (message?.attachmentIds && message.attachmentIds !== '') {
        // 如果消息中有附件，记录下来
        attachmentIds.push(...message.attachmentIds.split(','));
      }
    });

    const publicUserInfos: PublicUserInfoDto[] = [];
    const attachments: AttachmentEntity[] = [];

    if (userIds.length > 0) {
      // 对 authorIds 去重，避免重复查询
      publicUserInfos.push(
        ...(await this.userService.getUserPublicInfoList(Array.from(new Set(userIds))))
      );
    }
    if (attachmentIds.length > 0) {
      // 对 attachmentIds 去重，避免重复查询
      attachments.push(
        ...(await this.attachmentService.queryAttachmentByIds(Array.from(new Set(attachmentIds))))
      );
    }
    return messageList.map((message) => {
      if (publicUserInfos.length > 0) {
        message.author = publicUserInfos.find((item) => item.id === message.authorId);
        mentionMap[message.id]?.forEach((userId) => {
          const tmpUser = publicUserInfos.find((item) => item.id === userId);
          if (tmpUser) {
            message.mentions?.push(tmpUser);
          }
        });
      }
      if (attachments.length > 0) {
        message.attachments = attachments.filter((item) =>
          message.attachmentIds?.includes(item.id)
        );
      }
      return message;
    });
  }

  /**
   * 根据频道id查询最新的消息
   * @param channelIds 频道id列表
   * @returns 消息ID与消息列表的映射
   */
  async queryMessagesByChannelIds(channelIds: string[]) {
    const uniqueChannelIds = Array.from(new Set(channelIds));
    const channelMap: ChannelIdMapMessageListDto = {};
    for (let i = 0; i < uniqueChannelIds.length; i++) {
      const channelId = uniqueChannelIds[i];
      const messageList = await this.queryMessageByChannelId(channelId, {
        page: 1,
        pageSize: 10,
      });
      channelMap[channelId] = messageList;
    }
    return channelMap;
  }

  /**
   * 根据文件类型获取消息类型
   * @param mineType 文件类型
   * @returns 消息类型
   */
  getMsgTypeByMineType(mineType: string) {
    const [type, subType] = mineType.split('/');
    switch (type) {
      case 'image':
        return MsgTypeEnum.IMAGE;
      case 'video':
        return MsgTypeEnum.VIDEO;
      case 'audio':
        return MsgTypeEnum.AUDIO;
      case 'application':
        switch (subType) {
          case 'pdf':
            return MsgTypeEnum.PDF;
        }
        break;
      default:
        return MsgTypeEnum.FILE;
    }
  }

  /**
   * 根据频道id删除消息
   * @param channelId 频道id
   * @returns
   */
  async deleteMessageByChannelId(channelId: string) {
    return await this.messageRepository.delete({ channelId });
  }

  /**
   * 创建消息前的校验
   * @param channelId 消息所属频道
   * @param userId 用户id
   */
  async prevCreateMessage(channelId: string, userId: number) {
    const channelInfo = await this.channelService.queryChannelInfoByChannelId(channelId);
    // 不存在频道
    if (channelInfo == null) {
      return ResultDto.fail(ApiCode.CHANNEL_NOT_FOUND_CODE, ApiCode.CHANNEL_NOT_FOUND_MSG);
    }
    // 好友关系已删除
    if (channelInfo.deletedAt !== null) {
      return ResultDto.fail(
        ApiCode.FRIEND_SHIP_IS_DELETED_CODE,
        ApiCode.FRIEND_SHIP_IS_DELETED_MSG
      );
    }
    // 查看能否找到频道成员
    const channelMembers = await this.channelService.queryChannelMembersByChannelId(channelId);
    if (channelMembers == null) {
      return ResultDto.fail(
        ApiCode.CHANNEL_MEMBER_IS_EMPTY_CODE,
        ApiCode.CHANNEL_MEMBER_IS_EMPTY_MSG
      );
    }
    // 查看是否是频道成员
    const isChannelMember = channelMembers.some((item) => item.memberId === userId);
    if (!isChannelMember) {
      return ResultDto.fail(
        ApiCode.CHANNEL_MEMBER_NOT_FOUND_CODE,
        ApiCode.CHANNEL_MEMBER_NOT_FOUND_MSG
      );
    }
    return channelMembers;
  }
}
