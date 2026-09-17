import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ContactRequestsService } from './contact-requests.service';
import { SendContactRequestDto } from './dto/send-contact-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { UserDocument } from '../users/users.schema';

@Controller('contact-requests')
@UseGuards(JwtAuthGuard)
export class ContactRequestsController {
  constructor(private readonly contactRequestsService: ContactRequestsService) {}

  @Post()
  send(@Body() dto: SendContactRequestDto, @CurrentUser() user: UserDocument) {
    return this.contactRequestsService.send(user._id.toString(), dto);
  }

  @Get('incoming')
  getIncoming(@CurrentUser() user: UserDocument) {
    return this.contactRequestsService.getIncoming(user._id.toString());
  }

  @Get('outgoing')
  getOutgoing(@CurrentUser() user: UserDocument) {
    return this.contactRequestsService.getOutgoing(user._id.toString());
  }

  @Get('contacts')
  getContacts(@CurrentUser() user: UserDocument) {
    return this.contactRequestsService.getContacts(user._id.toString());
  }

  @Get('status/:userId')
  getStatus(
    @CurrentUser() user: UserDocument,
    @Param('userId', ParseObjectIdPipe) userId: string,
  ) {
    return this.contactRequestsService.getStatus(user._id.toString(), userId);
  }

  @Patch(':id/accept')
  accept(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.contactRequestsService.accept(id, user._id.toString());
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.contactRequestsService.reject(id, user._id.toString());
  }
}
