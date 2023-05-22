import { GroupController } from "./group.controller";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupService } from "./group.service";
import Groups from "./group.entity";
import UsersModule from "src/user/user.module";
import ChatModule from "src/chat/chat.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Groups]),
		forwardRef(() => UsersModule),
		ChatModule
	],
	providers: [GroupService],
	exports: [GroupService],
	controllers: [GroupController]
})
export default class GroupModule {} 