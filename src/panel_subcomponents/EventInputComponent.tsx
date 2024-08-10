import { useState } from "react";
import TeamAndYearRangeType from "../TeamAndYearRangePairType";
import { CircularProgress } from "@mui/material";
import { HorizontalRule } from "@mui/icons-material";

function EventInputComponent(props: {
    setInputFunction: Function
}) {
    const [eventCode, setEventCode] = useState("")
    const [startYear, setStartYear] = useState("")
    const [endYear, setEndYear] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fillTeams = async () => {
        setIsLoading(true)
        // TODO: Display a visual indicator if a year range is invalid
        if (startYear == undefined || endYear == undefined || startYear > endYear) {
            return
        }
        const finalTeamInputList : TeamAndYearRangeType[] = []
        for (let year : number = Number(startYear); year <= Number(endYear); year += 1) {
            const teamsResponse = await fetch("https://www.thebluealliance.com/api/v3/event/" + year + "" + eventCode + "/teams/keys?X-TBA-Auth-Key=Qvh4XAMdIteMcXIaz6eunrLmGlseHtDnb4NrUMALYuNErSOgcKPBsNSMEWDMgVyV");
            const teamsJson = await teamsResponse.json() as [];
            if (Object.keys(teamsJson)[0] == "Error") {
                continue
            }
            for (const teamIndex in teamsJson) {
                const team : string = (teamsJson[teamIndex] as string).split("frc")[1]
                finalTeamInputList.push({team: team})
            }
        }
        props.setInputFunction(finalTeamInputList)
        setIsLoading(false)
    }

    return <div style={{marginBottom: 40}}>
        <div style={{display: "flex", alignItems: "flex-end", height: 60}}>
            <div style={{marginRight: 20}}>
                <p style={{fontSize: 12, marginTop: 0, marginBottom: 5}}>Event Code</p>
                <input style={{width: 80}} type="text" onChange={(event) => setEventCode(event.target.value)} ></input>
            </div>
            <div>
                <p style={{fontSize: 12, marginTop: 0, marginBottom: 5}}>Year Range</p>
                <div style={{ maxWidth: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <input
                        onChange={(event) => setStartYear(event.target.value)}
                        style={{ width: 42 }}
                        id={`event-code-start-year`}
                        type="text"
                    />
                    <HorizontalRule style={{ minWidth: "14%" }} id="dash-icon" className="material-icon" />
                    <input
                        onChange={(event) => setEndYear(event.target.value)}
                        style={{ width: 42 }}
                        id={`event-code-end-year`}
                        type="text"
                    />
                </div>
            </div>
        </div>
        { isLoading ? 
            <CircularProgress style={{width: 30, height: 30, marginTop: 20}} id="loading-icon"/> :
            <button className="fill-button" onClick={fillTeams}>Fill Teams</button>}
    </div>
}

export default EventInputComponent