import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ReqType } from '@/common/types/request.types';
import { ChannelDto, ChannelMemberDto, QueryChannelMemberInfoDto } from './dto/channel.dto';
import { ResultDto } from '@/common/dto/common-result.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiHeaders,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResult } from '@/common/decorators/ApiResult.decorator';
import { PageQueryDto } from '@/common/dto/common.dto';
import { PaginatedDto } from '@/common/dto/common-data.dto';
import { CreateGroupDto } from './dto/create.dto';

@Controller('channels')
@ApiTags('频道模块')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post('queryChannelMemberInfo')
  @ApiBody({ type: QueryChannelMemberInfoDto })
  @ApiOperation({ summary: '查询成员频道信息' })
  @ApiBearerAuth('Authorization')
  @ApiHeaders([
    {
      name: 'Authorization',
      description: '用户token',
      required: true,
    },
  ])
  @ApiExtraModels(ResultDto, ChannelMemberDto, ChannelDto)
  @ApiResult(ChannelMemberDto)
  async queryChannelMemberInfo(@Req() req: ReqType, @Body() body: QueryChannelMemberInfoDto) {
    const channelMember = await this.channelsService.queryChannelMemberInfo(
      req.user.id,
      body.channelId
    );
    if (channelMember == null) {
      return ResultDto.fail();
    }
    return ResultDto.ok<ChannelMemberDto>(channelMember);
  }

  @Get('getMyChannels')
  @ApiOperation({ summary: '获取登陆用户的所在的所有频道' })
  @ApiBearerAuth('Authorization')
  @ApiHeaders([
    {
      name: 'Authorization',
      description: '用户token',
      required: true,
    },
  ])
  @ApiExtraModels(ResultDto, ChannelMemberDto)
  @ApiResult(ChannelMemberDto, true, true)
  async getMyChannels(@Req() req: ReqType, @Query() query: PageQueryDto) {
    const [channelList, total] = await this.channelsService.getMyChannels(req.user.id, query);
    return ResultDto.ok(new PaginatedDto(total, channelList));
  }

  @Post('/createGroup')
  @ApiOperation({ summary: '创建频道' })
  @ApiBearerAuth('Authorization')
  @ApiHeaders([
    {
      name: 'Authorization',
      description: '用户token',
      required: true,
    },
  ])
  async createGroup(@Req() req: ReqType, @Body() body: CreateGroupDto) {
    const channel = await this.channelsService.createGroupChat(req.user.id, body);
    return ResultDto.ok(channel);
  }
}
