import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import Users from "src/user/user.entity";
import Game from "./game.entity";

@Injectable()
export class GameService {
  constructor(
	@InjectRepository(Game)
	private readonly gameRepository: Repository<Game>
  ) {}

	async createGame(winner: Users, looser: Users): Promise<Game | never> {
		const game = await this.gameRepository.create({
			winner: winner,
			looser: looser
		});
		await this.gameRepository.save(game);
		return game;
	}

	async victories(user: Users): Promise<Game[] | never> {
		return (await this.gameRepository.createQueryBuilder('game')
		.select()
		.where("game.winner = :userId", { userId: user.id })
		.getMany());
	}

	async defeats(user: Users): Promise<Game[] | never> {
		return (await this.gameRepository.createQueryBuilder('game')
		.select()
		.where("game.looser = :userId", { userId: user.id })
		.getMany());
	}
}