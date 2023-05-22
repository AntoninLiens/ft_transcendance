import { useContext, useEffect, useState } from "react";
import { AuthContext, WsContext } from "../../../../..";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { BiMessageDetail } from "react-icons/bi";
import { MdOutlineCancel } from "react-icons/md";
import { FaUsersCog } from "react-icons/fa";
import axios from "../../../../../utils/axios";
import "./Group.scss"

interface GroupType {
	group: any;
	setAffPage: any;
	getGroupList: any;
}

const GroupElement: React.FC<GroupType> = ({ group, setAffPage, getGroupList }) => {
	// states
	const { users } = useContext(AuthContext);
	const [memberName, setMemberName] = useState<string>("");
	const [ errorMsg, setErrorMsg ] = useState<string>("");
	const { setMessageData, setIsOnChat, setGroup } = useContext(WsContext)

	// behavior
	const handleAddMember = async () => {
		await axios.post("group/addMember", { userName: memberName, groupName: group.name })
		.catch(err => { setErrorMsg(err.response.data.message); setTimeout(() => { setErrorMsg(""); }, 3000) })
		setMemberName("");
	}

	const handleUpdateMemberName = (e: any) => {
		setMemberName(e.target.value);
	}

	const openChat = async () => {
		await axios.get("group/get?group_id=" + group.id)
		.then(res => { setMessageData({ group: res.data, message: [], group_id: res.data.id, friend: null, friend_id: -1 }); })
		.catch(err => { console.log("Group get id error: ", err); })
		setIsOnChat(true);
	}

	const leaveGroup = async () => {
		await await axios.put("group/leave", { groupName: group.name })
		.catch(err => { console.log("Leave group error: ", err); });
		getGroupList();
	}

	const changeStatus = async (e: any) => {
		await axios.put("group/changeStatus", { groupName: group.name, status: e.target.value })
		.catch(err => { console.log("Change group status error: ", err); });
	}

	const handleManageUsers = () => {
		setGroup(group);
		setAffPage(4);
	}

	useEffect(() => {
		if (group.owner.name === users.name) {
			if (group.status === 0)
				(document.getElementById("status-select") as HTMLInputElement).value = "public";
			else if (group.status === 1)
				(document.getElementById("status-select") as HTMLInputElement).value = "private";
		}
	}, [])

	// render
	return (
		<div className="group">
				<div className="group_info">
					<div className="group_info_column">
						<div className="group_name">{ group.name }</div>
						{ users.name === group.owner.name && <select className="manageStatus" name="status" id="status-select" onChange={changeStatus}>
							<option value="public">public</option>
							<option value="private">private</option>
						</select>}
					</div>
					<button className="manageUsers" onClick={handleManageUsers}><FaUsersCog size={30}/></button>
				</div>
				<div className="group_buttons">
					<div className="group_addMembers">
						<input type="text" value={memberName} onChange={handleUpdateMemberName} placeholder="Name of your future group mate" maxLength={10}/>
						<button className="group_Btn" title="ajoute tout tes meilleur potes ! :)" onClick={handleAddMember}><AiOutlineUsergroupAdd size={30}/></button>
						<p>{errorMsg}</p>
					</div>
					<div className="MandL">
						<button className="group_Btn" title="messagerie en ligne astrale telescopique" onClick={openChat}><BiMessageDetail size={30}/></button>
						<button className="group_Btn" title="leave group" onClick={leaveGroup}><MdOutlineCancel size={30}/></button>
					</div>
				</div>
			</div>
	);
}
export default GroupElement;