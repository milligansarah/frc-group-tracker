import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, DotProps, ErrorBar, Legend, Line, LineChart, RectangleProps, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import queryType from "../QueryType";
import { Checkbox, CircularProgress } from "@mui/material";
import '../index.css';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from "firebase/firestore";

const tealColor = '#3BBA9C'
const tealColorClear = '#3BBA9CAA'
const offWhiteColor = '#EEEEEE'
let individualTeamsVisible = false

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

const firebaseConfig = {
    apiKey: "AIzaSyCVQ2MYhLtTdhvcqpDsraOo9AUhmVWN9oo",
    authDomain: "frc-group-tracker.firebaseapp.com",
    projectId: "frc-group-tracker",
    storageBucket: "frc-group-tracker.appspot.com",
    messagingSenderId: "923417274992",
    appId: "1:923417274992:web:e08a78b79e05e617b4a2b5",
    measurementId: "G-37Y43BPX12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

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
    const [graphInvalidData, setGraphInvalidData] = useState([] as string[])

    async function fetchData() {
        const startYear : number = props.startYear as number
        const endYear : number = props.endYear as number
        if (startYear < 1997 || startYear > 2024 || endYear < 1997 || endYear > 2024 || startYear > endYear) {
            return;
        }
        // Include the year prior to the start year so we can gather "yearsPlayed" data for the prior year
        // If the start year is 2022, we need to add another year to the span since 2021 is never looped over
        const yearAdditionFor2022 = startYear == 2022 ? 1 : 0
        const years : number[] = Array.from({length: endYear - startYear + 2 + yearAdditionFor2022}, (_, index) => startYear - (1 + yearAdditionFor2022) + index)
        const allPercentileRanks : any = {};
        // Retrieve team data and validate teams
        let invalidTeams : string[] = [];
        let teamData : any = [];
        let yearsPlayed : any = {};
        for (let teamIndex in props.teams) {
            const team : string = props.teams[Number(teamIndex)];
            const teamRef = doc(database, "teams", "frc" + team)
            const docSnap = await getDoc(teamRef)
            if (docSnap.exists()) {
                teamData[team] = docSnap.data()
            }
            else {
                invalidTeams.push(team)
            }
        }
        if (invalidTeams.length > 0) {
            setGraphInvalidData(invalidTeams);
            return
        }
        // For each year in the range
        for (let yearIndex in years) {
            const year : number = years[yearIndex]
            // If the current year is 2022, the last season is 2020. Otherwise, it is the prior year
            const lastYear : number = year == 2022 ? 2019 : year-1
            // Remove 2021 from the graph, because of the Covid cancellation
            if (year != 2021 && year != 2020) {
                // Get the percentile ranking for each team in their own district
                const percentileRanksTeamPairs : any = {};
                let returningVeterans = 0;
                let restartedVeterans = 0;
                let rookieTeams = 0;
                let foldedTeams = 0;
                let totalTeamsPlayed = 0;
                for (let teamIndex in props.teams) {
                    const team = props.teams[Number(teamIndex)]
                    const currentTeamData : { [index: string]: any; } = teamData[team]
                    let currentTeamYearsPlayed : string[] = Object.keys(currentTeamData)
                    const currentTeamCurrentYearData = currentTeamData[year]
                    if (currentTeamCurrentYearData === undefined) {
                        if (currentTeamYearsPlayed.includes(String(lastYear))) {
                            foldedTeams += 1
                        }
                        continue
                    }
                    const currentTeamCurrentYearPoints : number = currentTeamCurrentYearData["district_points"] as number
                    const currentTeamCurrentYearPercentile : number = currentTeamCurrentYearData["percentile"] as number
                    if (currentTeamCurrentYearPoints != 0) {
                        percentileRanksTeamPairs[team] = currentTeamCurrentYearPercentile
                        totalTeamsPlayed += 1
                        // If the team also played the prior year
                        if (currentTeamYearsPlayed.includes(String(lastYear)) && currentTeamData[lastYear]["district_points"] != 0) {
                            returningVeterans += 1;
                        }
                        // If there are no prior years of play
                        else if (Array.from({length: (lastYear) - 1992 + 1}, (_, index) => 1992 + index).some((year) => currentTeamYearsPlayed.includes(String(year))) == false) {
                            rookieTeams += 1
                        }
                        // If the team didn't play in the prior year, but played in at least one year before
                        else {
                            restartedVeterans += 1;
                        }
                    }
                    else if (currentTeamYearsPlayed.includes(String(lastYear))) {
                        foldedTeams += 1
                    }
                }
                const percentileRanks : number[] = Object.values(percentileRanksTeamPairs)
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
                let numTeams : number = totalTeamsPlayed;
                // If no teams participated, 
                if (numTeams == 0 && year != startYear - 1 - yearAdditionFor2022) {
                    newData.push({
                        Year: year,
                        numTeams: numTeams,
                        returningVeterans: returningVeterans,
                        restartedVeterans: restartedVeterans,
                        rookieTeams: rookieTeams,
                        foldedTeams: foldedTeams
                    })
                }
                // Since we loop through the year prior to the inputted start year for the purpose of populating the "yearsPlayed" data,
                // We have to ensure that we don't display that year's data
                else if (year != startYear - 1 - yearAdditionFor2022) {
                    const thisYearData : any = {
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
                        foldedTeams: foldedTeams,
                    }
                    for (const team in props.teams) {
                        const key : string = props.teams[team as any] as string
                        thisYearData[key] = percentileRanks[Number(team)]
                    }
                    newData.push(thisYearData)
                }
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
                returningVeterans = payload[8].value
                restartedVeterans = payload[9].value
                rookieTeams = payload[10].value
                foldedTeams = payload[11].value
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
                <div id="custom-tooltip" style={{width: 150, pointerEvents: 'auto', animation: 'none', position: 'relative', left: -120}}>
                    <p style={{marginBottom: 20}}>{label}</p>
                    <table style={{marginBottom: 30}}>
                        <tr>
                            <td><strong>Median</strong></td>
                            <td><strong>{median.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td>Mean</td>
                            <td>{mean.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Minimum</td>
                            <td>{min.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>1st Quartile</td>
                            <td>{lowerQuartile.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>3rd Quartile</td>
                            <td>{upperQuartile.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Maximum</td>
                            <td>{max.toFixed(2)}</td>
                        </tr>
                    </table>
                    <table style={{marginBottom: 30}}>
                        <tr>
                            <td>Teams Included</td>
                            <td>{numTeams}</td>
                        </tr>
                        <tr>
                            <td>Returning Veterans</td>
                            <td>{returningVeterans}</td>
                        </tr>
                        <tr>
                            <td>Restarted Veterans</td>
                            <td>{restartedVeterans}</td>
                        </tr>
                        <tr>
                            <td>Rookie Teams</td>
                            <td>{rookieTeams}</td>
                        </tr>
                        <tr>
                            <td>Folded Teams</td>
                            <td>{foldedTeams}</td>
                        </tr>
                    </table>
                    {label == 2020 || label == 2021 ? <p>Teams that did not play in 2020 but were registered for cancelled events are counted as folded teams in 2020, and as restarted veterans in 2022.</p> : null}
                    {label == 2020 || label == 2021 ? <p>This may change in a future release.</p> : null}
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

    let TeamDot = (props: any) => {
        const { cx, cy, dataKey, value, payload } = props;
        const id = payload["Year"] + "" + dataKey

        if (cy == null) return <></>

        // toggle text visibility on clicked
        return (
            <>
                <circle className="teamDot" visibility={"hidden"} cx={cx} cy={cy} r={3} fill={offWhiteColor} onClick={() => toggleTeamPointVisibility(id)}/>
                <text id={id} visibility={"hidden"} x={cx + 12} y={cy + 3}><a style={{fontFamily: "Arial, Helvetica, sans-serif", fontSize: 10, stroke: offWhiteColor, strokeWidth: 0.01, fill: offWhiteColor, textDecoration: "underline"}} target="_blank" href={'https://www.thebluealliance.com/team/' + dataKey + '/' + payload["Year"]}>{dataKey}: {value.toFixed(2)}</a></text>
            </>
        );
    };

    let toggleTeamPointVisibility = (id: string) => {
        if (document.getElementById(id)?.style.visibility == "visible") {
            document.getElementById(id)!.style.visibility = 'hidden' 
        }
        else {
            document.getElementById(id)!.style.visibility = 'visible'
        }
    }

    const CustomDot = (props: any) => {
        const { cx, cy, type } = props;

        return (
            <circle cx={cx} cy={cy} r={type.includes("median") ? 5 : 4} fill={tealColorClear} />
        );
    };

    const getIndividualTeamDisplays = () => {
        const teams = props.teams
        const teamDisplays = []
        for (const team in teams) {
            teamDisplays.push(<Line type="monotone" dataKey={teams[team as any]} stroke="none" dot={<TeamDot/>} activeDot={<TeamDot/>}/>)
        }
        return teamDisplays
    }

    let dataVerificationOutput : ReactElement[] = []

    if (graphInvalidData.length > 0) {
        if (graphInvalidData.length == 1) {
            dataVerificationOutput.push(<li>Input "{graphInvalidData[0]}" is not a valid district team</li>)
        }
        else {
            dataVerificationOutput.push(<li>Inputs {graphInvalidData.map((team, index) => (index == graphInvalidData.length-1 && graphInvalidData.length != 1 ? "and " : "") + '"' + team + '" ')} are not valid district teams</li>)
        }
    }

    if (props.startYear as number < 1997 || props.startYear as number > 2024 || Number.isNaN(props.startYear as number)) {
        dataVerificationOutput.push(<li>Start year must be a number between 1997 and 2024</li>)
    }
    
    if (props.endYear as number < 1997 || props.endYear as number > 2024 || Number.isNaN(props.endYear as number)) {
        dataVerificationOutput.push(<li>End year must be a number between 1997 and 2024</li>)
    }

    if ((props.startYear as number) > (props.endYear as number)) {
        dataVerificationOutput.push(<li>End year must be greater than start year</li>)
    }

    if (dataVerificationOutput.length > 1) {
        return <div><p>Input errors: </p><ul>{dataVerificationOutput.map(element => element)}</ul></div>
    }
    else if (dataVerificationOutput.length == 1) {
        return <div><p>Input error: </p><ul>{dataVerificationOutput.map(element => element)}</ul></div>
    }

    return show ? <CircularProgress id="loading-icon"/>: <div style={{width: '60vw', height: '80vh'}}>
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
        <ResponsiveContainer width={'100%'} height={'90%'}>
        <ComposedChart data={newData}>
            <XAxis fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" dataKey="Year" tickLine={false} />
            <CartesianGrid opacity={"15%"} stroke="#EEEEEE" />
            <YAxis domain={[0, 100]} allowDataOverflow={true} fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" tickLine={false}/>
            <Tooltip trigger="click" position={{ x: 0, y: 0 }} content={<CustomTooltip/>} contentStyle={{backgroundColor: "#FF000000", border: "none"}} labelStyle={{fontSize: 14}} itemStyle={{fontSize: 14, fontFamily: "Arial, Helvetica, sans-serif", color: "#EEEEEE", lineHeight: 0.5}} />
            <Tooltip trigger="click" position={{ x: 10, y: 10 }} content={<CustomTooltip/>} contentStyle={{backgroundColor: "#FF000000", border: "none"}} labelStyle={{fontSize: 14}} itemStyle={{fontSize: 14, fontFamily: "Arial, Helvetica, sans-serif", color: "#EEEEEE", lineHeight: 0.5}} />
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
            {getIndividualTeamDisplays()}
        <ZAxis type='number' dataKey='size' range={[0, 250]} />
        </ComposedChart>
        </ResponsiveContainer>
        <p style={{textAlign: "center", marginBottom: 0}}>Number of Input Teams: {props.teams?.length}</p>
        <div style={{display: 'flex', justifyContent: 'center'}}>
            <p style={{fontSize: 14, marginLeft: 10}}>Display individual teams</p>
            <Checkbox
                onChange={() => {
                    const dots = document.getElementsByClassName("teamDot")!
                    individualTeamsVisible = !individualTeamsVisible;
                    for (const index in dots) {
                        (dots.item(Number(index))! as HTMLElement).style.visibility = individualTeamsVisible ? "visible" : "hidden"
                    }
                }}
                sx={{
                    color: tealColor,
                    '&.Mui-checked': {
                      color: tealColor,
                    },
                  }}></Checkbox>
        </div>
    </div>
}

export default GraphOutputComponent