/* eslint-disable @typescript-eslint/no-redeclare */
// 全局成功与失败状态码
enum ApiCode {
  OK_CODE = 0,
  FAIL_CODE,
}

// 全局成功与失败的消息
enum ApiCode {
  OK_MSG = '操作成功',
  FAIL_MSG = '操作失败',
}

// 系统级别的错误码
enum ApiCode {
  UNKNOWN_CODE = 1000, // 未知错误
  PARAMS_ERROR_CODE, // 参数错误
}

// 系统级别错误信息

enum ApiCode {
  UNKNOWN_MSG = '未知错误',
  PARAMS_ERROR_MSG = '参数错误',
}

// 业务级别的错误码
enum ApiCode {
  NOT_LOGIN_CODE = 2000, // 未登录
  USER_IS_OFFLINE_CODE, // 用户已下线
  INVALID_TOKEN_CODE, // 无效的token
  INVALID_USER_CODE, // 无效的用户
  INVALID_PASSWORD_CODE, // 无效的密码
  INVALID_USERNAME_CODE, // 无效的用户名
  INVALID_NICKNAME_CODE, // 无效的昵称
  USER_EXIST_CODE, // 用户已存在
  USER_CREATE_ERR_CODE, // 用户创建失败
  USER_NOT_FOUND_CODE, // 用户不存在
  CREATE_FRIEND_REQUESTS_FAIL_CODE = 2100, // 创建好友请求失败
  FRIEND_REQUESTS_IS_PENDING_CODE, // 好友请求已经是待处理状态
  FRIEND_REQUESTS_IS_ACCEPTED_CODE, // 好友请求已经是已接受状态
  FRIEND_REQUESTS_SELF_CODE, // 不能添加自己为好友
  FRIEND_REQUESTS_NOT_EXIST_CODE, // 好友请求不存在
  FRIEND_REQUESTS_NOT_YOUR_CODE, // 好友请求不属于你
  FRIEND_REQUESTS_ACCEPT_FAIL_CODE, // 接受好友请求失败
  FRIEND_REQUESTS_REJECT_FAIL_CODE, // 拒绝好友请求失败
  INVALID_FRIEND_REQUESTS_TYPE_CODE, // 未知的好友请求类型
  INVALID_FRIEND_REQUESTS_STATUS_CODE, // 未知的好友请求状态
  IS_ALREADY_FRIEND_CODE, // 已经是好友
  FRIEND_SHIP_NOT_EXIST_CODE, // 好友关系不存在
  FRIEND_DELETE_FAIL_CODE, // 删除好友失败
  FRIEND_SHIP_IS_DELETED_CODE, // 好友关系被解除
  UPLOAD_FILE_FAIL_CODE = 2200, // 上传文件失败
  CHANNEL_NOT_FOUND_CODE = 2300, // 频道不存在
  CHANNEL_MEMBER_IS_EMPTY_CODE, // 频道成员为空
  CHANNEL_MEMBER_NOT_FOUND_CODE, // 频道成员不存在
  CHANNEL_NOT_FOUND_OR_NOT_MEMBER_CODE, // 频道不存在或者不是频道成员
}

// 业务级别的错误信息
enum ApiCode {
  NOT_LOGIN_MSG = '未登录',
  USER_IS_OFFLINE_MSG = '用户已下线',
  INVALID_TOKEN_MSG = '无效的token',
  INVALID_USER_MSG = '无效的用户',
  INVALID_PASSWORD_MSG = '无效的密码',
  INVALID_USERNAME_MSG = '无效的用户名',
  INVALID_NICKNAME_MSG = '无效的昵称',
  USER_EXIST_MSG = '用户已存在',
  USER_NOT_FOUND_MSG = '用户不存在',
  USER_CREATE_ERR_MSG = '用户创建失败',
  CREATE_FRIEND_REQUESTS_FAIL_MSG = '创建好友请求失败',
  FRIEND_REQUESTS_IS_PENDING_MSG = '好友申请待确认',
  FRIEND_REQUESTS_IS_ACCEPTED_MSG = '好友请求已接受',
  FRIEND_REQUESTS_SELF_MSG = '不能添加自己为好友',
  FRIEND_REQUESTS_NOT_EXIST_MSG = '好友请求不存在',
  FRIEND_REQUESTS_NOT_YOUR_MSG = '好友请求不属于你',
  FRIEND_REQUESTS_ACCEPT_FAIL_MSG = '接受好友请求失败',
  FRIEND_REQUESTS_REJECT_FAIL_MSG = '拒绝好友请求失败',
  INVALID_FRIEND_REQUESTS_TYPE_MSG = '未知的好友请求类型',
  INVALID_FRIEND_REQUESTS_STATUS_MSG = '未知的好友请求状态',
  IS_ALREADY_FRIEND_MSG = '已经是好友',
  FRIEND_SHIP_NOT_EXIST_MSG = '好友关系不存在',
  FRIEND_DELETE_FAIL_MSG = '删除好友失败',
  FRIEND_SHIP_IS_DELETED_MSG = '好友关系被解除',
  UPLOAD_FILE_FAIL_MSG = '上传文件失败',
  CHANNEL_NOT_FOUND_MSG = '频道不存在',
  CHANNEL_MEMBER_IS_EMPTY_MSG = '频道成员为空',
  CHANNEL_MEMBER_NOT_FOUND_MSG = '频道成员不存在',
  CHANNEL_NOT_FOUND_OR_NOT_MEMBER_MSG = '频道不存在或者不是频道成员',
}

export default ApiCode;
