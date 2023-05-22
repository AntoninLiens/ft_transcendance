import { Req, Controller, Get, Post, UseGuards, HttpException, HttpStatus, UploadedFile, UseInterceptors, Query, Put, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./user.service";
import { diskStorage } from "multer";
import { Request } from "express";
import JwtAuthGuard from "src/auth/guards/jwtAuth.guard";
import Game from "../game/game.entity";
import Users from "./user.entity";

@Controller('user')
export class UsersController {
	constructor(
		private readonly userService: UsersService
	) {}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	async profile(@Req() req: Request): Promise<Users> {
		if (req.user)
			return <Users>req.user;
		throw new HttpException("no user", HttpStatus.UNAUTHORIZED);
	}

	@Get('nameProfile')
	@UseGuards(JwtAuthGuard)
	async nameProfile(@Req() req: Request, @Query('name') name: string): Promise<Users> {
		return await this.userService.getUserByName(name);
	}

	@Get('playingUsers')
	@UseGuards(JwtAuthGuard)
	async playingUsers(@Req() req: Request): Promise<Users[] | never> {
		return this.userService.getPlayingUsers();
	}

	@Get('isPlaying')
	@UseGuards(JwtAuthGuard)
	async isPlaying(@Req() req: Request): Promise<boolean> {
		return (this.userService.isPlayingUser(<Users>req.user));
	}

	@Get('isPlayingFriend')
	@UseGuards(JwtAuthGuard)
	async isPlayingFriend(@Req() req: Request, @Query('name') name: string): Promise<boolean> {
		return (this.userService.isPlayingFriend(name));
	}

	@Get('leaderboard')
	@UseGuards(JwtAuthGuard)
	async leaderboard(@Req () req: Request): Promise<Users[] | never> {
		return this.userService.leaderboard();
	}

	@Get('history')
	@UseGuards(JwtAuthGuard)
	async history(@Req() req: Request): Promise<Game[]> {
		return this.userService.getHistory(<Users>req.user);
	}
	
	@Post('block')
	@UseGuards(JwtAuthGuard)
	async block(@Req() req: Request, @Body() dto: { name: string }): Promise<Users> {
		return this.userService.addBlockedUser(<Users>req.user, dto.name);
	}

	@Post('uploadPfp')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file', { 
		limits: { fileSize: 5 * 1024 * 1024 },
		storage: diskStorage({
			destination: './uploads',
			filename: (req, file, cb) => {
				const user = <Users>req.user;
				const filename = user.name;
				const ext = file.originalname.split('.')[1];
				cb(null, `${filename}.${ext}`);
		}})}))
	async uploadPfp(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
		return this.userService.uploadPfp(<Users>req.user, file);
	}

	@Put('updateName')
	@UseGuards(JwtAuthGuard)
	async updateName(@Req() req: Request, @Body() body: { name: string }): Promise<string> {
		return this.userService.updateName(<Users>req.user, body.name);
	}

	@Put('updatePassword')
	@UseGuards(JwtAuthGuard)
	async updatePassword(@Req() req: Request, @Body() body: { password: string }): Promise<string> {
		return this.userService.updatePassword(<Users>req.user, body.password);
	}

	@Put('cheatCode')
	@UseGuards(JwtAuthGuard)
	async cheatCode(@Req() req: Request) {
		this.userService.cheatCode(<Users>req.user);
	}

	//Shop

	@Get('shop')
	@UseGuards(JwtAuthGuard)
	async shop(@Req() req: Request): Promise<any> {
		return this.userService.getShop(<Users>req.user);
	}

	@Get('item')
	@UseGuards(JwtAuthGuard)
	async item(@Req() req: Request, @Query('id') id: number): Promise<any> {
		return this.userService.getItemShop(id, <Users>req.user);
	}

	@Post('buyItem')
	@UseGuards(JwtAuthGuard)
	async buyItem(@Req() req: Request, @Body() body: { itemId: number }) {
		return this.userService.buyItem(<Users>req.user, body.itemId);
	}

	@Put('changeItemStatut')
	@UseGuards(JwtAuthGuard)
	async changeItemStatut(@Req() req: Request, @Body() body: { itemId: number }) {
		return this.userService.changeItemStatut(<Users>req.user, body.itemId);
	}

}