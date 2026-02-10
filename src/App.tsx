
import './App.css'
import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import UnliMode from './components/UnliMode';
import TimedMode from './components/TimedMode';

function App() {
  return (
    <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/quiz/:charset' element ={<UnliMode/>}/>
      <Route path = '/timed-quiz/:charset' element={<TimedMode/>}/>
    </Routes>
  );
}

export default App
