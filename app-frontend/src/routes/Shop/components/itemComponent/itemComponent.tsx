import { ImCoinDollar } from "react-icons/im";
import { useEffect, useState } from "react";
import { ItemCategory } from "../../Items";
import ItemIllustartion from "../itemIllustration/itemIllustration";
import axios from "../../../../utils/axios";
import "./itemComponent.scss";

export default function ItemComponent({item, reload, setReload}: any) {
	// states
	const [confirm, setConfirm] = useState<boolean>(false);
	const [isOwned, setIsOwned] = useState<number>(0);

	// behavior
	const handleBuy = () => {
		setConfirm(true);
	}

	const handleRefuse = () => {
		setConfirm(false);
	}

	const getItem = async () => {
		await axios.get("user/item?id="+ (item.id - 1))
		.then(res => { if (res.data) setIsOwned(res.data.statut === 0 ? 1 : 2); })
		.catch(err => { console.log("Item error : ", err); });
	}

	const buyItem = async () => {
		await axios.post("user/buyItem", { itemId: item.id - 1 })
		.then(() => { setIsOwned(1); })
		.catch(err => { console.log("Buy error : ", err.response.data.message); });

		setReload(true);
	}

	const equipUnequip = async () => {
		await axios.put("user/changeItemStatut", { itemId: item.id - 1 })
		.then(() => { isOwned === 1 ? setIsOwned(2) : setIsOwned(1); })
		.catch(err => { console.log("Equip error : ", err.response.data.message); });
		
		setReload(true);
	}

	useEffect(() => {
		getItem();
	}, []);

	// render
	return (
		<li className="shopItem">
			<ItemIllustartion item={item} type={1}/>
			<div className="item_title">{item.name}</div>
			{isOwned === 0 && <div className="buy_item">
				<button className="buy_btn" onClick={handleBuy}>BUY</button>
				<div className="item_price">{item.price}
					<ImCoinDollar className="item_icon" color={"gold"} size={"24px"}/>
				</div>
				{confirm && <div className="confirm_buy">
					<div className="confirm_title">{item.name}</div>
					<ItemIllustartion item={item} type={2}/>
					<div className="confirm_type">
						{item.category === ItemCategory.Background && "Type: Background"}
						{item.category === ItemCategory.Pad && "Type: Pad"}
						{item.category === ItemCategory.Ball && "Type: Ball"}
					</div>
					<div className="confirm_value">Price: <div className="confirm_price">{item.price}<ImCoinDollar color={"gold"} size={"24px"}/></div></div>
					<div className="confirm_message">Confirm purchase ?</div>
					<div className="confirm_button">
						<button className="confirm_yes" onClick={buyItem}>Accept</button>
						<button className="confirm_no" onClick={handleRefuse}>Refuse</button>
					</div>
				</div>}
			</div>}
			{isOwned === 1 && <button className="equip_item" onClick={equipUnequip}>EQUIP</button>}
			{isOwned === 2 && <button className="unequip_item" onClick={equipUnequip}>UNEQUIP</button>}
		</li>
	);
}