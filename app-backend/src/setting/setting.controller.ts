import { Req, Controller, Get, UseGuards, Put, Body } from "@nestjs/common";
import { SettingService } from "./setting.service";
import { Setting } from "./setting.entity";
import { Request } from "express";
import UpdateSettingsDto from "./dto/updateSettings.dto";
import JwtAuthGuard from "src/auth/guards/jwtAuth.guard";
import Users from "src/user/user.entity";

@Controller('settings')
export class SettingController {
	constructor(
		private readonly settingService: SettingService
	) {}

	@Get('user')
	@UseGuards(JwtAuthGuard)
	async getSetting(@Req() req: Request): Promise<Setting> {
		return this.settingService.getSettingByUser(<Users>req.user);
	}

	@Put('user')
	@UseGuards(JwtAuthGuard)
	async updateSetting(@Req() req: Request, @Body() props: UpdateSettingsDto) {
		this.settingService.update(<Users>req.user, props);
	}
}