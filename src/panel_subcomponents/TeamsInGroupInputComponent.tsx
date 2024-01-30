import { AddBox, AddBoxOutlined, CloseSharp, ExitToAppSharp, MinimizeSharp } from "@mui/icons-material";
import { ReactElement, useEffect } from "react";
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
            inputBoxes.push(<div id={"divinput" + i}><button className={"delete-button"} id={"delete" + i} onClick={(e) => deleteInputBox(e)}><CloseSharp/></button>
            <input autoFocus id={"input" + i} onKeyDown={(e) => shiftFocus(e)} type="text" defaultValue={teamsModified[i]}></input></div>);
        }
        
        return inputBoxes;
    }

    function shiftFocus(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key == "Enter") {
            const inputValue = e.currentTarget.value
            const currentInputId = e.currentTarget.id
            const lastInputId = window.document.getElementById("teams-input-boxes")?.lastElementChild?.lastElementChild?.id;
            console.log("current: " + currentInputId)
            console.log("last: " + lastInputId)
            if (inputValue == "" && currentInputId == lastInputId) {
                window.document.getElementById("start-year")?.focus()
            }
            else if (currentInputId == lastInputId) {
                addInputBox()
                renderInputBoxes()
            }
            else {
                const inputNumber = currentInputId.split("input")[1]
                let targetInputNumber : number = Number(inputNumber) + 1
                while (window.document.getElementById("input" + targetInputNumber) == null) {
                    targetInputNumber += 1
                }
                window.document.getElementById("input" + (targetInputNumber))?.focus()
            }
        }
    }

    function deleteInputBox(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const deleteButtonId = e.currentTarget.id
        window.document.getElementById("divinput" + deleteButtonId.split("delete")[1])?.remove()
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
        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
            {addClicked 
                ? <AddBox onMouseUp={() => addInputBox()} id="add-button" className="material-icon"/>
                : <AddBoxOutlined onMouseDown={() => setAddClicked(true)} id="add-button" className="material-icon"></AddBoxOutlined>
            }
            <button id="clear-button" onClick={() => {
                const inputElementContainer = window.document.getElementById("teams-input-boxes");
                while (inputElementContainer?.lastChild) {
                    inputElementContainer.removeChild(inputElementContainer.lastChild)
                }
            }}>Clear All</button>
        </div>
    </div>
}

export default TeamsInGroupInputComponent