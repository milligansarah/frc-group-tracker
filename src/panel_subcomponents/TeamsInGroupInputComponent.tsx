import { AddBox, AddBoxOutlined, CloseSharp, ExpandMore, HorizontalRule, KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import { ReactElement, useState } from "react";
import YearRangeInputComponent from "./YearRangeInputComponent";
import TeamAndYearRangeType from "../TeamAndYearRangePairType";
import Collapsible from "react-collapsible";
import LocationInputComponent from "./LocationInputComponent";
import EventInputComponent from "./EventInputComponent";

function TeamsInGroupInputComponent(props: {
    teamAndYearRangesProp: TeamAndYearRangeType[] | undefined
}) {
    const [teamAndYearRanges, setTeamAndYearRanges] = useState<TeamAndYearRangeType[]>(props.teamAndYearRangesProp || []);
    const [addClicked, setAddClicked] = useState(false);
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
    const [eventDropdownOpen, setEventDropdownOpen] = useState(false)

    function handleTeamInputChange(index: number, value: string) {
        const updatedTeamAndYearRanges = [...teamAndYearRanges];
        updatedTeamAndYearRanges[index].team = value;
        setTeamAndYearRanges(updatedTeamAndYearRanges);
    }

    function handleStartYearInputChange(index: number, startYear: number) {
        const updatedTeamAndYearRanges = [...teamAndYearRanges];
        updatedTeamAndYearRanges[index].startYear = startYear;
        setTeamAndYearRanges(updatedTeamAndYearRanges);
    }

    function handleEndYearInputChange(index: number, endYear: number) {
        const updatedTeamAndYearRanges = [...teamAndYearRanges];
        updatedTeamAndYearRanges[index].endYear = endYear;
        setTeamAndYearRanges(updatedTeamAndYearRanges);
    }

    function addInputBox() {
        setTeamAndYearRanges([...teamAndYearRanges, { team: '', startYear: 0, endYear: 0 }]);
        setAddClicked(false)
    }

    function deleteInputBox(index: number) {
        const updatedTeamAndYearRanges = teamAndYearRanges.filter((_, i) => i !== index);
        setTeamAndYearRanges(updatedTeamAndYearRanges);
    }

    function handleInputKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            if (teamAndYearRanges[index].team === "") {
                if (index === teamAndYearRanges.length - 1) {
                    addInputBox();
                }
                return;
            }

            const nextIndex = index + 1;
            if (nextIndex < teamAndYearRanges.length) {
                document.getElementById(`input${nextIndex}`)?.focus();
            } else {
                addInputBox();
            }
        }
    }

    function clearInputs() {
        setTeamAndYearRanges([])
    }

    function setInputTeamsFromChild(teams: TeamAndYearRangeType[]) {
        setTeamAndYearRanges(teams);
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
                {teamAndYearRanges.map((input, index) => (
                    <div key={index} id={`divinput${index}`}>
                        <button className="delete-button" id={`delete${index}`} onClick={() => deleteInputBox(index)}>
                            <CloseSharp />
                        </button>
                        <input
                            id={`team-input-${index}`}
                            style={{ width: 50 }}
                            autoFocus={index === teamAndYearRanges.length - 1}
                            type="text"
                            value={input.team}
                            onChange={(e) => handleTeamInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(index, e)}
                        />
                        <div>
                            <a href={`https://thebluealliance.com/team/${input.team}`} tabIndex={-1} target='_blank' style={{ marginLeft: 10 }}>
                                <img width={14} src='tba-logo.png' />
                            </a>
                            <a href={`https://statbotics.io/team/${input.team}`} tabIndex={-1} target='_blank' style={{ margin: 10 }}>
                                <img width={14} src='statbotics-logo.png' />
                            </a>
                        </div>
                        <div style={{ maxWidth: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <input
                                value={teamAndYearRanges[index]?.startYear || ''}
                                onChange={(e) => handleStartYearInputChange(index, Number(e.target.value))}
                                style={{ width: 42 }}
                                id={`${index}-start-year`}
                                type="text"
                            />
                            <HorizontalRule style={{ minWidth: "14%" }} id="dash-icon" className="material-icon" />
                            <input
                                value={teamAndYearRanges[index]?.endYear || ''}
                                onChange={(e) => handleEndYearInputChange(index, Number(e.target.value))}
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
