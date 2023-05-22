import { useEffect, useState } from "react";
import { GrClose } from "react-icons/gr";
import axios from "../../../../utils/axios";
import Group from "./Group/Group";
import "./GroupPage.scss";

export default function GroupPage({setAffPage}: any) {
	// States
	const [groupList, setGroupList] = useState<any[]>([]);
	const [groupName, setGroupName] = useState("");
	const [groupPassword, setGroupPassword] = useState("");
	const [ errorMsg, setErrorMsg ] = useState<string>("");

	// Behavior
	const handleCreateGroup = async () => {
		await axios.post("group/create", { name: groupName, password: groupPassword === "" ? null : groupPassword })
		.catch(err => { setErrorMsg(err.response.data.message); setTimeout(() => {setErrorMsg("")}, 3000) });
		setGroupName("");
		setGroupPassword("");
		getGroupList();
	}

	const handleAddGroup = async () => {
		await axios.post("group/add", { name: groupName, password: groupPassword })
		.catch(err => { setErrorMsg(err.response.data.message); setTimeout(() => {setErrorMsg("")}, 3000); });
		setGroupName("");
		setGroupPassword("");
		getGroupList();
	}

	const updateGroupName = (e: any) => {
		setGroupName(e.target.value);
	};

	const updateGroupPassword = (e: any) => {
		setGroupPassword(e.target.value);
	};

	const getGroupList = async () => {
		await axios.get("group/list")
		.then(res => { setGroupList(res.data); })
		.catch(err => { console.log("Grouplist error: ", err); });
	}

	useEffect(() => {
		getGroupList();
	}, []);

	// Render
	return (
		<div className="social_group">
			<button className="social_cancelButton" onClick={() => setAffPage(0)}><GrClose size={24}/></button>
			<div className="social_fourTitle">
				<h1>Groups</h1>
			</div>
			<div className="group_createGroup">
				<div className="group_input">
					<p>{errorMsg}</p>
					<input type="text" value={groupName} placeholder="Group name" maxLength={12} className="group_nameInput" onChange={updateGroupName}/>
					<input type="password" value={groupPassword} placeholder="Group password" className="group_passwordInput" onChange={updateGroupPassword}/>
				</div>
				<button className="group_createButton" onClick={handleCreateGroup}>Create group</button>
				<button className="group_addButton" onClick={handleAddGroup}>Add group</button>
			</div>
			{
				groupList.map((group, index) => {
					return (
						<Group group={group} getGroupList={getGroupList} key={index} setAffPage={setAffPage}/>
					);
				})
			}
		</div>
	);
}