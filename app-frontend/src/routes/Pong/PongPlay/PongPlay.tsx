import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext, MatchmakingContext } from "../../..";
import { io } from "socket.io-client";
import axios from "../../../utils/axios";

export default function PongPlay({ socket, ratioState, isStarted, setIsEnded, setEndMessage, setPlayerPos }: any) {
	const { users } = useContext(AuthContext);
	const { opponent } = useContext(MatchmakingContext);
	const [ upKeyValue, setUpKeyValue ] = useState<string>("");
	const [ downKeyValue, setDownKeyValue ] = useState<string>("");
	const down = useRef<boolean>(false);
	const up = useRef<boolean>(false);

	const getSettings = async () => {
		const res = await axios.get("settings/user")
		.then(res => { return res.data })
		.catch(err => { console.log("Get settings error: ", err); return null;  });

		setUpKeyValue(res.moveUp);
		setDownKeyValue(res.moveDown);
	}

	useEffect(() => {
		getSettings();

		const handleKeyDown = (event: KeyboardEvent) => {

			if (event.key.toUpperCase() === downKeyValue) {
				down.current = true;
			}
			else if (event.key.toUpperCase() === upKeyValue) {
				up.current = true;
			}
			if (socket.current)
				socket.current.emit("move", { down: down.current, up: up.current });
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key.toUpperCase() === downKeyValue) {
				down.current = false;
			}
			else if (event.key.toUpperCase() === upKeyValue) {
				up.current = false;
			}
			if (socket.current)
				socket.current.emit("move", { down: down.current, up: up.current });
		};

		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [ up, down, upKeyValue, downKeyValue ]);

	useEffect(() => {
		if (socket.current && isStarted)
			socket.current.emit("start");
		if (!socket.current && users.token) {
			socket.current = io("ws://localhost:5000/Game", {
				extraHeaders: { Authorization: users.token },
				auth: { token: opponent ? opponent.token : null }
			});
			
			if (socket.current) {
				socket.current.on("connect", () => {
					socket.current.on("position", (data: any) => {
						setPlayerPos(data);
					});

					socket.current.on('disconnect', () => {
						socket.current = null;
					});

					socket.current.on('update', (data: any) => {
						ratioState(data);
					});

					socket.current.on('endGame', (message: string) => {
						socket.current.disconnect();
						socket.current = null;
						setIsEnded(true);
						setEndMessage(message);
					});
				});
				
				socket.current.on("error", (data: any) => {
					console.log("Error: ", data);
				});
			}
		}
		return (() => {
			if (socket.current)
				socket.current.emit("start");
		});
	}, [isStarted]);

	return (
		<div style={{display: "none"}}></div>
	);
}