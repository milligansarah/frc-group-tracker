import React, { useEffect, useState } from "react";
import TeamsInGroupInputComponent from "./panel_subcomponents/TeamsInGroupInputComponent";
import YearRangeInputComponent from "./panel_subcomponents/YearRangeInputComponent";
import queryType from "./QueryType";
import { useSearchParams } from "react-router-dom";
import TeamAndYearRangePairsType from "./TeamAndYearRangePairType";

function InputPanelContentComponent(props: queryType) {
    const [searchParams] = useSearchParams();

    window.addEventListener('resize', updateQueryString);

    useEffect(() => {
        window.document.getElementById("end-year")?.addEventListener('keydown', (e) => {
            if (e.key == "Enter") {
                updateQueryString();
            }
        })
    })

    function updateQueryString() {
        let startYear : string = "2023"
        let endYear : string = "2024"
        const teamPairs : TeamAndYearRangePairsType = {}
        const teams : string[] = []
        const inputs : HTMLCollectionOf<HTMLInputElement> = document.getElementsByTagName("input")
        for (var input in inputs) {
            const inputValue : string = (inputs.item(Number(input)) as HTMLInputElement).value
            const inputId : string = (inputs.item(Number(input)) as HTMLInputElement).id
            console.log(inputValue)
            if (inputId == "start-year") {
                startYear = inputValue
            }
            else if (inputId == "end-year") {
                endYear = inputValue
            }
            else if (inputId.includes("-start-year") && Number(inputValue) != 0) {
                const teamNumber = (document.getElementById("input" + inputId.split("-")[0]) as HTMLInputElement).value
                teamPairs[teamNumber] = {
                    startYear: Number(inputValue),
                    endYear: 0
                };
            }
            else if (inputId.includes("-end-year") && Number(inputValue) != 0) {
                const teamNumber = (document.getElementById("input" + inputId.split("-")[0]) as HTMLInputElement).value
                teamPairs[teamNumber]["endYear"] = Number(inputValue)
            }
            else if (teams.includes(inputValue) == false && inputValue != "") {
                teams.push(inputValue)
            }
        }
        if (teams.length > 0) {
            // Removes the "on" parameter added by the individual team checkbox
            if (teams.includes("on")) teams.pop()
            // Format the teams query
            let teamQuery : string = ""
            const teamsWithCustomYearRanges : string[] = Object.keys(teamPairs)
            for (const teamIndex in teams) {
                const team = teams[teamIndex]
                if (teamsWithCustomYearRanges.includes(team)) {
                    teamQuery += team + "s" + teamPairs[team]["startYear"] + "e" + teamPairs[team]["endYear"] + ","
                }
                else {
                    teamQuery += team + ","
                }
            }
            teamQuery = teamQuery.substring(0, teamQuery.length - 1)
            console.log("q: " + teamQuery)
            window.location.href = "?teams=" + teamQuery + "&start_year=" + startYear + "&end_year=" + endYear
        }
        else {
            (window.document.getElementById("teams-input-boxes")?.firstChild?.lastChild as HTMLElement).focus();
        }
    }

    return <div style={{margin: 40, marginRight: 0, maxWidth: 300}}>
        <TeamsInGroupInputComponent teamAndYearRangePairs={props.teams as TeamAndYearRangePairsType}/>
        <YearRangeInputComponent startYear={props.startYear} endYear={props.endYear}/>
        <button id="graph-button" type='submit' onClick={() => updateQueryString()}>Graph Stats</button>
    </div>
}

export default InputPanelContentComponent