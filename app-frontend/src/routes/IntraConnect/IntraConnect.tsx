import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../..";

export default function IntraConnect() {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const { profile, setRoutesBlocked } = useContext(AuthContext);
	const navigate = useNavigate();
	
	useEffect(() => {
		const token = searchParams.get("token");
		const twoFa = searchParams.get("twoFa");
		if (token) {
			profile(token);
			if (searchParams.get("type") === "register") { navigate(`/homePage/settings`); }
			else if (twoFa === "true") { setRoutesBlocked(true); }
			else { navigate(`/homePage/`); }
		}
	}, []);
	
	return (
		<div>
			Intra Connecting
		</div>
	);
}