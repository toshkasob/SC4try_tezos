import {BrowserRouter,Routes,Route} from 'react-router-dom';
import NotFound404 from './map_planets/not_found_404';
import { GamePlanet1 } from './map_planets/planet_1';
import { GamePlanet2 } from './map_planets/planet_2';
import { GamePlanet3 } from './map_planets/planet_3';
import { GamePlanet4 } from './map_planets/planet_4';
import { GamePlanet5 } from './map_planets/planet_5';
import {MainWindow} from './map_planets/main/load_title';

const App = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route  path='/' element={<MainWindow/>}/>
          <Route path='/planet1' element={<GamePlanet1/>}/>
          <Route path='/planet2' element={<GamePlanet2/>}/>
          <Route path='/planet3' element={<GamePlanet3/>}/>
          <Route path='/planet4' element={<GamePlanet4/>}/>
          <Route path='/planet5' element={<GamePlanet5/>}/>
          <Route element={<NotFound404/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;