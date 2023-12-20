import React, { useState } from "react";
import TeamsInGroupInputComponent from "./panel_subcomponents/TeamsInGroupInputComponent";
import YearRangeInputComponent from "./panel_subcomponents/YearRangeInputComponent";
import queryType from "./QueryType";
import { useSearchParams } from "react-router-dom";

function InputPanelContentComponent(props: queryType) {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState("?teams=" + searchParams.get("teams"));

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
        setQuery("?teams=" + teams.map((team) => team) + "&end_year=" + endYear + "&start_year=" + startYear)
    }

    return <div style={{margin: 40}}>
        <TeamsInGroupInputComponent teams={props.teams}/>
        <YearRangeInputComponent startYear={props.startYear} endYear={props.endYear}/>
        <a href={query}><button type='submit' onClick={() => updateQueryString()}>Graph Stats</button></a>
    </div>
}

export default InputPanelContentComponent