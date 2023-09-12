export interface User {
  id: string; // 用户ID
  username: string; // 用户名
  global_name: string; // 全局用户名
  display_name: string; // 显示名
  avatar: string; // 头像
  avatar_decoration: string; // 头像装饰
  discriminator: string; // 用户标识符
  public_flags: number; // 用户公开标识符
}

export interface Attachment {
  filename: string; // 文件名
  id: string; // 文件ID
  proxy_url: string; // 代理URL
  url: string; // URL
  size: number; // 文件大小
  content_type?: string; // 文件类型
  width?: number; // 宽度
  height?: number; // 高度
}

export interface MessageReference {
  channel_id: string; // 频道ID
  message_id: string; // 消息ID
  guild_id?: string; // 服务器ID
}

export interface Msg {
  id: string; // 消息ID
  type: number; // 消息类型
  content: string; // 消息内容
  channel_id: string; // 频道ID
  author: User; // 发送者
  attachments: Attachment[]; // 附件
  embeds: [];
  mentions: User[]; // 提及的用户
  mention_roles: []; // 提及的角色
  pinned: false; // 是否已固定
  mention_everyone: false; // 是否提及了everyone
  tts: false; // 是否为TTS
  timestamp: '2023-03-25T14:33:05.995000+00:00';
  edited_timestamp: null; // 编辑时间
  flags: 0; // 消息标识符
  components: []; // 组件
  message_reference: MessageReference; // 消息引用
  referenced_message: Msg; // 该条消息引用的消息的具体内容
}

// api设计
// POST /channels/${channel_id}/attachments 对频道发送附件
// POST /channels/${channel_id}/messages 对频道发送消息
// PATCH /channels/${channel_id}/messages/${message_id} 编辑频道消息
// DELETE /channels/${channel_id}/messages/${message_id} 删除频道消息
// POST /channels/${channel_id}/messages/${message_id}/crosspost 跨频道转发消息
// GET /channels/${channel_id}/messages 获取频道消息
// GET /channels/${channel_id}/messages/${message_id} 获取频道消息
// DELETE users/@me/relationships/${user_id} 删除好友
// POST /users/@me/relationships 添加好友
// GET /users/@me/affinities/users 获取好友列表
// GET /users/${user_id}/profile?with_mutual_guilds=true&with_mutual_friends_count=false 获取用户信息

/**
 * discord 添加好友整个流程
 * 1. 申请方发送好友申请
 * 2. 被申请方 websocket 收到消息
 *  {"t":"RELATIONSHIP_ADD","s":7,"op":0,"d":{"user":{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"type":3,"since":"2023-03-27T15:55:57.379126+00:00","should_notify":true,"nickname":null,"id":"1026009799596462102"}}
 *  {"t":"RELATIONSHIP_ADD","s":8,"op":0,"d":{"user":{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"type":1,"nickname":null,"id":"1026009799596462102"}}
 * 3. 被申请方点击确认接受好友请求后，收到websocket消息
 *  {"t":"PRESENCE_UPDATE","s":9,"op":0,"d":{"user":{"username":"EthanXu","id":"1026009799596462102","display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"status":"idle","last_modified":1679929273072,"client_status":{"web":"idle"},"activities":[]}}
 *  {"t":"CHANNEL_CREATE","s":10,"op":0,"d":{"type":1,"recipients":[{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"}],"last_message_id":null,"is_spam":false,"id":"1089927523036561552","flags":0}}
 * 4. 正在输入状态
 * {"t":"TYPING_START","s":11,"op":0,"d":{"user_id":"1026009799596462102","timestamp":1679929273072,"channel_id":"1089927523036561552"}}
 * 5. 接收消息
 * {"t":"MESSAGE_CREATE","s":4,"op":0,"d":{"type":0,"tts":false,"timestamp":"2023-03-28T01:07:30.576000+00:00","referenced_message":null,"pinned":false,"nonce":"1090079686165266432","mentions":[],"mention_roles":[],"mention_everyone":false,"id":"1090079689072201819","flags":0,"embeds":[],"edited_timestamp":null,"content":"111","components":[],"channel_id":"1089927523036561552","author":{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"attachments":[]}}
 * 6. 接收语音申请
 *  {"t":"MESSAGE_CREATE","s":6,"op":0,"d":{"type":3,"tts":false,"timestamp":"2023-03-28T01:09:10.086000+00:00","pinned":false,"mentions":[{"username":"thinkhalo","public_flags":0,"id":"1089918900474482719","global_name":null,"display_name":null,"discriminator":"0115","avatar_decoration":null,"avatar":null}],"mention_roles":[],"mention_everyone":false,"id":"1090080106447384668","flags":0,"embeds":[],"edited_timestamp":null,"content":"","components":[],"channel_id":"1089927523036561552","call":{"participants":["1026009799596462102"],"ended_timestamp":null},"author":{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"attachments":[]}}
 *  {"t":"CALL_CREATE","s":7,"op":0,"d":{"voice_states":[{"user_id":"1026009799596462102","suppress":false,"session_id":"e25d8aa5c172ae40c302519dbdd41fe3","self_video":false,"self_mute":true,"self_deaf":false,"request_to_speak_timestamp":null,"mute":false,"deaf":false,"channel_id":"1089927523036561552"}],"ringing":[],"region":"sydney","message_id":"1090080106447384668","embedded_activities":[],"channel_id":"1089927523036561552"}}
 *  {"t":"CALL_UPDATE","s":8,"op":0,"d":{"ringing":["1089918900474482719"],"region":"sydney","message_id":"1090080106447384668","guild_id":null,"channel_id":"1089927523036561552"}}
 *  {"t":"VOICE_STATE_UPDATE","s":9,"op":0,"d":{"user_id":"1026009799596462102","suppress":false,"session_id":"e25d8aa5c172ae40c302519dbdd41fe3","self_video":false,"self_mute":false,"self_deaf":false,"request_to_speak_timestamp":null,"mute":false,"guild_id":null,"deaf":false,"channel_id":"1089927523036561552"}}
 *  {"t":"CALL_UPDATE","s":10,"op":0,"d":{"ringing":[],"region":"sydney","message_id":"1090080106447384668","guild_id":null,"channel_id":"1089927523036561552"}}
 *  {"t":"VOICE_STATE_UPDATE","s":11,"op":0,"d":{"user_id":"1026009799596462102","suppress":false,"session_id":"e25d8aa5c172ae40c302519dbdd41fe3","self_video":false,"self_mute":false,"self_deaf":false,"request_to_speak_timestamp":null,"mute":false,"guild_id":null,"deaf":false,"channel_id":null}}
 *  {"t":"MESSAGE_UPDATE","s":12,"op":0,"d":{"id":"1090080106447384668","channel_id":"1089927523036561552","call":{"participants":["1026009799596462102"],"ended_timestamp":"2023-03-28T01:10:37.502013+00:00"}}}
 *  {"t":"CALL_DELETE","s":13,"op":0,"d":{"channel_id":"1089927523036561552"}}
 */

/**
 * 发起好友申请方（thinkhalo）
 *  {"t":"RELATIONSHIP_ADD","s":9,"op":0,"d":{"user":{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"type":4,"nickname":null,"id":"1026009799596462102"}}
 *  {"t":"RELATIONSHIP_ADD","s":10,"op":0,"d":{"user":{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"type":1,"should_notify":true,"nickname":null,"id":"1026009799596462102"}}
 *  {"t":"PRESENCE_UPDATE","s":11,"op":0,"d":{"user":{"username":"EthanXu","id":"1026009799596462102","display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"status":"idle","last_modified":1680013976885,"client_status":{"web":"idle"},"activities":[]}}
 *  {"t":"NOTIFICATION_CENTER_ITEM_CREATE","s":12,"op":0,"d":{"type":"friend_request_accepted","other_user":{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"},"message_content":null,"item_enum":null,"id":"1090284179134095410","icon_url":"https://cdn.discordapp.com/avatars/1026009799596462102/bd53e49a735dd5d7fc8404ac955a81c2.jpg","icon_name":null,"guild_id":null,"deeplink":"https://discord.com/users/1026009799596462102","completed":false,"bundle_id":"f783a84b4b21aa46b86ef69af451f6927c8f5d87a892fd1b11f9287e148a179d","body":"**EthanXu** 已接受您的好友请求。","acked":false}}
 *  {"t":"CHANNEL_CREATE","s":13,"op":0,"d":{"type":1,"recipients":[{"username":"EthanXu","public_flags":0,"id":"1026009799596462102","global_name":null,"display_name":null,"discriminator":"2695","avatar_decoration":null,"avatar":"bd53e49a735dd5d7fc8404ac955a81c2"}],"last_message_id":"1090080106447384668","is_spam":false,"id":"1089927523036561552","flags":0}}
 *
 * 接受好友申请方
 *  {"t":"RELATIONSHIP_ADD","s":35,"op":0,"d":{"user":{"username":"thinkhalo","public_flags":0,"id":"1089918900474482719","global_name":null,"display_name":null,"discriminator":"0115","avatar_decoration":null,"avatar":null},"type":3,"since":"2023-03-28T14:38:53.282604+00:00","should_notify":true,"nickname":null,"id":"1089918900474482719"}}
 *  {"t":"RELATIONSHIP_ADD","s":42,"op":0,"d":{"user":{"username":"thinkhalo","public_flags":0,"id":"1089918900474482719","global_name":null,"display_name":null,"discriminator":"0115","avatar_decoration":null,"avatar":null},"type":1,"nickname":null,"id":"1089918900474482719"}}
 *  {"t":"PRESENCE_UPDATE","s":43,"op":0,"d":{"user":{"username":"thinkhalo","id":"1089918900474482719","display_name":null,"discriminator":"0115","avatar_decoration":null,"avatar":null},"status":"online","last_modified":1680014168814,"client_status":{"web":"online"},"activities":[]}}
 *  {"t":"CHANNEL_CREATE","s":44,"op":0,"d":{"type":1,"recipients":[{"username":"thinkhalo","public_flags":0,"id":"1089918900474482719","global_name":null,"display_name":null,"discriminator":"0115","avatar_decoration":null,"avatar":null}],"last_message_id":"1090080106447384668","is_spam":false,"id":"1089927523036561552","flags":0}}
 */
