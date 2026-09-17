import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { UserDocument } from '../users/users.schema';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  getUserConversations(@CurrentUser() user: UserDocument) {
    return this.conversationsService.getUserConversations(user._id.toString());
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: UserDocument) {
    return this.conversationsService.getUnreadCount(user._id.toString());
  }

  @Get(':id/messages')
  getMessages(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: UserDocument,
    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ) {
    return this.conversationsService.getMessages(id, user._id.toString(), +page, +limit);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationsService.createMessage(id, user._id.toString(), dto);
  }
}
