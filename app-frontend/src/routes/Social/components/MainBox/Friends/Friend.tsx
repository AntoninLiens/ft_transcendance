import { AuthContext, MatchmakingContext, WsContext } from "../../../../..";
import { BiMessageDetail } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { AiFillEye } from "react-icons/ai";
import { FaGamepad } from "react-icons/fa";
import { GrClose } from "react-icons/gr"
import { useContext, useEffect, useState } from "react";
import axios from "../../../../../utils/axios";
import "./Friend.css";

export default function Friend({friend, message, remove, setter}: any) {

	// State
	const { playWithFriend, setMessageData, setIsOnChat } = useContext(WsContext);
	const { connect } = useContext(MatchmakingContext);
	const { setIsViewing, setOserProfile } = useContext(AuthContext);
	const navigate = useNavigate();
	const [ statut, setStatut ] = useState<string>("");

	// Behavior
	const handleDeleteFriend = async () => {
		await axios.delete(`friends/remove/${friend.name}`)
		.catch(err => { console.log("Remove friend error: ", err); });

		await axios.get("friends/list")
		.then(res => { setter(res.data) })
		.catch(err => { console.log("Friendlist error: ", err); });
	}

	const playWithYourFriend = async () => {
		playWithFriend(friend.id);
		connect(true, friend.id);
	}

	const viewFriendGame = async () => {
		await axios.get("user/isPlayingFriend?name=" + friend.name)
		.then(res => {
			if (res.data) {
				setIsViewing(friend.name);
				navigate("/pong");
			}
		})
		.catch(err => { console.log("Is playing friend error: ", err); });
	}

	const isPlayingFriend = async () => {
		await axios.get("user/isPlayingFriend?name=" + friend.name)
		.then(res => { if (res.data) setStatut("playing"); })
		.catch(err => { console.log("Is playing friend error: ", err); });
	}

	const viewFriendProfile = async () => {
		setOserProfile(friend.name);
		navigate(`/homePage/profile`);
	}

	const openChat = async () => {
		await axios.get("friends/get?friend_id=" + friend.id)
		.then(res => { setMessageData({friend: friend, message: [], friend_id: res.data.id, group: null, group_id: -1}); })
		.catch(err => { console.log("Get friend id error: ", err); });
		setIsOnChat(true);
	}

	useEffect(() => {
		isPlayingFriend();
		if (statut !== "playing" && statut !== "afk") {
			if (!friend.statut)
				setStatut("connected");
			else if (friend.statut === 1)
				setStatut("disconnected");
		}
		console.log("Friend: ", statut);
	}, [ friend ])

	// Render
	return (
		<div className="friend_friend">
			<div className="friend_friendProfile">
				<div className="friend_friendPfp" onClick={viewFriendProfile} style={{backgroundImage: `url(${friend.pfp})`,
														backgroundRepeat: "no-repeat",
														backgroundSize: "cover"}}>
					<div className={`friend_friendStatus ${statut}`}></div>
				</div>
				<div className="friend_friendName">{friend.name}</div>
			</div>
			<div className="friend_things">
				<div className="friend_info">
					<div className="friend_infoMessage">Level: {friend.level}</div>
					<div className="friend_infoStatus">Score: {friend.score}</div>
				</div>
				<div className="playButtons">
					<button className={`friend_playButton ${remove}`} onClick={playWithYourFriend}><FaGamepad size={30}/></button>
					<button className={`friend_viewGame_button ${remove}`} onClick={viewFriendGame}><AiFillEye size={30}/></button>
				</div>
				<button className={`friend_msgButton ${remove}`} onClick={openChat}><BiMessageDetail size={30}/></button>
				<button className={`friend_removeButton ${message}`} onClick={handleDeleteFriend}><GrClose size={30}/></button>
			</div>
		</div>
	);
}