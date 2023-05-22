import { useContext, useEffect, useRef, useState } from "react";
import { createContext, PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext, MatchmakingContext } from "..";

export type messageData = {
	friend_id: number;
	group_id: number;
	message: string[];
	friend: any | null;
	group: any | null;
};

export function createWs() {
	type WsContextType = {
		inviteFriendNotif: (friendId: number) => void;
		notif: boolean;
		setNotif: (notif: boolean) => void;
		inviteNotif: boolean;
		inviteGame: boolean;
		opponentFriend: any;
		setInviteNotif: (inviteNotif: boolean) => void;
		pendingNotif: boolean;
		setPendingNotif: (pendingNotif: boolean) => void;
		playWithFriend: (friendId: number) => void;
		sendMessage: (message: string, friend: any, group: any) => void;
		messageData: messageData;
		setMessageData: (messageData: messageData) => void;
		isOnChat: boolean;
		setIsOnChat: (isOnChat: boolean) => void;
		notifMessage: string;
		setNotifMessage: (notifMessage: string) => void;
		group: any;
		setGroup: (group: any) => void;
	};

	const wsCtx = createContext<WsContextType>({
		inviteFriendNotif: () => {},
		notif: false,
		setNotif: () => {},
		inviteNotif: false,
		setInviteNotif: () => {},
		pendingNotif: false,
		setPendingNotif: () => {},
		inviteGame: false,
		opponentFriend: null,
		playWithFriend: () => {},
		sendMessage: () => {},
		messageData: { message: [], friend: null, group: null, friend_id: -1, group_id: -1 },
		setMessageData: () => {},
		isOnChat: false,
		setIsOnChat: () => {},
		notifMessage: "",
		setNotifMessage: () => {},
		group: null,
		setGroup: () => {},
	});

	function WsProvider(props: PropsWithChildren<{}>) {
		const { users } = useContext(AuthContext);
		const socket = useRef<any | null>(null);
		const [notif, setNotif] = useState(false);
		const [pendingNotif, setPendingNotif] = useState(false);
		const [isOnChat, setIsOnChat ] = useState<boolean>(false);
		const [inviteNotif, setInviteNotif] = useState(false);
		const [inviteGame, setInviteGame] = useState(false);
		const [opponentFriend, setOpponentFriend] = useState(null);
		const [messageData, setMessageData] = useState<messageData>({ message: [], friend: null, group: null, friend_id: -1, group_id: -1 });
		const [notifMessage, setNotifMessage] = useState<string>("");
		const [group, setGroup] = useState<any | null>(null);

		const navigate = useNavigate();

		const inviteFriendNotif = (friendId: number) => {
			if (socket.current)
				socket.current.emit("inviteFriend", friendId);
		};

		const playWithFriend = (friendId: number) => {
			if (socket.current)
				socket.current.emit("playWithFriend", friendId);
		};

		const sendMessage = (message: string, friend: any, group: any) => {
			if (socket.current) {
				setTimeout(() => {
					setMessageData({ message: [ ...messageData.message, message ], friend, friend_id: messageData.friend_id, group, group_id: messageData.group_id });
				}, 500);
				socket.current.emit("sendMessage", { message, friend, group });
			}
		};

		useEffect(() => {
			if (users.token !== "" && (!socket.current)) {
				socket.current = io("ws://localhost:5000/User", {
					extraHeaders: {
						Authorization: users.token
					}
				});
				
				socket.current.on("connect", () => {

					socket.current.on("inviteFriend", () => {
						setNotif(true);
						setInviteNotif(true);
						setPendingNotif(true);
					});

					socket.current.on("playWithFriend", (data: any) => {
						setOpponentFriend(data)
						setInviteGame(true);
						setTimeout(() => {
							setInviteGame(false);
						}, 100);
					});

					socket.current.on("receiveMessage", (data: messageData) => {
						setMessageData({ message: data.message, friend: data.friend, friend_id: data.friend_id, group: data.group, group_id: data.group_id });
						setIsOnChat(true);
					});

					socket.current.on("notif", (data: any) => {
						setNotifMessage(data);
					});

					socket.current.on("mute in this group", (data: any) => {
						setNotifMessage("You have been muted in this group");
					});
				});
			}

			return () => {
				if (socket.current) {
					socket.current.close();
					socket.current = null;
				}
			}
		}, [users]);

		return (
			<wsCtx.Provider value={{
				inviteFriendNotif,
				notif,
				setNotif,
				inviteNotif,
				setInviteNotif,
				pendingNotif,
				setPendingNotif,
				inviteGame,
				opponentFriend,
				playWithFriend,
				sendMessage,
				messageData,
				setMessageData,
				isOnChat,
				setIsOnChat,
				notifMessage,
				setNotifMessage,
				group,
				setGroup
			}}>
				{props.children}
			</wsCtx.Provider>
		);
	}

	return { wsCtx, WsProvider } as const;
}
