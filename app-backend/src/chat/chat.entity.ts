import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Chat {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;
	
	@Column({ type: 'int', nullable: true })
	friend_id: number;
	
	@Column({ type: 'int', nullable: true })
	group_id: number;

	@OneToMany(() => Message, message => message.chat_id, { cascade: true })
	messages: Message[];
}