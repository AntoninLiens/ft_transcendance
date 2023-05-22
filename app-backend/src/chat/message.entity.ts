import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";
import Users from "src/user/user.entity";

@Entity()
export class Message {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@ManyToOne(() => Users)
	sender: Users;

	@ManyToOne(() => Chat)
	chat_id: Chat;

	@Column({ type: 'varchar' })
	content: string;
}