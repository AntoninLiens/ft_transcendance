import { MdLeaderboard, MdSettingsSuggest, MdMenu, MdClose } from "react-icons/md"
import { BiJoystickButton, BiLogOutCircle } from "react-icons/bi"
import { BsClockHistory, BsPeopleFill } from "react-icons/bs"
import { useContext, useEffect, useState } from "react";
import { FaUser, FaShoppingCart } from "react-icons/fa"
import { AuthContext, WsContext } from "../..";
import { Link } from "react-router-dom";
import NavBarRoutes from "./components/NavBarRoutes"
import "./NavBar.css";

export default function NavBar() {
	// States
	const { users, signout } = useContext(AuthContext);

	const [aff, setAff] = useState("unfold");
	const [fold, setFold] = useState("hide");
	const [unfold, setUnfold] = useState("");

	const [navNotif, setNavNotif] = useState("hide");
	const { notif, setNotif, inviteNotif, pendingNotif, setInviteNotif } = useContext(WsContext);

	// Behavior
	function affNavBar() {
		if (aff === "unfold") {
			setAff("fold");
			setUnfold("hide");
			setFold("");
			setNotif(false);
		}
		else {
			setAff("unfold");
			setFold("hide");
			setUnfold("");
			if (pendingNotif && inviteNotif)
				setNotif(true);
		}
	}

	const handleSignout = async () => {
		await signout();
	}

	useEffect(() => {
		if (pendingNotif && inviteNotif)
			setNotif(true);
		if (notif)
			setNavNotif("");
		else
			setNavNotif("hide");
	}, [notif, pendingNotif]);

	// Render
	return (
		<div className={`NavBar ${aff}`}>
			<a id="isHide" className={`affNavBar ${unfold}`} onClick={affNavBar}>
				<div className={`NavBarNotif ${navNotif}`}></div>
				<MdMenu size={24}/>
			</a>
			<a id="isHere" className={`affNavBar ${fold}`} onClick={affNavBar}><MdClose size={24} /></a>
			<ul>
				<NavBarRoutes path='/homePage/' icon={<BiJoystickButton size={24}/>} notif={false}/>
				<NavBarRoutes path={`/homePage/profile`} icon={<FaUser size={24}/>} notif={false}/>
				<NavBarRoutes path={`/shop`} icon={<FaShoppingCart size={24}/>} notif={false}/>
				<NavBarRoutes path={`/homePage/leaderboard`} icon={<MdLeaderboard size={24}/>} notif={false}/>
				<NavBarRoutes path={`/homePage/history`} icon={<BsClockHistory size={24}/>} notif={false}/>
				<NavBarRoutes path={`/homePage/social`} icon={<BsPeopleFill size={24}/>} notif={inviteNotif}/>
				<li className="signout"><Link to={'/'} onClick={handleSignout}><BiLogOutCircle size={24}/></Link></li>
				<div className="settings"><NavBarRoutes path={`/homePage/settings`} icon={<MdSettingsSuggest size={24}/>} notif={false}/></div>
			</ul>
		</div>
	);
}