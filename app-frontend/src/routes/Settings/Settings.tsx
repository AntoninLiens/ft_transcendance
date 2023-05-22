import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";
import { AuthContext } from "../..";
import NavBar from "../../components/NavBar/NavBar";
import axios from "../../utils/axios";
import QRCode from "qrcode.react";
import "./Settings.css";

export default function Settings() {

	// STATES

	const { users, signout, setUsers } = useContext(AuthContext);

	const [ controlToggle, setControlToggle ] = useState("isHide");
	const [ HUDToggle, setHUDToggle ] = useState("isHide");
	const [ userToggle, setUserToggle ] = useState("isHide");
	const [changePSWToggle, setChangePSWToggle] = useState("hide");
	const [ twoFA, setTwoFA ] = useState<string>(users.isTwoFA ? "active" : "disable");
	const [submitMessage, setSubmitMessage] = useState<String>("");

	const [upKeyValue, setUpKeyValue] = useState<string>("");
	const [downKeyValue, setDownKeyValue] = useState<string>("");
	const [passwordVal, setPasswordVal] = useState<string>("");
	const [scoreChecked, setScoreChecked] = useState<boolean>(true);
	const [profileChecked, setProfileChecked] = useState<boolean>(true);
	const [qrCodeChecked, setQrCodeChecked] = useState<boolean>(true);
	const [userName, setUserName] = useState<string>(users.name);
	const [ qrCode, setQrCode ] = useState<string>("");
	const [ twoFAcode, setTwoFAcode ] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);

	const navigate = useNavigate();

	// BEHAVIOR

	const showHideSettingItems = (type: string) => {
		if (type === "controls") {
			if (controlToggle === "isHide")
				setControlToggle("isShow");
			else
				setControlToggle("isHide");
		}
		else if (type === "HUD") {
			if (HUDToggle === "isHide")
				setHUDToggle("isShow");
			else
				setHUDToggle("isHide");
		}
		else if (type === "user") {
			if (userToggle === "isHide")
				setUserToggle("isShow");
			else
				setUserToggle("isHide");
		}
	}

	function intToChar(nbr: number) {
		return String.fromCharCode(nbr);
	}

	const handleButtonClick = (type: string) => {
		// a => 65 | z => 90 | <- => 37 | ^ => 38 | -> => 39 | V => 40
		if (type === "moveUp")
			document.addEventListener("keydown", handleMoveUpKeyPress);
		else if (type === "moveDown")
			document.addEventListener("keydown", handleMoveDownKeyPress);
	};

	const handleMoveUpKeyPress = (event: KeyboardEvent) => {
		if ((event.keyCode < 65 || event.keyCode > 90) && (event.keyCode < 37 || event.keyCode > 40))
			alert("You must chose an alphabetic key or an arrow key");
		else {
			if (event.keyCode >= 37 && event.keyCode <= 40) {
				if (event.keyCode === 37) 
					setUpKeyValue("Left arrow");
				else if (event.keyCode === 38) 
					setUpKeyValue("Up arrow");
				else if (event.keyCode === 39) 
					setUpKeyValue("Rigth arrow");
				else
					setUpKeyValue("Down arrow");
			}
			else
				setUpKeyValue(intToChar(event.keyCode));
		}
		document.removeEventListener("keydown", handleMoveUpKeyPress)
	}

	const handleMoveDownKeyPress = (event: KeyboardEvent) => {
		if ((event.keyCode < 65 || event.keyCode > 90) && (event.keyCode < 37 || event.keyCode > 40))
			alert("You must chose an alphabetic key or an arrow key");
		else {
			if (event.keyCode >= 37 && event.keyCode <= 40) {
				if (event.keyCode === 37) 
					setDownKeyValue("Left arrow");
				else if (event.keyCode === 38) 
					setDownKeyValue("Up arrow");
				else if (event.keyCode === 39) 
					setDownKeyValue("Rigth arrow");
				else
					setDownKeyValue("Down arrow");
			}
			else
				setDownKeyValue(intToChar(event.keyCode));
		}
		document.removeEventListener("keydown", handleMoveDownKeyPress)
	}

	const handleChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
		setPasswordVal(event.target.value)
	}

	const handleChangeUserName = (event: ChangeEvent<HTMLInputElement>) => {
		setUserName(event.target.value)
	}

	const handleSubmitSettings = () => {
		let error: String = "";
		if (upKeyValue === downKeyValue)
			error = "You cannot use the same key for moving up and moving down!";
		else if (changePSWToggle === "show")
		{
			if (passwordVal.length > 16)
				error = "Password length must be under 17 chars!";
			else if (passwordVal.length < 8)
				error = "Password length must be upper 7 chars!";
		}
		if (error === "") {
			changeSettings();
			error = "Settings saved!"
		}
		setSubmitMessage(error);
		setTimeout(() => {
			setSubmitMessage("");
		}, 3000);
		setChangePSWToggle("hide");
	}

	const changePswBtn = () => {
		if (changePSWToggle === "hide")
			setChangePSWToggle("show");
		else
			setChangePSWToggle("hide");
	}

	const activate2FA = async () => {
		if (!users.isTwoFA) {
			await axios.post("2FA/generate")
			.then(res => {
				setQrCode(res.data);
				setTwoFA("enable");
				if (inputRef.current)
					inputRef.current.focus();
		})
			.catch(err => { console.log(err) });
		}
	}

	const disable2FA = async () => {
		await axios.put("2FA/deactivate")
		.then(() => { 
			setUsers({ ...users, isTwoFA: false, secret: "" });
			setTwoFA("disable");
		})
		.catch(err => { console.log(err) });
	}

	const send2FAcode = async () => {
		await axios.post("2FA/activate", { code: twoFAcode.replace(/\D/g, '') })
		.then(res => {
			setUsers({ ...users, isTwoFA: true });
			setTwoFA("active");
			setTwoFAcode("");
		})
		.catch(err => { setSubmitMessage("Incorrect code"); setTimeout(() => setSubmitMessage(""), 3000) });
	}

	const updateTwoFAcode = (event: ChangeEvent<HTMLInputElement>) => {
		let newTwoFACode = event.target.value.replace(/\D/g, '');
		newTwoFACode = newTwoFACode.replace(/(\d{3})(\d{1,3})/, '$1 $2');
		setTwoFAcode(newTwoFACode);
	}
	
	const getSettings = async () => {
		const res = await axios.get("settings/user")
		.then(res => { return res.data })
		.catch(err => { return null });

		setUpKeyValue(res.moveUp);
		setDownKeyValue(res.moveDown);
		setScoreChecked(res.showScore);
		setProfileChecked(res.showProfile);
		setQrCodeChecked(res.enableQrCode);
	}

	const changeSettings = async () => {
		await axios.put("settings/user", {
			"moveUp": upKeyValue,
			"moveDown": downKeyValue,
			"showScore": scoreChecked,
			"showProfile": profileChecked,
			"enableQrCode": qrCodeChecked,
		})
		.catch(err => { console.log("error", err) });

		if (changePSWToggle === "show") {
			await axios.put("user/updatePassword", {
				"password": passwordVal
			});
		}
		if (userName !== users.name) {
			await axios.put("user/updateName", {
				"name": userName
			});
			signout();
			navigate("/");
		}
		
	}

	useEffect(() => {
		getSettings();
	}, []);

	useEffect(() => {
		if (inputRef.current)
			inputRef.current.focus();
	}, [twoFA]);
	
	// RENDER

	return (
		<div className="settingsPage">
			<NavBar />
			<div className="settingsTitle">
				<h2>Disco-PONG</h2>
				<h1>Settings</h1>
			</div>
			<div className="mySettings">

				<div className="controls settingsItem">
					<button onClick={() => showHideSettingItems("controls")} className="controlsButton settingsButton">Controls</button>
					<div className={`mainSettingsItems ${controlToggle}`}>
						<div className="moveUp settingsPair">
							<div className="settingsKey">Move up</div>
							<button onClick={() => handleButtonClick("moveUp")} className="settingsVal">{upKeyValue}</button>
						</div>
						<div className="moveDown settingsPair">
							<div className="settingsKey">Move down</div>
							<button onClick={() => handleButtonClick("moveDown")} className="settingsVal">{downKeyValue}</button>
						</div>
					</div>
				</div>

				<div className="user settingsItem">
					<button onClick={() => showHideSettingItems("user")} className="userButton settingsButton">User</button>
					<div className={`mainSettingsItems ${userToggle}`}>
						<div className="password settingsPair">
							<div className="settingsKey">Password
								<div title="Will disconnect"><FaInfoCircle /></div>
							</div>
							<input onChange={handleChangePassword} type="password" className={`settingsVal ${changePSWToggle}`} value={passwordVal}/>
							<button className={`settingsVal ${changePSWToggle === "hide" ? "show" : "hide"}`} onClick={changePswBtn}>Change password</button>
						</div>

						{ !users.isIntra && <div className="userName settingsPair">
							<div className="settingsKey">Username
								<div title="Will disconnect"><FaInfoCircle /></div>
							</div>
							<input className="settingsVal" onChange={handleChangeUserName} value={userName}/>
						</div> }

						<div className="QrCode settingsPair">
							<div className="settingsKey">Enable 2FA</div>
							<button className={`activate2FABtn ${twoFA}`} onClick={activate2FA} >Activate 2FA</button>
							{ twoFA === "active" ? <button className="activeMessage" onClick={disable2FA}>Disable 2FA</button> : null }
							<div className={`${twoFA}`}>
								<QRCode value={qrCode} />
								<div className="TwoFAcodeSender">
									<input className="settingsVal input2FA" ref={inputRef} type="text" value={twoFAcode} maxLength={7} onChange={updateTwoFAcode} />
									<button className="send2FAcodeBtn" onClick={send2FAcode} >send code</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="submitMSG settingsItem">{submitMessage}</div>
				<button className="submitButton" onClick={handleSubmitSettings}>Save</button>
			</div>
		</div>
	);
}

// reset settings by default
// alert msg when exit settings without saving
