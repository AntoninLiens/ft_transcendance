import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class RefreshAuthGuard extends AuthGuard("jwtRefresh") {}