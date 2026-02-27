/**
 * CaptainsMeetingTeamReport
 *
 * React-PDF document listing every team and its roster for the captains
 * meeting. Each team is rendered in a two-column box: left column contains
 * team and bar (place) info, right column lists the member roster.
 *
 * Teams are grouped by division/subdivision before rendering.
 */

import React from "react";
import { Document, Page, Text,
	View,
	StyleSheet,
} from "@react-pdf/renderer";
import { TeamReportTeamPlaceInfo, TeamReportTeamMemberInfo } from "@/lib/definitions";
import ReportsHeader from "@/components/ui/reports-header";

// Styles for the PDF
const styles = StyleSheet.create({
	page: {
		padding: 24,
		fontSize: 10,
		fontFamily: "Helvetica",
		backgroundColor: "#fff",
	},
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	section: {
		marginBottom: 8,
	},
	box: {
		border: "1.5 solid black",
		padding: 8,
		marginBottom: 8,
		minHeight: 80,
	},
	teamInfoBox: {
		width: "48%",
		marginRight: "2%",
	},
	barInfoBox: {
		width: "48%",
	},
	boxTitle: {
		fontWeight: "bold",
		fontSize: 11,
		marginBottom: 4,
	},
	teamName: {
		fontSize: 11,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 4,
	},
	divisionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	divisionLabel: {
		fontSize: 9,
		fontWeight: "bold",
	},
	divisionValue: {
		fontSize: 11,
		fontWeight: "bold",
	},
	feeStatus: {
		fontWeight: "bold",
		fontSize: 10,
		marginTop: 8,
		textAlign: "center",
	},
	barName: {
		fontSize: 11,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 4,
	},
	phoneRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 2,
	},
	phoneLabel: {
		fontSize: 9,
		marginRight: 4,
	},
	phoneValue: {
		fontSize: 11,
		fontWeight: "bold",
	},
	boardsText: {
		fontSize: 9,
		marginTop: 4,
	},
	table: {
		marginTop: 10,
		border: "1 solid #888",
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#e5e5e5",
		borderBottom: "1 solid #888",
	},
	tableHeaderCell: {
		fontWeight: "bold",
		fontSize: 10,
		padding: 3,
		borderRight: "1 solid #888",
		textAlign: "center",
	},
	tableRow: {
		flexDirection: "row",
		borderBottom: "1 solid #ddd",
	},
	tableCell: {
		fontSize: 10,
		padding: 3,
		borderRight: "1 solid #ddd",
		textAlign: "center",
	},
	tableCellLeft: {
		textAlign: "left",
	},
	tableCellRight: {
		borderRight: "none",
	},
	notes: {
		marginTop: 12,
		fontSize: 8,
		lineHeight: 1.4,
	},
	notesTitle: {
		fontWeight: "bold",
		fontSize: 8,
		textDecoration: "underline",
		marginBottom: 2,
	},
	notesText: {
		fontSize: 8,
		marginBottom: 4,
	},
	highlight: {
		fontWeight: "bold",
		textDecoration: "underline",
	},
});

interface Props {
	data: TeamReportTeamPlaceInfo[];
	reportDate?: string;
}

const getPaidStatusText = (paidStatus: boolean) =>
	paidStatus ? "Team Fee has been paid" : "Team Fee has NOT been paid";

const getPhone = (phone: string) => phone || "";

const getPlayerRows = (players: TeamReportTeamMemberInfo[]) =>
	players.map((p, idx) => (
		<View style={styles.tableRow} key={idx}>
			<Text style={[styles.tableCell, styles.tableCellLeft, { flex: 2 }]}>
				{p.fullName}
			</Text>
			<Text style={[styles.tableCell, { flex: 1 }]}>{p.playerId}</Text>
			<Text style={[styles.tableCell, { flex: 0.7 }]}>{p.isCaptain}</Text>
			<Text style={[styles.tableCell, { flex: 1.5 }]}>{getPhone(p.phoneNumber)}</Text>
			<Text style={[styles.tableCell, { flex: 1.5 }]}>{p.datesDuesPaid}</Text>
			<Text style={[styles.tableCell, { flex: 1 }]}>{p.needForm}</Text>
		</View>
	));

const CaptainsMeetingTeamReport: React.FC<Props> = ({ data, reportDate }) => {
	return (
		<Document>
			{data.map((teamData, index) => {
				const subtitle = teamData.desc || "";
				const teamInfo = teamData;
				const players = teamData.playerArray || [];

				return (
					<Page key={index} size="A4" style={styles.page}>
						<ReportsHeader
							title="TEAM REPORT"
							reportDate={reportDate || ""}
							subtitle={subtitle}
							showPageNumbers={true}
						/>
						<View style={[styles.row, styles.section]}>
							<View style={[styles.box, styles.teamInfoBox]}>
								<Text style={styles.boxTitle}>TEAM INFO</Text>
								<Text style={styles.teamName}>{teamInfo.teamName}</Text>
								<View style={styles.divisionRow}>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<Text style={styles.divisionLabel}>Division:</Text>
										<Text style={[styles.divisionValue, { marginLeft: 4 }]}>{teamInfo.divisionName}</Text>
									</View>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<Text style={styles.divisionLabel}>Nbr:</Text>
										<Text style={[styles.divisionValue, { marginLeft: 4 }]}>{teamInfo.subdivisionNumber}</Text>
									</View>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<Text style={styles.divisionLabel}>Ltr:</Text>
										<Text style={[styles.divisionValue, { marginLeft: 4 }]}>{teamInfo.teamLetter}</Text>
									</View>
								</View>
								<Text style={styles.feeStatus}>
									{getPaidStatusText(teamInfo.paidStatus)}
								</Text>
							</View>
							<View style={[styles.box, styles.barInfoBox]}>
								<Text style={styles.boxTitle}>BAR INFO</Text>
								<Text style={styles.barName}>{teamInfo.placeName}</Text>
								{teamInfo.addressFirstLine && (
									<Text style={{ fontSize: 9, textAlign: "center", marginBottom: 2 }}>
										{teamInfo.addressFirstLine}
									</Text>
								)}
								{teamInfo.addressSecondLine && (
									<Text style={{ fontSize: 9, textAlign: "center", marginBottom: 4 }}>
										{teamInfo.addressSecondLine}
									</Text>
								)}
								<View style={styles.phoneRow}>
									<Text style={styles.phoneLabel}>Phone</Text>
									<Text style={styles.phoneValue}>{getPhone(teamInfo.phoneNumber)}</Text>
								</View>
							</View>
						</View>
						<View style={styles.table}>
							<View style={styles.tableHeader}>
								<Text style={[styles.tableHeaderCell, styles.tableCellLeft, { flex: 2 }]}>
									Team Member Info
								</Text>
								<Text style={[styles.tableHeaderCell, { flex: 1 }]}>LEDA#</Text>
								<Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>Capt</Text>
								<Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Phone</Text>
								<Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Date Dues Paid</Text>
								<Text style={[styles.tableHeaderCell, styles.tableCellRight, { flex: 1 }]}>Needs Form</Text>
							</View>
							{getPlayerRows(players)}
						</View>
                        <View style={[styles.notes, { marginTop: "auto" }]}>
                            <Text style={[styles.notesText, {textIndent: 10}]}>
                                The information shown above is what is currently on file with the LEDA regarding the Team / Bar / Members. Captains should review this information to make sure it is accurate and up to date. If there is a problem, let the Club know immediately.
                            </Text>
                            
                            <Text style={[styles.notesText, {textIndent: 10}]}>
                                Make sure that all fees have been paid by the FIRST NIGHT of play! If the above shows any fees due, or no form on file, your Team will receive Penalty Points (each week) until corrected (pp are not returned). Payment for fees owed, as well as Member Forms, should be included with the 1ST Week Score Sheets (whether home or away). 
                                
                            </Text>
                            <Text style= {styles.notesText}>
                                (1PP will be given for each missing Member form per week.)
                            </Text>
                            <Text style={styles.notesTitle}>Adding Players...</Text>
                            <Text style={[styles.notesText, {textIndent: 10}]}>
                                To add a player to the team you must submit the player&apos;s name (in writing) to the Club. Please use the Form in your folders when possible. There is a 1 week waiting period before the new player can participate on the team (if approved). If the added player is not a current Member of the Club, please submit a completed member form / fee for the player by his/her night of play (with the score sheet is acceptable) to avoid penalties.
                            </Text>

                            <Text style={styles.notesTitle}>Forfeits...</Text>
                            <Text style={[styles.notesText, {textIndent: 10}]}>
                                If your team forfeits a match your team is responsible for the Weekly Fees of BOTH TEAMS! If your team is Forfeited against you must send us a score sheet filled out with the names of both teams, write FORFEIT, and sign the sheet. No fees apply.
                            </Text>

                            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 2 }}>
                                <Text style={styles.notesTitle}>
                                    Important Points To Remember
                                </Text>
                                <Text style={[styles.notesTitle, { marginLeft: 20, marginBottom: 0 }]}>
                                    Take care of any Hi-Lited items above by the 1st night of play.
                                </Text>
                            </View>
                            <View style={{ marginTop: 8 }}>
                                <Text style={[styles.notesText, { textAlign: "center", fontWeight: "bold" }]}>
                                    IF YOU DETECT A DISCREPANCY WITH ANY STATEMENT ON THIS REPORT, THE LEAGUE RESERVES THE RIGHT TO REQUEST PROOF AND CAN REVOKE ANY OR ALL OF THIS REPORT.
                                </Text>
                                <Text style={[styles.notesText, { textAlign: "center", fontWeight: "bold"}]}>
                                    ANY DISCREPANCY SHOULD BE BROUGHT TO THE LEAGUE&apos;S ATTENTION PRIOR TO THE 2ND WEEK OF LEAGUE COMPLETION
                                </Text>
                            </View>
                        </View>
					</Page>
				);
			})}
		</Document>
	);
};

export default CaptainsMeetingTeamReport;
