import { ItemCategory } from "../../Items"
import "./itemIllustration.scss"

export default function ItemIllustartion({item, type}: any) {
	return (
		<div className="item_illustration">
			{type === 1 && <div className="item_small">
				{item.category === ItemCategory.Background &&
				<video autoPlay muted loop className="item_video">
					<source src={item.image} type="video/mp4"/>
				</video>}

				{item.category === ItemCategory.Pad &&
				<div className="item_box">
					<div className="item_pad" style={{background: `${item.image}`}}></div>
				</div>}

				{item.category === ItemCategory.Ball &&
				<div className="item_box">
					<div className="ball_box">
						<div className="item_ball" style={{background: `${item.image}`}}></div>
					</div>
				</div>}
			</div>}

			{type === 2 && <div className="item_big">
				{item.category === ItemCategory.Background &&
				<video autoPlay muted loop className="confirm_video">
					<source src={item.image} type="video/mp4"/>
				</video>}

				{item.category === ItemCategory.Pad &&
				<div className="big_box">
					<div className="big_pad_one" style={{background: `${item.image}`}}></div>
					<div className="big_pad_two" style={{background: `${item.image}`}}></div>
				</div>}

				{item.category === ItemCategory.Ball &&
				<div className="big_box">
					<div className="big_ball_box">
						<div className="big_ball" style={{background: `${item.image}`}}></div>
					</div>
				</div>}
			</div>}
		</div>
	);
}