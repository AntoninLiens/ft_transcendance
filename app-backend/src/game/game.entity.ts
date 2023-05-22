import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Users from "src/user/user.entity";

@Entity()
export class Game {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	date: Date;

	@ManyToOne(() => Users, Users => Users.id)
	winner: Users;

	@ManyToOne(() => Users, Users => Users.id)
	looser: Users;
}
export default Game;