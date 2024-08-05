import React, { useEffect } from "react";
import { HorizontalRule } from "@mui/icons-material";

function TeamsInGroupInputComponent(props: {
    startYear: number,
    endYear: number
}) {
    return <div style={{marginBottom: 20}}>
        <h1>Year Range</h1>
        <div style={{maxWidth: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <input placeholder="2023" onKeyDown={(e) => {
                if (e.key == "Enter") {
                    window.document.getElementById("end-year")?.focus()
                }
            }} style={{minWidth: 60, width: '43%'}} id="start-year" type="text" defaultValue={props.startYear == 0 ? 2023 : props.startYear}></input>
            <HorizontalRule style={{minWidth: "14%"}} id="dash-icon" className="material-icon"/>
            <input style={{minWidth: 60, width: '43%'}} id="end-year" type="text" defaultValue={props.endYear == 0 ? 2024 : props.endYear}></input>
        </div>
    </div>
}

export default TeamsInGroupInputComponent