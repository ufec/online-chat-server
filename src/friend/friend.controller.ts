import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiExtraModels, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from 'src/common/decorators/ApiResult.decorator';
import { PaginatedDto } from 'src/common/dto/common-data.dto';
import { ResultDto } from 'src/common/dto/common-result.dto';
import ApiCode from 'src/common/enums/ApiCode.enum';
import { ReqType } from 'src/common/types/request.types';
import {
  FriendRequestsDto,
  AcceptFriendRequestsBodyDto,
  FriendDto,
  DeleteFriendDto,
} from './dto/friends.dto';
import { FriendService } from './friend.service';
import { PageQueryDto } from '@/common/dto/common.dto';

@Controller('friend')
@ApiTags('好友模块')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('send')
  @ApiOperation({ summary: '发送好友请求' })
  async sendFriendRequest(
    @Req() req: ReqType,
    @Body() friendRequestDto: FriendRequestsDto
  ): Promise<ResultDto> {
    if (req.user == null) {
      return ResultDto.fail(ApiCode.NOT_LOGIN_CODE, ApiCode.NOT_LOGIN_MSG);
    }
    return await this.friendService.createFriendRequest(
      typeof req.user.id === 'number' ? req.user.id : parseInt(req.user.id),
      friendRequestDto
    );
  }

  @Post('accept')
  @ApiOperation({ summary: '接受好友请求' })
  async acceptFriendRequest(
    @Req() req: ReqType,
    @Body() acceptBody: AcceptFriendRequestsBodyDto
  ): Promise<ResultDto> {
    const friendRequestRecord = await this.preOperateFriendRequest(req, acceptBody);
    if (friendRequestRecord instanceof ResultDto) {
      return friendRequestRecord;
    }
    return await this.friendService.acceptFriendRequest(
      typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id,
      acceptBody,
      friendRequestRecord
    );
  }

  @Post('reject')
  @ApiOperation({ summary: '拒绝好友请求' })
  async rejectFriendRequest(
    @Req() req: ReqType,
    @Body() acceptBody: Pick<AcceptFriendRequestsBodyDto, 'id'>
  ) {
    const friendRequestRecord = await this.preOperateFriendRequest(req, acceptBody);
    if (friendRequestRecord instanceof ResultDto) {
      return friendRequestRecord;
    }
    const rejectRes = await this.friendService.rejectFriendRequest(friendRequestRecord);
    if (rejectRes === null) {
      return ResultDto.fail(
        ApiCode.FRIEND_REQUESTS_REJECT_FAIL_CODE,
        ApiCode.FRIEND_REQUESTS_REJECT_FAIL_MSG
      );
    }
    return ResultDto.ok();
  }

  /**
   * 接受/拒绝 好友申请的前置操作
   * @param req 请求对象
   * @param acceptBody 接受好友请求的参数
   * @returns 返回好友请求记录 | 返回错误信息
   */
  private async preOperateFriendRequest(req: ReqType, acceptBody: AcceptFriendRequestsBodyDto) {
    const friendRequestRecord = await this.friendService.getFriendRequestsById(acceptBody.id);
    // 好友申请不存在
    if (friendRequestRecord == null) {
      return ResultDto.fail(
        ApiCode.FRIEND_REQUESTS_NOT_EXIST_CODE,
        ApiCode.FRIEND_REQUESTS_NOT_EXIST_MSG
      );
    }
    // 当前登录的用户必须是接受好友请求的用户
    if (req.user.id !== friendRequestRecord.toUserId) {
      return ResultDto.fail(
        ApiCode.FRIEND_REQUESTS_NOT_YOUR_CODE,
        ApiCode.FRIEND_REQUESTS_NOT_YOUR_MSG
      );
    }
    return friendRequestRecord;
  }

  @Get('/getFriendList')
  @ApiOperation({ summary: '获取好友列表' })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: '用户token',
      required: true,
    },
  ])
  @ApiExtraModels(PaginatedDto, FriendDto)
  @ApiResult(FriendDto, true, true)
  async getFriendList(@Req() req: ReqType, @Query() query: PageQueryDto) {
    return await this.friendService.getFriendListByUserId(
      typeof req.user.id === 'number' ? req.user.id : parseInt(req.user.id),
      query.page,
      query.pageSize
    );
  }

  @Post('/deleteFriend')
  @ApiOperation({ summary: '删除好友' })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: '用户token',
      required: true,
    },
  ])
  async deleteFriend(@Req() req: ReqType, @Body() body: DeleteFriendDto) {
    return await this.friendService.deleteFriend(req.user.id, body.friendId);
  }
}
