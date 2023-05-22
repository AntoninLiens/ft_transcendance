import { SettingController } from "./setting.controller";
import { SettingService } from "./setting.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Setting } from "./setting.entity";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([Setting])],
	providers: [SettingService],
	controllers: [SettingController],
	exports: [SettingService]
})
export class SettingModule {}