import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { UsersService } from "src/user/user.service";
import { Socket } from "socket.io";
import Users from "src/user/user.entity";

@WebSocketGateway({ cors: true, namespace: 'Matchmaking' })
export class MatchmakingGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	matchmacking: [Socket, Users][] = [];
	inMatchmaking: [[Socket, Users], [Socket, Users], boolean][] = [];

	constructor(private readonly userService: UsersService) {}

	async afterInit(server: any) {
		setInterval(() => {
			if (this.matchmacking.length >= 2) {
				const user1 = this.matchmacking[0];
				const user2 = this.matchmacking[1];
				user1[0].emit('createMatchmaking', user2[1]);
				user2[0].emit('createMatchmaking', user1[1]);
				this.inMatchmaking.push([[user1[0], user1[1]], [user2[0], user2[1]], false]);
				this.matchmacking.splice(0, 2);
			}
		}, 5000);
	}

	async handleConnection(client: Socket, ...args: any[]) {
		const friendMatch: boolean = <boolean>client.handshake.auth.friendMatch;
		const friendId: number = <number>client.handshake.auth.friendId;
		const token: string = <string>client.handshake.headers.authorization;
		if (!token)
			throw new WsException('No token provided');
		let user = await this.userService.getUserByToken(token);
		user.token = token;
		if (friendMatch) {
			const friend = await this.userService.getUserById(friendId);
			if (!friend)
				return client.disconnect();
			if (friend.isplaying || user.isplaying)
				return client.disconnect();
			if (this.inMatchmaking.find((game) => game[1][1].id === user.id)) {
				this.inMatchmaking.find((game) => game[0][1].id === friend.id)[1][0] = client;
				this.inMatchmaking.find((game) => game[0][1].id === friend.id)[1][1] = user;
				this.inMatchmaking.find((game) => game[0][1].id === friend.id)[0][0].emit('createMatchmaking', user);
				this.inMatchmaking.find((game) => game[0][1].id === friend.id)[1][0].emit('createMatchmaking', this.inMatchmaking.find((game) => game[0][1].id === friend.id)[0][1]);
			}
			else {
				if (this.inMatchmaking.find((game) => game[0][1].id === friend.id || game[1][1].id === friend.id))
					return client.disconnect();
				if (friend.isplaying || user.isplaying)
					return client.disconnect();
				this.inMatchmaking.push([[client, user], [null, friend], false]);
			}
		}
		else
			this.matchmacking.push([client, user]);
			// else {
			// 	const friend = await this.userService.getUserById(friendId);
			// 	if (!friend)
			// 		throw new WsException('Friend not found');
			// 	const user1 = this.matchmacking.find((socket) => socket[1].id === friend.id);
			// 	const user2 = this.matchmacking.find((socket) => socket[1].id === user.id);
			// 	this.inMatchmaking.push([user1, user2, false]);
			// 	this.matchmacking.splice(this.matchmacking.indexOf(user1), 1);
			// 	this.matchmacking.splice(this.matchmacking.indexOf(user2), 1);
			// 	user1[0].emit('createMatchmaking', user2[1]);
			// 	user2[0].emit('createMatchmaking', user1[1]);
			// }
	}

	async handleDisconnect(client: any) {
		let index = this.matchmacking.findIndex((sockets) => sockets[0] === client);
		if (index !== -1)
			this.matchmacking.splice(index, 1);
		index = this.inMatchmaking.findIndex((sockets) => sockets[0] === client || sockets[1] === client);
		if (index !== -1) {
			this.inMatchmaking[index][client === this.inMatchmaking[index][0] ? 1 : 0][0].disconnect();
			this.inMatchmaking.splice(index, 1);
		}
	}

	@SubscribeMessage('acceptMatchmaking')
	async acceptMatchmaking(client: Socket, data: any) {
		let index = this.inMatchmaking.findIndex((sockets) => sockets[0][0] === client || sockets[1][0] === client);
		if (index !== -1) {
			const matcher: Socket = client === this.inMatchmaking[index][0][0] ? this.inMatchmaking[index][1][0] : this.inMatchmaking[index][0][0];
			matcher.emit('waitingYou');
			if (!this.inMatchmaking[index][2])
				this.inMatchmaking[index][2] = true;
			else
				this.inMatchmaking.splice(index, 1);
		}
	}

	@SubscribeMessage('refuseMatchmaking')
	async refuseMatchmaking(client: Socket, data: any) {
		let index = this.inMatchmaking.findIndex((sockets) => sockets[0][0] === client || sockets[1][0] === client);
		if (index !== -1) {
			const matcher: [Socket, Users] = client === this.inMatchmaking[index][0][0] ? this.inMatchmaking[index][1] : this.inMatchmaking[index][0];
			matcher[0].emit('refusedMatchmaking');
			this.inMatchmaking.splice(index, 1);
			client.disconnect();
			this.matchmacking.push(matcher);
		}
	}
}