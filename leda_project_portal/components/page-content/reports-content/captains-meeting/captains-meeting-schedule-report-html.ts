/**
 * generateCaptainsMeetingScheduleHtml
 *
 * Builds a standalone, printable HTML document for the captains meeting
 * schedule report — an HTML equivalent of CaptainsMeetingScheduleReport
 * (the react-pdf version), for users who want a downloadable HTML file
 * instead of a PDF.
 */

import { DivisionsData, ScheduleData, TeamData, MatchData } from "@/lib/schedule";
import { CaptainsMtgSchedulePlaceCaptainSeasonInfo } from "@/lib/definitions";
import { buildSitePageHtml, escapeHtml } from "@/lib/report-html";

interface GenerateScheduleReportHtmlParams {
	divisionsData: DivisionsData;
	matchData: ScheduleData;
	gameDates: Record<string, string>;
	seasonCode: string;
	placesData: Record<string, string>;
	seasonInfo: CaptainsMtgSchedulePlaceCaptainSeasonInfo[];
	detailedView?: boolean;
}

const convertTo12HourFormat = (time24: string): string => {
	if (!time24) return "";
	const [hours, minutes] = time24.split(":").map(Number);
	if (isNaN(hours) || isNaN(minutes)) return time24;
	const period = hours >= 12 ? "PM" : "AM";
	const hours12 = hours % 12 || 12;
	return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const getTeamNameById = (teamId: string, teams: Record<string, TeamData>): string => {
	const team = Object.values(teams).find((team) => team.teamId === teamId);
	return team ? team.teamName : "Unknown Team";
};

export function generateCaptainsMeetingScheduleHtml({
	divisionsData,
	matchData,
	gameDates,
	seasonCode,
	placesData,
	seasonInfo,
	detailedView = false,
}: GenerateScheduleReportHtmlParams): string {
	// Convert gameDates keys (e.g. "Date 1") to the "weekN" format used as
	// matchesData keys, mirroring captains-meeting-schedule-report.tsx.
	const gameDateEntries: [string, string][] = Object.entries(gameDates).map(([key, date]) => {
		const match = key.match(/\d+/);
		const weekNum = match ? match[0] : "1";
		return [`week${weekNum}`, date];
	});

	const seasonDescription =
		seasonInfo && seasonInfo.length > 0 ? seasonInfo[0].desc : `Season ${seasonCode}`;

	const getTeamMatchup = (
		division: string,
		subdivision: string,
		teamLetter: string,
		gameTitle: string
	): MatchData | null =>
		matchData[division]?.[subdivision]?.[teamLetter]?.matchesData?.[gameTitle] || null;

	const renderDetailedMatchupCell = (
		matchup: MatchData | null,
		teamData: TeamData,
		teams: Record<string, TeamData>
	): string => {
		if (!matchup) {
			return `<span class="bye">BYE</span>`;
		}

		const opposingTeamName = getTeamNameById(matchup.opposingTeamId, teams);
		if (opposingTeamName.toUpperCase().includes("BYE")) {
			return `<span class="bye">BYE</span>`;
		}

		const backupPlaceId = Object.values(teams).find((team) => team.teamId === "0")?.placeId;
		const locationPlaceId =
			matchup.isAtBackupLocation && backupPlaceId
				? backupPlaceId
				: matchup.home
					? teamData.placeId
					: teams[matchup.opposingTeamLetter]?.placeId || "";
		const placeName = placesData[locationPlaceId] || "TBD";
		const formattedTime = convertTo12HourFormat(matchup.matchTime);

		return `
			<div class="matchup">
				<div>${matchup.home ? "Home" : "Away"}</div>
				<div>VS</div>
				<div class="team-name">${escapeHtml(opposingTeamName)}</div>
				<div>${escapeHtml(formattedTime)}</div>
				<div>@ ${escapeHtml(placeName)}</div>
			</div>`;
	};

	// Compact (legacy) letter-grid: home matchups show the opponent's letter
	// uppercase, away matchups lowercase, BYE placeholder ("X") shows "BYE".
	const renderCompactMatchupCell = (matchup: MatchData | null, backupLetter?: string): string => {
		if (!matchup) {
			return `<span class="bye">BYE</span>`;
		}

		const isBye = matchup.opposingTeamId === "0" || matchup.opposingTeamLetter.toUpperCase() === "X";
		if (isBye) {
			return `<span class="bye">BYE</span>`;
		}

		const letter = matchup.isAtBackupLocation && backupLetter ? backupLetter : matchup.opposingTeamLetter;
		const matchupCode = matchup.home ? letter.toUpperCase() : letter.toLowerCase();

		return `<span class="matchup-letter">${escapeHtml(matchupCode)}</span>`;
	};

	const renderPlaceInfoBlock = (
		info: CaptainsMtgSchedulePlaceCaptainSeasonInfo | undefined
	): string => {
		if (!info) return "";
		return `
			<div class="place-info">
				<div>${escapeHtml(info.placeName)}</div>
				<div>${escapeHtml(info.addressFirstLine)}</div>
				<div>${escapeHtml(info.addressSecondLine)}${info.placePhoneNumber ? ` - ${escapeHtml(info.placePhoneNumber)}` : ""}</div>
				${info.captainFullName !== "No Captain"
					? `<div>${escapeHtml(info.captainFullName)}${info.captainPhoneNumber ? ` - ${escapeHtml(info.captainPhoneNumber)}` : ""}</div>`
					: ""}
			</div>`;
	};

	const sections: string[] = [];

	Object.entries(divisionsData).forEach(([division, divisionData]) => {
		Object.entries(divisionData.subdivisions).forEach(([subdivision, teams]) => {
			// Filter out BYE teams and the virtual backup-location entry (teamId "0").
			const teamsArray = Object.entries(teams).filter(
				([, teamData]) => !teamData.teamName.toUpperCase().includes("BYE") && teamData.teamId !== "0"
			);
			const backupEntry = Object.entries(teams).find(([, teamData]) => teamData.teamId === "0");
			const [backupLetter, backupTeamData] = backupEntry ?? [undefined, undefined];
			const backupPlaceInfo = backupTeamData
				? seasonInfo.find((info) => info.placeId.toString() === backupTeamData.placeId)
				: undefined;

			let table: string;

			if (detailedView) {
				const headerCells = teamsArray
					.map(([teamLetter, teamData]) => {
						const matchingSeasonInfo = seasonInfo.find(
							(info) =>
								info.teamId.toString() === teamData.teamId &&
								info.division === division &&
								info.subdivision === subdivision
						);
						return `
							<th>
								<div class="team-name">${escapeHtml(teamLetter)}</div>
								<div>${escapeHtml(teamData.teamName)}</div>
								${renderPlaceInfoBlock(matchingSeasonInfo)}
							</th>`;
					})
					.join("");
				const backupHeaderCell =
					backupEntry && backupTeamData
						? `
							<th>
								<div class="team-name">${escapeHtml(backupLetter ?? "")}</div>
								<div>${escapeHtml(backupTeamData.teamName)}</div>
								<div>${escapeHtml(placesData[backupTeamData.placeId] || "")}</div>
								${backupPlaceInfo
									? `<div class="place-info">
										<div>${escapeHtml(backupPlaceInfo.addressFirstLine)}</div>
										<div>${escapeHtml(backupPlaceInfo.addressSecondLine)}${backupPlaceInfo.placePhoneNumber ? ` - ${escapeHtml(backupPlaceInfo.placePhoneNumber)}` : ""}</div>
									</div>`
									: ""}
							</th>`
						: "";

				const rows = gameDateEntries
					.map(([gameTitle, date]) => {
						const cells = teamsArray
							.map(([teamLetter, teamData]) => {
								const matchup = getTeamMatchup(division, subdivision, teamLetter, gameTitle);
								return `<td>${renderDetailedMatchupCell(matchup, teamData, teams)}</td>`;
							})
							.join("");
						return `
							<tr>
								<td class="week-label">Week ${gameTitle.match(/\d+/)?.[0] ?? ""}<div class="game-date">${escapeHtml(date)}</div></td>
								${cells}
							</tr>`;
					})
					.join("");

				table = `
					<table>
						<thead>
							<tr>
								<th>${escapeHtml(division)} - ${escapeHtml(subdivision)}</th>
								${headerCells}
								${backupHeaderCell}
							</tr>
						</thead>
						<tbody>${rows}</tbody>
					</table>`;
			} else {
				const headerCells = gameDateEntries
					.map(
						([gameTitle, date]) =>
							`<th>Week ${gameTitle.match(/\d+/)?.[0] ?? ""}<div class="game-date">${escapeHtml(date)}</div></th>`
					)
					.join("");

				const rows = teamsArray
					.map(([teamLetter, teamData]) => {
						const matchingSeasonInfo = seasonInfo.find(
							(info) =>
								info.teamId.toString() === teamData.teamId &&
								info.division === division &&
								info.subdivision === subdivision
						);
						const cells = gameDateEntries
							.map(([gameTitle]) => {
								const matchup = getTeamMatchup(division, subdivision, teamLetter, gameTitle);
								return `<td>${renderCompactMatchupCell(matchup, backupLetter)}</td>`;
							})
							.join("");
						return `
							<tr>
								<td class="team-info">
									<div class="team-name">${escapeHtml(teamLetter)} - ${escapeHtml(teamData.teamName)}</div>
									${renderPlaceInfoBlock(matchingSeasonInfo)}
								</td>
								${cells}
							</tr>`;
					})
					.join("");

				const backupRow =
					backupEntry && backupTeamData
						? `
							<tr>
								<td class="team-info">
									<div class="team-name">${escapeHtml(backupLetter ?? "")} - ${escapeHtml(backupTeamData.teamName)}</div>
									<div>${escapeHtml(placesData[backupTeamData.placeId] || "")}</div>
									${backupPlaceInfo
										? `<div class="place-info">
											<div>${escapeHtml(backupPlaceInfo.addressFirstLine)}</div>
											<div>${escapeHtml(backupPlaceInfo.addressSecondLine)}${backupPlaceInfo.placePhoneNumber ? ` - ${escapeHtml(backupPlaceInfo.placePhoneNumber)}` : ""}</div>
										</div>`
										: ""}
								</td>
								<td colspan="${gameDateEntries.length}"></td>
							</tr>`
						: "";

				table = `
					<table>
						<thead>
							<tr>
								<th>${escapeHtml(division)} - ${escapeHtml(subdivision)}</th>
								${headerCells}
							</tr>
						</thead>
						<tbody>${rows}${backupRow}</tbody>
					</table>`;
			}

			sections.push(`<section class="subdivision">${table}</section>`);
		});
	});

	return buildSitePageHtml({
		heading: `LEDA ${seasonDescription} Schedule`,
		body: sections.join("\n"),
		maxWidth: "none",
		css: `
	#Report .subdivision { margin-bottom: 32px; overflow-x: auto; }
	#Report table { border-collapse: collapse; width: 100%; }
	#Report th, #Report td { border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle; font-size: 11px; }
	#Report thead th { background-color: #f0f0f0; font-weight: bold; }
	#Report .team-name { font-weight: bold; }
	#Report .team-info { text-align: left; width: 220px; }
	#Report .place-info { font-size: 10px; color: #333; margin-top: 2px; }
	#Report .game-date { font-weight: normal; color: #666; font-size: 10px; }
	#Report .bye { color: #999; font-style: italic; }
	#Report .matchup-letter { font-weight: bold; font-size: 13px; }
	#Report .matchup { line-height: 1.3; }
	@media print { #Report .subdivision { page-break-after: always; } }`,
	});
}
