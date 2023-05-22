import { createContext, PropsWithChildren, useRef, useState, useContext, Dispatch, SetStateAction } from "react"
import { io } from "socket.io-client";
import { AuthContext } from "..";

interface searchTimer {
	isSearching: boolean;
	seconds: number;
	minutes: number;
}

export function createMatchmaking() {
	type UpdateType = Dispatch<SetStateAction<searchTimer>>;
	type MatchmakingContextType = {
		connect: (friendMatch: boolean, friendId: number) => void;
		disconnect: () => void;
		acceptMatchmaking: () => void;
		refuseMatchmaking: () => void;
		isCreated:  boolean;
		isAccepted: boolean;
		isWaitingYou: boolean;
		searchTimer: searchTimer;
		setSearchTimer: UpdateType;
		pfp1: string;
		pfp2: string;
		opponent: any;
	};

	const matchmakingCtx = createContext<MatchmakingContextType>({
		connect: (friendMatch: boolean, freindId: number) => {},
		disconnect: () => {},
		acceptMatchmaking: () => {},
		refuseMatchmaking: () => {},
		isCreated: false,
		isAccepted: false,
		isWaitingYou: false,
		searchTimer: {isSearching: false, seconds: 0, minutes: 0},
		setSearchTimer: () => {},
		pfp1: "",
		pfp2: "",
		opponent: null
	});

	function MatchmakingProvider(props: PropsWithChildren<{}>) {
		const socket = useRef<any | null>(null);
		const [isCreated, setIsCreated] = useState(false);
		const [isAccepted, setIsAccepted] = useState(false);
		const [isWaitingYou, setIsWaitingYou] = useState(false);
		const [pfp1, setPfp1] = useState("");
		const [pfp2, setPfp2] = useState("");
		const [searchTimer, setSearchTimer] = useState<searchTimer>({isSearching: false, seconds: 0, minutes: 0});

		const { users } = useContext(AuthContext);

		const [ opponent, setOpponent ] = useState(null);


		const connect = (friendMatch: boolean, friendId: number) => {
			if (!socket.current) {
				socket.current = io("ws://localhost:5000/Matchmaking", {
					extraHeaders: { Authorization: users.token },
					auth: {
						friendMatch: friendMatch,
						friendId: friendId
					}
				});

				socket.current.on("connect", () => {
					setSearchTimer({...searchTimer, isSearching: true});
					
					socket.current.on("disconnect", () => {
						socket.current = null;
						setSearchTimer({...searchTimer, isSearching: false});
					});

					socket.current.on("createMatchmaking", (data: any) => {
						setSearchTimer({...searchTimer, isSearching: false});
						setIsCreated(true);
						if (data)
							setOpponent(data);
						

						socket.current.on("refusedMatchmaking", () => {
							setIsCreated(false);
							setSearchTimer({...searchTimer, isSearching: true});
							setIsAccepted(false);
							socket.current.off("refusedMatchmaking");
							socket.current.off("waitingYou");
						});

						socket.current.on("waitingYou", () => {
							setIsWaitingYou(true);
							socket.current.off("refusedMatchmaking");
							socket.current.off("waitingYou");
						});
					});
				});
			};
		};
		
		const disconnect = () => {
			if (socket.current) {
				socket.current.close();
				setIsCreated(false);
				setIsAccepted(false);
				setIsWaitingYou(false);
				socket.current = null;
			}
		};

		const acceptMatchmaking = () => {
			if (socket.current) {
				socket.current.emit("acceptMatchmaking");
				setPfp1(users.pfp);
				setIsAccepted(true);
			}
		};

		const refuseMatchmaking = () => {
			if (socket.current) {
				socket.current.emit("refuseMatchmaking");
				setIsCreated(false);
				setIsWaitingYou(false);
			}
		};

		return (
			<matchmakingCtx.Provider value={{
				connect,
				disconnect,
				acceptMatchmaking,
				refuseMatchmaking,
				isCreated,
				isAccepted,
				isWaitingYou,
				searchTimer,
				setSearchTimer,
				pfp1,
				pfp2,
				opponent
			}}>
				{props.children}
			</matchmakingCtx.Provider>
		);
	};
	return { MatchmakingProvider, matchmakingCtx } as const;
};