import type { FindOptionsSelect } from 'typeorm';
import type { UserEntity } from './entities/User.entity';

export type UserEntityProps = keyof UserEntity;

export const selectFields: FindOptionsSelect<UserEntity> = {
  id: true,
  username: true,
  nickname: true,
  avatar: true,
  slogan: true,
  gender: true,
  // fromFriendRequests: true,
  // toFriendRequests: true,
  // salt: false,
  // password: false,
  // createdAt: false,
  // updatedAt: false,
  // isDelete: false,
};
