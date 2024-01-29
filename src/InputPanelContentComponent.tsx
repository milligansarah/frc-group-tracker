import React, { useEffect, useState } from "react";
import TeamsInGroupInputComponent from "./panel_subcomponents/TeamsInGroupInputComponent";
import YearRangeInputComponent from "./panel_subcomponents/YearRangeInputComponent";
import queryType from "./QueryType";
import { useSearchParams } from "react-router-dom";

function InputPanelContentComponent(props: queryType) {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState("?teams=" + searchParams.get("teams"));

    useEffect(() => {
        window.document.getElementById("end-year")?.addEventListener('keydown', (e) => {
            if (e.key == "Enter") {
                updateQueryString();
                window.document.getElementById("query-link")?.click()
            }
        })
    })

    function updateQueryString() {
        const teams : string[] = []
        let startYear : string = ""
        let endYear : string = ""
        const inputs : HTMLCollectionOf<HTMLInputElement> = document.getElementsByTagName("input")
        for (var input in inputs) {
            const inputValue : string = (inputs.item(Number(input)) as HTMLInputElement).value
            const inputId : string = (inputs.item(Number(input)) as HTMLInputElement).id
            if (inputId == "start-year") {
                startYear = inputValue
            }
            else if (inputId == "end-year") {
                endYear = inputValue
            }
            else if (teams.includes(inputValue) == false && inputValue != "") {
                teams.push(inputValue)
            }
        }
        setQuery("?teams=" + teams.map((team) => team) + "&start_year=" + startYear + "&end_year=" + endYear)
    }

    return <div style={{margin: 40}}>
        <TeamsInGroupInputComponent teams={props.teams}/>
        <YearRangeInputComponent startYear={props.startYear} endYear={props.endYear}/>
        <a id="query-link" href={query}><button id="graph-button" type='submit' onClick={() => updateQueryString()}>Graph Stats</button></a>
    </div>
}

export default InputPanelContentComponent