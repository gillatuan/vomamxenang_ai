import { Body, Controller, Post } from '@nestjs/common';
import { CustomerChatService } from './customer-chat.service';

@Controller('customer-chat')
export class CustomerChatController {
  constructor(private readonly service: CustomerChatService) {}

  @Post()
  reply(@Body() body: { message?: string }) {
    return this.service.reply(body?.message || '');
  }
}
