import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState, useEffect } from "react";
import axios, { setAuthToken, removeAuthToken } from "../utils/axios"

export function createAuth() {
	const defaultUser = {
		id: 0,
		isTwoFA: false,
		secret: "",
		name: "",
		password: "",
		token: "",
		pfp: "",
		score: 0,
		level: 0,
		xp: 0,
		coins: 0,
		isPlaying: false,
		isIntra: false,
	};

	type UpdateType = Dispatch<SetStateAction<typeof defaultUser>>;
	const defaultUpdate: UpdateType = () => defaultUser;

	const signup = async (name: string, password: string) => defaultUser;   
	const signin = async (name: string, password: string) => defaultUser;
	const signout = async () => "null";
	const profile = async (token: string) => defaultUser;

	type AuthContextType = {
		users: typeof defaultUser;
		isViewing: string | null;
		friendProfile: string;
		oserProfile: string;
		routesBlocked: boolean;
		setUsers: UpdateType;
		setIsViewing: Dispatch<SetStateAction<string | null>>;
   		setFriendProfile: Dispatch<SetStateAction<string>>;
		setOserProfile: Dispatch<SetStateAction<string>>;
		setRoutesBlocked: Dispatch<SetStateAction<boolean>>;
		signup: typeof signup;
		signin: typeof signin;
		signout: typeof signout;
		profile: typeof profile;
	}

	const authCtx = createContext<AuthContextType>({
		users: defaultUser,
		isViewing: null,
		friendProfile: "",
		oserProfile: "",
		routesBlocked: true,
		setUsers: defaultUpdate,
		setIsViewing: () => {},
    	setFriendProfile: () => {},
		setOserProfile: () => {},
		setRoutesBlocked: () => {},
		signup: signup,
		signin: signin,
		signout: signout,
		profile: profile
	});

	function AuthProvider(props: PropsWithChildren<{}>) {
		const [ users, setUsers ] = useState(defaultUser);
		const [ isViewing, setIsViewing ] = useState<string | null>(null);
		const [ friendProfile, setFriendProfile ] = useState<string>("");
		const [ oserProfile, setOserProfile ] = useState<string>("");
		const [ routesBlocked, setRoutesBlocked ] = useState<boolean>(false);

		const signup =  async (name: string, password: string) => {
			const accessToken = await axios.post("auth/register", { name, password, pfp: "http://localhost:5000/uploads/bread.png" })
			.then(res => { return (res.data) })
			.catch(err => {
				if (err.response.data.message === "User already exists")
					throw("User already exists");
				else if (err.response.data.message[0] === "name should not be empty")
					throw("Name should not be empty");
				else if (err.response.data.message[1] === "password should not be empty")
					throw("Password should not be empty");
				else if (err.response.data.message[0] === "password must be longer than or equal to 7 characters")
					throw("Password must be longer than or equal to 7 characters");
				else if (err.response.data.message[0] === "name must be shorter than or equal to 10 characters")
					throw("Name must be shorter than or equal to 10 characters");
			});

			if (!accessToken)
				throw ("Token not found");
			
			return await profile(accessToken)
			.then(res => { return (res) })
			.catch(err => { throw(err) })
		};
		
		const signin = async (name: string, password: string) => {
			const accessToken = await axios.post("auth/login", { name, password })
			.then(res => { return (res.data) })
			.catch(err => { throw(err.response.data.message) });
			
			if (!accessToken)
				throw ("Token not found");

			return await profile(accessToken)
			.then(res => { return (res) })
			.catch(err => { throw(err) })
		};
		
		const profile = async (token: string) => {
			removeAuthToken();
			localStorage.clear();
			setAuthToken(token);
			localStorage.setItem("token", token);
			const user = await axios.get("user/profile")
			.then(res => { return (res.data) })
			.catch(() => { return null })
			
			if (!user) {
				setUsers(defaultUser);
				throw ("User not found");
			}
			else {
				setUsers({
					id: user.id,
					isTwoFA: user.isTwoFA,
					secret: user.secret,
					name: user.name,
					password: user.password,
					token: token,
					pfp: user.pfp,
					score: user.score,
					level: user.level,
					xp: user.xp,
					coins: user.coins,
					isPlaying: user.isPlaying,
					isIntra: user.isIntra,
				});
			}
			if (!user.isTwoFA)
				setRoutesBlocked(false);
			return user;
		};

		const signout = async () => {
			setUsers(defaultUser);
			localStorage.removeItem("token");
			return "null";
		};

		useEffect(() => {
			const Profile = async () => {
				const token = localStorage.getItem("token");
				if (token) {
					return await profile(token)
					.then(res => { return (res) })
					.catch(err => { throw(err) })
				}
			}
			Profile()
			.catch(err => { console.log("Profile error: ", err) });

			return (() => {
				setUsers(defaultUser);
				localStorage.removeItem("token");
			});
		}, []);

		return (
			<authCtx.Provider value={{
				users,
				isViewing,
				friendProfile,
				oserProfile,
				routesBlocked,
				setUsers,
				setIsViewing,
        		setFriendProfile,
				setOserProfile,
				setRoutesBlocked,
				signup,
				signin,
				signout,
				profile
			}}
			{...props} />
		);
	};
	return { authCtx, AuthProvider } as const;
}