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
            inputBoxes.push(<div id={"divinput" + i}>
                <button className={"delete-button"} id={"delete" + i} onClick={(e) => deleteInputBox(e)}><CloseSharp/></button>
                <input autoFocus id={"input" + i} onKeyDown={(e) => shiftFocus(e)} type="text" defaultValue={teamsModified[i]}></input>
                <a href={'https://thebluealliance.com/team/' + teamsModified[i]} target='_blank' style={{marginLeft: 10}}><img width={20} src='tba-logo.png'/></a>
                <a href={'https://statbotics.io/team/' + teamsModified[i]} target='_blank' style={{margin: 10}}><img width={20} src='statbotics-logo.png'/></a>
            </div>);
        }
        return inputBoxes;
    }

    function shiftFocus(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key == "Enter") {
            const inputValue = e.currentTarget.value
            const currentInputId = e.currentTarget.id
            console.log("currentInputId " + currentInputId)
            const lastInputId = window.document.getElementById("teams-input-boxes")?.lastElementChild?.getElementsByTagName('input')[0]?.id;
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
                    console.log("while loop")
                    targetInputNumber += 1
                }
                window.document.getElementById("input" + (targetInputNumber))?.focus()
            }
        }
    }

    function deleteInputBox(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const deleteButtonId = e.currentTarget.id
        const numberOfInputBoxesBeforeDelete = window.document.getElementById("teams-input-boxes")?.childNodes.length
        window.document.getElementById("divinput" + deleteButtonId.split("delete")[1])?.remove()
        if (numberOfInputBoxesBeforeDelete == 1) {
            addInputBox()
        }
    }

    function addInputBox() {
        setAddClicked(false)
        setNumberOfInputBoxes(numberOfInputBoxes + 1)
    }
    
    return <div id="teams-input-container" style={{display: 'flex', flexDirection: 'column', marginBottom: 30}}>
        <h1>Teams In Group</h1>
            <div id="teams-input-boxes">
                {renderInputBoxes()}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                {addClicked 
                    ? <AddBox onMouseUp={() => addInputBox()} id="add-button" className="material-icon"/>
                    : <AddBoxOutlined onMouseDown={() => setAddClicked(true)} id="add-button" className="material-icon"></AddBoxOutlined>
                }
                <button id="clear-button" onClick={() => {
                    const inputElementContainer = window.document.getElementById("teams-input-boxes");
                    while (inputElementContainer?.lastChild) {
                        inputElementContainer.removeChild(inputElementContainer.lastChild)
                    }
                    addInputBox();
                }}>Clear All</button>
            </div>
    </div>
}

export default TeamsInGroupInputComponent