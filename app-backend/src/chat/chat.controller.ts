import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Request } from "express";
import JwtAuthGuard from "src/auth/guards/jwtAuth.guard";
import Users from "src/user/user.entity";

@Controller("chat")
export class ChatController {
	constructor (
		private readonly chatService: ChatService
	) {}

	@Get("chat")
	@UseGuards(JwtAuthGuard)
	async getChat(@Req() req: Request, @Query("friend_id") friend_id: number, @Query("group_id") group_id: number) {
		return await this.chatService.getChatMessages(<Users>req.user, friend_id, group_id);
	}
}