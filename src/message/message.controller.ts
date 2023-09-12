import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { ReqType } from '@/common/types/request.types';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageQueryDto } from '@/common/dto/common.dto';
import { ApiResult } from '@/common/decorators/ApiResult.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { type ChannelIdMapMessageListDto, MessageResultDto } from './dto/result.message.dto';
import { ResultDto } from '@/common/dto/common-result.dto';
import { PaginatedDto } from '@/common/dto/common-data.dto';
import { ChannelsService } from '@/channels/channels.service';
import ApiCode from '@/common/enums/ApiCode.enum';
import { ChatGateway } from '@/chat/chat.gateway';
import { AllowAnon } from '@/common/decorators/AllowAnon.decorator';
import { QueryMessagesByChannelIdsPayload } from './dto/query-message.dto';
import { md5 } from '@/common/utils/utils';
import { AttachmentService } from '@/attachment/attachment.service';
import { type MessageEntity } from './entities/Message.entity';
import { type ChannelMemberEntity } from '@/channels/entities/ChannelMember.entity';

@ApiTags('消息模块')
@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly channelService: ChannelsService,
    private readonly chatGateway: ChatGateway,
    private readonly attachmentService: AttachmentService
  ) {}

  /**
   * 创建消息的后续处理
   */
  private async afterCreateMessage(
    createRes: MessageEntity,
    channelMembers: ChannelMemberEntity[],
    userId: number,
    channelId: string
  ) {
    // 更新频道的最后一条消息
    const upRes = await this.channelService.updateChannelLastMessage(channelId, createRes.id);
    if (upRes == null) {
      return ResultDto.fail();
    }
    createRes.author = channelMembers.find((item) => item.memberId === userId)?.member;
    channelMembers.forEach((item) => {
      if (item.memberId !== userId && item.member) {
        // 这里的channel是更新之前的，所以要更新一下
        item.channel.lastMessageId = createRes.id;
        // 把消息发给频道其他成员
        this.chatGateway.sendMessagesToChannelMember(item.memberId, {
          ...createRes,
        });
      }
    });
    return ResultDto.ok(createRes);
  }

  @Post(':channelId/messages')
  @ApiOperation({ summary: '创建消息' })
  async create(
    @Req() req: ReqType,
    @Param('channelId') channelId: string,
    @Body() body: CreateMessageDto
  ) {
    // 创建消息前的校验
    const prevRes = await this.messageService.prevCreateMessage(channelId, req.user.id);
    if (prevRes instanceof ResultDto) {
      return prevRes;
    }
    const channelMembers = prevRes;
    // 创建消息
    const createRes = await this.messageService.create({
      ...body,
      authorId: req.user.id,
    });
    if (createRes == null) {
      return ResultDto.fail();
    }
    return await this.afterCreateMessage(createRes, channelMembers, req.user.id, channelId);
  }

  @Post(':channelId/createAttachmentMessage')
  @ApiOperation({ summary: '创建附件消息' })
  async createAttachmentMessage(@Req() req: ReqType, @Param('channelId') channelId: string) {
    const file = await req.file();
    if (file === undefined) {
      return ResultDto.fail(ApiCode.UPLOAD_FILE_FAIL_CODE, ApiCode.UPLOAD_FILE_FAIL_MSG);
    }
    // 创建消息前的校验
    const prevRes = await this.messageService.prevCreateMessage(channelId, req.user.id);
    if (prevRes instanceof ResultDto) {
      return prevRes;
    }
    const userPath = md5(String(req.user.id));
    const path = this.attachmentService.saveAttachmentToLocalStorage(file, userPath);
    const createAttachment = await this.attachmentService.createAttachment([
      {
        userId: req.user.id,
        fileName: file.filename.split('.')[0],
        filePath: path,
        fileType: file.mimetype,
        fileSize: file.file.bytesRead,
      },
    ]);
    const channelMembers = prevRes;
    // 创建消息
    const createRes = await this.messageService.create({
      channelId,
      authorId: req.user.id,
      content: '',
      msgType: this.messageService.getMsgTypeByMineType(file.mimetype),
      attachmentIds: createAttachment.map((item) => item.id),
    });
    if (createRes == null) {
      return ResultDto.fail();
    }
    createRes.attachments = createAttachment;
    return await this.afterCreateMessage(createRes, channelMembers, req.user.id, channelId);
  }

  @Get(':channelId/messages')
  @ApiOperation({ summary: '查询频道消息' })
  @ApiExtraModels(MessageResultDto)
  @ApiResult(MessageResultDto, true, true)
  async queryChannelMessage(@Query() query: PageQueryDto, @Param('channelId') channelId: string) {
    const messageList = await this.messageService.queryMessageByChannelId(channelId, query);
    return ResultDto.ok(new PaginatedDto(query.pageSize, messageList));
  }

  @Post('queryMessagesByChannelIds')
  @ApiOperation({ summary: '通过频道ID列表查询对应频道ID下的最新消息' })
  async queryMessagesByChannelIds(
    @Req() req: ReqType,
    @Body() payload: QueryMessagesByChannelIdsPayload
  ) {
    // 校验当前登录用户是否是频道成员
    const isChannelMember = await this.channelService.queryUserIsInChannelList(
      req.user.id,
      payload.channelIds
    );
    // 如果不是频道成员，返回错误
    if (!isChannelMember) {
      return ResultDto.fail(
        ApiCode.CHANNEL_MEMBER_NOT_FOUND_CODE,
        ApiCode.CHANNEL_MEMBER_NOT_FOUND_MSG
      );
    }
    const messageMap = await this.messageService.queryMessagesByChannelIds(payload.channelIds);
    return ResultDto.ok<ChannelIdMapMessageListDto>(messageMap);
  }

  @Get('/test')
  @AllowAnon()
  async testServices() {
    return await this.messageService.queryMessageByChannelId('8632552609026048', {
      pageSize: 10,
      page: 1,
    });
  }
}
