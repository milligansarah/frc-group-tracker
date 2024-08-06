import { AddBox, AddBoxOutlined, CloseSharp, ExpandMore, HorizontalRule, KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import { ReactElement, useState } from "react";
import YearRangeInputComponent from "./YearRangeInputComponent";
import TeamAndYearRangePairsType from "../TeamAndYearRangePairType";
import Collapsible from "react-collapsible";
import LocationInputComponent from "./LocationInputComponent";
import EventInputComponent from "./EventInputComponent";

function TeamsInGroupInputComponent(props: {
    teamAndYearRangePairsProp: TeamAndYearRangePairsType | undefined
}) {
    const [teamAndYearRangePairs, setTeamAndYearRangePairs] = useState<TeamAndYearRangePairsType>(props.teamAndYearRangePairsProp || {});
    const [inputBoxes, setInputBoxes] = useState<string[]>(Object.keys(teamAndYearRangePairs));
    const [addClicked, setAddClicked] = useState(false);
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
    const [eventDropdownOpen, setEventDropdownOpen] = useState(false)

    function handleTeamInputChange(index: number, value: string) {
        const updatedInputBoxes = [...inputBoxes];
        updatedInputBoxes[index] = value;
        setInputBoxes(updatedInputBoxes);
    }

    function handleStartYearInputChange(team: string, startYear: number) {
        setTeamAndYearRangePairs(prevState => ({
            ...prevState,
            [team]: {
                ...prevState[team],
                startYear: startYear
            }
        }));
    }

    function handleEndYearInputChange(team: string, endYear: number) {
        setTeamAndYearRangePairs(prevState => ({
            ...prevState,
            [team]: {
                ...prevState[team],
                endYear: endYear
            }
        }));
    }

    function addInputBox() {
        setInputBoxes([...inputBoxes, '']);
        setAddClicked(false)
    }

    function deleteInputBox(index: number) {
        const updatedInputBoxes = inputBoxes.filter((_, i) => i !== index);
        setInputBoxes(updatedInputBoxes);
    }

    function handleInputKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            if (inputBoxes[index] === "") {
                if (index === inputBoxes.length - 1) {
                    addInputBox();
                }
                return;
            }

            const nextIndex = index + 1;
            if (nextIndex < inputBoxes.length) {
                document.getElementById(`input${nextIndex}`)?.focus();
            } else {
                addInputBox();
            }
        }
    }

    function clearInputs() {
        setInputBoxes(['']);
        setTeamAndYearRangePairs({});
    }

    function setInputTeamsFromChild(teams: TeamAndYearRangePairsType) {
        setTeamAndYearRangePairs(teams);
        setInputBoxes(Object.keys(teams));
    }

    return (
        <div id="teams-input-container" style={{ display: 'flex', flexDirection: 'column', marginBottom: 30 }}>
            <h1 style={{ marginBottom: 5 }}>Teams In Group</h1>
            <p style={{ marginTop: 0 }}>Input manually or generate inputs from a location or event</p>
            <Collapsible trigger={<h2>By Location 
                { locationDropdownOpen ?
                    <KeyboardArrowDown style={{ position: 'relative', transform: 'translateY(25%)' }} />:
                    <KeyboardArrowRight style={{ position: 'relative', transform: 'translateY(25%)' }} />
                } </h2>} 
                onOpening={() => setLocationDropdownOpen(true)}
                onClosing={() => setLocationDropdownOpen(false)}>
                <div style={{ marginBottom: 20 }}>
                    <LocationInputComponent locationType="Country" setInputFunction={setInputTeamsFromChild} />
                    <LocationInputComponent locationType="State/Province" setInputFunction={setInputTeamsFromChild} />
                    <LocationInputComponent locationType="City" setInputFunction={setInputTeamsFromChild} />
                    <LocationInputComponent locationType="Zip Code" setInputFunction={setInputTeamsFromChild} />
                </div>
            </Collapsible>
            <Collapsible trigger={<h2 style={{ marginBottom: 14 }}>By Event 
                { eventDropdownOpen ?
                    <KeyboardArrowDown style={{ position: 'relative', transform: 'translateY(25%)' }} />:
                    <KeyboardArrowRight style={{ position: 'relative', transform: 'translateY(25%)' }} />
                } </h2>} 
                onOpening={() => setEventDropdownOpen(true)}
                onClosing={() => setEventDropdownOpen(false)}>
                <div style={{ marginBottom: 25 }}>
                    <EventInputComponent setInputFunction={setInputTeamsFromChild}/>
                </div>
            </Collapsible>
            <div id="teams-input-boxes">
                {inputBoxes.map((team, index) => (
                    <div key={index} id={`divinput${index}`}>
                        <button className="delete-button" id={`delete${index}`} onClick={() => deleteInputBox(index)}>
                            <CloseSharp />
                        </button>
                        <input
                            id={`team-input-${index}`}
                            style={{ width: 50 }}
                            autoFocus={index === inputBoxes.length - 1}
                            type="text"
                            value={team}
                            onChange={(e) => handleTeamInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(index, e)}
                        />
                        <div>
                            <a href={`https://thebluealliance.com/team/${team}`} tabIndex={-1} target='_blank' style={{ marginLeft: 10 }}>
                                <img width={14} src='tba-logo.png' />
                            </a>
                            <a href={`https://statbotics.io/team/${team}`} tabIndex={-1} target='_blank' style={{ margin: 10 }}>
                                <img width={14} src='statbotics-logo.png' />
                            </a>
                        </div>
                        <div style={{ maxWidth: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <input
                                value={teamAndYearRangePairs[team]?.startYear || ''}
                                onChange={(e) => handleStartYearInputChange(team, Number(e.target.value))}
                                style={{ width: 42 }}
                                id={`${index}-start-year`}
                                type="text"
                            />
                            <HorizontalRule style={{ minWidth: "14%" }} id="dash-icon" className="material-icon" />
                            <input
                                value={teamAndYearRangePairs[team]?.endYear || ''}
                                onChange={(e) => handleEndYearInputChange(team, Number(e.target.value))}
                                style={{ width: 42 }}
                                id={`${index}-end-year`}
                                type="text"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {addClicked
                    ? <AddBox onMouseUp={() => addInputBox()} id="add-button" className="material-icon" />
                    : <AddBoxOutlined onMouseDown={() => setAddClicked(true)} id="add-button" className="material-icon" />
                }
                <button id="clear-button" onClick={clearInputs}>Clear All</button>
            </div>
        </div>
    );
}

export default TeamsInGroupInputComponent;
