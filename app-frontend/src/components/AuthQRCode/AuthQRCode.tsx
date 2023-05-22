import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../..';
import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "../../utils/axios"
import "./AuthQRCode.scss"

export default function AuthQRCode() {
	//States
	const { setRoutesBlocked, users } = useContext(AuthContext);
	const inputRef = useRef<HTMLInputElement>(null);
	const [ errorMsg, setErrorMsg ] = useState<string>("");
	const [ code, setCode ] = useState<string>("");
	const navigate = useNavigate();

	//Behavior
	const sendCode = async () => {
		setErrorMsg("");
		await axios.post("2FA/activate", { code: code.replace(/\D/g, '') })
		.then((res) => {
			setRoutesBlocked(false);
			navigate(`/homePage/`);
		})
		.catch(() => {
			setErrorMsg("Incorrect code");
		})
		setCode("");
	}

	const handleChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
		let newCode = event.target.value.replace(/\D/g, '');
		newCode = newCode.replace(/(\d{3})(\d{1,3})/, '$1 $2');
		setCode(newCode);
	}

	useEffect(() => {
		if (inputRef.current)
			inputRef.current.focus();
	}, []);

	//Render
	return (
		<div className='QRAuthPage'>
			<div className="QRAuthTitle">
				<h2>Disco-PONG</h2><h1>2FA</h1>
			</div>
			<div className="QRAuthBox">
				<input className='QRCode'
				ref={inputRef}
				type="text"
				onChange={ handleChangeCode }
				placeholder="code"
				value={code}
				maxLength={7} />

				<button className='QRButton' onClick={sendCode}>Send</button>
			</div>
			<p>{errorMsg}</p>
		</div>
	);
}