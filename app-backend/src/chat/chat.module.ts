import { ChatController } from "./chat.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatService } from "./chat.service";
import { Message } from "./message.entity";
import { Module } from "@nestjs/common";
import { Chat } from "./chat.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Chat, Message]),
    ],
    providers: [ChatService],
    exports: [ChatService],
    controllers: [ChatController]
})
export default class ChatModule {}