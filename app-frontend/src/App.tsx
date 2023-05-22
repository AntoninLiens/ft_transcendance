import { AuthContext, WsContext, MatchmakingContext } from ".";
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Matchmaking from "./components/Matchmaking/Matchmaking";
import AuthQRCode from "./components/AuthQRCode/AuthQRCode";
import ConnectPage from "./routes/ConnectPage/ConnectPage";
import Leaderbord from "./routes/Leaderboard/Leaderboard";
import HomePage from "./routes/HomePage/HomePage";
import Settings from "./routes/Settings/Settings";
import Profile from "./routes/Profile/Profile";
import History from "./routes/History/History";
import Notif from "./components/Notif/Notif";
import Social from "./routes/Social/Social";
import Chat from "./components/Chat/Chat";
import Pong from "./routes/Pong/Pong";
import Shop from "./routes/Shop/Shop";
import "./App.css";
import IntraConnect from "./routes/IntraConnect/IntraConnect";

function App() {

	const { users, isViewing, routesBlocked } = useContext(AuthContext);
	const { isCreated, connect } = useContext(MatchmakingContext);
	const { inviteGame, opponentFriend, isOnChat, notifMessage } = useContext(WsContext);

	if (inviteGame) {
		connect(true, opponentFriend.id);
	}

	if (users.name !== "") {
		return (
				<div className="App">
					{ !routesBlocked &&
						<Routes>
							<Route path={`/homePage/history`} element={<History/>} />
							<Route path={`/homePage/`} element={<HomePage/>} />
							<Route path={`/homePage/leaderboard`} element={<Leaderbord/>} />
							<Route path="/pong" element={<Pong viewer={isViewing}/>} />
							<Route path={`/homePage/profile`} element={<Profile/>} />
							<Route path={`/homePage/social`} element={<Social/>} />
							<Route path={`/homePage/settings`} element={<Settings/>} />
							<Route path="/shop" element={<Shop/>} />
						</Routes>
					}
					{ routesBlocked && 
						<Routes>
							<Route path={"/"} element={<AuthQRCode />} />
							<Route path={"/intraConnect"} element={<AuthQRCode />} />
						</Routes>
					}
					{ notifMessage !== "" && <Notif />}
					{ isCreated && <Matchmaking /> }
					{ isOnChat && <Chat /> }
				</div>
		);
	}
	else {

		return (
			<div className="App">
				<Routes>
					<Route path="/" element={<ConnectPage/>} />
					<Route path="/intraConnect" element={<IntraConnect />} />
				</Routes>
			</div>
		);
	}
}

export default App;