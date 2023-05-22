import { FriendsModule } from "src/friends/friends.module";
import { SettingModule } from "src/setting/setting.module";
import { Setting } from "src/setting/setting.entity";
import { forwardRef, Module } from "@nestjs/common";
import { UsersController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UsersService } from "./user.service";
import { UserGateway } from "./user.gateway";
import { JwtModule } from "@nestjs/jwt";
import ChatModule from "src/chat/chat.module";
import Game from "src/game/game.entity";
import Users from "./user.entity";
import GroupModule from "src/group/group.module";
import ItemModule from "src/item/item.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Users, Setting, Game]),
		JwtModule,
		SettingModule,
		ConfigModule,
		forwardRef(() => FriendsModule),
		ItemModule,
		ChatModule,
		GroupModule
	],
	providers: [
		UsersService,
		UserGateway
	],
	exports: [UsersService],
	controllers: [UsersController]
})
export default class UsersModule {}