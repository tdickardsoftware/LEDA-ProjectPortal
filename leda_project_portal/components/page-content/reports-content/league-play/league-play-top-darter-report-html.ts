import { TopDarter } from "@/lib/definitions";
import { buildSitePageHtml, escapeHtml } from "@/lib/report-html";

// Mirrors the PDF layout: 5 columns of 30 rows per page, filled top-to-bottom then left-to-right.
const COLUMNS_PER_PAGE = 5;
const ROWS_PER_COLUMN = 30;

export function generateTopDarterHtml(data: TopDarter[], desc: string, minimumPoints: string): string {
	const pageSize = COLUMNS_PER_PAGE * ROWS_PER_COLUMN;
	const pages: string[] = [];

	for (let start = 0; start < data.length; start += pageSize) {
		const pageRows = data.slice(start, start + pageSize);
		let columns = "";
		for (let c = 0; c < pageRows.length; c += ROWS_PER_COLUMN) {
			const rows = pageRows
				.slice(c, c + ROWS_PER_COLUMN)
				.map(
					(row) =>
						`<div style="display:flex;font-size:7pt;margin-bottom:2px">
							<span style="width:25%">${escapeHtml(row.divisionInfo)}</span>
							<span style="width:60%;overflow:hidden">${escapeHtml(row.fullName)}</span>
							<span style="width:15%;text-align:right">${escapeHtml(row.totalPoints)}</span>
						</div>`
				)
				.join("");
			columns += `<div style="width:19%">${rows}</div>`;
		}
		pages.push(`<div style="display:flex;gap:8px;width:100%">${columns}</div>`);
	}

	return buildSitePageHtml({
		heading: "Current Top Darter",
		subtitle: `${desc} - Minimum Points ${minimumPoints}`,
		body: pages,
	});
}
