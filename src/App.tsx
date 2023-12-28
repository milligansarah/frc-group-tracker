import InputPanelContentComponent from './InputPanelContentComponent';
import OutputPanelContentComponent from './OutputPanelContentComponent';
import { useSearchParams } from 'react-router-dom';

const darkBlueBackgroundColor = '#2E3047'

function App() {
  // Use search query paramaters to build the UI
  const [searchParams] = useSearchParams()
  const teams : string[] | undefined = searchParams.get('teams')?.split(',')
  const startYear : number | null = Number(searchParams.get('start_year'))
  const endYear : number | null = Number(searchParams.get('end_year'))  
  console.log("teams: " + teams)
  return (
    <div className="App" style={{display: 'flex', backgroundColor: darkBlueBackgroundColor}}>
      <div style={{width: "25%", height: '100vh'}}>
        <InputPanelContentComponent teams={teams} startYear={startYear} endYear={endYear}/>
      </div>
      <div style={{width: "75%", height: '100vh'}}>
        <OutputPanelContentComponent teams={teams} startYear={startYear} endYear={endYear}/>
      </div>
    </div>
  );
}

export default App;
