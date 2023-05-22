import { useContext, useEffect, useState } from "react";
import { ImCoinDollar } from "react-icons/im";
import { AuthContext } from "../..";
import Items, { Item } from "./Items"
import ItemComponent from "./components/itemComponent/itemComponent";
import NavBar from "../../components/NavBar/NavBar"
import axios from "../../utils/axios";
import "./Shop.scss"

export default function Shop() {
	// states
	const { users } = useContext(AuthContext);
	const [ profile, setProfile ] = useState<any>({});
	const [ reload, setReload ] = useState<boolean>(false);

	// behavior
	const getUserProfile = async () => {
		 axios.get("user/nameProfile?name=" + users.name)
		.then(res => {
			setProfile(res.data);
		})
		.catch(err => { console.log("Profile error : ", err); });
	}

	useEffect(() => {
		getUserProfile();
		if (reload === true)
			setReload(false);
	}, [ profile.coins, reload ]);

	// render
	return (
		<div className="ShopPage">
			<NavBar />
			<div className="shopBox">
				<div className="shopTitle">
					<h2>{reload}</h2>
					<h1>SHOP</h1>
				</div>
				<div className="shopWallet">
					<div className="shopMoney">
						<div className="shopYouHave">You have : </div>
						{profile.coins}<ImCoinDollar color={"gold"} size={"24px"}/>
					</div>
				</div>
				<ul className="shopList">
					{ !reload && Items.map((item: Item, index: number) => {
						return (
							<ItemComponent item={item} reload={reload} setReload={setReload} key={index} />
						);
					})}
				</ul>
			</div>
		</div>
	)
}