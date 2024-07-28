interface YearRange {
    startYear?: number;
    endYear?: number;
}

type TeamAndYearRangePairsType = {[team: string]: YearRange}

export default TeamAndYearRangePairsType