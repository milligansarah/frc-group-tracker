import React, { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, ErrorBar, Legend, Line, LineChart, RectangleProps, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import queryType from "../QueryType";
import { CircularProgress } from "@mui/material";
import { ArrowDropDown, ArrowDropUp, ArrowUpward, CircleOutlined } from "@mui/icons-material";

const tealColor = '#3BBA9C'
type teamAPIRequestType = {
    "event_points": [],
    "point_total": number,
    "rank": number,
    "rookie_bonus": number,
    "team_key": string
}

function GraphOutputComponent(props: queryType) {
    type graphDataType = [{}?]
    const [newData, setNewData] = useState([] as graphDataType)
    const [show, setShow] = useState(true)

    async function fetchData() {
        const startYear : number = props.startYear as number
        const endYear : number = props.endYear as number
        const years : number[] = Array.from({length: endYear - startYear + 1}, (_, index) => startYear + index)
        // For each year in the range
        for (let yearIndex in years) {
            const year : number = years[yearIndex]
            if (year != 2021) {
                const response = await fetch('https://www.thebluealliance.com/api/v3/district/' + year + 'fim/rankings?X-TBA-Auth-Key=Qvh4XAMdIteMcXIaz6eunrLmGlseHtDnb4NrUMALYuNErSOgcKPBsNSMEWDMgVyV	');
                let json = await response.json();
                const ranks : number[] = []
                let totalTeamsPlayed : number = 0;
                // For each team in the data fethed from the API, add the teams ranking to a list if it is in our teams input
                for (let index in json) {
                    const teamObject : teamAPIRequestType = json[index]
                    const teamNumber : string = teamObject['team_key'].substring(3)
                    const teamPoints : number = teamObject['point_total']
                    if (teamPoints != 0) {
                        totalTeamsPlayed += 1
                        if (props.teams?.includes(teamNumber)) {
                            ranks.push(teamObject['rank'])
                        }
                    }
                }
                // Convert ranks to percentiles
                for (const rankIndex in ranks) {
                    ranks[rankIndex] = 100 - ranks[rankIndex] / totalTeamsPlayed * 100
                }
                // Get the mean
                const mean : number = ranks.reduce((previousValue, currentValue) => previousValue + currentValue, 0) / ranks.length
                // Get the median
                let median : number | undefined = 0;
                if (ranks.length % 2 == 1) {
                    median = ranks.sort().at(Math.floor(ranks.length / 2))
                }
                else {
                    median = (ranks.sort().at(ranks.length / 2)! + ranks.sort().at(ranks.length / 2 - 1)!) / 2
                }
                // Get the standard deviation
                let standardDeviation : number = 0;
                for (const rankIndex in ranks) {
                    standardDeviation += Math.pow((ranks[rankIndex] - mean), 2)
                }
                standardDeviation = Math.sqrt(standardDeviation / (ranks.length - 1))
                newData.push({
                    Year: year,
                    mean: Number(mean.toFixed(2)),
                    median: Number(median!.toFixed(2)),
                    sd: standardDeviation,
                    bottomWhisker: mean - (2 * standardDeviation)
                })
                setNewData(newData)
            }
        }
        const test : {} | undefined = newData.at(0)
        if (typeof newData.at(0) == "object") {
            newData.slice(0, 1)
            setNewData(newData)
        }
        setShow(false);
        
    }

    fetchData()

    const WhiskerLine = (props: RectangleProps) => {
        const { x, y, width, height } = props;
      
        if (x == null || y == null || width == null || height == null) {
          return null;
        }
      
        return (
          <line
            x1={x + width / 2}
            y1={y + 2 * height}
            x2={x + width / 2}
            y2={y + height}
            stroke={tealColor}
            strokeWidth={2}
            opacity={"50%"}
            fillOpacity={"0%"}
          />
        );
    };
    
    const BarOutline = (props: RectangleProps) => {
        const { x, y, width, height } = props;

        if (x == null || y == null || width == null || height == null) {
            return null;
        }
        
        return (
            <rect
              x={x + 2 * width / 6}
              y={y + height}
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

    const TopWhisker = (props: RectangleProps) => {
        const { x, y, width, height } = props;
      
        if (x == null || y == null || width == null || height == null) {
          return null;
        }
      
        return <line x1={x + 2 * width / 3} y1={y + 2*height} x2={x + width / 3} y2={y + 2*height} stroke={tealColor} opacity={"50%"} strokeWidth={2} />;
    };

    const BottomWhisker = (props: RectangleProps) => {
        const { x, y, width, height } = props;
      
        if (x == null || y == null || width == null || height == null) {
          return null;
        }
      
        return <line x1={x + 2 * width / 3} y1={y + height} x2={x + width / 3} y2={y + height} stroke={tealColor} opacity={"50%"} strokeWidth={2} />;
    };

    return show ? <CircularProgress id="loading-icon"/>: <ComposedChart width={550} height={550} data={newData}>
        <Legend iconType="plainline" fontFamily="Arial, Helvetica, sans-serif" fontSize={12}/>
        <XAxis fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" dataKey="Year" tickLine={false} />
        <CartesianGrid opacity={"50%"} stroke="#EEEEEE" />
        <YAxis fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" tickLine={false}/>
        <Tooltip contentStyle={{backgroundColor: "#FF000000", border: "none"}} labelStyle={{fontSize: 14}} itemStyle={{fontSize: 14, fontFamily: "Arial, Helvetica, sans-serif", color: "#EEEEEE", lineHeight: 0.5}} />
        <Line type="monotone" dataKey="mean" stroke={tealColor} strokeWidth={2}/>
        <Line type="monotone" dataKey="median" stroke={tealColor} strokeWidth={2} strokeDasharray='4, 8, 12, 16'/>
        <Bar stackId={'a'} dataKey={'bottomWhisker'} fill={'none'} />
        <Bar activeBar={<BottomWhisker/>} stackId={'a'} dataKey={'sd'} shape={<BottomWhisker/>} />
        <Bar activeBar={<WhiskerLine/>} stackId={'a'} dataKey={'sd'} shape={<WhiskerLine/>}/>
        <Bar activeBar={<BarOutline/>} stackId={'a'} dataKey={'sd'} fillOpacity={"50%"} shape={<BarOutline/>}/>
        <Bar activeBar={<BarOutline/>} stackId={'a'} dataKey={'sd'} fillOpacity={"50%"} shape={<BarOutline/>}/>
        <Bar activeBar={<WhiskerLine/>} stackId={'a'} dataKey={'sd'} shape={<WhiskerLine/>} />
        <Bar activeBar={<TopWhisker/>} stackId={'a'} dataKey={'sd'} shape={<TopWhisker/>} />
    </ComposedChart>
}

export default GraphOutputComponent