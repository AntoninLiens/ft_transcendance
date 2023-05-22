import { useContext, useEffect, useState } from "react";
import { GoPencil } from "react-icons/go";
import { AuthContext } from "../..";
import { GiMoneyStack } from "react-icons/gi"
import NavBar from "../../components/NavBar/NavBar";
import axios from "../../utils/axios";
import "./Profile.css"

export default function Profile() {

	// States
	const { users, profile, oserProfile, setOserProfile } = useContext(AuthContext);
	const [ background, setBackground ] = useState<string>("");
	const [victories, setVictories] = useState<any[]>([]);
	const [defeats, setDefeats] = useState<any[]>([]);
	const [ currentProfile, setCurrentProfile ] = useState<any>({});
	const [ xpPercent, setXpPercent ] = useState<number>(0);

	// Behaviors
	const getUSerProfile = async () => {
		const name = oserProfile === "" ? users.name : oserProfile;

		 axios.get("user/nameProfile?name=" + name)
		.then(res => {
			if (background === "") setBackground(res.data.background);
			setCurrentProfile(res.data);
			getVictories(res.data.name);
			getDefeats(res.data.name);
			setXpPercent((res.data.xp / (10 + res.data.level * 5)) * 100);
		})
		.catch(err => { console.log("Profile error : ", err); });
	}

	const getVictories = async (name: string) => {
		await axios.get("game/victories?name=" + name)
		.then(res => { setVictories(res.data) })
		.catch(err => { console.log("Victories error : ", err) });
	}

	const getDefeats = async (name: string) => {
		await axios.get("game/defeats?name=" + name)
		.then(res => { setDefeats(res.data) })
		.catch(err => { console.log("Defeats error : ", err) });
	}

	const uploadPfp = async (e: any) => {
		if (e.target.files) {
			const data = new FormData();
			data.append("file", e.target.files[0]);

			await axios.postForm("user/uploadPfp", data)
			.then(res => { console.log("Edit pfp success : ", res.data) })
			.catch(err => { console.log("Edit pfp error : ", err) });

			profile(users.token);
		}
	}

	const editPfp = async () => {
		document.getElementById("profile_edit")?.click();
	}

	const handleCheat = async () => {
		await axios.put("user/cheatCode")
		.then(res => { console.log("Cheater!") })
		.catch(err => { console.log("Cheh Cheater!!!") })
		getUSerProfile();
	}

	useEffect(() => {
		getUSerProfile();
		return () => { setOserProfile(""); };
	}, [ background ]);

	// Render
	return (
		<div className="profilePage">
			<NavBar />
			{ background !== "" && <video autoPlay muted loop className="profile_animated_background">
				<source src={background} type="video/mp4"/>
			</video> }
			<div className="profile_box">
				<div className="profile_pfp" style={{
					backgroundImage: `url(${currentProfile.pfp})`,
					backgroundRepeat: "no-repeat",
					backgroundSize: "cover" }}>
				</div>
				{ oserProfile === "" && <input id="profile_edit" type="file" accept="image/*" style={{display: "none"}} onChange={uploadPfp}/> }
				{ oserProfile === "" && <button className="profile_edit" onClick={editPfp}><GoPencil size={24} color="grey"/></button> }
				<div className="profile_name">{currentProfile.name}</div>
				<div className="profile_wins">Victories: {victories.length}</div>
				<div className="profile_loose">Defeats: {defeats.length}</div>
				<div className="profile_coins">Coins: {currentProfile.coins}</div>
				<div className="profile_score">Score: {currentProfile.score}</div>
				<div className="profile_lvl">Level: {currentProfile.level}</div>
				<div className="profile_xpBar">
					<div className="profile_xp" style={{ width: `${xpPercent}%` }}></div>
				</div>
			</div>
			{false && <button className="cheat_code" onClick={handleCheat}><GiMoneyStack size={100} color={"greenyellow"}/></button>}
		</div>
	);
}