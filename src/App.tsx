import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import UnliMode from './components/UnliMode';
import TimedMode from './components/TimedMode';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerGame from './components/MultiplayerGame';

function App() {
  return (
    <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/quiz/:charset' element ={<UnliMode/>}/>
      <Route path = '/timed-quiz/:charset' element={<TimedMode/>}/>
      <Route path = '/multiplayer' element={<MultiplayerLobby/>}/>
      <Route path = '/multiplayer-game/:roomCode/:player' element={<MultiplayerGame/>}/>
    </Routes>
  );
}

export default App
