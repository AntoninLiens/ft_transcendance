import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../..";
import HistoryMatch from "./components/HistoryMatch";
import NavBar from "../../components/NavBar/NavBar";
import axios from "../../utils/axios";
import "./History.scss"

export default function History() {
	const { users } = useContext(AuthContext);
	const [ history, setHistory ] = useState<any[]>([]);

	const getHistory = async () => {
		const res = await axios.get("user/history")
		.then((res) => { return res.data })
		.catch((err) => { console.log("Get history error: ", err); return null });
		if (res) setHistory(res);
	}

	useEffect(() => {
		getHistory();
	}, []);

	return (
		<div className="historyPage">
			<NavBar />
			<div className="history_box">
				<div className="history_title">
					<h2>Disco-PONG</h2>
					<h1>History</h1>
				</div>
				<div className="history_games">
					{history.map((match: any, index: number) => {
						if (match.winner.name === users.name)
							return <HistoryMatch p1={users.name} p2={match.looser.name} image1={users.pfp} image2={match.looser.pfp} result={1} key={index}/>
						else
							return <HistoryMatch p1={users.name} p2={match.winner.name} image1={users.pfp} image2={match.winner.pfp} result={0} key={index}/>
					})}
				</div>
			</div>
		</div>
	);
}