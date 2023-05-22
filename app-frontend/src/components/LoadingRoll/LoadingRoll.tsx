import "./LoadingRoll.scss";

export default function LoadingRoll({isLoading}: {isLoading: boolean}) {
	if (isLoading) {
    	return (
    	  <div className="loading-roll-container">
    	    <div className="loading-roll"></div>
    	  </div>
    	);
	}
 	else
   		return null;
};
