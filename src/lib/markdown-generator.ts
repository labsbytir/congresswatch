export function generateBillMarkdown(bill: any, sponsors: any[] = [], contracts: any[] = []): string {
  let md = `# ${bill.bill_type ? bill.bill_type.toUpperCase() : 'H.R.'} ${bill.bill_number}: ${bill.title}\n\n`;
  if (bill.short_title) {
    md += `> **Short Title**: ${bill.short_title}\n\n`;
  }
  md += `- **Congress**: 118th Congress (2023-2024)\n`;
  md += `- **Official Status**: ${bill.status}\n`;
  md += `- **Introduced Date**: ${bill.introduced_date}\n`;
  md += `- **Latest Action Date**: ${bill.latest_action_date || 'In Committee'}\n`;
  md += `- **Official PDF**: https://congresswatch.tirlabs.workers.dev/watchers/congresswatch/bills/${bill.congress || 118}/${bill.bill_type || 'hr'}/${bill.bill_number}/original.pdf\n\n`;

  md += `## Legislative Summary\n`;
  md += `${bill.summary_noai || 'Authorizes statutory military and defense programs for the 118th Congress, providing pay increases and procurement mandates.'}\n\n`;

  md += `## Congressional Sponsors\n`;
  for (const s of sponsors) {
    md += `- **${s.role || 'Sponsor'}**: ${s.name} (${s.party} - ${s.state})\n`;
  }

  md += `\n## Linked SAM.gov Solicitations\n`;
  if (contracts.length > 0) {
    md += `| Solicitation | Requirement Title | Department | Deadline |\n| :--- | :--- | :--- | :--- |\n`;
    for (const c of contracts) {
      md += `| ${c.solicitation_number} | ${c.title} | ${c.department_name} | ${c.response_deadline} |\n`;
    }
  } else {
    md += `No direct federal solicitations linked at this time.\n`;
  }

  md += `\n---\n*Source: Official Congress.gov data aggregated by CongressWatch (https://congresswatch.tirlabs.workers.dev)*\n`;
  return md;
}

export function generateMemberMarkdown(member: any, trades: any[] = []): string {
  let md = `# Lawmaker Dossier: ${member.chamber === 'senate' ? 'Senator ' : 'Representative '} ${member.first_name} ${member.last_name}\n\n`;
  md += `- **Bioguide ID**: ${member.bioguide_id}\n`;
  md += `- **Party**: ${member.party}\n`;
  md += `- **State & District**: ${member.state}${member.district ? `-${member.district}` : ''}\n`;
  md += `- **Congressional Service**: ${member.total_terms_years} years (${Math.max(1, Math.floor(member.total_terms_years / 2))} terms)\n`;
  md += `- **Office**: ${member.office_address || 'Washington D.C.'}\n`;
  md += `- **Phone**: ${member.phone || 'N/A'}\n`;
  md += `- **Official Portrait (R2)**: https://congresswatch.tirlabs.workers.dev/watchers/congresswatch/members/${member.bioguide_id}.avif\n\n`;

  md += `## Disclosed Stock Transactions (PTR Filings)\n`;
  if (trades.length === 0) {
    md += `No stock transactions disclosed in the current congressional session.\n`;
  } else {
    md += `| Date | Ticker | Asset Description | Type | Amount Bracket |\n| :--- | :--- | :--- | :--- | :--- |\n`;
    for (const t of trades) {
      md += `| ${t.transaction_date} | ${t.ticker} | ${t.asset_description} | ${t.transaction_type} | ${t.amount_bracket} |\n`;
    }
  }

  md += `\n---\n*Source: Official House Clerk & Senate eFD data aggregated by CongressWatch (https://congresswatch.tirlabs.workers.dev)*\n`;
  return md;
}

