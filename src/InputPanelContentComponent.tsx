import React, { useEffect, useState } from "react";
import TeamsInGroupInputComponent from "./panel_subcomponents/TeamsInGroupInputComponent";
import YearRangeInputComponent from "./panel_subcomponents/YearRangeInputComponent";
import queryType from "./QueryType";
import { useSearchParams } from "react-router-dom";
import TeamAndYearRangeType from "./TeamAndYearRangePairType";

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
        let startYear : string = "2024"
        let endYear : string = "2025"
        let numTeams : number = 0
        const inputs : HTMLCollectionOf<HTMLInputElement> = document.getElementsByTagName("input")
        let teamQuery : string = ""
        for (var input in inputs) {
            const inputValue : string = (inputs.item(Number(input)) as HTMLInputElement).value
            const inputId : string = (inputs.item(Number(input)) as HTMLInputElement).id
            if (inputId == "start-year") {
                startYear = inputValue
            }
            else if (inputId == "end-year") {
                endYear = inputValue
            }
            else if (inputId.includes("-start-year") && inputId.includes("event") == false && Number(inputValue) != 0) {
                teamQuery += "s" + inputValue
            }
            else if (inputId.includes("-end-year") && inputId.includes("event") == false && Number(inputValue) != 0) {
                teamQuery += "e" + inputValue
            }
            else if (inputValue != "" && inputId.includes("team-input-")) {
                // Removes the "on" parameter added by the individual team checkbox                
                if (inputValue == "on") {
                    continue
                }
                teamQuery += teamQuery.length != 0 ? "," : ""
                teamQuery += inputValue
                numTeams++
            }
        }
        if (numTeams > 0) {
            window.location.href = "?teams=" + teamQuery + "&start_year=" + startYear + "&end_year=" + endYear
        }
        else {
            (window.document.getElementById("teams-input-boxes")?.firstChild?.lastChild as HTMLElement).focus();
        }
    }

    return <div style={{margin: 40, marginRight: 0, maxWidth: 300}}>
        {/* Creates an empty input component if there are no input teams */}
        <TeamsInGroupInputComponent teamAndYearRangesProp={props.teams?.length == 0 ? [{team: '', startYear: 0, endYear: 0}] as TeamAndYearRangeType[] : props.teams as TeamAndYearRangeType[]}/>
        <YearRangeInputComponent startYear={props.startYear} endYear={props.endYear}/>
        <button style={{marginBottom: 40}} id="graph-button" type='submit' onClick={() => updateQueryString()}>Graph Stats</button>
    </div>
}

export default InputPanelContentComponent