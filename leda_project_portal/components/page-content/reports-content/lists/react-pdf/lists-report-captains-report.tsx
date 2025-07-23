import React, { JSX } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ListsCaptains } from "@/lib/definitions";
import ReportsFooter from "@/components/ui/reports-footer";
import ReportsHeader from "@/components/ui/reports-header";

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 30,
		fontSize: 9,
		fontFamily: "Helvetica",
	},
	table: {
		width: "100%",
		marginBottom: 16,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#d3d3d3",
		border: "1 solid #888",
		paddingVertical: 2,
		paddingHorizontal: 2,
	},
	tableRow: {
		flexDirection: "row",
		borderLeft: "1 solid #888",
		borderRight: "1 solid #888",
		borderBottom: "1 solid #ccc",
		paddingVertical: 2,
		paddingHorizontal: 2,
	},
	cell: {
		fontSize: 8,
		padding: 2,
		borderRight: "1 solid #ccc",
		minHeight: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	divisionInfoColumn: {
		width: "17%",
		fontWeight: "bold",
	},
	teamNameColumn: {
		width: "18%",
		fontWeight: "bold",
	},
	placeNameColumn: {
		width: "17%",
		fontWeight: "bold",
	},
	fullNameColumn: {
		width: "20%",
		fontWeight: "bold",
	},
	ledaIdColumn: {
		width: "13%",
		fontWeight: "bold",
	},
	phoneNumberColumn: {
		width: "15%",
		fontWeight: "bold",
		textAlign: "right",
	},
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
	divisionTitle: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 8,
		textAlign: "center",
		textTransform: "uppercase",
		letterSpacing: 1,
	},
});

interface ListsReportCaptainsReportProps {
	data: ListsCaptains[];
	desc: string;
	reportDate?: string;
}

const MAX_ROWS_PER_PAGE = 35;

// Helper to chunk array into pages of maxRows
function chunkArray<T>(arr: T[], maxRows: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += maxRows) {
		chunks.push(arr.slice(i, i + maxRows));
	}
	return chunks;
}

const getDivision = (row: ListsCaptains & { division?: string }): string => {
	// Prefer row.division if present, else divisionInfo, else "Unknown"
	return (row as { division?: string }).division || "Unknown";
};

const ListsReportCaptainsReport: React.FC<ListsReportCaptainsReportProps> = ({
	data,
	desc,
	reportDate = new Date()
		.toLocaleDateString("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
		.replace(",", ""),
}) => {
	// Group by division (use row.division if present, else divisionInfo)
	const grouped: Record<string, ListsCaptains[]> = {};
	data.forEach((row) => {
		const division = getDivision(row);
		if (!grouped[division]) grouped[division] = [];
		grouped[division].push(row);
	});

	const pages: JSX.Element[] = [];
	Object.entries(grouped).forEach(([division, rows]) => {
		const chunks = chunkArray(rows, MAX_ROWS_PER_PAGE);
		chunks.forEach((chunk, idx) => {
			pages.push(
				<Page key={division + idx} size="A4" style={styles.page} wrap>
					<ReportsHeader
						title="CAPTAINS LIST"
						reportDate={reportDate}
						subtitle={desc}
					/>
					<Text style={styles.divisionTitle}>
						Division: {division}
					</Text>
					<View style={styles.table}>
						<View style={styles.tableHeader}>
							<Text style={[styles.cell, styles.fullNameColumn, styles.tableHeaderText]}>
								Name
							</Text>
							<Text style={[styles.cell, styles.ledaIdColumn, styles.tableHeaderText]}>
								LEDA ID
							</Text>
							<Text style={[styles.cell, styles.phoneNumberColumn, styles.tableHeaderText]}>
								Phone Number
							</Text>
							<Text style={[styles.cell, styles.teamNameColumn, styles.tableHeaderText]}>
								Team Name
							</Text>
							<Text style={[styles.cell, styles.divisionInfoColumn, styles.tableHeaderText]}>
								Division
							</Text>
							<Text style={[styles.cell, styles.placeNameColumn, styles.tableHeaderText, styles.lastCell]}>
								Place Name
							</Text>
						</View>
						{chunk.map((row, idx2) => (
							<View style={styles.tableRow} key={idx2}>
								<Text style={[styles.cell, styles.fullNameColumn]}>
									{row.fullName}
								</Text>
								<Text style={[styles.cell, styles.ledaIdColumn]}>
									{row.ledaId}
								</Text>
								<Text style={[styles.cell, styles.phoneNumberColumn]}>
									{row.phoneNumber}
								</Text>
								<Text style={[styles.cell, styles.teamNameColumn]}>
									{row.teamName}
								</Text>
								<Text style={[styles.cell, styles.divisionInfoColumn]}>
									{row.divisionInfo}
								</Text>
								<Text style={[styles.cell, styles.placeNameColumn, styles.lastCell]}>
									{row.placeName}
								</Text>
							</View>
						))}
					</View>
					<ReportsFooter />
				</Page>
			);
		});
	});

	return <Document>{pages}</Document>;
};

export default ListsReportCaptainsReport;
