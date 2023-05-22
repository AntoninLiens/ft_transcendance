import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Setting {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', default: 'W' })
	moveUp: string;

	@Column({ type: 'varchar', default: 'S' })
	moveDown: string;

	@Column({ type: 'boolean', default: true })
	showScore: boolean;

	@Column({ type: 'boolean', default: true })
	showProfile: boolean;

	@Column({ type: 'boolean', default: false })
	enableQrCode: boolean;
	
	@Column({ type: 'int' })
	user_id: number;
}