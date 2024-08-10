import InputPanelContentComponent from './InputPanelContentComponent';
import OutputPanelContentComponent from './OutputPanelContentComponent';
import { useSearchParams } from 'react-router-dom';
import TeamAndYearRangeType from './TeamAndYearRangePairType';

const darkBlueBackgroundColor = '#2E3047'

function App() {
  // Use search query paramaters to build the UI
  const [searchParams] = useSearchParams()
  const teams : string[] | undefined = searchParams.get('teams')?.split(',')
  const startYear : number = Number(searchParams.get('start_year'))
  const endYear : number = Number(searchParams.get('end_year')) 
  let teamAndYearRanges : TeamAndYearRangeType[] = []
  for (const teamDataIndex in teams) {
    const teamData : string = teams[teamDataIndex as any]
    // Splits the query data into an array including the team (index 0), start year (index 1), and end year (index 2)
    const teamDataSeparated : string[] = teamData.split("s").join("e").split("e")
    // If there is no year range specified for the particular team, don't input anything
    if (teamDataSeparated.length == 1) {
      teamAndYearRanges.push({
        team: teamDataSeparated[0]
      })
    }
    // Otherwise, use the given year range for that team
    else {
      teamAndYearRanges.push({
        team: teamDataSeparated[0],
        startYear: Number(teamDataSeparated[1]),
        endYear: Number(teamDataSeparated[2])
      })
    }
  }
  window.document.title = "FRC Group Tracker"
  return (
    <div className="App" style={{display: 'flex', backgroundColor: darkBlueBackgroundColor}}>
      <div style={{width: "fit-content", height: '100vh'}}>
        <InputPanelContentComponent teams={teamAndYearRanges} startYear={startYear} endYear={endYear}/>
      </div>
      <div style={{width: "100%", height: '100vh'}}>
        <OutputPanelContentComponent teams={teamAndYearRanges} startYear={startYear} endYear={endYear}/>
      </div>
    </div>
  );
}

export default App;
