import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/passport/permission.guard';
import { Roles } from '@/decorator/customize';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { AddUserToRoomDto } from './dto/add-user-to-room.dto';
import { ChatGateway } from './chat.gateway';
import {
  CreateMessageDto,
  CreatePrivateMessageDto,
} from './dto/create-message.dto';
import type { RequestWithUserInJWTStrategy } from '@/helpers/auth/interfaces/RequestWithUser.interface';
import { Message, RoomChat } from '@prisma/client';

@Controller('chat')
@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'USER', 'OPERATOR')
export class ChatController {
  /**
   * Creates chat controller instance.
   *
   * This constructor performs the following operations:
   * 1. Injects chat service dependency
   * 2. Prepares controller for chat route handling
   *
   * @param {ChatService} chatService - Chat business logic service
   *
   * @remarks
   * - Controller currently exposes websocket-focused chat domain setup
   * - HTTP endpoints can be added here when needed
   */
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @ApiOperation({ summary: 'Create a new public chat room' })
  @ApiResponse({
    status: 201,
    description: 'Create a new public chat room',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Public room creation data',
    type: CreateRoomDto,
  })
  @Post('/public-rooms')
  async createPublicRoom(
    @Req() req: RequestWithUserInJWTStrategy,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<RoomChat> {
    const chatService: ChatService = this.chatService;
    return await chatService.createPublicRoomByUser(
      Number(req.user.userId),
      createRoomDto,
    );
  }

  @ApiOperation({ summary: 'Join an existing public chat room' })
  @ApiResponse({
    status: 201,
    description: 'Join an existing public chat room',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Join room payload',
    type: JoinRoomDto,
  })
  @Post('/public-rooms/join')
  async joinPublicRoom(
    @Req() req: RequestWithUserInJWTStrategy,
    @Body() joinRoomDto: JoinRoomDto,
  ): Promise<{ joined: boolean; roomName: string }> {
    const chatService: ChatService = this.chatService;
    return await chatService.joinPublicRoomByUser(
      Number(req.user.userId),
      joinRoomDto,
    );
  }

  @ApiOperation({ summary: 'Add a specific user to a public room (admin only)' })
  @ApiResponse({ status: 200, description: 'User added to room.' })
  @ApiBody({ type: AddUserToRoomDto })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('/public-rooms/add-user')
  async addUserToRoom(
    @Body() dto: AddUserToRoomDto,
  ): Promise<{ joined: boolean; roomName: string }> {
    const result = await this.chatService.addUserToPublicRoom(dto);
    // Notify the user's active WS socket so they join the room in real-time
    await this.chatGateway.notifyUserAddedToRoom(dto.userId, dto.roomName);
    return result;
  }

  @ApiOperation({
    summary: 'Get all customer support rooms (admin only)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return all public rooms whose name starts with "support-", ordered by creation date descending. Used by admins to discover incoming customer support requests.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Roles('ADMIN', 'OPERATOR')
  @Get('/admin/rooms')
  async getAdminRooms(): Promise<RoomChat[]> {
    return await this.chatService.getAdminRooms();
  }

  @ApiOperation({
    summary: 'Get all chat rooms joined by authenticated user',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return all private and public rooms where authenticated user is a member',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Get('/rooms')
  async getAllRooms(
    @Req() req: RequestWithUserInJWTStrategy,
  ): Promise<RoomChat[]> {
    const chatService: ChatService = this.chatService;
    return await chatService.getAllRooms(Number(req.user.userId));
  }

  @ApiOperation({ summary: 'Get paginated messages of a room' })
  @ApiResponse({
    status: 200,
    description: 'Get paginated messages of a room',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiQuery({
    name: 'roomName',
    required: true,
    type: String,
    example: 'sample-room',
    description: 'Room name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 20,
    description: 'Number of items per page',
  })
  @Get('/messages')
  async getRoomMessages(
    @Query('roomName') roomName: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ): Promise<Message[]> {
    const chatService: ChatService = this.chatService;
    return await chatService.getRoomMessages(
      roomName,
      Number(page),
      Number(perPage),
    );
  }

  @ApiOperation({ summary: 'Send a message to a public room' })
  @ApiResponse({
    status: 201,
    description: 'Send a message to a public room',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Public room message payload',
    type: CreateMessageDto,
  })
  @Post('/messages/public')
  async sendPublicMessage(
    @Req() req: RequestWithUserInJWTStrategy,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const chatService: ChatService = this.chatService;
    return await chatService.sendPublicMessageByUser(
      Number(req.user.userId),
      createMessageDto,
    );
  }

  @ApiOperation({ summary: 'Send a private message' })
  @ApiResponse({
    status: 201,
    description: 'Send a private message',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({
    description: 'Private message payload',
    type: CreatePrivateMessageDto,
  })
  @Post('/messages/private')
  async sendPrivateMessage(
    @Req() req: RequestWithUserInJWTStrategy,
    @Body() createPrivateMessageDto: CreatePrivateMessageDto,
  ): Promise<Message> {
    const chatService: ChatService = this.chatService;
    return await chatService.sendPrivateMessageByUser(
      Number(req.user.userId),
      createPrivateMessageDto,
    );
  }
}
