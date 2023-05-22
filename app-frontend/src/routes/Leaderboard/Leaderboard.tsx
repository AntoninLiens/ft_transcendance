import NavBar from "../../components/NavBar/NavBar";
import "./Leaderboard.css"

import { useState, useEffect } from "react";
import axios from "../../utils/axios";

const Leaderboard = () => {

	// States

	const [ threeFirstLeaderboard, setThreeFirstLeaderboard ] = useState<any[]>([]);
	const [ otherLeaderboard, setOtherLeaderboard ] = useState<any[]>([]);

	// Behavior

	const getLeaderboard = async () => {
		await axios.get("user/leaderboard")
		.then(res => {
			setThreeFirstLeaderboard(res.data.slice(0, 3));
			setOtherLeaderboard(res.data.slice(3, 10));
		})
		.catch(err => { console.log("Leaderboard error : ", err) });
	}

	useEffect(() => {
		getLeaderboard();
	}, [])
	
	// Render

	return (
		<div className="leaderboardPage">
			<NavBar />
			<div className="topPlayers">
				<div className="top3">
					{ threeFirstLeaderboard.map((user: any, index: number) => {
						return (
							<div key={index} className="top3Box">
								<div className={`name name-${index + 1}`}>{user.name}</div>
								<div className={`podiumItem  podiumItem-${index + 1}`}>{index + 1}</div>
							</div>
					)})}
				</div>
				<ul className="top10">
					{ otherLeaderboard.map((user: any, index: number) => {
						return (
							<li key={index} className="top10Item">{index + 4} | {user.name}</li>
					)})}
				</ul>
			</div>
		</div>
	);
}

export default Leaderboard;