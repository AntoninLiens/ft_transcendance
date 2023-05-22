import { Body, Controller, HttpCode, Post, Get, UseGuards, UseInterceptors, ClassSerializerInterceptor, Query, Redirect } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UsersService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import RefreshAuthGuard from "./guards/refreshAuth.guard";
import RegisterDto from "src/auth/dto/register.dto";
import JwtAuthGuard from "./guards/jwtAuth.guard";
import Users from "src/user/user.entity";
import AuthService from "./auth.service";
import LoginDto from "./dto/login.dto";
import axios from "axios";

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
	) {}

	@Post('register')
	async register(@Body() props: RegisterDto) {
		const user: Users = await this.authService.register(props);
		const accessToken =  await this.authService.getJwtAccessToken(user);
		
		return accessToken;
	}

	@HttpCode(200)
	@Post('login')
	async login(@Body() props: LoginDto) {
		const user: Users = await this.authService.login(props);
		const accessToken =  await this.authService.getJwtAccessToken(user);

		return accessToken;
	}

	@UseGuards(RefreshAuthGuard)
	@Get('refresh')
	async refresh(@Body() props: Users) {
		return await this.authService.getJwtAccessToken(props);
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout() {
		return await this.authService.getLogOut();
	}

	@Get('oauth')
	@Redirect('http://localhost:3000/intraConnect', 302)
	async auth(@Query() query: any) {
		const ret = await axios.post("https://api.intra.42.fr/oauth/token", {
			grant_type: "authorization_code",
			client_id: this.configService.get("INTRA_CLIENT_ID"),
			client_secret: this.configService.get("INTRA_CLIENT_SECRET"),
			code: query.code,
			redirect_uri: this.configService.get("INTRA_REDIRECT_URI")
		})
		.then(async (response) => { return response.data; })
		.catch((error) => {
			return null;
		});
		if (ret) {
			const url = await axios.get("https://api.intra.42.fr/v2/me", {
				headers: { Authorization: `Bearer ${ret.access_token}` }
			})
			.then(async (response) => {
				const user: Users = await this.userService.getUserByName(response.data.login);
				if (!user) {
					const newUser = await this.userService.createUser({
						name: response.data.login,
						pfp: response.data.image.link,
						password: "",
					});
					await this.userService.isIntra(newUser);
					const accessToken = await this.authService.getJwtAccessToken(newUser);
					return { url: `http://localhost:3000/intraConnect?type=register&token=${accessToken}&twoFa=false` }
				}
				else {
					if (user.isIntra) {
						const accessToken = await this.authService.getJwtAccessToken(user);
						if (user.isTwoFA)
							return { url: `http://localhost:3000/intraConnect?type=signin&token=${accessToken}&twoFa=true` }
						return { url: `http://localhost:3000/intraConnect?type=signin&token=${accessToken}&twoFa=false` }
					}
					return null;
				}
			})
			.catch((error) => { return null; })
			if (url)
				return url;
		}
		return ({ url: "http://localhost:3000" })
	}
}