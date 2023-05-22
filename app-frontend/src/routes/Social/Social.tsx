import { useState, useEffect, useContext } from "react";
import { WsContext } from "../..";
import GroupMembers from "./components/Groups/GroupMembers/GroupMembers";
import InviteFriends from "./components/InviteFriends/InviteFriends";
import Pending from "./components/PendingRequest/pending";
import GroupPage from "./components/Groups/GroupPage";
import NavBar from "../../components/NavBar/NavBar";
import MainBox from "./components/MainBox/MainBox";
import "./Social.css"

export default function Social() {

	// state
	const [affPage, setAffPage] = useState(0);
	const { setInviteNotif, setNotif, pendingNotif, group } = useContext(WsContext);

	// behavior
	useEffect(() => {
		setNotif(false);
		setInviteNotif(false);
		return () => {
			if (pendingNotif) {
				setInviteNotif(true);
				setNotif(true);
			}
		}
	}, [pendingNotif])

	// render
	return (
		<div className="SocialPage">
			<NavBar />
			{affPage === 0 && <MainBox setAffPage={setAffPage} />}
			{affPage === 1 && <InviteFriends setAffPage={setAffPage} />}
			{affPage === 2 && <Pending setAffPage={setAffPage} />}
			{affPage === 3 && <GroupPage setAffPage={setAffPage} />}
			{affPage === 4 && <GroupMembers setAffPage={setAffPage} group_id={group.id} />}
		</div>
	);
}