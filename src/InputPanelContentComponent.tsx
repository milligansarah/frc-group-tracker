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
            else if (inputId.includes("-start-year") && Number(inputValue) != 0) {
                teamQuery += "s" + inputValue
            }
            else if (inputId.includes("-end-year") && Number(inputValue) != 0) {
                teamQuery += "e" + inputValue
            }
            else if (inputValue != "" && inputId.includes("group") == false) {
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
        <TeamsInGroupInputComponent teamAndYearRangePairsProp={props.teams as TeamAndYearRangePairsType}/>
        <YearRangeInputComponent startYear={props.startYear} endYear={props.endYear}/>
        <button style={{marginBottom: 40}} id="graph-button" type='submit' onClick={() => updateQueryString()}>Graph Stats</button>
    </div>
}

export default InputPanelContentComponent