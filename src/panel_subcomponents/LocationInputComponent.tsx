import { useState } from "react";
import TeamAndYearRangePairsType from "../TeamAndYearRangePairType";
import { CircularProgress } from "@mui/material";

function LocationInputComponent(props: {
    locationType: string,
    setInputFunction: Function
}) {
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fillTeams = async () => {
        setIsLoading(true)
        let teamsResponse, teamsJson
        let index = 0
        let allTeams : any = []
        do {
            teamsResponse = await fetch('https://www.thebluealliance.com/api/v3/teams/' + index + '?X-TBA-Auth-Key=Qvh4XAMdIteMcXIaz6eunrLmGlseHtDnb4NrUMALYuNErSOgcKPBsNSMEWDMgVyV');
            teamsJson = await teamsResponse.json() as [];
            console.log(index)
            index++
            allTeams = allTeams.concat(teamsJson) as []
        }
        while (teamsJson.length != 0)
        const finalTeamInputList : TeamAndYearRangePairsType = {}
        console.log(allTeams)

        switch (props.locationType) {
            case "Country":
                for (const teamIndex in allTeams) {
                    const teamDict = allTeams[teamIndex as any]
                    console.log(teamDict)
                    if (teamDict["country"] == inputValue) {
                        finalTeamInputList[teamDict["team_number"]] = {}
                    }
                }
                break;
            case "State/Province":
                for (const teamIndex in allTeams) {
                    const teamDict = allTeams[teamIndex as any]
                    console.log(teamDict)
                    if (teamDict["state_prov"] == inputValue) {
                        finalTeamInputList[teamDict["team_number"]] = {}
                    }
                }
                break;
            case "City":
                for (const teamIndex in allTeams) {
                    const teamDict = allTeams[teamIndex as any]
                    console.log(teamDict)
                    if (teamDict["city"] == inputValue) {
                        finalTeamInputList[teamDict["team_number"]] = {}
                    }
                }
                break;
            case "Zip Code":
                for (const teamIndex in allTeams) {
                    const teamDict = allTeams[teamIndex as any]
                    console.log(teamDict)
                    if (teamDict["postal_code"] == inputValue) {
                        finalTeamInputList[teamDict["team_number"]] = {}
                    }
                }
                break;
        }
        props.setInputFunction(finalTeamInputList)
        console.log(finalTeamInputList)
        setIsLoading(false)
    }

    return <div style={{display: "flex", alignItems: "flex-end", height: 60}}>
        <div style={{marginRight: 20}}>
            <p style={{fontSize: 12, marginTop: 0, marginBottom: 5}}>{props.locationType}</p>
            <input id={props.locationType + "-group"} style={{width: "max-content"}} type="text" onChange={(event) => setInputValue(event.target.value)} ></input>
        </div>
        { isLoading ? 
            <CircularProgress style={{width: 30, height: 30}} id="loading-icon"/> :
            <button className="fill-button" style={{width: 80}} onClick={fillTeams}>Fill Teams</button>}
    </div>
}

export default LocationInputComponent