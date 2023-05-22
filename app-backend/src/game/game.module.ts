import { FriendsModule } from "src/friends/friends.module";
import { MatchmakingGateway } from "./matchmaking.gateway";
import { GameController } from "./game.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { Module } from "@nestjs/common";
import { Game } from "./game.entity";
import UsersModule from "src/user/user.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Game]),
		UsersModule,
		FriendsModule
	],
	providers: [
		GameService,
		GameGateway,
		MatchmakingGateway,
	],
	controllers: [GameController],
	exports: [GameService]
})
export default class GameModule {}