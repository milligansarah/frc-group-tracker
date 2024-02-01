import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, DotProps, ErrorBar, Legend, Line, LineChart, RectangleProps, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import queryType from "../QueryType";
import { CircularProgress } from "@mui/material";
import '../index.css';
import { useHover } from "@uidotdev/usehooks";

const tealColor = '#3BBA9C'
const tealColorClear = '#3BBA9CAA'
type teamAPIRequestType = {
    "event_points": [],
    "point_total": number,
    "rank": number,
    "rookie_bonus": number,
    "team_key": string
}

function getMean(data : number[]) {
    return data.reduce((previousValue, currentValue) => previousValue + currentValue, 0) / data.length
}

function getMedian(data: number[]) {
    let median : number | undefined;
    if (data.length % 2 == 1) {
        median = data.at(Math.floor(data.length / 2))
    }
    else {
        median = (data.at(data.length / 2)! + data.at(data.length / 2 - 1)!) / 2
    }
    return median
}

function getLowerQuartile(data: number[]) {
    let dataLength : number = data.length
    if (dataLength % 4 == 0) {
        return (data[dataLength / 4] + data[dataLength / 4 - 1]) / 2
    }
    else {
        return data[Math.floor(dataLength / 4)]
    }
}

function getUpperQuartile(data: number[]) {
    let dataLength : number = data.length
    if (dataLength % 4 == 0) {
        return (data[dataLength - (dataLength / 4)] + data[dataLength - (dataLength / 4) - 1]) / 2
    }
    else {
        return data[dataLength - Math.floor(dataLength / 4) - 1]
    }
}

function GraphOutputComponent(props: queryType) {
    type graphDataType = [{}?]
    const [newData, setNewData] = useState([] as graphDataType)
    const [show, setShow] = useState(true)

    async function fetchData() {
        const startYear : number = props.startYear as number
        const endYear : number = props.endYear as number
        const years : number[] = Array.from({length: endYear - startYear + 1}, (_, index) => startYear + index)
        const allPercentileRanks : any = {};
        // Get the district IDs for each team and
        // Get a list of years played for each team (used for several stat calculations)
        let districtTeamPairs : any = {};
        let yearsPlayed : any = {} 
        for (let teamIndex in props.teams) {
            const team : string = props.teams[Number(teamIndex)];
            const districtResponse = await fetch('https://www.thebluealliance.com/api/v3/team/frc' + team + '/districts?X-TBA-Auth-Key=Qvh4XAMdIteMcXIaz6eunrLmGlseHtDnb4NrUMALYuNErSOgcKPBsNSMEWDMgVyV');
            const districtJson = await districtResponse.json();
            const districtId = districtJson[0]['abbreviation'];
            districtTeamPairs[team] = districtId;
        }
        // For each year in the range
        for (let yearIndex in years) {
            const year : number = years[yearIndex]
            // If the current year is 2022, the last season is 2020. Otherwise, it is the prior year
            const lastYear : number = year == 2022 ? 2020 : year-1
            // Remove 2021 from the graph, because of the Covid cancellation
            if (year != 2021) {
                let districtsFetched : any = [];
                // Get the percentile ranking for each team in their own district
                const percentileRanks = [];
                let returningVeterans = 0;
                let restartedVeterans = 0;
                let rookieTeams = 0;
                let foldedTeams = 0;
                for (let teamIndex in props.teams) {
                    const team = props.teams[Number(teamIndex)]
                    const teamDistrictId = districtTeamPairs[team]
                    // If we don't have the ranking data for the current team's district yet, fetch that data
                    // and compute the percentile rankings for each team in that district (in the user's group)
                    if (districtsFetched.includes(teamDistrictId) == false) {
                        districtsFetched.push(teamDistrictId)
                        const response = await fetch('https://www.thebluealliance.com/api/v3/district/' + year + '' + teamDistrictId + '/rankings?X-TBA-Auth-Key=Qvh4XAMdIteMcXIaz6eunrLmGlseHtDnb4NrUMALYuNErSOgcKPBsNSMEWDMgVyV');
                        let json = await response.json();
                        let ranks : any = {}
                        let totalTeamsPlayed : number = 0;
                        // For each team in the data fetched from the API, add the team's ranking to a list if it is in the user's group
                        for (let index in json) {
                            const teamObject : teamAPIRequestType = json[index]
                            const teamNumber : string | undefined = teamObject['team_key']?.substring(3)
                            const teamPoints : number = teamObject['point_total']
                            let currentTeamYearsPlayed = yearsPlayed[teamNumber]
                            if (teamPoints != 0 && teamNumber != undefined) {
                                totalTeamsPlayed += 1
                                // This will add all teams
                                if (props.teams?.includes(teamNumber)) {
                                    if (yearsPlayed[teamNumber] == null) {
                                        yearsPlayed[teamNumber] = [year]
                                    }
                                    else {
                                        yearsPlayed[teamNumber].push(year)
                                    }
                                    currentTeamYearsPlayed = yearsPlayed[teamNumber]
                                    ranks[teamNumber] = teamObject['rank']
                                    // If the team played the current year
                                    if (currentTeamYearsPlayed.includes(year)) {
                                        // If the team also played the prior year
                                        if (currentTeamYearsPlayed.includes(lastYear)) {
                                            returningVeterans += 1;
                                        }
                                        // If this is the team's first year of play
                                        else if (currentTeamYearsPlayed[0] == year) {
                                            rookieTeams += 1;
                                        }
                                        // If the team didn't play in the prior year, but played in at least one year before
                                        else if (currentTeamYearsPlayed.includes(lastYear) == false 
                                        && Array.from({length: (lastYear-1) - 1992 + 1}, (_, index) => startYear + index).some((year) => currentTeamYearsPlayed.includes(year))) {
                                            restartedVeterans += 1;
                                        }
                                    }
                                }
                            }
                        }
                        const teamsInCurrentDistrict = props.teams.filter((team) => districtTeamPairs[team] == teamDistrictId)
                        for (const teamInCurrentDistrictIndex in teamsInCurrentDistrict) {
                            const teamInCurrentDistrict = teamsInCurrentDistrict[teamInCurrentDistrictIndex]
                            if (ranks[teamInCurrentDistrict] != null) {
                                percentileRanks.push(100 - ranks[teamInCurrentDistrict] / totalTeamsPlayed * 100)
                            }
                            else if (yearsPlayed[teamInCurrentDistrict] != null && yearsPlayed[teamInCurrentDistrict].includes(lastYear)) {
                                foldedTeams += 1
                            }
                        }
                    }
                }
                // Sort the data
                percentileRanks.sort(function(a, b) {
                    return a - b;
                })
                // Get the mean
                let mean : number = getMean(percentileRanks)
                // Get the median
                let median : number | undefined = getMedian(percentileRanks);
                // Get the lower quartile
                let lowerQuartile : number = getLowerQuartile(percentileRanks);
                // Get the upper quartile
                let upperQuartile : number = getUpperQuartile(percentileRanks);
                // Number of teams
                let numTeams : number = percentileRanks.length;
                // If no teams participated, 
                if (numTeams == 0) {
                    newData.push({
                        Year: year,
                        numTeams: numTeams,
                        returningVeterans: returningVeterans,
                        restartedVeterans: restartedVeterans,
                        rookieTeams: rookieTeams,
                        foldedTeams: foldedTeams
                    })
                }
                else {
                    newData.push({
                        Year: year,
                        median: Number(median!.toFixed(2)),
                        mean: Number(mean.toFixed(2)),
                        min: percentileRanks[0],
                        bottomWhisker: lowerQuartile - percentileRanks[0],
                        bottomBox: median! - lowerQuartile, 
                        topBox: upperQuartile - median!,
                        topWhisker: percentileRanks[percentileRanks.length - 1] - upperQuartile, 
                        max: percentileRanks[percentileRanks.length - 1],
                        numTeams: numTeams,
                        returningVeterans: returningVeterans,
                        restartedVeterans: restartedVeterans,
                        rookieTeams: rookieTeams,
                        foldedTeams: foldedTeams
                    })
                }
                // console.log(ranks)
                allPercentileRanks[year] = percentileRanks
                setNewData(newData)
            }
        }
        if (typeof newData.at(0) == "object") {
            newData.slice(0, 1)
            setNewData(newData)
        }
        setShow(false);
    }

    fetchData()
    
    const BarOutline = (props: RectangleProps) => {
        const { x, y, width, height } = props;

        if (x == null || y == null || width == null || height == null) {
            return null;
        }
        
        return (
            <rect
              x={x+1*width/3}
              y={y}
              x1={x+width}
              y1={y+height}
              width={width / 3}
              height={height}
              stroke={tealColor}
              strokeWidth={2}
              opacity={"50%"}
              fillOpacity={"0%"}
            >
            </rect>
        );
    };

    const DotBar = (props: RectangleProps) => {
        const { x, y, width, height } = props;
      
        if (x == null || y == null || width == null || height == null) {
          return null;
        }
      
        return (
          <line
            x1={x + width / 2}
            y1={y}
            x2={x + width / 2}
            y2={y + height}
            stroke={tealColor}
            strokeWidth={2}
            opacity={"50%"}
            fillOpacity={"0%"}
          />
        );
      };
      
    const HorizonBar = (props: RectangleProps) => {
        const { x, y, width, height } = props;
      
        if (x == null || y == null || width == null || height == null) {
          return null;
        }
      
        return <line 
            x1={x + 1 * width / 3} 
            y1={y} 
            x2={x + 2 *width / 3} 
            y2={y + height} 
            stroke={tealColor}
            strokeWidth={2}
            opacity={"50%"}
            fillOpacity={"0%"} 
        />;
    };

    const CustomTooltip = ({ active, payload, label } : any) => {
        if (active && payload && payload.length) {
            console.log(payload)
            let numTeams : number = payload[0].dataKey == "numTeams" ? payload[0].value : payload[7].value
            let mean, median, min, bottomWhiskerBarHeight, lowerQuartile, topWhiskerBarHeight, upperQuartile, max, returningVeterans, restartedVeterans, rookieTeams, foldedTeams;
            if (numTeams == 0) {
                mean = 0
                median = 0
                min = 0
                lowerQuartile = 0
                upperQuartile = 0
                max = 0
                returningVeterans = payload[1].value
                restartedVeterans = payload[2].value
                rookieTeams = payload[3].value
                foldedTeams = payload[4].value
            }
            else {
                mean = payload[0].value
                median = payload[1].value
                min = payload[2].value
                bottomWhiskerBarHeight = payload[3].value
                lowerQuartile = bottomWhiskerBarHeight + min
                topWhiskerBarHeight = payload[5].value
                upperQuartile = topWhiskerBarHeight + median!
                max = payload[6].value + upperQuartile
                returningVeterans = payload[8].value
                restartedVeterans = payload[9].value
                rookieTeams = payload[10].value
                foldedTeams = payload[11].value
            }
            return (
                <div id="custom-tooltip" style={{width: 150, pointerEvents: 'auto'}}>
                    <p style={{marginBottom: 20}}>{label}</p>
                    <p><b>Median: {median.toFixed(2)}</b></p>
                    <p>Mean: {mean.toFixed(2)}</p>
                    <p>Minimum: {min.toFixed(2)}</p>
                    <p>1st Quartile: {lowerQuartile.toFixed(2)}</p>
                    <p>3rd Quartile: {upperQuartile.toFixed(2)}</p>
                    <p style={{marginBottom: 30}}>Maximum: {max.toFixed(2)}</p>
                    <p>Teams Included: {numTeams}</p>
                    <p>Returning Veterans: {returningVeterans}</p>
                    <p>Restarted Veterans: {restartedVeterans}</p>
                    <p>Rookie Teams: {rookieTeams}</p>
                    <p>Folded Teams: {foldedTeams}</p>
                </div>
            );
        }
        
        return null;
    };

    let ActiveDot = (props: any) => {
        const { cx, cy, type } = props;

        return (
            <circle cx={cx} cy={cy} r={type.includes("median") ? 8 : 6} stroke={tealColorClear} strokeWidth={2} fill="transparent" />
        );
    };

    const CustomDot = (props: any) => {
        const { cx, cy, type } = props;

        return (
            <circle cx={cx} cy={cy} r={type.includes("median") ? 5 : 4} fill={tealColorClear} />
        );
    };

    return show ? <CircularProgress id="loading-icon"/>: <div style={{transform: 'translate(50px, 0)'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{display: 'flex', alignItems: "center", marginRight: 30}}>
                    <p style={{fontSize: 12, marginRight: 10}}>Median Percentile Rank</p>
                    <div className="line"></div>
                </div>
                <div style={{display: 'flex', alignItems: "center"}}>
                    <p style={{fontSize: 12, marginRight: 10}}>Mean Percentile Rank</p>
                    <div className="line" id="dashed-line"></div>
                </div>
        </div>
        <ComposedChart width={800} height={550} data={newData}>
            <XAxis fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" dataKey="Year" tickLine={false} />
            <CartesianGrid opacity={"15%"} stroke="#EEEEEE" />
            <YAxis domain={[0, 100]} allowDataOverflow={true} fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" tickLine={false}/>
            <Tooltip trigger="click" position={{ x: -100, y: 0 }} content={<CustomTooltip/>} contentStyle={{backgroundColor: "#FF000000", border: "none"}} labelStyle={{fontSize: 14}} itemStyle={{fontSize: 14, fontFamily: "Arial, Helvetica, sans-serif", color: "#EEEEEE", lineHeight: 0.5}} />
            <Line type="monotone" dataKey="mean" stroke={tealColorClear} strokeWidth={2} strokeDasharray='4, 2' activeDot={<ActiveDot type="mean"/>} dot={<CustomDot type="mean"/>}/>
            <Line type="monotone" dataKey="median" stroke={tealColor} strokeWidth={2} activeDot={<ActiveDot type="median"/>} dot={<CustomDot type="median"/>}/>
            <Bar stackId={'a'} dataKey={'min'} fill={'none'} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bar'} shape={<HorizonBar />} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bottomWhisker'} shape={<DotBar />} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bottomBox'} shape={<BarOutline/>} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'topBox'} shape={<BarOutline/>} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'topWhisker'} shape={<DotBar />} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bar'} shape={<HorizonBar />} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'numTeams'} fill={'none'}/>
            <Bar stackId={'a'} dataKey={'returningVeterans'} fill={'none'}/>
            <Bar stackId={'a'} dataKey={'restartedVeterans'} fill={'none'}/>
            <Bar stackId={'a'} dataKey={'rookieTeams'} fill={'none'}/>
            <Bar stackId={'a'} dataKey={'foldedTeams'} fill={'none'}/>
        <ZAxis type='number' dataKey='size' range={[0, 250]} />
        </ComposedChart>
        <p style={{textAlign: "center"}}>Number of Input Teams: {props.teams?.length}</p>
    </div>
}

export default GraphOutputComponent