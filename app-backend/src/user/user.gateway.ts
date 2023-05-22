import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets/interfaces";
import { FriendsService } from "src/friends/friends.service";
import { GroupService } from "src/group/group.service";
import { ChatService } from "src/chat/chat.service";
import { UsersService } from "./user.service";
import { Server, Socket } from "socket.io";
import Users from "./user.entity";

@WebSocketGateway({ cors: true, namespace: 'User' })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	clients: Socket[] = [];
	
	constructor (
		private readonly userService: UsersService,
		private readonly chatService: ChatService,
		private readonly groupService: GroupService,
		private readonly friendsService: FriendsService
	) {}

	async getFriend(user: Users, friend: Users) {
		let friends = await this.friendsService.getFriends(user, friend);
		if (!friends)
			friends = await this.friendsService.getFriends(friend, user);
		return friends;
	}

	async handleConnection(client: Socket, ...args: any[]) {
		const token: string = <string>client.handshake.headers.authorization;
		if (!token)
			throw new WsException('No token provided');
		const user = await this.userService.getUserByToken(token);
		if (!user) {
			client.disconnect();
			return ;
		}
		await this.userService.setUserConnected(user, client.id);
		this.clients.push(client);
		
		const friends: Users[] = await this.friendsService.getFriendsList(user);
		friends.map((friend) => {
			const friendSocket = this.clients.find((client) => client.id === friend.socket_id);
			if (friendSocket)
				friendSocket.emit('notif', user.name + ' is connected');
		})
	}

	async handleDisconnect(client: Socket) {
		const user: Users = await this.userService.getUserBysocketId(client.id);
		if (!user)
			return ;
		await this.userService.setUserDisconnected(user);

		const index = this.clients.indexOf(client);
		this.clients.splice(index, 1);

		const friends: Users[] = await this.friendsService.getFriendsList(user);
		friends.map((friend) => {
			const friendSocket = this.clients.find((client) => client.id === friend.socket_id);
			if (friendSocket)
				friendSocket.emit('notif', user.name + ' is disconnected');
		})
	}

	@SubscribeMessage('sendMessage')
	async sendMessage(client: Socket, {message, friend, group}: any) {
		if (friend) {
			const user1 = await this.userService.getUserBysocketId(client.id);
			const user2 = await this.userService.getUserById(friend.id);
			const friends = await this.getFriend(user1, user2);
			await this.chatService.createMessage(message, user1, friends.chat);
			const friendSocket = this.clients.find((client) => client.id === user2.socket_id);
			if (friendSocket)
				friendSocket.emit('receiveMessage', {friend_id: friends.id, group_id: -1, message, friend: user1, group: null});
		} else if (group) {
			const user = await this.userService.getUserBysocketId(client.id);
			const myGroup = await this.groupService.getGroupByName(group.name);
			myGroup.muted.map((mutedUser) => {
				const mutedSocket = this.clients.find((client) => client.id === mutedUser.socket_id && mutedUser.id !== user.id);
				if (mutedSocket) {
					client.emit('mute in this group');
					throw new WsException('You are muted in this group');
				}
			});
			await this.chatService.createMessage(message, user, myGroup.chat);
			myGroup.members.map((member) => {
				const isBlocked = member.blockedUsers.find((blocked) => blocked === user.name);
				const memberSocket = this.clients.find((client) => client.id === member.socket_id && member.id !== user.id);
				if (memberSocket && !isBlocked)
					memberSocket.emit('receiveMessage', {friend_id: -1, group_id: group.id, message, friend: null, group: group});
			})
			myGroup.admins.map((admin) => {
				const isBlocked = admin.blockedUsers.find((blocked) => blocked === user.name);
				const adminSocket = this.clients.find((client) => client.id === admin.socket_id && admin.id !== user.id);
				if (adminSocket && !isBlocked)
					adminSocket.emit('receiveMessage', {friend_id: -1, group_id: group.id, message, friend: null, group: group});
			})
			if (myGroup.owner.id !== user.id) {
				const isBlocked = group.owner.blockedUsers.find((blocked) => blocked === user.name);
				const ownerSocket = this.clients.find((client) => client.id === group.owner.socket_id);
				if (ownerSocket && !isBlocked)
					ownerSocket.emit('receiveMessage', {friend_id: -1, group_id: group.id, message, friend: null, group: group});
			}
		}
	}

	@SubscribeMessage('inviteFriend')
	async inviteFriend(client: Socket, friendId: number) {
		const friend: Users = await this.userService.getUserById(friendId);
		const friendSocket = this.clients.find((client) => client.id === friend.socket_id);
		if (friendSocket) {
			friendSocket.emit('inviteFriend');
			friendSocket.emit('notif', 'You have a friend invitation');
		}
	}

	@SubscribeMessage('playWithFriend')
	async playWithFriend(client: Socket, friendId: number) {
		const me = await this.userService.getUserBysocketId(client.id);
		const friend: Users = await this.userService.getUserById(friendId);
		const friendSocket = this.clients.find((client) => client.id === friend.socket_id);
		if (friendSocket)
			friendSocket.emit('playWithFriend', me);
	}
}