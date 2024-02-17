import InputPanelContentComponent from './InputPanelContentComponent';
import OutputPanelContentComponent from './OutputPanelContentComponent';
import { useSearchParams } from 'react-router-dom';

const darkBlueBackgroundColor = '#2E3047'

function App() {
  // Use search query paramaters to build the UI
  const [searchParams] = useSearchParams()
  const teams : string[] | undefined = searchParams.get('teams')?.split(',')
  const startYear : number = Number(searchParams.get('start_year'))
  const endYear : number = Number(searchParams.get('end_year')) 
  window.document.title = "FRC Group Tracker"
  return (
    <div className="App" style={{display: 'flex', backgroundColor: darkBlueBackgroundColor}}>
      <div style={{width: "fit-content", height: '100vh'}}>
        <InputPanelContentComponent teams={teams} startYear={startYear} endYear={endYear}/>
      </div>
      <div style={{width: "100%", height: '100vh'}}>
        <OutputPanelContentComponent teams={teams} startYear={startYear} endYear={endYear}/>
      </div>
    </div>
  );
}

export default App;
