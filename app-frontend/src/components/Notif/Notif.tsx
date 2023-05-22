import { useState, useContext, useEffect } from "react";
import { WsContext } from "../..";
import React from "react";
import "./Notif.scss"

const Notif: React.FC = () => {
	var color = ["red", "yellow", "blueviolet", "orange", "magenta", "white", "cyan", "mediumspringgreen", "deepskyblue"];
	const [rand] = useState(Math.floor(Math.random() * color.length));

	const { notifMessage, setNotifMessage } = useContext(WsContext)

	useEffect(() => {
		setTimeout(() => {
			setNotifMessage("");
		}, 3000);
	}, []);

	return (
		<div className="NotifPage" style={{background: color[rand]}}>{notifMessage}</div>
	);
};

export default Notif;