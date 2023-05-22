import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { FriendsService } from "src/friends/friends.service";
import { UsersService } from "src/user/user.service";
import { GameService } from "./game.service";
import { Socket } from "socket.io";

const PAD_SPEED = 20;

export class gameDto {
	ballPosX: number;
	ballPosY: number;
	ballVY: number;
	ballVX: number;
	player1Y: number;
	player2Y: number;
	player1Score: number;
	player2Score: number;
	ended: boolean;
	started: readyToPlay;
}

class playerInput {
	up1: boolean;
	down1: boolean;
	up2: boolean;
	down2: boolean;
}

enum readyToPlay {
	"none",
	"one",
	"two"
}

const setRandomBall = (game: gameDto, user: number) => {
	const rdmBool: boolean = Math.random() > 0.5;
	const rdmY: boolean = Math.random() > 0.5;
	const rdmV: number = Math.random() * 10;
	const rdmBallY: number = Math.random() * 500 + 250;
	game.ballPosX = 500;
	if (user === 0) {
		game.ballPosY = rdmBallY;
		game.ballVY = rdmY ? rdmV : -rdmV;
		game.ballVX = rdmBool ? 10 : -10;
	}
	else if (user === 1) {
		game.ballPosY = rdmBallY;
		game.ballVY = rdmY ? rdmV : -rdmV;
		game.ballVX = 10;
	}
	else if (user === -1) {
		game.ballPosY = rdmBallY;
		game.ballVY = rdmY ? rdmV : -rdmV;
		game.ballVX = -10;
	}
}

const updateGameData = (game: gameDto, inputs: playerInput) => {
	if (game.ballPosX < 0) {
		game.player2Score++;
		setRandomBall(game, -1);
	}
	if (game.ballPosX >= 1000) {
		game.player1Score++;
		setRandomBall(game, 1);
	}
	if (game.ballPosY < 0) {
		game.ballVY = -game.ballVY;
		game.ballPosY = 0;
	}
	if (game.ballPosY >= 1000) {
		game.ballVY = -game.ballVY;
		game.ballPosY = 1000;
	}
	if (game.ballPosX <= 40 && game.ballPosY >= game.player1Y - 50 && game.ballPosY <= game.player1Y + 50) {
		game.ballVY = (game.ballPosY - game.player1Y) / 2;
		game.ballVX = -game.ballVX;
		game.ballPosX = 40;

		if (game.ballVX < 0 && game.ballVX > -45)
			game.ballVX -= 1;
		else if (game.ballVX < 45)
			game.ballVX += 1;
	}
	if (game.ballPosX >= 960 && game.ballPosY >= game.player2Y - 50 && game.ballPosY <= game.player2Y + 50) {
		game.ballVY = (game.ballPosY - game.player2Y) / 2;
		game.ballVX = -game.ballVX;
		game.ballPosX = 960;

		if (game.ballVX < 0 && game.ballVX > -45)
			game.ballVX -= 1;
		else if (game.ballVX < 45)
			game.ballVX += 1;
	}
	if (inputs.up1 && game.player1Y >= 50)
		game.player1Y -= PAD_SPEED;
	if (inputs.down1 && game.player1Y <= 950)
		game.player1Y += PAD_SPEED;
	if (inputs.up2 && game.player2Y >= 50)
		game.player2Y -= PAD_SPEED;
	if (inputs.down2 && game.player2Y <= 950)
		game.player2Y += PAD_SPEED;
	game.ballPosX += game.ballVX;
	game.ballPosY += game.ballVY;

	return game;
}

@WebSocketGateway({ cors: true, namespace: 'Game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	constructor (
		private readonly userService: UsersService,
		private readonly gameService: GameService,
		private readonly friendService: FriendsService
	) {}

	inGame: [ [Socket, string], [Socket, string], gameDto, playerInput, Socket[], boolean ][] = [];
	
	sendResult(winner: [Socket, string], looser: [Socket, string], game: gameDto) {
		if (winner[0])
			winner[0].emit('endGame', "WINNER !!!");
		if (looser[0])
			looser[0].emit('endGame', "LOOSER !!!");
		this.setGame(winner[1], looser[1], game);
	}

	sendUpdate(user1: Socket, user2: Socket, game: gameDto) {
		if (user1)
			user1.emit("update", game);
		if (user2)
			user2.emit("update", game);
	}

	async afterInit(server: any) {
		setInterval(async () => {
			for (let i = 0; i < this.inGame.length; i++) {
				if (this.inGame[i][2].player1Score === 10 || this.inGame[i][2].player2Score === 10 && !this.inGame[i][2].ended) {
					this.inGame[i][2].ended = true;
					this.inGame[i][2].player1Score === 10 ? this.sendResult(this.inGame[i][0], this.inGame[i][1], this.inGame[i][2]) : this.sendResult(this.inGame[i][1], this.inGame[i][0], this.inGame[i][2])
					this.inGame.splice(i, 1);
				}
				else if (this.inGame[i][2].started === readyToPlay.two) {
					this.inGame[i][2] = updateGameData(this.inGame[i][2], this.inGame[i][3]);
					this.sendUpdate(this.inGame[i][0][0], this.inGame[i][1][0], this.inGame[i][2]);
					this.inGame[i][4].forEach(element => { element.emit('update', this.inGame[i][2]); });
				}
			}
		}, 1000 / 60);
	}

	async handleConnection(client: Socket, ...args: any[]) {
		const viewer: string | undefined = <string | undefined>client.handshake.auth.viewer;

		if (viewer !== undefined) {
			if (viewer === "") {
				if (!this.inGame.length) {
					client.disconnect();
					return ;
				}
				const rdmGame: number = Math.random() * (this.inGame.length - 1);
				this.inGame[rdmGame][4].push(client);
			}
			else {
				for (let i = 0; this.inGame[i]; i++) {
					const user1 = await this.userService.getUserByToken(this.inGame[i][0][1]);
					const user2 = await this.userService.getUserByToken(this.inGame[i][1][1]);
					if (user1.name === viewer || user2.name === viewer) {
						this.inGame[i][4].push(client);
						break ;
					}
				}
			}
			return ;
		}

		const token1: string = <string>client.handshake.headers.authorization;
		const token2: string = <string>client.handshake.auth.token;

		if (!token1)
		throw new WsException('No token provided');
		
		let i = 0;
		for (; i < this.inGame.length; i++)
		if (this.inGame[i][0][1] === token1 || this.inGame[i][1][1] === token1)
		break;
		if (i === this.inGame.length) {
			if (!token2) {
				client.disconnect();
				return ;
			}
			const gameData: gameDto = {
				ballPosX: 500,
				ballPosY: 500,
				ballVX: 0,
				ballVY: 0,
				player1Y: 500,
				player2Y: 500,
				player1Score: 0,
				player2Score: 0,
				ended: false,
				started: readyToPlay.none
			};
			const gameInputs: playerInput = {
				up1: false,
				down1: false,
				up2: false,
				down2: false
			};
			setRandomBall(gameData, 0);
			client.emit('position', "PLAYER1");
			this.inGame.push([[client, token1], [null, token2], gameData, gameInputs, [], false]);
		}
		else {
			token1 === this.inGame[i][0][1] ? client.emit('position', "PLAYER1") : client.emit('position', "PLAYER2");
			token1 === this.inGame[i][0][1] ? this.inGame[i][0][0] = client : this.inGame[i][1][0] = client;
		}
		const user = await this.userService.getUserByToken(token1);
		setTimeout(async() => {
			await this.userService.setUserPlaying(user, true);
		}, 100);
	}

	setGame = async (winnerToken: string, looserToken: string, game: gameDto) => {
		const winner = await this.userService.getUserByToken(winnerToken);
		const looser = await this.userService.getUserByToken(looserToken);
		this.gameService.createGame(winner, looser);
		if (game.player1Score === 10) {
			this.userService.calcRewardLooser(looser, game.player2Score, game.player1Score);
			this.userService.calcRewardWinner(winner, game.player1Score, game.player2Score);
		}
		else {
			this.userService.calcRewardLooser(looser, game.player1Score, game.player2Score);
			this.userService.calcRewardWinner(winner, game.player2Score, game.player1Score);
		}
		this.userService.setUserPlaying(winner, false);
		this.userService.setUserPlaying(looser, false);
	}

	async handleDisconnect(client: any) {

		const viewer: boolean = <boolean>client.handshake.auth.viewer;
		if (viewer) {
			for (let i = 0; i < this.inGame.length; i++) {
				if (this.inGame[i][4].indexOf(client) !== -1) {
					this.inGame[i][4].splice(this.inGame[i][4].indexOf(client), 1);
					break;
				}
			}
			return ;
		}

		for (let i = 0; i < this.inGame.length; i++) {
			if (this.inGame[i][0][0] === client || this.inGame[i][1][0] === client)
				this.inGame[i][0][0] === client ? this.inGame[i][0][0] = null : this.inGame[i][1][0] = null;
			}
	}

	@SubscribeMessage('move')
	async move(client: Socket, data: any) {
		const token: string = <string>client.handshake.headers.authorization;
		let i = 0;
		for (; i < this.inGame.length; i++)
			if (this.inGame[i][0][1] === token || this.inGame[i][1][1] === token)
				break;
		if (i === this.inGame.length)
			return;
		if (this.inGame[i][0][1] === token) {
			this.inGame[i][3].up1 = data.up;
			this.inGame[i][3].down1 = data.down;
		}
		else {
			this.inGame[i][3].up2 = data.up;
			this.inGame[i][3].down2 = data.down;
		}
	}

	@SubscribeMessage('start')
	async start(client: Socket) {
		this.inGame.forEach( async (game) => {
			if (game[0][0] === client || game[1][0] === client) {
				if (game[2].started === readyToPlay.none)
					game[2].started = readyToPlay.one;
				else if (game[2].started === readyToPlay.one)
					game[2].started = readyToPlay.two;
			}
		});
	}
}