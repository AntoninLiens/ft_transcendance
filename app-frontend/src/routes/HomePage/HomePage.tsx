import { AuthContext, MatchmakingContext } from "../../";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye } from "react-icons/ai";
import NavBar from "../../components/NavBar/NavBar";
import axios from "../../utils/axios";
import "./HomePage.css"

export default function HomePage() {

	// States
	const [ message, setMessage ] = useState<string>("");
	const { connect, disconnect, searchTimer, setSearchTimer } = useContext(MatchmakingContext);
	const { users, setIsViewing } = useContext(AuthContext);
	const navigate = useNavigate();

	var color = ["red", "blue", "yellow", "blueviolet", "orange", "magenta", "white", "cyan", "mediumspringgreen", "deepskyblue"];
	const [rand] = useState(Math.floor(Math.random() * color.length));

	// Behavior
	const handleConnect = async () => {
		await axios.get("user/isPlaying")
		.then((res) => {
			if (res.data)
				navigate("/pong");
			else
				connect(false, -1);
		})
		.catch((err) => {console.log("Get playing users error: ", err)});
	}

	const handleDisconnect = async () => {
		disconnect();
	}

	const handleViewer = async () => {
		await axios.get("user/playingUsers")
		.then((res) => {
			if (res.data.length !== 0) {
				setIsViewing("");
				navigate("/pong");
			}
			else {
				setMessage("No one is playing");
				setTimeout(() => {setMessage("")}, 2000);
		}})
		.catch((err) => { console.log("Connect viewer error: ", err); })
	}

	useEffect(() => {
		if (searchTimer.isSearching) {
			const interval = setInterval(() => {
				setSearchTimer({ ...searchTimer, seconds: searchTimer.seconds + 1 });
				if (searchTimer.seconds === 59)
					setSearchTimer({ ...searchTimer, minutes: searchTimer.minutes + 1, seconds: 0 });
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [searchTimer, setSearchTimer]);

	// Render
	return (
		<div className="HomePage" style={{background: color[rand]}}>
			<NavBar />
			<div className="centerBox">
				<div className="title">
					<h1>Disco</h1>
					<h1>PONG</h1>
				</div>
				<div className="play">
					{ !searchTimer.isSearching && <button className="PlayCancel" onClick={handleConnect}>PLAY</button> }
					{ searchTimer.isSearching && <button className="PlayCancel" onClick={handleDisconnect}>CANCEL</button> }
					{ searchTimer.isSearching && <div className="timer">{searchTimer.minutes < 10 ? "0" + searchTimer.minutes : searchTimer.minutes}:{ searchTimer.seconds < 10 ? "0" + searchTimer.seconds : searchTimer.seconds }</div> }
				</div>
				<button id="viewer" onClick={handleViewer}><AiFillEye size={24}/></button>
				<div className="message">{message}</div>
			</div>
		</div>
	);
}