import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../..";
import { GrClose } from "react-icons/gr";
import axios from "../../../../../utils/axios";
import Member from "./Members/Member";
import "./GroupMembers.scss";

export enum	groupStatus {
	"owner",
	"admin",
	"member"
}

type GroupMembersProps = {
	setAffPage: any;
	group_id: number
};

export default function GroupMembers({ setAffPage, group_id }: GroupMembersProps) {
	// States
	const { users } = useContext(AuthContext);
	const [ group, setGroup ] = useState<any>();
	const [ update, setUpdate ] = useState<boolean>(false);
	const [ status, setStatus ] = useState<groupStatus>(groupStatus.member);
	const [ newPassword, setNewPassword ] = useState<string>("");
	const [ errorMsg, setErrorMsg ] = useState<string>("");

	// Behavior
	const getGroup = async () => {
		await axios.get("group/get?group_id=" + group_id)
		.then(res => {
			setGroup(res.data);
			if (res.data.owner.name === users.name) setStatus(groupStatus.owner);
			res.data.admins.map((user: any) => { if (user.name === users.name) setStatus(groupStatus.admin); })
		})
		.catch(err => { console.log("Get group error: ", err); });
	}

	const changeGroupPassword = async () => {
		await axios.put("group/updatePassword", { groupName: group.name, password: newPassword })
		.catch(err => { console.log(err); setErrorMsg(err.response.data.message); setTimeout(() => {setErrorMsg("")}, 3000); });
		setNewPassword("");
	}

	const updateNewGroupPaswword = (e: any) => {
		setNewPassword(e.target.value);
	}

	useEffect(() => {
		getGroup();
	}, [update]);

	// Render
	return (
		<div className="GroupInside">
			<button className="social_cancelButton" onClick={() => setAffPage(3)}><GrClose size={24}/></button>
			<div className="groupInside_title">manage users</div>
			{ group &&
				<div className="groupInsideChangePassword">
					<input type="password" value={newPassword} placeholder="Change/Add group password" onChange={updateNewGroupPaswword}/>
					<button onClick={changeGroupPassword}>Change password</button>
					<p>{ errorMsg }</p>
				</div> }
			<div className="groupInside_body">
				{ group &&
					<Member update={update} setUpdate={setUpdate} admin={false} member={group.owner} groupName={group.name} /> }
				{ group && group.admins.map((member: any, index: number) => {
					return <Member update={update} setUpdate={setUpdate} admin={status === groupStatus.owner ? true : false} member={member} groupName={group.name} key={index} />
				})}
				{ group && group.members.map((member: any, index: number) => {
					return <Member update={update} setUpdate={setUpdate} admin={status === groupStatus.owner || status === groupStatus.admin ? true : false} member={member} groupName={group.name} key={index} />
				})}
			</div>
			<div className="groupInside_footer"></div>
		</div>
	);
}