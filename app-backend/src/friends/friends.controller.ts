import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "src/user/user.service";
import { FriendsService } from "./friends.service";
import { Friends } from "./friends.entity";
import { Request } from "express";
import JwtAuthGuard from "src/auth/guards/jwtAuth.guard";
import InviteFriendsDto from "./dto/inviteFriends.dto";
import Users from "src/user/user.entity";

@Controller('friends')
export class FriendsController {
	constructor(
		private readonly friendsService: FriendsService,
		private readonly usersService: UsersService
	) {}

	@Get('list')
	@UseGuards(JwtAuthGuard)
	async getFriendsList(@Req() req: Request): Promise<Users[] | never> {
		return await this.friendsService.getFriendsList(<Users>req.user);
	}

	@Get("get")
	@UseGuards(JwtAuthGuard)
	async getFriend(@Req() req: Request, @Query('friend_id') friend_id: number): Promise<Friends | never> {
		const user2 = await this.usersService.getUserById(friend_id);
		let friend = await this.friendsService.getFriends(<Users>req.user, user2);
		if (!friend)
			friend = await this.friendsService.getFriends(user2, <Users>req.user);		
		return friend;
	}

	@Post('invite')
	@UseGuards(JwtAuthGuard)
	async inviteFriend(@Body() props: InviteFriendsDto, @Req() req: Request) {
		return await this.friendsService.inviteFriend(<Users>req.user, props.name);
	}

	@Get('pending')
	@UseGuards(JwtAuthGuard)
	async getPendingRequests(@Req() req: Request): Promise<Friends[] | never> {
		return await this.friendsService.getPendingRequests(<Users>req.user);
	}

	@Put('accept')
	@UseGuards(JwtAuthGuard)
	async acceptFriend(@Req() req: Request, @Body() props: InviteFriendsDto) {
		return await this.friendsService.acceptFriend(<Users>req.user, props.name);
	}

	@Put('block')
	@UseGuards(JwtAuthGuard)
	async declineFriend(@Req() req: Request, @Body() props: InviteFriendsDto) {
		return await this.friendsService.declineFriend(<Users>req.user, props.name);
	}

	@Delete('remove/:name')
	@UseGuards(JwtAuthGuard)
	async removeFriend(@Req() req: Request) {
		return await this.friendsService.removeFriend(<Users>req.user, req.params.name);
	}

}
