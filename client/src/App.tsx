import React from 'react';
import StartScreen from './components/StartScreen';
import { GameProvider } from './context/GameContext';
import './App.css';

function App() {
	return (
		<div className="App">
			<GameProvider>
				<StartScreen />
			</GameProvider>
		</div>
	);
}

export default App;
