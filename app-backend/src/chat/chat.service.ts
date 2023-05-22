import { HttpException, Injectable } from "@nestjs/common";
import { Friends } from "src/friends/friends.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./message.entity";
import { Repository } from "typeorm";
import { Chat } from "./chat.entity";
import Groups from "src/group/group.entity";
import Users from "src/user/user.entity";

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Chat)
		private readonly chatRepository: Repository<Chat>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>
	) {}

	async createChat(friend: Friends, group: Groups): Promise<Chat> {
		if (friend) {
			const newChat = await this.chatRepository.create({ friend_id: friend.id });
			return await this.chatRepository.save(newChat);
		}
		else if (group) {
			const newChat = await this.chatRepository.create({ group_id: group.id });
			return await this.chatRepository.save(newChat);
		}
		else
			throw new HttpException("No friend or group", 400);
	}

	async deleteChat(friend_id: number, group_id: number): Promise<void> {
		const chat = await this.getChat(friend_id, group_id);
		for (const message of chat.messages)
			await this.messageRepository.delete({id: message.id});
		if (chat)
			await this.chatRepository.delete({id: chat.id});
		else
			throw new HttpException("No friend or group", 400);
	}

	async createMessage(content: string, user: Users, chat: Chat) {
		const newMessage = await this.messageRepository.create({ content: content, chat_id: chat, sender: user });
		return await this.messageRepository.save(newMessage);
	}

	async getChat(friend_id: number, group_id: number): Promise<Chat> {
		return await this.chatRepository.createQueryBuilder("chat")
		.where("chat.friend_id = :friend_id", { friend_id: friend_id })
		.orWhere("chat.group_id = :group_id", { group_id: group_id })
		.leftJoinAndSelect("chat.messages", "messages")
		.leftJoinAndSelect("messages.sender", "sender")
		.getOne();
	}

	async getChatMessages(user: Users, friend_id: number, group_id: number): Promise<Chat> {
		const chat = await this.chatRepository.createQueryBuilder("chat")
		.where("chat.friend_id = :friend_id", { friend_id: friend_id })
		.orWhere("chat.group_id = :group_id", { group_id: group_id })
		.leftJoinAndSelect("chat.messages", "messages")
		.leftJoinAndSelect("messages.sender", "sender")
		.getOne();

		if (user.blockedUsers.length === 0)
			return chat;
			
		const messages = chat.messages.filter((message) => {
			for (const blocked of user.blockedUsers)
				if (message.sender.name !== blocked)
					return true;
		});
		return { ...chat, messages: messages};
	}
}
