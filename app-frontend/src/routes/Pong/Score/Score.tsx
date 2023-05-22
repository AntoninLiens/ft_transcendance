import { playerPosEnum } from "../Pong";
import "./Score.scss";

export default function Score({player1Score, player2Score, playerPos}: any) {
	const playerScore1 = () => {
		if (playerPos === playerPosEnum.PLAYER1 || playerPos === playerPosEnum.undefined)
			return player1Score;
		return player2Score;
	}

	const playerScore2 = () => {
		if (playerPos === playerPosEnum.PLAYER1 || playerPos === playerPosEnum.undefined)
			return player2Score;
		return player1Score;
	}


	return (
	<div className={`scorePage`}>
	  <div className={`score`}>
		<div className="score-text">{playerScore1()}</div>
	  </div>
	  <div className={`score`}>
		<div className="score-text">{playerScore2()}</div>
	  </div>
	</div>
  );
}