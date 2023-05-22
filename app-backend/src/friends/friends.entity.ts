import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "src/chat/chat.entity";
import Users from "src/user/user.entity";

export enum friendStatut {
	'pending',
	'accepted'
}

@Entity()
export class Friends {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'enum', enum: friendStatut, default: friendStatut.pending })
	statut: friendStatut;

	@ManyToOne(() => Users, user => user.id, { eager: true, cascade: true })
	demander: Users;

	@ManyToOne(() => Users, user => user.id, { eager: true, cascade: true })
	invited: Users;

	@OneToOne(() => Chat, { cascade: true })
	@JoinColumn()
	chat: Chat;
}