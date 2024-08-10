import TeamAndYearRangePairsType from "./TeamAndYearRangePairType"

type queryType = {
    teams: TeamAndYearRangePairsType[] | undefined,
    startYear: number,
    endYear: number
}

export default queryType