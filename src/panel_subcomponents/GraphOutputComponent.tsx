import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, DotProps, ErrorBar, Legend, Line, LineChart, RectangleProps, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import queryType from "../QueryType";
import { CircularProgress } from "@mui/material";
import '../index.css';

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

function getStandardDeviation(data: number[], mean: number) {
    let standardDeviation : number = 0;
    for (const rankIndex in data) {
        standardDeviation += Math.pow((data[rankIndex] - mean), 2)
    }
    standardDeviation = Math.sqrt(standardDeviation / (data.length - 1))
    return standardDeviation;
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
                            console.log(teamNumber + " at rank " + teamObject['rank'])
                            ranks.push(teamObject['rank'])
                        }
                    }
                }
                // Convert ranks to percentiles
                for (const rankIndex in ranks) {
                    ranks[rankIndex] = 100 - ranks[rankIndex] / totalTeamsPlayed * 100
                }
                // Sort the data
                ranks.sort()
                // Get the mean
                const mean : number = getMean(ranks)
                // Get the median
                let median : number | undefined = getMedian(ranks);
                // Get the standard deviation
                let standardDeviation : number = getStandardDeviation(ranks, mean);
                // Get the lower quartile
                let lowerQuartile : number = getLowerQuartile(ranks);
                // Get the upper quartile
                let upperQuartile : number = getUpperQuartile(ranks);
                newData.push({
                    Year: year,
                    median: Number(median!.toFixed(2)),
                    mean: Number(mean.toFixed(2)),
                    min: ranks[0],
                    bottomWhisker: lowerQuartile - ranks[0],
                    bottomBox: median! - lowerQuartile, 
                    topBox: upperQuartile - median!,
                    topWhisker: ranks[ranks.length - 1] - upperQuartile, 
                    max: ranks[ranks.length - 1]
                })

                setNewData(newData)
                console.log(ranks)
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
            let mean : number = payload[0].value
            let median : number | undefined = payload[1].value
            let min : number = payload[2].value
            let bottomWhiskerBarHeight : number = payload[3].value
            let lowerQuartile : number = bottomWhiskerBarHeight + min
            let topWhiskerBarHeight : number = payload[5].value
            let upperQuartile : number = topWhiskerBarHeight + median!
            let max : number = payload[6].value + upperQuartile
            console.log(median)
            return (
                <div id="custom-tooltip">
                    <p>{label}</p>
                    <p style={{fontSize: 10}}>All values describe <i>percentile rank</i></p>
                    <p>Mean: {mean.toFixed(2)}</p>
                    <p>Minimum: {min.toFixed(2)}</p>
                    <p>1st Quartile: {lowerQuartile.toFixed(2)}</p>
                    <p>Median: {median!.toFixed(2)}</p>
                    <p>3rd Quartile: {upperQuartile.toFixed(2)}</p>
                    <p>Maximum: {max.toFixed(2)}</p>
                </div>
            );
        }
        
        return null;
    };

    const ActiveDot = (props: any) => {
        const { cx, cy } = props;

        return (
            <circle cx={cx} cy={cy} r={8} stroke={tealColorClear} strokeWidth={2} fill="transparent" />
        );
    };

    const CustomDot = (props: any) => {
        const { cx, cy } = props;

        return (
            <circle cx={cx} cy={cy} r={5} fill={tealColorClear} />
        );
    };

    return show ? <CircularProgress id="loading-icon"/>: <div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{display: 'flex', alignItems: "center", marginRight: 30}}>
                    <p style={{fontSize: 12, marginRight: 10}}>Mean Percentile Rank</p>
                    <div className="line" id="dashed-line"></div>
                </div>
                <div style={{display: 'flex', alignItems: "center"}}>
                    <p style={{fontSize: 12, marginRight: 10}}>Median Percentile Rank</p>
                    <div className="line"></div>
                </div>
        </div>
        <ComposedChart width={550} height={550} data={newData}>
            <XAxis fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" dataKey="Year" tickLine={false} />
            <CartesianGrid opacity={"50%"} stroke="#EEEEEE" />
            <YAxis domain={[0,100]} fontFamily="Arial, Helvetica, sans-serif" fontSize={11} strokeWidth={3} stroke="#EEEEEE" tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} contentStyle={{backgroundColor: "#FF000000", border: "none"}} labelStyle={{fontSize: 14}} itemStyle={{fontSize: 14, fontFamily: "Arial, Helvetica, sans-serif", color: "#EEEEEE", lineHeight: 0.5}} />
            <Line type="monotone" dataKey="mean" stroke={tealColor} strokeWidth={2} strokeDasharray='4, 2' activeDot={<ActiveDot/>} dot={<CustomDot/>}/>
            <Line type="monotone" dataKey="median" stroke={tealColor} strokeWidth={2} activeDot={<ActiveDot/>} dot={<CustomDot/>}/>
            <Bar stackId={'a'} dataKey={'min'} fill={'none'} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bar'} shape={<HorizonBar />} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bottomWhisker'} shape={<DotBar />} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bottomBox'} shape={<BarOutline/>} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'topBox'} shape={<BarOutline/>} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'topWhisker'} shape={<DotBar />} legendType="none" activeBar={false}/>
            <Bar stackId={'a'} dataKey={'bar'} shape={<HorizonBar />} legendType="none" activeBar={false}/>
        <ZAxis type='number' dataKey='size' range={[0, 250]} />
        </ComposedChart>
    </div>
}

export default GraphOutputComponent