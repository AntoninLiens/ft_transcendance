import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext, MatchmakingContext } from "../..";
import { useNavigate } from "react-router-dom";
import PongViewer from "./PongViewer/PongViewer";
import PongPlay from "./PongPlay/PongPlay";
import axios from "../../utils/axios";
import Ready from "./Ready/Ready";
import Score from "./Score/Score";
import "./Pong.scss";

interface PongProps {
	viewer: string | null;
}

export enum playerPosEnum {
	PLAYER1 = "PLAYER1",
	PLAYER2 = "PLAYER2",
	undefined = "undefined"
}

const Pong : React.FC<PongProps> = ({ viewer }) => {
	const socket = useRef<any | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	const size = useRef(0);
	const ratio = useRef(0);
	const [ isStarted, setIsStarted ] = useState<boolean>(false);
	const [ isEnded, setIsEnded ] = useState<boolean>(false);
	const [ endMessage, setEndMessage ] = useState<string>("");
	const navigate = useNavigate();
	const { users } = useContext(AuthContext);
	const { opponent } = useContext(MatchmakingContext);
	const [ ballColor, setBallColor ] = useState<string>("white");
	const [ padColor, setPadColor ] = useState<string>("white");
	const [ playerPos, setPlayerPos ] = useState<playerPosEnum>(playerPosEnum.undefined);
	
	const [ state, setState ] = useState({
		ballPosX: 0,
		ballPosY: 0,
		ballVY: 0,
		ballVX: 0,
		player1Y: 0,
		player2Y: 0,
		player1Score: 0,
		player2Score: 0
	});
	
	const discoBall = (x: number, y: number, radius: number) => {
		if (!contextRef.current) return;
		contextRef.current.beginPath();
		contextRef.current.arc(x, y, radius, 0, 2 * Math.PI);
		contextRef.current.fillStyle = ballColor;
		contextRef.current.fill();
		contextRef.current.strokeStyle = "white";
		contextRef.current.lineWidth = 2;
		contextRef.current.arc(x, y, radius, 0, 2 * Math.PI);
		contextRef.current.stroke();
		contextRef.current.closePath();
	}
	
	const discoPlayer = (x: number, y: number, width: number, height: number, color: string) => {
		if (color === "")
			color = "black";
		if (!contextRef.current) return;
		contextRef.current.beginPath();
		contextRef.current.rect(x, y, width, height);
		contextRef.current.fillStyle = color;
		contextRef.current.fill();
		contextRef.current.strokeStyle = "white";
		contextRef.current.lineWidth = 2;
		contextRef.current.rect(x, y, width, height);
		contextRef.current.stroke();
		contextRef.current.closePath();

	}
	
	const drawGame = () => {
		if (!contextRef.current) return;
		contextRef.current.fillStyle = "black";
		contextRef.current.fillRect(0, 0, window.innerWidth, window.innerHeight);
		if (playerPos !== playerPosEnum.undefined) {
			let userPos;
			let oppPos;
			let ballpos;
			if (playerPos === playerPosEnum.PLAYER1) {
				ballpos = state.ballPosX;
				userPos = state.player1Y;
				oppPos = state.player2Y;
			}
			else {
				ballpos = size.current - state.ballPosX;
				userPos = state.player2Y;
				oppPos = state.player1Y;
			}
			discoBall(ballpos, state.ballPosY, 15 * ratio.current);
			discoPlayer(20 * ratio.current, userPos - (100 * ratio.current) / 2, 20 * ratio.current, 100 * ratio.current, padColor);
			discoPlayer(size.current - (40 * ratio.current), oppPos - (100 * ratio.current) / 2, 20 * ratio.current, 100 * ratio.current, opponent.pad);
		}
		else {
			discoBall(state.ballPosX, state.ballPosY, 15 * ratio.current);
			discoPlayer(20 * ratio.current, state.player1Y - (100 * ratio.current) / 2, 20 * ratio.current, 100 * ratio.current, padColor);
			discoPlayer(size.current - (40 * ratio.current), state.player2Y - (100 * ratio.current) / 2, 20 * ratio.current, 100 * ratio.current, opponent ? opponent.pad : "white");
		}

		
	}

	const resizeWindow = (height: number, width: number) => {
		const newSize = height > width ? width : height;
		size.current = newSize;
		ratio.current = newSize / 1000;
	}
	
	const ratioState = (data: any) => {
		setState((prev) => ({ ...prev,
			ballPosX: data.ballPosX * ratio.current,
			ballPosY: data.ballPosY * ratio.current,
			player1Y: data.player1Y * ratio.current,
			player2Y: data.player2Y * ratio.current,
			player1Score: data.player1Score,
			player2Score: data.player2Score
		}));
	}

	const getIsPlaying = async () => {
		await axios.get('user/isPlaying')
		.then(res => {
			if (res.data) {
				setIsStarted(true);
		
		}})	
		.catch(err => { console.log("Get is playing error: ", err); });
	}

	const getUser = async () => {
		await axios.get('user/profile')
		.then(res => {
			if (res.data) {
				setBallColor(res.data.ball);
				setPadColor(res.data.pad);
			}
		})
		.catch(err => { console.log("Get user error: ", err); });
	}


	useEffect(() => {
		getUser();
		getIsPlaying();
		window.addEventListener("resize", () => resizeWindow(window.innerHeight, window.innerWidth));
		resizeWindow(window.innerHeight, window.innerWidth);
		return () => {
			window.removeEventListener("resize", () => resizeWindow(window.innerHeight, window.innerWidth));
		};
	}, []);

	useEffect(() => {
		if (canvasRef.current) {
			let canvas = canvasRef.current;
			let context = canvas.getContext("2d");
			contextRef.current = context;
			if (contextRef.current && isStarted)
				drawGame();
		}
		return () => {
			if (canvasRef.current)
				contextRef.current = null;

		};
	}, [ canvasRef.current, contextRef.current, state, isEnded ]);

	return (
		<div tabIndex={0} className="pongPage">
			{ viewer === null && <PongPlay socket={socket} ratioState={ratioState} isStarted={isStarted} setIsEnded={setIsEnded} setEndMessage={setEndMessage} setPlayerPos={setPlayerPos} /> }
			{ !isStarted && <Ready setIsStarted={setIsStarted}/> }
			{ viewer != null && <PongViewer socket={socket} ratioState={ratioState} setIsEnded={setIsEnded} setEndMessage={setEndMessage} /> }
			{ isStarted &&
				<div className="Pong">
				<Score player1Score={state.player1Score} player2Score={state.player2Score} playerPos={playerPos} id="scorePanel" />
				<canvas ref={canvasRef} width={size.current} height={size.current} />
			</div> }
			{ isEnded && <div className="endGame">Game is over
				<p>{endMessage}</p>
				<button onClick={() => navigate(`/homePage/`)}>Return to home</button>
			</div>}
		</div>
	);
}

export default Pong;
// Think about refresh page and how to keep the user logged in