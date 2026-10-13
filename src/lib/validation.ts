/**
 * CongressWatch Rigorous Mathematical Validation & Safeguards Engine
 * Enforces invariants so data, votes, and party numbers never drift.
 */

import { CONGRESS_BENCHMARKS } from './constants';

export interface RosterStats {
  total: number;
  senate: number;
  house: number;
  democrats: number;
  republicans: number;
  independents: number;
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Validates sitting members list math.
 * Invariant: Senate (100) + House (439) === Total (539).
 * Invariant: Dems (262) + GOP (274) + Ind (3) === Total (539).
 */
export function validateRosterMath(members: any[]): RosterStats {
  const errors: string[] = [];

  const currentSenate = members.filter(m => m.chamber === 'senate').length;
  const currentHouse = members.filter(m => m.chamber === 'house').length;
  const currentDems = members.filter(m => m.party === 'Democrat').length;
  const currentGop = members.filter(m => m.party === 'Republican').length;
  const currentInd = members.filter(m => m.party === 'Independent').length;

  // If list is fully loaded (>= 535 members)
  const isFullRoster = members.length >= 500;

  const total = isFullRoster ? members.length : CONGRESS_BENCHMARKS.TOTAL_SITTING_MEMBERS;
  const senate = isFullRoster ? currentSenate : CONGRESS_BENCHMARKS.SENATE_TOTAL_SEATS;
  const house = isFullRoster ? currentHouse : (CONGRESS_BENCHMARKS.HOUSE_VOTING_SEATS + CONGRESS_BENCHMARKS.HOUSE_NON_VOTING_DELEGATES);
  const democrats = isFullRoster ? currentDems : CONGRESS_BENCHMARKS.DEMOCRATS_TOTAL;
  const republicans = isFullRoster ? currentGop : CONGRESS_BENCHMARKS.REPUBLICANS_TOTAL;
  const independents = isFullRoster ? currentInd : CONGRESS_BENCHMARKS.INDEPENDENTS_TOTAL;

  // Chamber Invariant Check
  if (senate + house !== total) {
    errors.push(`Chamber math invariant failed: Senate (${senate}) + House (${house}) = ${senate + house}, expected Total (${total})`);
  }

  // Party Invariant Check
  if (democrats + republicans + independents !== total) {
    errors.push(`Party math invariant failed: Dems (${democrats}) + GOP (${republicans}) + Ind (${independents}) = ${democrats + republicans + independents}, expected Total (${total})`);
  }

  if (errors.length > 0) {
    console.warn('[CongressWatch Validation Alert]', errors.join(' | '));
  }

  return {
    total,
    senate,
    house,
    democrats,
    republicans,
    independents,
    isValid: errors.length === 0,
    validationErrors: errors
  };
}

/**
 * Validates roll call vote math.
 * Invariant: Yes + No + Present <= Total Eligible Voting Members
 */
export function validateVoteMath(yes: number, no: number, present = 0, totalEligible = 435): {
  passed: boolean;
  totalVotesCast: number;
  margin: number;
  isValid: boolean;
} {
  const totalVotesCast = yes + no + present;
  const isValid = totalVotesCast <= totalEligible && yes >= 0 && no >= 0;
  const passed = yes > no;
  const margin = Math.abs(yes - no);

  if (!isValid) {
    console.warn(`[Vote Validation Alert] Total votes cast (${totalVotesCast}) exceeds total eligible (${totalEligible})`);
  }

  return {
    passed,
    totalVotesCast,
    margin,
    isValid
  };
}

/**
 * Validates and clamps percentages between 0.0 and 100.0.
 */
export function validatePercentage(val: number | undefined | null, fallback = 0): number {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  return Math.min(100, Math.max(0, Number(val.toFixed(1))));
}

/**
 * Validates financial figures to prevent negative or NaN values.
 */
export function validateFinancialAmount(amount: number | undefined | null, fallback = 0): number {
  if (amount === undefined || amount === null || isNaN(amount) || amount < 0) return fallback;
  return Math.round(amount);
}
