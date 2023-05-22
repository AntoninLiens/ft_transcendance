import React, { useContext, useEffect, useState } from "react";
import { AuthContext, MatchmakingContext } from "../..";
import { useNavigate } from "react-router-dom";
import "./Matchmaking.scss";

const Matchmaking: React.FC = () => {
	const { acceptMatchmaking, refuseMatchmaking, isAccepted, isWaitingYou, opponent, disconnect } = useContext(MatchmakingContext);
	const { users } = useContext(AuthContext);
	const navigate = useNavigate();
	
	useEffect(() => {
		if (isWaitingYou && isAccepted) {
			const interval = setInterval(() => {
				disconnect();
				navigate("/pong");
				clearInterval(interval);
			}, 1000);
		}
	}, [isWaitingYou, isAccepted]);

	return (
		<div className="MatchmakingPage">
			<div className="MatchmakingBox">
				<h1>Match found</h1>
				<div className="opponents">
					<div className="opponent opponent1">
						<div className="frame">
							{!isAccepted && <div className="shadow_frame"></div>}
							{isAccepted && <div className="fire_frame"></div>}
							<div className="opponent_pfp opponent1_pfp" style={{backgroundImage: `url(${users.pfp})`,
																				backgroundRepeat: "no-repeat",
																				backgroundSize: "cover"}}></div>
						</div>
						<div className="opponent_name opponent1_name">{users.name}</div>
					</div>
					<span>VS</span>
					<div className="opponent opponent2">
						<div className="frame">
							{!isWaitingYou && <div className="shadow_frame"></div>}
							{isWaitingYou && <div className="fire_frame"></div>}
							<div className="opponent_pfp opponent2_pfp" style={{backgroundImage: `url(${opponent.pfp})`,
																				backgroundRepeat: "no-repeat",
																				backgroundSize: "cover"}}></div>
						</div>
						<div className="opponent_name opponent2_name">{opponent.name}</div>
					</div>
				</div>
				{ !isAccepted && <div className="MatchmakingForm">
					<p>Are you ready?</p>
					<div className="MatchmakingBoxBtn">
						<button className="MatchmakingBtn-item yes" onClick={acceptMatchmaking}>Yes</button>
						<button className="MatchmakingBtn-item no" onClick={refuseMatchmaking}>No</button>
					</div>
				</div> }
			</div>
		</div>
	);
}

export default Matchmaking;