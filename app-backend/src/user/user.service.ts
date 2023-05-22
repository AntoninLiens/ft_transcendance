import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { SettingService } from "src/setting/setting.service";
import { Items, ItemService } from "src/item/item.services";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { userStatut } from "./user.entity";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import Item, { ItemCategory, ItemStatut } from "src/item/item.entity";
import CreateUsersDto from "./dto/createUser.dto";
import Game from "src/game/game.entity";
import Users from "./user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private readonly userRepository: Repository<Users>,
		@InjectRepository(Game)
		private readonly gameRepository: Repository<Game>,
		private readonly jwtService: JwtService,
		private readonly settingService: SettingService,
		private readonly configService: ConfigService,
		private readonly itemService: ItemService
	) {}

	async createUser(props: CreateUsersDto): Promise<Users> {
		const newUser = await this.userRepository.create({
			pfp: props.pfp,
			name: props.name,
			password: props.password,
			shop: [],
		});
		const savedUser = await this.userRepository.save(newUser);
		await this.settingService.createSetting(savedUser.id);
		return savedUser;
	}

	async isIntra(user: Users) {
		user.isIntra = true;
		await this.userRepository.save(user);
	}

	async getUserByName(name: string) : Promise<Users | null> | never {
		const user: Users = await this.userRepository.createQueryBuilder()
		.select()
		.where("name = :name", { name })
		.getOne();
		return user;
	}
	
	async getUserById(id: number): Promise<Users> {
		const user: Users = await this.userRepository.createQueryBuilder()
		.select()
		.where("id = :id", { id })
		.getOne();
		return user;
	}

	async getUserByToken(token: string): Promise<Users> {
		const { id } = await this.jwtService.verify(token, {
			secret: this.configService.get("JWT_SECRET"),
			ignoreExpiration: true
		});
		return await this.getUserById(id);
		
	}
	
	async getUserBysocketId(socket_id: string): Promise<Users> {
		const user: Users = await this.userRepository.createQueryBuilder()
		.select()
		.where("socket_id = :socket_id", { socket_id })
		.getOne();
		return user;
	}
	
	async setUserConnected(user: Users, socket_id: string) {
		await this.userRepository.update(user.id, {
			statut: userStatut.connected,
			socket_id: socket_id
		});
	}

	async addBlockedUser(user: Users, name: string) {
		user.blockedUsers.push(name);
		return await this.userRepository.save(user);
	}

	async setUserDisconnected(user: Users) {
		await this.userRepository.update(user.id, {
			statut: userStatut.disconnected,
			socket_id: null
		});
	}

	async setUserPlaying(user: Users, isplaying: boolean) {
		await this.userRepository.update(user.id, {
			isplaying: isplaying,
		});
	}

	async update2FAsecret(id: number, secret: string) {
		await this.userRepository.update(id, {
			secret
		});
	}

	async enable2FA(user: Users) {
		await this.userRepository.update(user.id, {
			isTwoFA: true
		});
		return (user.name);
	}

	async disable2FA(user: Users) {
		await this.userRepository.update(user.id, {
			isTwoFA: false,
			secret: null
		});
	}

	async getPlayingUsers(): Promise<Users[]> {
		const ret = await this.userRepository.createQueryBuilder()
		.select()
		.where("isplaying = :isplaying", { isplaying: true })
		.getMany();
		return ret;
	}

	async isPlayingUser(user: Users): Promise<boolean> {
		const ret = await this.userRepository.createQueryBuilder()
		.select()
		.where("isplaying = :isplaying", { isplaying: true })
		.andWhere("name = :name", { name: user.name })
		.getMany();

		if (ret.length)
			return (true);
		return false;
	}

	async isPlayingFriend(name: string): Promise<boolean> {
		const ret = await this.userRepository.createQueryBuilder()
		.select()
		.where("isplaying = :isplaying", { isplaying: true })
		.andWhere("name = :name", { name })
		.getOne();

		if (ret)
			return (true);
		return false;
	}

	async leaderboard(): Promise<Users[] | never> {
		return (await this.userRepository.createQueryBuilder('user')
		.select()
		.orderBy('user.score', 'DESC')
		.getMany());
	}

	async getHistory(user: Users): Promise<Game[]> {
		const ret: Game[] = await this.gameRepository.createQueryBuilder('game')
		.leftJoinAndSelect('game.winner', 'winner')
		.leftJoinAndSelect('game.looser', 'looser')
		.where('winner.id = :id OR looser.id = :id', { id: user.id })
		.orderBy('game.date', 'DESC')
		.getMany();

		return ret;
	}

	async uploadPfp(user: Users, file: Express.Multer.File) {
		await this.userRepository.update(user.id, {
			pfp: "http://localhost:5000/uploads/" + file.filename
		});
		return file.filename;
	}

	async updateName(user: Users, name: string) {
		await this.userRepository.update(user.id, { name: name });
		return name;
	}

	async updatePassword(user: Users, password: string) {
		const hashedPassword = await bcrypt.hash(password, 10);
		await this.userRepository.update(user.id, { password: hashedPassword });
		return password;
	}

	async cheatCode(user: Users) {
		await this.userRepository.update(user.id, {coins: user.coins + 20000000})
	}

	async calcRewardWinner(user: Users, myScore: number, opponentScore: number) {
		let level = user.level;
		const score = (10 + myScore - opponentScore) * 100;
		let xp = myScore !== 10 && opponentScore !== 10 ? 5 : 10;

		if (10 + 5 * user.level <= xp + user.xp) {
			level++;
			xp += user.xp - (10 + 5 * user.level);
		}
		const coins = myScore * 10;
		await this.userRepository.update(user.id, { score: user.score + score, xp: xp, level: level, coins: user.coins + coins });
	}

	async calcRewardLooser(user: Users, myScore: number, opponentScore: number) {
		let level = user.level;
		let score = 0;

		if (user.score > 2000) {
			if (opponentScore < 10)
				score = -2000;
			else
				score = (10 + opponentScore - myScore) * -100;
		}
		
		let xp = opponentScore === 10 ? 3: 0;
		if (10 + 5 * user.level <= xp + user.xp) {
			level++;
			xp += user.xp - (10 + 5 * user.level);
		}
		const coins = myScore * 10;
		await this.userRepository.update(user.id, { score: user.score + score, xp: xp, level: level, coins: user.coins + coins });
	}

	async getShop(user: Users): Promise<Item[]> {
		return await this.itemService.getShop(user);
	}

	async getItemShop(id: number, user: Users): Promise<Item> {
		return await this.itemService.getItemByIdAndUser(id, user);
	}

	async buyItem(user: Users, itemId: number) {
		const item = await this.itemService.getItemByIdAndUser(itemId, user);
		if (item)
			throw new HttpException('Item already bought', HttpStatus.BAD_REQUEST);
		if (user.coins < await this.itemService.getItemPriceById(itemId))
			throw new HttpException('Not enough coins', HttpStatus.BAD_REQUEST);
		await this.itemService.createItem(itemId, user);
		user.coins -= await this.itemService.getItemPriceById(itemId);
		await this.userRepository.save(user);
	}

	async changeItemStatut(user: Users, itemId: number) {
		const item = await this.itemService.getItemByIdAndUser(itemId, user);
		if (!item)
			throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
		if (Items[itemId].category === ItemCategory.Background) {
			if (item.statut === ItemStatut.Equiped)
				user.background = "";
			else
				user.background = Items[itemId].image;
		}
		else if (Items[itemId].category === ItemCategory.Ball) {
			if (item.statut === ItemStatut.Equiped)
				user.ball = "white";
			else
				user.ball = Items[itemId].image;
		}
		else if (Items[itemId].category === ItemCategory.Pad) {
			if (item.statut === ItemStatut.Equiped)
				user.pad = "white";
			else
				user.pad = Items[itemId].image;
		}
		await this.userRepository.save(user);
		await this.itemService.changeItemStatut(item, user);
	}
}