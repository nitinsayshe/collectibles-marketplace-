import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { UserDocument } from '../users/users.schema';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(@CurrentUser() user: UserDocument) {
    return this.notificationsService.getUserNotifications(user._id.toString());
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: UserDocument) {
    return this.notificationsService.getUnreadCount(user._id.toString());
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseObjectIdPipe) id: string, @CurrentUser() user: UserDocument) {
    return this.notificationsService.markRead(id, user._id.toString());
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: UserDocument) {
    return this.notificationsService.markAllRead(user._id.toString());
  }
}
