import { TrailsPointsList } from "@/lib/definitions";
import { buildSitePageHtml, escapeHtml } from "@/lib/report-html";

// Fixed column widths and alignments match the PDF.
const COLUMNS = [
	{ label: "LEDA ID", width: "12%", align: "left" },
	{ label: "Full Name", width: "25%", align: "left" },
	{ label: "Prev Points", width: "12%", align: "center" },
	{ label: "Total Points", width: "12%", align: "center" },
	{ label: "Change", width: "12%", align: "center" },
	{ label: "Trails Date", width: "15%", align: "center" },
	{ label: "Paid Dues", width: "12%", align: "center" },
] as const;

const cellStyle = (i: number, extra = "") =>
	`width:${COLUMNS[i].width};text-align:${COLUMNS[i].align};padding:5px 6px;font-size:8pt;` +
	`border:0;${i < COLUMNS.length - 1 ? "border-right:0.5px solid #ccc;" : ""}${extra}`;

export function generateTrailsPointsListHtml(data: TrailsPointsList[]): string {
	const header = `<tr style="background:#f0f0f0;border-bottom:1px solid #000">${COLUMNS.map(
		(c, i) => `<td style="${cellStyle(i, "font-size:9pt;font-weight:bold;")}">${c.label}</td>`
	).join("")}</tr>`;

	const rows = data
		.map((member) => {
			const values = [
				member.ledaId,
				member.fullname,
				member.previousTotalPoints,
				member.totalPoints,
				member.changeBy,
				new Date(member.trailsDate).toLocaleDateString("en-US", {
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				}),
				member.paidDues ? "X" : "",
			];
			return `<tr style="border-bottom:0.5px solid #ccc">${values
				.map((v, i) => `<td style="${cellStyle(i)}">${escapeHtml(v)}</td>`)
				.join("")}</tr>`;
		})
		.join("");

	const table = `<table style="table-layout:fixed;width:100%;border:1px solid #000;border-collapse:collapse;margin:0"><thead>${header}</thead><tbody>${rows}</tbody></table>`;

	return buildSitePageHtml({ heading: "Trails Points List", body: table });
}
