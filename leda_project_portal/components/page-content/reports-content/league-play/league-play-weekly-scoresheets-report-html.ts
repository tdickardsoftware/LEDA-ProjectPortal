import { LeaguePlayWeeklyScoresheets } from "@/lib/definitions";
import { buildSitePageHtml, escapeHtml } from "@/lib/report-html";
import { groupByDivisionAndSubdivision, naturalSort } from "./react-pdf/league-play-weekly-scoresheets-report";

// Widths match the PDF columns.
const COLUMNS = [
	{ label: "Division Info", width: "15%" },
	{ label: "Place Name", width: "18%" },
	{ label: "Team Name", width: "18%" },
	{ label: "PrP", width: "10%" },
	{ label: "PS", width: "10%" },
	{ label: "PrPP", width: "10%" },
	{ label: "PP", width: "10%" },
	{ label: "TP", width: "9%" },
] as const;

const cellStyle = (i: number, extra = "") =>
	`width:${COLUMNS[i].width};padding:4px;font-size:8pt;text-align:left;border:0;` +
	`${i < COLUMNS.length - 1 ? "border-right:1px solid #ccc;" : ""}${extra}`;

const headerRow = `<tr style="background:#d3d3d3;border:1px solid #888">${COLUMNS.map(
	(c, i) => `<td style="${cellStyle(i, "font-size:9pt;font-weight:bold;")}">${c.label}</td>`
).join("")}</tr>`;

export function generateWeeklyScoresheetsHtml(
	data: LeaguePlayWeeklyScoresheets[],
	weekNum: string,
	desc: string
): string {
	const divisionMap = groupByDivisionAndSubdivision(data);

	const divisions = Object.keys(divisionMap)
		.sort(naturalSort)
		.map((division) => {
			const subdivisionMap = divisionMap[division];
			const subdivisions = Object.keys(subdivisionMap)
				.sort(naturalSort)
				.map((subdivision) => {
					const label = subdivision.startsWith("Subdivision")
						? `${division} ${subdivision.replace("Subdivision", "").trim()}`
						: `${division} ${subdivision}`;
					const rows = subdivisionMap[subdivision]
						.map((row) => {
							const values = [
								row.divisionInfo,
								row.placeName,
								row.teamName,
								row.prevTotalPoints,
								row.pointsScored,
								row.previousPenaltyPoints,
								row.penaltyPoints,
								row.totalPoints,
							];
							return `<tr style="border-left:1px solid #888;border-right:1px solid #888;border-bottom:1px solid #ccc">${values
								.map((v, i) => `<td style="${cellStyle(i)}">${escapeHtml(v)}</td>`)
								.join("")}</tr>`;
						})
						.join("");
					return `<div style="break-inside:avoid">
						<div style="font-size:11pt;font-weight:bold;margin:4px 0">${escapeHtml(label)}</div>
						<table style="table-layout:fixed;width:100%;border-collapse:collapse;margin:0 0 16px">${headerRow}${rows}</table>
					</div>`;
				})
				.join("");
			return `<div style="font-size:12pt;font-weight:bold;margin:8px 0">${escapeHtml(division)}</div>${subdivisions}`;
		})
		.join("");

	return buildSitePageHtml({
		heading: `LEDA ${desc} League`,
		subtitle: `Week# ${weekNum} ${desc}`,
		body: divisions,
	});
}
