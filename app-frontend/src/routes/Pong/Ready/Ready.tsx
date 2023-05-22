import { useEffect, useState } from "react";
import "./Ready.css";

export default function Ready({setIsStarted}: any) {

	const [lastCounter, setLastCounter] = useState(3);

	useEffect(() => {
		const interval = setInterval(() => {
			if (lastCounter === 1) {
				setIsStarted(true);
				return;
			}
			setLastCounter((prev) => prev - 1);
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, [lastCounter]);

	return (
		<div className={`readyPage`}>
			<div className={`lastCounter`}>
				<div className="lastCounter-text">{lastCounter}</div>
			</div>
		</div>
	);
}