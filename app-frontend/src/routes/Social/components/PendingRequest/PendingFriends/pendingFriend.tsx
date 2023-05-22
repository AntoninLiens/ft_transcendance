import { useContext } from "react";
import axios from "../../../../../utils/axios";
import { FcApprove, FcDisapprove } from "react-icons/fc"
import "./pendingFriend.css";
import { MdBlockFlipped } from "react-icons/md";
import { WsContext } from "../../../../..";

export default function PendingFriend({demander, setter}: any) {

	// state
	const { setPendingNotif } = useContext(WsContext);

	// behavior
	const acceptRequest = async () => {
		await axios.put("friends/accept", { name: demander.name })
		.catch(err => { console.log("Accept friend error: ", err); });
		
		await axios.get("friends/pending")
		.then(res => {
			if (res.data.length === 0)
				setPendingNotif(false);
			setter(res.data)
		})
		.catch(err => { console.log("Pending friend error: ", err); })
	}

	const declineRequest = async () => {
		await axios.delete(`friends/remove/${demander.name}`)
		.catch(err => { console.log("Remove friend error: ", err); });

		await axios.get("friends/pending")
		.then(res => {
			if (res.data.length === 0)
				setPendingNotif(false);
			setter(res.data)
		})
		.catch(err => { console.log("Pending friend error: ", err); });
	}

	const blockRequest = async () => {
		await axios.put("friends/block", { name: demander.name })
		.catch(err => { console.log("Block friend error: ", err); });

		await axios.get("friends/pending")
		.then(res => {
			if (res.data.length === 0)
				setPendingNotif(false);
			setter(res.data)
		})
		.catch(err => { console.log("Pending friend error: ", err); });
	}

	// render
	return (
		<div className="social_pending">
			<div className="social_pendingProfile">
				<div className="social_pendingPfp" style={{backgroundImage: `url(${demander.pfp})`,
														backgroundRepeat: "no-repeat",
														backgroundSize: "cover"}}>
				</div>
				<div className="social_pendingName">{demander.name}</div>
			</div>
			<div className="social_pendingButton">
				<button onClick={acceptRequest}><FcApprove size={25}/></button>
				<button onClick={declineRequest}><FcDisapprove size={25}/></button>
				<button onClick={blockRequest}><MdBlockFlipped size={25} color={"red"}/></button>
			</div>
		</div>
		);
}