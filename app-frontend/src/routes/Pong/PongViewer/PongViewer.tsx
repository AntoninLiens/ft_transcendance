import { useContext, useEffect } from "react";
import { AuthContext } from "../../..";
import { io } from "socket.io-client";

export default function PongViewer({socket, ratioState, setIsEnded, setEndMessage}: any) {
	const { setIsViewing, isViewing } = useContext(AuthContext);

	useEffect(() => {
		if (!socket.current) {
			socket.current = io(`ws://localhost:5000/Game`, { auth: { viewer: isViewing }});
			socket.current.on("connect", () => {
				socket.current.on('disconnect', () => {
					socket.current = null;
				});

				socket.current.on('update', (data: any) => {
					ratioState(data);
				});

				socket.current.on('endGame', (message: string) => {
					if (socket.current) {
						socket.current.disconnect();
						socket.current = null;
					}
					setIsEnded(true);
					setEndMessage(message);
				});
			});
		}
		
		return () => {
			if (socket.current) {
				socket.current.disconnect();
				socket.current = null;
			}
			setIsViewing(null);
		}
	}, []);


	return (
		<div style={{display: "none"}}></div>
	);
}