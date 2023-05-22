import { TwoFactorAuthenticationController } from "./2FA.controller";
import { TwoFactorAuthenticationService } from "./2FA.services";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import UsersModule from "src/user/user.module";

@Module({
	imports: [
		UsersModule,
		ConfigModule
	],
	providers: [TwoFactorAuthenticationService],
	controllers: [TwoFactorAuthenticationController],
})
export default class TwoFactorAuthenticationModule {}