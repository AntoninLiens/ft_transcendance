import { createMatchmaking } from "./context/MatchmakingContext";
import { createAuth } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { createWs } from './context/WsContext';
import ReactDOM from 'react-dom/client';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const { wsCtx, WsProvider } = createWs();
export const WsContext = wsCtx;

const { authCtx, AuthProvider } = createAuth();
export const AuthContext = authCtx;

const { matchmakingCtx, MatchmakingProvider } = createMatchmaking();
export const MatchmakingContext = matchmakingCtx;

root.render(
	<BrowserRouter>
		<AuthProvider>
			<WsProvider>
				<MatchmakingProvider>
					<App />
				</MatchmakingProvider>
			</WsProvider>
		</AuthProvider>
	</BrowserRouter>
);