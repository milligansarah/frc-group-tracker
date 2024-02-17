import React from "react";
import GetStartedOutputComponent from "./panel_subcomponents/GetStartedOutputComponent";
import queryType from "./QueryType";
import GraphOutputComponent from "./panel_subcomponents/GraphOutputComponent";

function OutputPanelContentComponent(props: queryType) {
    return <div style={{position: 'relative', top: '50vh', left: '50%', height: 'fit-content', width: 'fit-content', transform: 'translate(-50%, -50%)'}}>
        {props.teams === undefined || props.endYear === null || props.startYear == null 
            ? <GetStartedOutputComponent/> 
            : <GraphOutputComponent teams={props.teams} startYear={props.startYear} endYear={props.endYear} />}
    </div>
}

export default OutputPanelContentComponent