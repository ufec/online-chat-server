import { Injectable, type OnModuleInit } from '@nestjs/common';
import type { CreateChannelMemberDto, CreateChannelDto, CreateGroupDto } from './dto/create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOneOptions, In, Repository, type FindManyOptions } from 'typeorm';
import { ChannelEntity } from './entities/Channel.entity';
import { ChannelMemberEntity } from './entities/ChannelMember.entity';
import { SnowflakeService } from '@/common/services/snowflake.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { UserService } from '@/user/user.service';
import { type PageQueryDto } from '@/common/dto/common.dto';
import { ChannelRole, ChannelType } from './interface/channel.interface';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ChannelsService implements OnModuleInit {
  private userService!: UserService;

  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channelRepository: Repository<ChannelEntity>,
    @InjectRepository(ChannelMemberEntity)
    private readonly channelMemberRepository: Repository<ChannelMemberEntity>,
    private readonly snowflakeService: SnowflakeService,
    private readonly chatGateway: ChatGateway,
    private readonly moduleRef: ModuleRef
  ) {}

  onModuleInit() {
    this.userService = this.moduleRef.get(UserService, { strict: false });
  }

  async createChannel(createChannelDto: CreateChannelDto) {
    const channel = this.channelRepository.create({
      id: this.snowflakeService.nextId(),
      ...createChannelDto,
    });
    return await this.channelRepository.save(channel);
  }

  /**
   * 批量创建频道成员
   * @param createChannelMemberDto 频道成员信息
   * @returns
   */
  async createChannelMember(createChannelMemberDto: CreateChannelMemberDto[]) {
    const channelMembers = createChannelMemberDto.map((item) => {
      return this.channelMemberRepository.create({
        ...item,
      });
    });
    return await this.channelMemberRepository.save(channelMembers);
  }

  /**
   * 通知频道成员
   * @param createChannelMemberRes 频道成员信息
   * @returns
   */
  async noticeChannelMember(createChannelMemberRes: ChannelMemberEntity[]) {
    const noticPromises = createChannelMemberRes.map(async (member) => {
      return await this.chatGateway.notifyChannelCreateToChannelMember(member);
    });
    return (await Promise.all(noticPromises)).some((item) => item); // 有一个成功就返回true 因为有可能有些用户不在线
  }

  /**
   * 查询频道成员详细信息
   * @param memberId 成员id
   * @param channelId 频道id
   * @returns
   */
  async queryChannelMemberInfo(memberId: number, channelId: string) {
    const channelMember = await this.channelMemberRepository.findOne({
      where: {
        memberId,
        channelId,
      },
      relations: ['channel'],
      withDeleted: true,
    });
    if (!channelMember) {
      return null;
    }
    const member = await this.userService.getUserPublicInfo(memberId);
    channelMember.member = member;
    return channelMember;
  }

  /**
   * 查询频道成员详细信息
   * @param findManyOptions 查询条件
   * @returns
   */
  async queryChannelMembersInfo(findManyOptions: FindManyOptions<ChannelMemberEntity>) {
    return await this.channelMemberRepository.find(findManyOptions);
  }

  /**
   * 查询当前用户id的频道列表
   * @param userId 用户id
   * @param pageQuery 分页信息
   * @returns 频道列表
   */
  async getMyChannels(userId: number, pageQuery: PageQueryDto) {
    return await this.channelMemberRepository.findAndCount({
      where: {
        memberId: userId,
      },
      take: Number(pageQuery.pageSize) ?? 10,
      skip: ((Number(pageQuery.page) ?? 1) - 1) * (Number(pageQuery.pageSize) ?? 10),
      relations: ['channel'],
    });
  }

  /**
   * 查询频道信息
   * @param channelId 频道id
   * @returns 频道信息
   */
  async queryChannelInfoByChannelId(channelId: string) {
    return await this.channelRepository.findOne({
      where: {
        id: channelId,
      },
      withDeleted: true, // 一并查询软删除的数据
    });
  }

  /**
   * 查询频道信息
   * @param findOneOptions 查询条件
   * @returns
   */
  async queryChannelInfo(findOneOptions: FindOneOptions<ChannelEntity>) {
    return await this.channelRepository.findOne(findOneOptions);
  }

  /**
   * 查询频道列表
   * @param findManyOptions 查询条件
   * @returns
   */
  async queryChannelList(findManyOptions: FindManyOptions<ChannelEntity>) {
    return await this.channelRepository.find(findManyOptions);
  }

  /**
   * 查询频道成员
   * @param channelId 频道id
   * @returns 频道成员列表
   */
  async queryChannelMembersByChannelId(channelId: string) {
    const channelMembers = await this.channelMemberRepository.find({
      where: {
        channelId,
      },
      relations: ['channel'],
      withDeleted: true, // 一并查询软删除的数据
    });
    const channelMemberIds = channelMembers.map((item) => item.memberId);
    const members = await this.userService.getUserPublicInfoList(channelMemberIds);
    return channelMembers.map((item) => {
      item.member = members.find((member) => member.id === item.memberId);
      return item;
    });
  }

  /**
   * 创建群聊
   * @param groupOwnerId 群主id
   * @param info 群聊信息
   */
  async createGroupChat(groupOwnerId: number, info: CreateGroupDto) {
    // 查询频道成员
    const members = await this.userService.getUserPublicInfoList([groupOwnerId, ...info.memberIds]);
    if (members.length !== info.memberIds.length + 1) {
      throw new Error('部分成员不存在');
    }
    const channelName =
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      info?.groupName ||
      members
        .slice(0, 4)
        .map((item) => item.nickname)
        .join(',');
    // 先创建频道
    const channel = await this.createChannel({
      channelName,
      channelType: ChannelType.GROUP,
      avatar: info.avatar ?? members.find((item) => item.id === groupOwnerId)?.avatar ?? '',
      friendUniqueId: '',
    });
    if (!channel) {
      throw new Error('创建频道失败');
    }
    // 组装频道成员信息
    const channelMembers = members.map((item) => {
      const channelMember: CreateChannelMemberDto = {
        role: item.id === groupOwnerId ? ChannelRole.OWNER : ChannelRole.MEMBER,
        aliasChannelName: channelName,
        aliasMemberName: '',
        channelId: channel.id,
        memberId: item.id,
        channelType: channel.channelType,
      };
      return channelMember;
    });
    // 创建频道成员
    const createRes = await this.createChannelMember(channelMembers);
    if (createRes.length !== channelMembers.length) {
      throw new Error('创建频道成员失败');
    }
    // 查询频道成员详细信息
    createRes.forEach((item) => {
      item.member = members.find((member) => member.id === item.memberId);
      item.channel = channel;
    });
    // 通知频道成员
    const noticeRes = await this.noticeChannelMember(createRes);
    if (!noticeRes) {
      throw new Error('通知频道成员失败');
    }
    return channel;
  }

  /**
   * 更新频道最后一条消息
   * @param channelId 频道id
   * @param messageId 消息id
   */
  async updateChannelLastMessage(channelId: string, messageId: string) {
    return await this.channelRepository.update({ id: channelId }, { lastMessageId: messageId });
  }

  /**
   * 查询指定用户是否在指定频道列表中
   * @param userId 用户id
   * @param channelIds 频道id列表
   * @returns 是否在频道列表中 true:在 false:不在
   */
  async queryUserIsInChannelList(userId: number, channelIds: string[]) {
    const channelMembers = await this.channelMemberRepository.find({
      where: {
        channelId: In(channelIds),
        memberId: userId,
      },
    });
    return channelMembers.length === channelIds.length;
  }

  /**
   * 查询两个用户是否有共同的好友频道，这里两个参数的顺序不影响查询结果
   * @param userId 用户id
   * @param friendId 用户id
   */
  async queryFriendChannelId(userId: number, friendId: number) {
    const userChannels = await this.channelMemberRepository.find({
      where: {
        memberId: userId,
        channelType: ChannelType.FRIEND,
      },
      select: ['channelId'],
      withDeleted: false, // 不查询软删除的数据
    });
    const channel = await this.channelMemberRepository.findOne({
      where: {
        memberId: friendId,
        channelType: ChannelType.FRIEND,
        channelId: In(userChannels.map((item) => item.channelId)),
      },
      select: ['channelId'],
      withDeleted: false, // 不查询软删除的数据
    });
    return channel?.channelId;
  }

  /**
   * 删除频道成员
   * @param channelId 频道id
   * @param memberId 成员id
   * @param isSoftDelete 是否软删除
   * @returns
   */
  async deleteChannelMember(channelId: string, memberId: number, isSoftDelete = true) {
    if (isSoftDelete) {
      return await this.channelMemberRepository.softDelete({
        channelId,
        memberId,
      });
    }
    return await this.channelMemberRepository.delete({
      channelId,
      memberId,
    });
  }

  /**
   * 删除频道
   * @param channelId 频道id
   * @param isSoftDelete 是否软删除
   * @returns
   */
  async deleteChannel(channelId: string, isSoftDelete = true) {
    if (isSoftDelete) {
      return await this.channelRepository.softDelete({
        id: channelId,
      });
    }
    return await this.channelRepository.delete({
      id: channelId,
    });
  }
}
