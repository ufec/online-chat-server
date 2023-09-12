import { forwardRef, Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ONLINE_USER_REDIS_KEY_PREFIX } from 'src/common/constants';
import { type OnlineUserDto } from 'src/common/dto/online-user.dto';
import { RedisClientService } from 'src/common/libs/redis/redis.service';
import { assertObject } from 'src/common/utils/utils';
import { ChatService } from './chat.service';
import { type MessageResultDto } from '@/message/dto/result.message.dto';
import { type ChannelMemberEntity } from '@/channels/entities/ChannelMember.entity';
import { type ChannelType } from '@/channels/interface/channel.interface';

interface PingBody {
  userId: number | string;
  accessToken: string;
}

interface SdpPayload {
  sdp: RTCSessionDescriptionInit;
  channelId: string;
  channelType: ChannelType;
  callType: 'video' | 'audio';
  userId: number;
}

interface IceCandidatePayload {
  candidate: RTCIceCandidate;
  channelId: string;
  channelType: ChannelType;
  userId: number;
}
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly redisService: RedisClientService // private readonly msgService: MsgService
  ) {}

  /**
   * 用户连接
   * @param client 客户端
   * @param args 参数
   * @returns
   */
  async handleConnection(client: Socket, ...args: any[]) {
    if (!assertObject<{ accessToken: string; refreshToken: string }>(client.handshake.auth)) {
      this.server.to(client.id).emit('connection_denied', {
        data: 'handshake auth accessToken is not string',
        id: client.id,
      });
      client.disconnect(true);
      return;
    }
    const verifyRes = this.chatService.verifyToken(client.handshake.auth.accessToken);
    if (verifyRes == null || client.handshake.query.userId !== String(verifyRes.id)) {
      // 验证失败，服务端主动断开连接 并告知客户端服务端拒绝连接
      this.server.to(client.id).emit('connection_denied', {
        data: 'connection_denied',
        id: client.id,
      });
      client.disconnect(true);
    } else {
      await this.chatService.addOnlineUser(verifyRes.id, {
        clientId: client.id,
        accessToken: client.handshake.auth.accessToken,
      });
      this.server.to(client.id).emit('connected', { data: 'connected', id: client.id, args });
      const friendRequestList = await this.chatService.hasFriendRequest(
        typeof verifyRes.id === 'number' ? verifyRes.id : parseInt(verifyRes.id)
      );
      // 上线后检测是否有待处理的好友请求 存在就下发通知
      if (friendRequestList.length !== 0) {
        this.server.to(client.id).emit('pending_friend_request_list', friendRequestList, client.id);
      }
    }
  }

  /**
   * 用户断开连接
   * @param client
   * @returns
   */
  async handleDisconnect(client: Socket) {
    if (!assertObject<{ accessToken: string; refreshToken: string }>(client.handshake.auth)) {
      return;
    }
    const userId = client.handshake.query.userId;
    if (typeof userId === 'string') {
      await this.chatService.removeOnlineUser(userId);
    }
    this.server.to(client.id).emit('disconnected', { data: 'disconnected', id: client.id });
  }

  /**
   * 向频道成员通知频道创建
   * @param channelId 频道id
   * @param channelMember 频道成员
   */
  async notifyChannelCreateToChannelMember(member: ChannelMemberEntity) {
    return await this.notifyClient(member.memberId, 'channel_create', member);
  }

  /**
   * 向频道成员推送消息
   * @param toUserId 用户id
   * @param messageResult 消息内容
   */
  sendMessagesToChannelMember(toUserId: number, messageResult: MessageResultDto) {
    this.notifyClient(toUserId, 'message_create', messageResult)
      .then()
      .catch((err) => {
        console.trace(err);
        throw err;
      });
  }

  /**
   * 向客户端发送通知
   * @param userId 用户ID
   * @param eventName 事件名称
   * @param notifyData 消息内容
   */
  async notifyClient<D>(userId: number, eventName: string, notifyData: D) {
    try {
      const cacheData = await this.getOnlineUserCacheData(userId);
      if (cacheData !== null) {
        return this.emitEvent(cacheData.clientId, eventName, notifyData);
      }
    } catch (error) {
      console.trace(error);
      throw error;
    }
  }

  /**
   * 发送消息
   * @param clientId 客户端id
   * @param event 事件名称
   * @param data 数据
   */
  private emitEvent<D>(clientId: string, event: string, data: D) {
    return this.server.to(clientId).emit(event, data);
  }

  private async getOnlineUserCacheData(userId: number | string) {
    try {
      const cacheDataStr = await this.redisService.get(`${ONLINE_USER_REDIS_KEY_PREFIX}${userId}`);
      if (cacheDataStr == null) return null;
      const cacheData = JSON.parse(cacheDataStr) as OnlineUserDto;
      return cacheData;
    } catch (error) {
      console.trace(error);
      throw error;
    }
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: PingBody, @ConnectedSocket() client: Socket) {
    const verifyRes = this.chatService.verifyToken(data.accessToken);
    if (verifyRes == null) {
      this.emitEvent('pong', client.id, {
        alive: false,
        action: 'refresh_token',
        time: Date.now(),
      });
    } else {
      this.emitEvent(client.id, 'pong', { alive: true, time: Date.now(), action: 'none' });
    }
  }

  @SubscribeMessage('create_offer')
  async handleCreateOffer(@MessageBody() data: SdpPayload, @ConnectedSocket() client: Socket) {
    const otherMembers = await this.chatService.getChannelsOtherMember(
      data.channelId,
      data.userId,
      data.channelType
    );
    const notifyPendingStack = otherMembers.map(async (member) => {
      await this.notifyClient(member.memberId, 'offer_create', data);
    });
    await Promise.all(notifyPendingStack);
  }

  @SubscribeMessage('create_answer')
  async handleCreateAnswer(@MessageBody() data: SdpPayload, @ConnectedSocket() client: Socket) {
    const otherMembers = await this.chatService.getChannelsOtherMember(
      data.channelId,
      data.userId,
      data.channelType
    );
    const notifyPendingStack = otherMembers.map(async (member) => {
      await this.notifyClient(member.memberId, 'answer_create', data);
    });
    await Promise.all(notifyPendingStack);
  }

  @SubscribeMessage('ice_candidate')
  async handleIceCandidate(
    @MessageBody() data: IceCandidatePayload,
    @ConnectedSocket() client: Socket
  ) {
    const otherMembers = await this.chatService.getChannelsOtherMember(
      data.channelId,
      data.userId,
      data.channelType
    );
    const notifyPendingStack = otherMembers.map(async (member) => {
      await this.notifyClient(member.memberId, 'swap_candidate', data);
    });
    await Promise.all(notifyPendingStack);
  }
}
