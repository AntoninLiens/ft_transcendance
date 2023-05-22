import { Body, Controller, HttpException, Post, Put, Req, UseGuards } from "@nestjs/common";
import { TwoFactorAuthenticationService } from "./2FA.services";
import { Request } from "express";
import JwtAuthGuard from "src/auth/guards/jwtAuth.guard";
import Users from "src/user/user.entity";

@Controller("2FA")
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService
	) {}

	@Post("generate")
	@UseGuards(JwtAuthGuard)
	async generateTwoFactorAuthenticationSecret(@Req() req: Request) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(<Users>req.user);
		return otpauthUrl
	}

	@Post("activate")
	@UseGuards(JwtAuthGuard)
	async activateTwoFactorAuthentication(@Req() req: Request, @Body() { code }: { code: string }) {
		const isValid: boolean = await this.twoFactorAuthenticationService.verifyTwoFactorAuthenticationCode(<Users>req.user, code);
		if (!isValid) {
			throw new HttpException("Invalid 2FA code", 400);
		}
		return await this.twoFactorAuthenticationService.activateTwoFactorAuthentication(<Users>req.user);
	}

	@Put("deactivate")
	@UseGuards(JwtAuthGuard)
	async deactivateTwoFactorAuthentication(@Req() req: Request) {
		await this.twoFactorAuthenticationService.deactivateTwoFactorAuthentication(<Users>req.user);
	}
}