import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext, MatchmakingContext, WsContext } from "../..";
import { MdClose } from "react-icons/md";
import axios from "../../utils/axios";
import "./Chat.scss";
import { useNavigate } from "react-router-dom";
import { FaGamepad } from "react-icons/fa";

export default function Chat() {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [chatContent, setChatContent] = useState("");
	const { messageData, setIsOnChat, sendMessage, playWithFriend } = useContext(WsContext);
	const { users, setFriendProfile } = useContext(AuthContext);
	const { connect } = useContext(MatchmakingContext);
	const [chat, setChat] = useState<any[]>([]);
	const navigate = useNavigate();

	var color = ["red", "blueviolet", "orange", "magenta", "cyan", "mediumspringgreen", "deepskyblue"];
	const [rand] = useState(Math.floor(Math.random() * color.length));

	const getDefaultChat = async () => {
		await axios.get("Chat/chat?friend_id=" + messageData.friend_id + "&group_id=" + messageData.group_id)
		.then((res) => { setChat(res.data.messages); })
		.catch((err) => { console.log("Chat error: ", err); })
	};

	useEffect(() => {
		if (textareaRef.current)
			textareaRef.current.focus();
		getDefaultChat();
		setTimeout(() => {
			document.getElementsByClassName("chat_body")[0].scrollTo(0, document.getElementsByClassName('chat_body')[0].scrollHeight);
		}, 150);
	}, [messageData]);

	const handleChange = (e: any) => {
		setChatContent(e.target.value);
	}

	const handleSubmit = () => {
		setChatContent("");
		sendMessage(chatContent, messageData.friend, messageData.group);
	}

	const handlePfp = (name: string) => {
		setFriendProfile(name);
		navigate("/homepage/profile");
	}

	const playWithYourFriend = async (frienId: number) => {
		playWithFriend(frienId);
		connect(true, frienId);
	}

	return (
		<div className="chat_component">
			<div className="chat_header" style={{background: color[rand]}}>
				<div className="chat_header_title">{`Chat with ${messageData.friend ? messageData.friend.name : messageData.group.name}`}</div>
				{ messageData.friend && <button title="Play with your friend!" onClick={() => playWithYourFriend(messageData.friend.id)}><FaGamepad size={30}/></button>}
				<button className="chat_header_close" onClick={() => setIsOnChat(false)} ><MdClose size={24} /></button>
			</div>
			<div className="chat_body">
				{
					chat !== undefined && chat.map((message: any, index: number) => {
						if (message.sender.name === users.name) {
							return (
								<div className="chatter" key={index}>
									<div className="chatter_pfp" style={{background: `url(${message.sender.pfp})`,
																		backgroundRepeat: "no-repeat",
																		backgroundSize: "cover",
																		backgroundPosition: "center"}}></div>
									<div className="chat_own_message chat_message" style={{background: color[rand]}}>{message.content}</div>
								</div>
							);
						}
						else {
							return (
								<div className="chatter chatter_friend" key={index}>
									<div className="chat_friend_message chat_message" style={{background: "grey"}}>{message.content}</div>
									<div className="chatter_name">{message.sender.name}</div>
									<div className="chatter_pfp" onClick={() => handlePfp(message.sender.name)} style={{background: `url(${message.sender.pfp})`,
																		backgroundRepeat: "no-repeat",
																		backgroundSize: "cover"}}></div>
								</div>
							);
						}
					})
				}
			</div>
			<div className="chat_footer" style={{ background: color[rand] }}>
				<textarea ref={textareaRef} className="chat_write" cols={19} rows={4}  maxLength={69} placeholder="Send message" onChange={handleChange} value={chatContent} style={{ background: color[rand] }}></textarea>
				<span className="chat_length">{chatContent.length}/69</span>
				<button className="chat_send" onClick={handleSubmit}>Send</button>
			</div>
		</div>
	);
}