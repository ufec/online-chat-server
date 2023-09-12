import { createHash, createHmac } from 'node:crypto';

/**
 * 生成随机字符串
 * @param len 生成的字符串长度 默认8
 * @returns 生成的字符串
 */
export function randomString(len = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxPos = chars.length;
  let pwd = '';
  while (len-- > 0) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

/**
 * 对密码进行hash
 * @param password 要加密的字符串
 * @param salt 加密的盐
 * @returns 加密后的字符串
 */
export function hashPassword(password: string, salt: string): string {
  const md5 = createHash('md5');
  const sha256 = createHash('sha256');
  return md5.update(sha256.update(password + salt).digest('hex')).digest('hex');
}

/**
 * 对头像进行hash
 * @param avatar
 * @param secret
 * @returns
 */
export function hashAvatar(avatar: string, secret: string) {
  return createHmac('sha1', secret).update(avatar).digest('hex');
}

/**
 * 对内容进行md5
 * @param content 文本
 * @returns md5后的字符串
 */
export function md5(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

/**
 * 断言对象
 * @param obj 要断言的对象
 * @param keys 要断言的key
 * @param types 要断言的类型
 * @returns 断言后的结果
 */
// export function assertObject<T>(
//   obj: unknown,
//   keys: string[],
//   types: Array<string | Function>,
// ): obj is {
//   [P in keyof T]: T[P];
// } {
//   return (
//     typeof obj === 'object' &&
//     obj !== null &&
//     keys.every((key) => key in obj) &&
//     types.every((type, index) => typeof obj[keys[index]] === type)
//   );
// }

/**
 * 断言函数
 * @param obj 断言的对象
 * @returns 断言结果
 */
export function assertObject<T>(obj: unknown): obj is {
  [P in keyof T]: T[P];
} {
  return typeof obj === 'object' && obj !== null;
}

/**
 * 获取好友唯一ID 用户id顺序不影响结果
 * @param user1 用户1
 * @param user2 用户2
 * @returns 唯一ID
 */
export function getFriendUniqueID(user1: number, user2: number): string {
  return user1 < user2 ? `${user1}-${user2}` : `${user2}-${user1}`;
}
