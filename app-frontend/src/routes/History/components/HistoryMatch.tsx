import { useEffect, useState } from "react";
import "./HistoryMatch.css";

export default function HistoryMatch({p1, p2, image1, image2, result}: any) {

	// state
	const [shortedP1, setShortedP1] = useState("");
	const [shortedP2, setShortedP2] = useState("");
	const [win1, setWin1] = useState("");
	const [win2, setWin2] = useState("");

	// behavior
	useEffect(() => {
		if (p1.length > 7)
			setShortedP1("shortedP1");
		if (p2.length > 7)
			setShortedP2("shortedP2");
		if (result === 1)
			setWin1("win1");
		else
			setWin2("win2");
	}, [p1, p2, result]);

	// render
	return (
		<div className="history_match">
			<div className="history_playerOne">
				<div className={`history_playerOnePfp ${win1}`} style={{
					backgroundImage: `url(${image1})`,
					backgroundRepeat: "no-repeat",
					backgroundSize: "cover"}}>
				</div>
				<div className={`history_playerOneName ${win1} ${shortedP1}`}>{p1}</div>
			</div>
			<div className="history_vs">VS</div>
			<div className="history_playerTwo">
				<div className={`history_playerTwoPfp ${win2}`} style={{
					backgroundImage: `url(${image2})`,
					backgroundRepeat: "no-repeat",
					backgroundSize: "cover"}}>
				</div>
				<div className={`history_playerTwoName ${win2} ${shortedP2}`}>{p2}</div>
			</div>
		</div>
	);
}