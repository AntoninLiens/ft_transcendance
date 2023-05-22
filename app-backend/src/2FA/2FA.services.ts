import { UsersService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { authenticator } from 'otplib';
import Users from "src/user/user.entity";

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		private readonly userService: UsersService,
		private readonly configService: ConfigService
	) {}

	async generateTwoFactorAuthenticationSecret(user: Users) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.name, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);

		await this.userService.update2FAsecret(user.id, secret);

		return {
			secret,
			otpauthUrl
		}
	}

	async activateTwoFactorAuthentication(user: Users) {
		return this.userService.enable2FA(user);
	}

	async deactivateTwoFactorAuthentication(user: Users) {
		this.userService.disable2FA(user);
	}

	async verifyTwoFactorAuthenticationCode(user: Users, code: string) {
		return authenticator.verify({ token: code, secret: user.secret });
	}
}