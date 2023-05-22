import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersService } from "src/user/user.service";
import { userStatut } from "src/user/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt/dist";
import RegisterDto from "src/auth/dto/register.dto";
import LoginDto from "src/auth/dto/login.dto";
import Users from "src/user/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export default class AuthService {
	constructor(
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	async register(props: RegisterDto) {
		const user = await this.userService.getUserByName(props.name);
		if (user)
			throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
		const hashedPassword = await bcrypt.hash(props.password, 10);
		const newUser = await this.userService.createUser({
			...props,
			password: hashedPassword
		});
		newUser.password = undefined;
		return newUser;
	}

	async login(props: LoginDto) {
		const user = await this.userService.getUserByName(props.name);
		if (!user)
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);

		if (user.socket_id)
			throw new HttpException("User already connected", HttpStatus.BAD_REQUEST);

		if (!await bcrypt.compare(props.password, user.password))
			throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED);

		user.password = undefined;
		return user;
	}

	getJwtRefreshToken(user: Users) {
		const payload: TokenPayload = { id: user.id };
		return this.jwtService.sign(payload, {
			secret: this.configService.get("JWT_REFRESH_TOKEN_SECRET"),
			expiresIn: this.configService.get("JWT_REFRESH_TOKEN_EXPIRATION_TIME")
		});
	}
	
	getJwtAccessToken(user: Users) {
		const payload: TokenPayload = { id: user.id };
		return this.jwtService.sign(payload);
	}

	getLogOut() {
		const payload: TokenPayload = { id: 0 };
		return this.jwtService.sign(payload);
	}
}