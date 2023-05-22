import { UsersService } from "src/user/user.service";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
	constructor(
		private readonly userService: UsersService,
		private readonly configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get("JWT_SECRET"),
			ignoreExpiration: true
		});
	}

	async validate(payload: TokenPayload) {
		return this.userService.getUserById(payload.id);
	}
}