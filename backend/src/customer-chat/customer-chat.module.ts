import { Module } from '@nestjs/common';
import { CustomerChatController } from './customer-chat.controller';
import { CustomerChatService } from './customer-chat.service';

@Module({ controllers:[CustomerChatController], providers:[CustomerChatService] })
export class CustomerChatModule {}
