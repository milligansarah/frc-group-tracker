import { AddBox, AddBoxOutlined } from "@mui/icons-material";
import { ReactElement } from "react";
import { useState } from 'react';

function TeamsInGroupInputComponent(props: {
    teams: string[] | undefined
}) {
    const [numberOfInputBoxes, setNumberOfInputBoxes] = useState(props.teams?.length ?? 1);
    const [addClicked, setAddClicked] = useState(false)
    
    function renderInputBoxes() : ReactElement[] {
        const teamsModified : string[] = props.teams == undefined ? [''] : props.teams
        let inputBoxes : ReactElement[] = []
        for(let i = 0; i < numberOfInputBoxes; i++) {
            inputBoxes.push(<input id={"team" + i} type="text" defaultValue={teamsModified[i]}></input>);
        }
        return inputBoxes;
    }

    function addInputBox() {
        setAddClicked(false)
        setNumberOfInputBoxes(numberOfInputBoxes + 1)
    }

    
    return <div id="teams-input-container" style={{display: 'flex', flexDirection: 'column'}}>
        <h1>Teams In Group</h1>
        <div id="teams-input-boxes">
            {renderInputBoxes()}
        </div>
        {addClicked 
            ? <AddBox onMouseUp={() => addInputBox()} id="add-button" className="material-icon"/>
            : <AddBoxOutlined onMouseDown={() => setAddClicked(true)} id="add-button" className="material-icon"></AddBoxOutlined>
        }
    </div>
}

export default TeamsInGroupInputComponent