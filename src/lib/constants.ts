/**
 * CongressWatch Authoritative Constants & Single Source of Truth
 * Official statutory benchmarks for the 118th United States Congress.
 */

export const CONGRESS_BENCHMARKS = {
  SESSION: 118,
  SESSION_YEARS: '2023–2025',

  // Constitutional & Roster Benchmarks
  SENATE_TOTAL_SEATS: 100,
  HOUSE_VOTING_SEATS: 435,
  HOUSE_NON_VOTING_DELEGATES: 4, // DC, Guam, Virgin Islands, American Samoa, Northern Mariana Islands
  TOTAL_SITTING_MEMBERS: 539, // 100 Senators + 439 House Members (435 voting + delegates)

  // 118th Congress Official Partisan Balance
  DEMOCRATS_TOTAL: 262,
  REPUBLICANS_TOTAL: 274,
  INDEPENDENTS_TOTAL: 3,

  // Legislative Threshold Invariants
  HOUSE_MAJORITY_THRESHOLD: 218,
  HOUSE_TWO_THIRDS_VETO_OVERRIDE: 290,
  SENATE_SIMPLE_MAJORITY: 51,
  SENATE_FILIBUSTER_CLOTURE: 60,
  SENATE_TWO_THIRDS_VETO_OVERRIDE: 67,
  SENATE_TREATY_RATIFICATION: 67,

  // Macro Financial & Disclosures Data
  FY2024_CONSOLIDATED_APPROPRIATIONS_BILLIONS: 851.6,
  FY2025_NDAA_AUTHORIZED_BILLIONS: 849.8,
  DISCLOSED_CONGRESSIONAL_TRADES_COUNT: 682,
  DISCLOSED_CONGRESSIONAL_TRADES_VOLUME_MILLIONS: 44.8,
  ACTIVE_SAM_GOV_SOLICITATIONS_ESTIMATE: 4280,
  AI_PREDICTIVE_ACCURACY_PCT: 88.4,

  // Developer API Metering Invariants
  RATE_LIMIT_DAILY_DEFAULT: 100,
  RATE_LIMIT_MONTHLY_DEFAULT: 1500,
  RATE_LIMIT_BURST_PER_MINUTE: 30
} as const;

export const PARTY_METADATA = {
  Democrat: {
    name: 'Democratic Party',
    shortName: 'DEM',
    colorHex: '#1e40af',
    bgClass: 'bg-blue-600',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-600',
    officialTotal: 262
  },
  Republican: {
    name: 'Republican Party',
    shortName: 'GOP',
    colorHex: '#991b1b',
    bgClass: 'bg-red-600',
    textClass: 'text-red-600',
    borderClass: 'border-red-600',
    officialTotal: 274
  },
  Independent: {
    name: 'Independent',
    shortName: 'IND',
    colorHex: '#7c3aed',
    bgClass: 'bg-purple-600',
    textClass: 'text-purple-600',
    borderClass: 'border-purple-600',
    officialTotal: 3
  }
} as const;

export const CHAMBER_METADATA = {
  senate: {
    name: 'United States Senate',
    totalSeats: 100,
    termLengthYears: 6
  },
  house: {
    name: 'House of Representatives',
    totalSeats: 439, // including delegates
    votingSeats: 435,
    termLengthYears: 2
  }
} as const;
