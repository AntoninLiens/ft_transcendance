import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersService } from "src/user/user.service";
import { ChatService } from "src/chat/chat.service";
import { InjectRepository } from "@nestjs/typeorm";
import { friendStatut } from "./friends.entity";
import { Friends } from "./friends.entity";
import { Repository } from "typeorm";
import Users from "src/user/user.entity";

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository(Friends)
		private readonly friendsRepository: Repository<Friends>,
		private readonly userService: UsersService,
		private readonly chatService: ChatService
	) {}

	async getFriendsList(user: Users): Promise<Users[]> {

		const usersList: Users[] = [];
		
		const friendList1 = await this.friendsRepository.createQueryBuilder("friends")
		.select()
		.orderBy("friends.statut", "DESC")
		.where("friends.statut = :statut", { statut: friendStatut.accepted })
		.innerJoin("friends.invited", "invited", "invited.id = :asked", { asked: user.id })
		.innerJoinAndSelect("friends.demander", "demander")
		.getMany();

		friendList1.map((friend) => usersList.push(friend.demander))

		const friendList2 = await this.friendsRepository.createQueryBuilder("friends")
		.select()
		.orderBy("friends.statut", "DESC")
		.where("friends.statut = :statut", { statut: friendStatut.accepted })
		.innerJoin("friends.demander", "demander", "demander.id = :asker", { asker: user.id })
		.innerJoinAndSelect("friends.invited", "invited")
		.getMany();

		friendList2.map((friend) => usersList.push(friend.invited))

		return usersList;
	}

	async getFriends(demander: Users, invited: Users): Promise<Friends> {
		const friend: Friends = await this.friendsRepository.createQueryBuilder("friends")
		.select()
		.innerJoinAndSelect("friends.demander", "demander", "demander.id = :asker", { asker: demander.id })
		.innerJoinAndSelect("friends.invited", "invited", "invited.id = :asked", { asked: invited.id })
		.leftJoinAndSelect("friends.chat", "chat")
		.getOne();
		return friend;
	}

	async inviteFriend(user: Users, name: string): Promise<Friends> {
		const friend: Users = await this.userService.getUserByName(name);
		if (!friend)
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		if (friend.id === user.id)
			throw new HttpException("You can't invite yourself", HttpStatus.BAD_REQUEST);

		if (await this.getFriends(user, friend))
			throw new HttpException("You already invited this user", HttpStatus.BAD_REQUEST);
		if (await this.getFriends(friend, user))
			throw new HttpException("This user already invited you", HttpStatus.BAD_REQUEST);

		const newFriend = await this.friendsRepository.create({
			demander: user,
			invited: friend,
			statut: friendStatut.pending
		})
		await this.friendsRepository.save(newFriend);
		return newFriend;
	}

	async getPendingRequests(user: Users): Promise<Friends[]> {
		return await this.friendsRepository.createQueryBuilder("friends")
		.select()
		.where("friends.statut = :statut", { statut: friendStatut.pending })
		.innerJoin("friends.invited", "invited", "invited.id = :asked", { asked: user.id })
		.innerJoinAndSelect("friends.demander", "demander")
		.getMany();
	}
	
	async acceptFriend(user: Users, name: string) {
		const demander: Users = await this.userService.getUserByName(name);
		if (!demander)
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		const friend: Friends = await this.getFriends(demander, user);
		const chat = await this.chatService.createChat(friend, null);
		await this.friendsRepository.update(friend.id, { statut: friendStatut.accepted, chat: chat });
	}

	async declineFriend(user: Users, name: string) {
		const demander: Users = await this.userService.getUserByName(name);
		if (!demander)
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);

		const friend: Friends = await this.getFriends(demander, user);
		await this.friendsRepository.delete(friend.id);
	}

	async removeFriend(user: Users, name: string) {
		const removed: Users = await this.userService.getUserByName(name);
		if (!removed)
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		let friend: Friends = await this.getFriends(user, removed);
		if (!friend)
			friend = await this.getFriends(removed, user);
		
		await this.friendsRepository.update(friend.id, { chat: null });
		if (friend.chat)
			await this.chatService.deleteChat(friend.id, -1);
		await this.friendsRepository.delete(friend.id);
	}
}