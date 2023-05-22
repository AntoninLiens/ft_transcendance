import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Setting } from "src/setting/setting.entity";
import { Message } from "src/chat/message.entity";
import { Exclude } from "class-transformer";
import { Game } from "src/game/game.entity";
import Groups from "src/group/group.entity";
import Item from "src/item/item.entity";

export enum userStatut {
	'connected',
	'disconnected',
	'playing'
}

@Entity()
class Users {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', unique: true, nullable: true })
	@Exclude()
	socket_id: string;

	@Column({ type: 'varchar', nullable: true })
	secret: string;

	@Column({ type: 'boolean', default: false })
	isTwoFA: boolean;

	@Column({ type: 'boolean', default: false })
	isplaying: boolean;

	@Column({ type: 'varchar', nullable: true })
	token: string;

	@Column({ type: 'varchar', unique: true })
	name: string;

	@Column({ type: 'varchar' })
	@Exclude()
	password: string;

	@Column({ type: 'varchar', nullable: true })
	pfp: string;

	@Column({ type: 'varchar', nullable: false, default: "" })
	background: string;

	@Column({ type: 'varchar', nullable: true, default: 'white' })
	ball: string;

	@Column({ type: 'varchar', nullable: true, default: 'white' })
	pad: string;

	@Column({ type: 'int', default: 0 })
	score: number;

	@Column({ type: 'int', default: 0 })    
	level: number;

	@Column({ type: 'int', default: 0 })
	xp: number;

	@Column({ type: 'int', default: 0 })
	coins: number;

	@Column({ type: 'enum', enum: userStatut, default: userStatut.disconnected })
	statut: userStatut;

	@Column({ type: 'boolean', default: false })
	isIntra: boolean;
	
	@Column({ type: 'varchar', array: true, default: [] })
	blockedUsers: string[];
	
	@OneToMany(() => Game, game => game.winner, { eager: true, cascade: true })
	victories: Game[];
	
	@OneToMany(() => Game, game => game.looser, { eager: true, cascade: true })
	defeats: Game[];
	
	@OneToMany(() => Item, item => item.owner, { eager: true, cascade: true })
	shop: Item[];

	@OneToOne(() => Setting, { eager: true, cascade: true })
	@JoinColumn()
	setting: Setting;

	@OneToMany(() => Groups, Groups => Groups.owner, { eager: true, cascade: true })
	ownGroups: Groups[];

	@ManyToMany(() => Groups, Groups => Groups.members, { eager: true, cascade: true })
	Groups: Groups[];

	@OneToMany(() => Message, message => message.sender, { eager: true, cascade: true })
	messages: Message[];
}
export default Users;