import { Body, Controller, Get, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { GroupService } from "./group.service";
import { Request } from "express";
import JwtAuthGuard from "src/auth/guards/jwtAuth.guard";
import Users from "src/user/user.entity";
import Groups from "./group.entity";

@Controller('group')
export class GroupController {
	constructor(private readonly groupService: GroupService) {}

	@Get('list')
	@UseGuards(JwtAuthGuard)
	async getGroupsList(@Req() req: Request): Promise<Groups[] | never> {
		return await this.groupService.getGroupsList(<Users>req.user);
	}

	@Get('get')
	@UseGuards(JwtAuthGuard)
	async getGroup(@Req() req: Request, @Query('group_id') group_id: number): Promise<Groups | never> {
		return await this.groupService.getGroupById(group_id);
	}

	@Post('add')
	@UseGuards(JwtAuthGuard)
	async getGroupsByName(@Req() req: Request, @Body() dto: { name: string, password: string }): Promise<Groups | never> {
		return await this.groupService.add(<Users>req.user, dto.name, dto.password);
	}

	@Post('create')
	@UseGuards(JwtAuthGuard)
	async createGroup(@Req() req: Request, @Body() dto: { name: string, password: string }): Promise<Groups | never> {
		return await this.groupService.createGroup({ name: dto.name, owner: <Users>req.user, password: dto.password });
	}

	@Put('updatePassword')
	@UseGuards(JwtAuthGuard)
	async updatePassword(@Req() req: Request, @Body() dto: { groupName: string, password: string }) {
		return await this.groupService.updatePassword(<Users>req.user, dto.groupName, dto.password);
	}

	@Post('addMember')
	@UseGuards(JwtAuthGuard)
	async addMember(@Req() req: Request, @Body() dto: { userName: string, groupName: string }): Promise<Groups | never> {
		return await this.groupService.addMember(<Users>req.user, dto.userName, dto.groupName);
	}
	
	@Post('makeAdmin')
	@UseGuards(JwtAuthGuard)
	async makeAdmin(@Req() req: Request, @Body() dto: { userName: string, groupName: string }): Promise<Groups | never> {
		return await this.groupService.makeAdmin(<Users>req.user, dto.userName, dto.groupName);
	}

	@Put('removeMember')
	@UseGuards(JwtAuthGuard)
	async removeMember(@Req() req: Request, @Body() dto: { userName: string, groupName: string}): Promise<Groups | never> {
		return await this.groupService.removeMember(<Users>req.user, dto.userName, dto.groupName);
	}

	@Put('leave')
	@UseGuards(JwtAuthGuard)
	async leaveGroup(@Req() req: Request, @Body() dto: { groupName: string}) {
		return await this.groupService.leaveGroup(<Users>req.user, dto.groupName);
	}

	@Put("changeStatus")
	@UseGuards(JwtAuthGuard)
	async changeStatus(@Req() req: Request, @Body() dto: { groupName: string, status: string }): Promise<Groups | never> {
		return await this.groupService.changeStatus(<Users>req.user, dto.groupName, dto.status);
	}

	@Put('mute')
	@UseGuards(JwtAuthGuard)
	async mute(@Req() req: Request, @Body() dto: { groupName: string, timeToMute: number }) {
		return await this.groupService.mute(<Users>req.user, dto.groupName, dto.timeToMute);
	}
}