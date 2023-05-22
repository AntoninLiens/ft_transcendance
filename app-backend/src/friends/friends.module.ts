import { FriendsController } from "./friends.controller";
import { forwardRef, Module } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Friends } from "./friends.entity";
import UsersModule from "src/user/user.module";
import ChatModule from "src/chat/chat.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Friends]),
		forwardRef(() => UsersModule),
		ChatModule
	],
	providers: [FriendsService],
	controllers: [FriendsController],
	exports: [FriendsService]
})
export class FriendsModule {}