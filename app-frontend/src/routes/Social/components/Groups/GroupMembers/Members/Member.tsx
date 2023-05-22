import { AiOutlineUsergroupAdd, AiOutlineUsergroupDelete } from "react-icons/ai";
import { MdBlockFlipped } from "react-icons/md";
import { GrUserAdmin } from "react-icons/gr"
import { AuthContext, WsContext } from "../../../../../..";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "../../../../../../utils/axios";
import "./Member.scss"
import { FaVolumeMute } from "react-icons/fa";
import { BsVolumeMute } from "react-icons/bs";

export default function Member({update, setUpdate, admin, member, groupName}: {update: boolean, setUpdate: any, admin: boolean, member: any, groupName: string}) {

	const { setFriendProfile } = useContext(AuthContext);
	const { inviteFriendNotif } = useContext(WsContext);
	const { users } = useContext(AuthContext);
	const [ errorMsg, setErrorMsg ] = useState<string>("")
	const [ timeToMute, setTimeToMute ] = useState<number>(300000);
	const navigate = useNavigate();


	const viewFriendProfile = async () => {
		setFriendProfile(member.name);
		navigate(`/homePage/profile`);
	}

	const makeAdmin = async () => {
		await axios.post("group/makeAdmin", { userName: member.name, groupName })
		.catch(err => { console.log("From member to admin error: ", err) })
	}

	const inviteFriend = async () => {
		await axios.post("friends/invite", { name: member.name })
		.then(res => { inviteFriendNotif(res.data.invited.id); })
		.catch(err => { setErrorMsg(err.response.data.message); setTimeout(() => { setErrorMsg("") }, 3000) })
	}

	const blockUser = async () => {
		await axios.post("user/block", { name: member.name })
		.catch(err => { console.log("Block user error: ", err) })
	}

	const removeUserFromGroup = async () => {
		await axios.put("group/removeMember", { userName: member.name, groupName: groupName })
		.then(() => { update ? setUpdate(false) : setUpdate(true); })
		.catch(err => { console.log("Remove member error: ", err) });
	}

	const changeTime = async (e: any) => {
		setTimeToMute(e.target.value);
	}

	const Mute = async () => {
		await axios.put("group/mute", { userName: member.name, groupName, timeToMute })
		.catch(err => { console.log("Mute user error: ", err) })
	}

	useEffect(() => {
		if (admin)
			(document.getElementById("time-select") as HTMLInputElement).value = "300000";
	}, [])

	return (
		<div className="GroupInside_member">
			<div className="MemberProfile">
				<div className="MemberPfp" onClick={viewFriendProfile} style={{backgroundImage: `url(${member.pfp})`,
														backgroundRepeat: "no-repeat",
														backgroundSize: "cover"}}>
					<div className={`MemberStatus ${member.statut ? "" : "connected"}`}></div>
				</div>
				<div className="MemberName">{member.name}</div>
			</div>
			<div className="Member_things">
				<p>{errorMsg}</p>
				<div className="Member_Btn">
					{ admin && <button className="Member_MakeAdmin" title="Add as admin" onClick={makeAdmin}><GrUserAdmin size={25} /></button> }
					{ users.name !== member.name && <button className="Member_AddFriendBtn" title="Send friend request" onClick={inviteFriend}><AiOutlineUsergroupAdd size={30}/></button> }
					{ admin && <button className="Member_DelUserFromGroup" title="Remove from the group" onClick={removeUserFromGroup}><AiOutlineUsergroupDelete size={30}/></button> }
					{ admin &&
						<div className="Member_MuteUser">
							<button title="Mute for some time" onClick={Mute}><BsVolumeMute size={30} /></button>
							<select className="manageTimeToMute" id="time-select" onChange={changeTime}>
								<option value="300000">5 min</option>
								<option value="1800000">30 min</option>
								<option value="3600000">1 hour</option>
							</select>
						</div>
					}
					{ users.name !== member.name && <button className="Member_BlockUser" title="Block the user" onClick={blockUser}><MdBlockFlipped size={30}/></button> }
				</div>
				<div className="Member_info">
					<div className="Member_infoMessage">Level: {member.level}</div>
					<div className="Member_infoStatus">Score: {member.score}</div>
				</div>
			</div>
		</div>
	);
}