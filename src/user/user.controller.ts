import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ResultDto } from 'src/common/dto/common-result.dto';
import { ApiResult } from 'src/common/decorators/ApiResult.decorator';
import { AllowAnon } from 'src/common/decorators/AllowAnon.decorator';
import {
  CreateUserDto,
  PublicUserInfoDto,
  RefreshTokenBodyDto,
  SearchUserDto,
  TokenDto,
  UserLoginDto,
  UserLoginSuccessDto,
} from './dto/user.dto';
import { ReqType } from 'src/common/types/request.types';
import ApiCode from 'src/common/enums/ApiCode.enum';

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @AllowAnon()
  async create(@Body() user: CreateUserDto): Promise<ResultDto> {
    return await this.userService.create(user);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiExtraModels(ResultDto, UserLoginSuccessDto)
  @ApiResult(UserLoginSuccessDto)
  @AllowAnon()
  async login(@Body() user: UserLoginDto): Promise<ResultDto<UserLoginSuccessDto | any>> {
    return await this.userService.login(user);
  }

  @Get('refreshToken')
  @ApiOperation({ summary: '刷新token' })
  @ApiExtraModels(RefreshTokenBodyDto)
  @ApiResult(TokenDto)
  refreshToken(@Req() req: ReqType, @Body() body: RefreshTokenBodyDto): ResultDto<TokenDto | null> {
    const verifyRes = this.userService.verifyToken(body.refresh_token);
    if (verifyRes == null || verifyRes.id !== req.user.id) {
      return ResultDto.fail(401, 'refresh_token无效');
    }
    const refreshRes = this.userService.refreshToken(req.user);
    if (refreshRes == null) {
      return ResultDto.fail(401, '刷新token失败');
    } else {
      return ResultDto.ok(refreshRes, '刷新token成功');
    }
  }

  @Get('userInfo')
  @ApiOperation({ summary: '获取用户公开信息' })
  @ApiExtraModels(PublicUserInfoDto)
  @ApiResult(PublicUserInfoDto)
  @AllowAnon()
  async userInfo(@Query('userId') userId: string): Promise<ResultDto<PublicUserInfoDto> | null> {
    const convert = parseInt(userId);
    if (isNaN(convert) || convert < 0) {
      return ResultDto.fail(ApiCode.PARAMS_ERROR_CODE, ApiCode.PARAMS_ERROR_MSG);
    }
    const userInfo = await this.userService.getUserPublicInfo(convert);
    return ResultDto.ok(userInfo);
  }

  @Post('search')
  @ApiOperation({ summary: '搜索用户' })
  @ApiResult(PublicUserInfoDto, true)
  async searchUser(
    @Req() req: ReqType,
    @Body() searchUserDto: SearchUserDto
  ): Promise<ResultDto | null> {
    const searchRes = await this.userService.searchUser(req.user, searchUserDto);
    if (searchRes == null) {
      return ResultDto.fail(404, '未找到用户');
    } else {
      return ResultDto.ok(searchRes);
    }
  }
}
