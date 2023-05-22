import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Setting } from "./setting.entity";
import Users from "src/user/user.entity";


@Injectable()
export class SettingService {
	constructor(
		@InjectRepository(Setting)
		private readonly settingRepository: Repository<Setting>
	) {}

	async createSetting(userId: number): Promise<Setting> {
		const setting = await this.settingRepository.create({ user_id: userId });
		await this.settingRepository.save(setting);
		return setting;
	}
	
	async getSettingByUser(user: Users): Promise<Setting> {
		return (this.settingRepository.createQueryBuilder()
		.where("user_id = :userId", { userId: user.id })
		.getOne());
	}

	async update(user: Users, props: any) {
		const setting = await this.getSettingByUser(user);
		if (!setting)
			throw new HttpException("Setting not found", HttpStatus.NOT_FOUND);
		await this.settingRepository.update(setting.id, props);
	}
}