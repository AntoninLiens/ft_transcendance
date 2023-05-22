import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../..";
import "./ConnectPage.css"
import axios from "axios";

export default function ConnectPage() {
	
	// STATES

	const [loginName, setLoginName] = useState("");
	const [registerName, setRegisterName] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [errorLogin, setErrorLogin] = useState("");
	const [errorRegister, setErrorRegister] = useState("");
	const [registerPassword, setRegisterPassword] = useState("");
	const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
	const [ tabulation, setTabulation ] = useState<boolean>(false);

	const { signin, signup, signout } = useContext(AuthContext);
	
	const [hideOrDisplay, setHideOrDisplay] = useState(errorLogin !== "" ? "display" : "hide");
	const [hideOrDisplay2, setHideOrDisplay2] = useState(errorRegister !== "" ? "display" : "hide");

	const [sliderType, setSliderType] = useState("loginSlider");
	const [formBoxType, setFormBoxType] = useState("loginFormBox");
	const { setRoutesBlocked } = useContext(AuthContext);

	const navigate = useNavigate();
	
	// COMPONENTS
	
	/*Login*/
	
	const handleLogin = async () => {
		await signin(loginName, loginPassword)
		.then((res) => {
			setErrorLogin("");
			if (!res.isTwoFA)
				navigate(`/homePage/`);
			else
				setRoutesBlocked(true);
		})
		.catch((err) => setErrorLogin(err));
	};
	
	const updateLoginName = (event: any) => {
		setLoginName(event.target.value);
	};

	const updateLoginPassword = (event: any) => {
		setLoginPassword(event.target.value);
	};
	
	/*Register*/
	
	const handleRegister = async () => {
		if (registerConfirmPassword === registerPassword) {
			await signup(registerName, registerPassword)
			.then((res) => {
				setErrorRegister("");
				navigate(`/homePage/`);
			})
			.catch((err) => setErrorRegister(err));
		}
		else 
			setErrorRegister("Passwords do not match");

	};
	
	const updateRegisterName = (event: any) => {
		setRegisterName(event.target.value);
	};
	const updateRegisterPassword = (event: any) => {
		setRegisterPassword(event.target.value);
	};
	const updateRegisterConfirmPassword = (event: any) => {
		setRegisterConfirmPassword(event.target.value);
	};

	/*Style*/
	
	const handleSliderClick = (sliderType: string, formBoxType: string) => {
		tabulation ? setTabulation(false) : setTabulation(true);
		setSliderType(sliderType);
		setFormBoxType(formBoxType);
		setTimeout(() => {
			setErrorLogin("");
			setErrorRegister("");
		  }, 300);
	};

	useEffect(() => {
		const Signout = async () => { await signout() };
		Signout();
		errorLogin !== "" ? setHideOrDisplay("display") : setHideOrDisplay("hide");
		errorRegister !== "" ? setHideOrDisplay2("display") : setHideOrDisplay2("hide");
	}, [errorLogin, errorRegister, signout]);

	// RENDER

	return (
			<div className="connect">
				
				<div className="box">
					<div className={`slider ${sliderType}`}></div>
					
					<div className="btn">
						<button className="signin" onClick={() => handleSliderClick("loginSlider", "loginFormBox")}>Sign in</button>
						<button className="signup" onClick={() => handleSliderClick("registerSlider", "registerFormBox")}>Sign up</button>
					</div>

					<div className={`formBox ${formBoxType}`}>
						<div className="loginBox">
							<input onChange={updateLoginName} type="text" maxLength={10} placeholder="Username" tabIndex={tabulation ? -1 : 0}></input>
							<input onChange={updateLoginPassword} type="password" placeholder="Password" tabIndex={tabulation ? -1 : 0}></input>
							<div className={`loginError ${hideOrDisplay}`} tabIndex={tabulation ? -1 : 0}>{ errorLogin }</div>
							<button className="connectBtn" onClick={handleLogin} type="submit" tabIndex={tabulation ? -1 : 0}>Login</button>
						</div>

						<div className="registerBox">
							<input onChange={updateRegisterName} type="text" maxLength={10} placeholder="Username" tabIndex={tabulation ? 0 : -1}></input>
							<input onChange={updateRegisterPassword} type="password" placeholder="Password" tabIndex={tabulation ? 0 : -1}></input>
							<input onChange={updateRegisterConfirmPassword} type="password" placeholder="Confirm password" tabIndex={tabulation ? 0 : -1}></input>
							<div className={`registerError ${hideOrDisplay2}`} tabIndex={tabulation ? 0 : -1}>{ errorRegister }</div>
			 				<button className="connectBtn" onClick={handleRegister} type="submit" tabIndex={tabulation ? 0 : -1}>Register</button>
						</div>
					</div>
				</div>
				<a className="intraBtn" href='https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-e15c1e274c80e87f6b05664e1043288517a9df28a2e69bf2f5b8f69b381e9743&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth%2Foauth&response_type=code'>Connect with intra</a>
			</div>
	);
};
