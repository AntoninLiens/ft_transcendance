import { playerPosEnum } from "../Pong";
import "./Score.scss";

export default function Score({player1Score, player2Score, playerPos}: any) {
	  return (
	<div className={`scorePage`}>
	  <div className={`score`}>
		<div className="score-text">{playerPos === playerPosEnum.PLAYER1 ? player1Score : player2Score}</div>
	  </div>
	  <div className={`score`}>
		<div className="score-text">{playerPos === playerPosEnum.PLAYER2 ? player1Score : player2Score}</div>
	  </div>
	</div>
  );
}