import { useContext, useState } from "react";
import { GoSearch } from "react-icons/go";
import { GrClose } from "react-icons/gr";
import { WsContext } from "../../../..";
import axios from "../../../../utils/axios";
import "./InviteFriends.css"

export default function InviteFriends({setAffPage}: any) {
	//States

	const { inviteFriendNotif } = useContext(WsContext);

	const [friendName, setFriendName] = useState("");
	const [inviteMessage, setInviteMessage] = useState("");
	
	const hideOrDisplay = inviteMessage ? "display" : "hide";

	// Behavior
	const updateFriendName = (event: any) => {
		setFriendName(event.target.value);
	}

	const backToMain = () => {
		setAffPage(0);
	}

	const inviteFriend = async () => {
		setInviteMessage("");
		await axios.post("friends/invite", { name: friendName })
		.then(res => {
			setInviteMessage("User " + res.data.invited.name + " invited !");
			inviteFriendNotif(res.data.invited.id);
		})
		.catch(err => { setInviteMessage(err.response.data.message) })
	}

	return (
		<div className="social_secondBox">
			<div className="social_friendSearch">
				<button className="social_cancelButton" onClick={backToMain}><GrClose size={24}/></button>
				<div className="social_form">
					<input className="social_searchBar" type="text" placeholder="Friend name" onChange={updateFriendName}></input>
					<button className="social_SearchButton" onClick={inviteFriend}><GoSearch size={24}/></button>
					<div className={`social_inviteMessageBox ${hideOrDisplay}`}>
						<div className="social_inviteMessage">
							{ inviteMessage }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}