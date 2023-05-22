import { useState, useEffect } from "react";
import { GrClose } from "react-icons/gr";
import PendingFriend from "./PendingFriends/pendingFriend";
import axios from "../../../../utils/axios";
import "./pending.css";

export default function Pending({setAffPage}: any) {
	// States
	const [pendingList, setPendingList] = useState<any[]>([]);

	const [inviteMessage, setInviteMessage] = useState("");	
	const hideOrDisplay = inviteMessage ? "display" : "hide";

	// Behavior
	const getPendingFriendsList = async () => {
		await axios.get("friends/pending")
		.then(res => {
			res.data.length === 0 ? setInviteMessage("Don't worry, be happy") : setInviteMessage("")
			setPendingList(res.data)
		})
		.catch(err => { console.log("Pending error : ", err) })
	}

	useEffect(() => {
		getPendingFriendsList();
	}, [])

	// Render
	return (
		<div className="social_thirdBox">
			<button className="social_cancelButton" onClick={() => setAffPage(0)}><GrClose size={24}/></button>
			<div className="social_thirdTitle">
				<div className="social_pendingTitle">Pending</div>
				<div className="social_requestTitle">request</div>
			</div>
			<div className={`social_inviteMessageBox ${hideOrDisplay}`}>
				<div className="social_inviteMessage">
					{ inviteMessage }
				</div>
			</div>
			{
				pendingList.map((request: any, index: number) => {
					return (
						<PendingFriend demander={request.demander} setter={setPendingList} key={index}/>
						)
					})
			}
		</div>
	);
}