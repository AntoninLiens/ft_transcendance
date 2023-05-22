import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./NavBarRoutes.css"

interface Props {
	path: string;
	icon: React.ReactNode;
	notif: boolean;
}

const NavBarRoutes: React.FC<Props> = ({path, icon, notif}) => {
	// States
	const [hide, setHide] = useState("hide");

	useEffect(() => {
		if (notif)
			setHide("")
		else
			setHide("hide")
	}, [notif])

	// Render
	return (
		<li>
			<div className={`BtnNotif ${hide}`}></div>
			<Link to={path}>{icon}</Link>
		</li>
	);
}

export default NavBarRoutes;