import { DatabaseModule } from './database/database.module';
import { FriendsModule } from './friends/friends.module';
import { SettingModule } from './setting/setting.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import GroupModule from './group/group.module';
import UsersModule from './user/user.module';
import GameModule from './game/game.module';
import ChatModule from './chat/chat.module';
import AuthModule from './auth/auth.module';
import TwoFactorAuthenticationModule from './2FA/2FA.module';
import ItemModule from './item/item.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		AuthModule,
		UsersModule,
		GameModule,
		FriendsModule,
		SettingModule,
		GroupModule,
		ChatModule,
		TwoFactorAuthenticationModule,
		ItemModule
	]
})
export class AppModule {}
