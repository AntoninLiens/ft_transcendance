import { AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";
import { GrGroup, GrUserSettings } from "react-icons/gr";
import { useContext, useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { WsContext } from "../../../..";
import axios from "../../../../utils/axios";
import Friend from "./Friends/Friend";
import "./MainBox.css"

export default function MainBox({setAffPage}: any) {
	// States

	const [inviteMessage, setInviteMessage] = useState("");
	const hideOrDisplay = inviteMessage ? "display" : "hide";

	const [friendList, setFriendList] = useState<any[]>([]);

	const [affRemove, setAffRemove] = useState("");
	const [affCancel, setAffCancel] = useState("hide");

	const { pendingNotif } = useContext(WsContext);

	// Behavior
	const getFriendsList = async () => {
		await axios.get("friends/list")
		.then(res => {
			res.data.length === 0 ? setInviteMessage("You don't have any friend yet !") : setInviteMessage("");
			setFriendList(res.data)
		})
		.catch(err => { console.log("Friendlist error : ", err) })
	}

	const changePage = (page: number) => {
		setAffPage(page);
	}

	const handleRemoveFriend = () => {
		setAffRemove("hide");
		setAffCancel("")
	}

	const handleCancelRemove = () => {
		setAffRemove("");
		setAffCancel("hide")
	}

	useEffect(() => {
		getFriendsList();
	}, []);

	// Render
	return (
		<div className="social_box">
			<div className="social_title">
				<h2>Disco-PONG</h2>
				<h1>Friends</h1>
			</div>
			<div className={`social_inviteMessageBox ${hideOrDisplay}`}>
				<div className="social_inviteMessage">
					{ inviteMessage }
				</div>
			</div>
			{
				friendList.map((friend: any, index: number) => {
					return (
						<Friend friend={friend} message={affCancel} remove={affRemove} setter={setFriendList} key={index} />
					)
				})
			}
			<div className="social_menu">
					<div className="social_footer">
						<button className="social_add" onClick={() => changePage(1)}><AiOutlineUserAdd size={30}/></button>
						<button className="social_pendingBtn" onClick={() => changePage(2)}><GrUserSettings size={26}/>
							{ pendingNotif && <div className={`social_pendingNotif`}></div>}
						</button>
						<button className="social_groups" onClick={() => changePage(3)}><GrGroup size={28}/></button>
						<button className={`social_remove ${affRemove}`} onClick={handleRemoveFriend}><AiOutlineUserDelete size={30}/></button>
						<button className={`social_cancel ${affCancel}`} onClick={handleCancelRemove}><MdOutlineCancel size={30}/></button>
					</div>
				</div>
		</div>
	);
}