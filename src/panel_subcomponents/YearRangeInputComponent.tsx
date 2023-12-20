import React from "react";
import { HorizontalRule } from "@mui/icons-material";

function TeamsInGroupInputComponent(props: {
    startYear: number | null,
    endYear: number | null
}) {
    return <div>
        <h1>Year Range</h1>
        <div style={{maxWidth: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <input style={{minWidth: 40, width: '43%'}} id="start-year" type="text" defaultValue={props.startYear!}></input>
            <HorizontalRule style={{minWidth: "14%"}} id="dash-icon" className="material-icon"/>
            <input style={{minWidth: 40, width: '43%'}} id="end-year" type="text" defaultValue={props.endYear!}></input>
        </div>
    </div>
}

export default TeamsInGroupInputComponent