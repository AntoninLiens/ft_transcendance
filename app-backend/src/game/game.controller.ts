import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "src/user/user.service";
import { GameService } from "./game.service";
import { Game } from "./game.entity";
import { Request } from "express";
import JwtAuthGuard from "src/auth/guards/jwtAuth.guard";

@Controller('game')
export class GameController {
	constructor(
		private readonly gameService: GameService,
		private readonly userService: UsersService
	) {}

	@Get('victories')
	@UseGuards(JwtAuthGuard)
	async victories(@Query('name') name: string, @Req() req: Request): Promise<Game[] | never> {
		const user = await this.userService.getUserByName(name);
		return this.gameService.victories(user);
	}

	@Get('defeats')
	@UseGuards(JwtAuthGuard)
	async defeats(@Query('name') name: string, @Req() req: Request): Promise<Game[] | never> {
		const user = await this.userService.getUserByName(name);
		return this.gameService.defeats(user);
	}
}