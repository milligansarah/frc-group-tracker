import { AddBox, AddBoxOutlined, CloseSharp, ExitToAppSharp, HorizontalRule, MinimizeSharp } from "@mui/icons-material";
import { ReactElement, useEffect } from "react";
import { useState } from 'react';
import YearRangeInputComponent from "./YearRangeInputComponent";
import TeamAndYearRangePairsType from "../TeamAndYearRangePairType";

function TeamsInGroupInputComponent(props: {
    teamAndYearRangePairs: TeamAndYearRangePairsType | undefined
}) {
    const [numberOfInputBoxes, setNumberOfInputBoxes] = useState(Object.keys(props.teamAndYearRangePairs!).length);
    const [addClicked, setAddClicked] = useState(false)
    
    function renderInputBoxes() : ReactElement[] {
        const teamPairsModified : TeamAndYearRangePairsType = props.teamAndYearRangePairs == undefined ? {'': {startYear: 2023, endYear: 2024}} : props.teamAndYearRangePairs
        const teamsModified : string[] = props.teamAndYearRangePairs == undefined ? [''] : Object.keys(props.teamAndYearRangePairs)
        let inputBoxes : ReactElement[] = []
        if (numberOfInputBoxes == 0) {
            addInputBox();
        }
        for(let i = 0; i < numberOfInputBoxes; i++) {
            const team = teamsModified[i]
            inputBoxes.push(<div id={"divinput" + i}>
                <button className={"delete-button"} id={"delete" + i} onClick={(e) => deleteInputBox(e)}><CloseSharp/></button>
                <input style={{width: 50}} autoFocus id={"input" + i} onKeyDown={(e) => shiftFocus(e)} type="text" defaultValue={team}></input>
                <div>
                    <a href={'https://thebluealliance.com/team/' + team} target='_blank' style={{marginLeft: 10}}><img width={14} src='tba-logo.png'/></a>
                    <a href={'https://statbotics.io/team/' + team} target='_blank' style={{margin: 10}}><img width={14} src='statbotics-logo.png'/></a>
                </div>
                <div style={{maxWidth: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <input defaultValue={teamPairsModified[team]?.startYear || ''} onKeyDown={(e) => {
                        // if (e.key == "Enter") {
                        //     window.document.getElementById("end-year")?.focus()
                        // }
                    }} style={{width: 42}} id={i + "-start-year"} type="text" ></input>
                    <HorizontalRule style={{minWidth: "14%"}} id="dash-icon" className="material-icon"/>
                    <input defaultValue={teamPairsModified[team]?.endYear || ''} style={{width: 42}} id={i + "-end-year"} type="text" ></input>
                </div>
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