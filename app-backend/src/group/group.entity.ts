import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "src/chat/chat.entity";
import Users from "src/user/user.entity";

export enum GroupStatus {
	'public',
	'private'
}

@Entity()
export default class Groups {
    @PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', unique: true })
	name: string;

	@Column({ type: 'varchar', nullable: true })
	password: string;

	@Column({ type: 'enum', enum: GroupStatus, default: GroupStatus.public })
	status: GroupStatus;

	@ManyToOne(() => Users, Users => Users.id)
    owner: Users;

	@ManyToMany(() => Users, Users => Users.id)
	@JoinTable()
	admins: Users[];

	@ManyToMany(() => Users, Users => Users.id)
	@JoinTable()
	members: Users[];

	@ManyToMany(() => Users, Users => Users.id)
	@JoinTable()
	muted: Users[];

	@OneToOne(() => Chat, { cascade: true })
	@JoinColumn()
	chat: Chat;
}