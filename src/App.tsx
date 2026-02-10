
import './App.css'
import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import UnliMode from './components/UnliMode';

function App() {
  return (
    <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/unlimode' element ={<UnliMode/>}/>
    </Routes>
  );
}

export default App
