import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsAlphanumeric,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { DEFAULT_SLOGAN } from 'src/common/constants';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsAlphanumeric('en-US', { message: '用户名只能包含字母和数字' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(4, { message: '用户名不能少于4位' })
  @MaxLength(20, { message: '用户名不能多于20位' })
  readonly username!: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsAlphanumeric('en-US', { message: '密码只能包含字母和数字' })
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password!: string;

  @ApiProperty({ description: '昵称', example: 'admin' })
  @IsString({ message: '昵称必须是字符串' })
  @IsNotEmpty({ message: '昵称不能为空' })
  readonly nickname!: string;

  @ApiProperty({
    description: '头像',
    required: false,
    example: 'https://example.com/avatar/example.jpg',
  })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: '头像必须是合法的URL' }
  )
  @IsOptional()
  readonly avatar?: string;

  @ApiProperty({ description: '个性签名', required: false, example: DEFAULT_SLOGAN })
  @IsString({ message: '个性签名必须是字符串' })
  @IsOptional()
  readonly slogan?: string;

  @ApiProperty({
    description: '性别[0 男, 1 女, 2 未知] 默认为2',
    required: false,
    example: 2,
    default: 2,
    enum: [0, 1, 2],
  })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '性别必须是合法的数字' })
  @IsOptional()
  readonly gender?: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class SearchUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsString({ message: '用户名必须是字符串' })
  @IsOptional()
  readonly username?: string;

  @ApiProperty({ description: '用户ID', required: false })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '用户ID必须是数字' })
  @IsOptional()
  readonly id?: number;
}

export class UserLoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsAlphanumeric('en-US', { message: '用户名只能包含字母和数字' })
  readonly username!: string;

  @ApiProperty({ description: '密码', example: 'admin' })
  @IsAlphanumeric('en-US', { message: '密码只能包含字母和数字' })
  readonly password!: string;
}

// 用户公开信息
export class PublicUserInfoDto {
  @ApiProperty({ description: '用户ID', type: Number, example: 0 })
  readonly id!: number;

  @ApiProperty({ description: '用户名', type: String, example: 'admin' })
  readonly username!: string;

  @ApiProperty({ description: '用户昵称', type: String, example: 'admin' })
  readonly nickname!: string;

  @ApiProperty({
    description: '头像地址',
    type: String,
    example: 'https://example.com/example.jpg',
  })
  readonly avatar?: string;

  @ApiProperty({
    description: '个性签名',
    type: String,
    example: DEFAULT_SLOGAN,
  })
  readonly slogan!: string;

  @ApiProperty({ description: '性别', type: Number, example: 1 })
  readonly gender!: number;
}

// token信息
export class TokenDto {
  @ApiProperty({
    description: '用户Token',
    type: String,
    example: 'this is access_token',
  })
  readonly access_token!: string;

  @ApiProperty({
    description: '刷新Token',
    type: String,
    example: 'this is refresh_token',
  })
  readonly refresh_token!: string;
}

// 用户登陆成功后返回的信息结构
export class UserLoginSuccessDto extends PublicUserInfoDto {
  @ApiProperty({ description: '用户Token', type: TokenDto })
  token!: TokenDto;
}

export class RefreshTokenBodyDto {
  @ApiProperty({ description: '刷新Token', example: 'this is refresh_token' })
  @IsString({ message: '刷新Token必须是字符串' })
  readonly refresh_token!: string;
}
