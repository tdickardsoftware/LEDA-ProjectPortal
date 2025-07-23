import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ListsTeams } from "@/lib/definitions";
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
		minHeight: 14,
		flexDirection: "row",
		alignItems: "center",
	},
	headerCell: {
		fontSize: 9,
		fontWeight: "bold",
		textAlign: "center",
		minHeight: 20,
	},
	teamId: { width: "10%" },
	teamName: { width: "14%" },
	placeName: { width: "13%" },
	addressFirstLine: { width: "13%" },
	addressSecondLine: { width: "13%" },
	placePhoneNumber: { width: "10%" },
	captainFullName: { width: "12%" },
	captainPhoneNumber: { width: "10%" },
	divisionInfo: { width: "8%" },
	lastCell: {
		borderRight: 0,
	},
});

interface Props {
	data: ListsTeams[];
	desc: string;
	reportDate?: string;
}

const ListsReportTeamsListJoinDateReport: React.FC<Props> = ({
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
}) => (
	<Document>
		<Page size="A4" style={styles.page} wrap>
			<ReportsHeader
				title="TEAMS LIST (By Established Date)"
				reportDate={reportDate}
				subtitle={desc}
			/>
			<View style={styles.table}>
				<View style={styles.tableHeader}>
					<Text style={[styles.cell, styles.headerCell, styles.teamId]} wrap={false}>Team LEDA ID</Text>
					<Text style={[styles.cell, styles.headerCell, styles.teamName]} wrap={false}>Team Name</Text>
					<Text style={[styles.cell, styles.headerCell, styles.placeName]} wrap={false}>Place Name</Text>
					<Text style={[styles.cell, styles.headerCell, styles.addressFirstLine]} wrap={false}>Place Address Line 1</Text>
					<Text style={[styles.cell, styles.headerCell, styles.addressSecondLine]} wrap={false}>Place Address Line 2</Text>
					<Text style={[styles.cell, styles.headerCell, styles.placePhoneNumber]} wrap={false}>Place Phone Number</Text>
					<Text style={[styles.cell, styles.headerCell, styles.captainFullName]} wrap={false}>Captain Full Name</Text>
					<Text style={[styles.cell, styles.headerCell, styles.captainPhoneNumber]} wrap={false}>Captain Phone Number</Text>
					<Text style={[styles.cell, styles.headerCell, styles.divisionInfo, styles.lastCell]} wrap={false}>Division Info</Text>
				</View>
				{data.map((row, idx) => {
					const noCaptain = !row.captainFullName || row.captainFullName === "No Captain";
					return (
						<View style={styles.tableRow} key={idx}>
							<Text style={[styles.cell, styles.teamId]}>{row.teamId}</Text>
							<Text style={[styles.cell, styles.teamName]}>{row.teamName}</Text>
							<Text style={[styles.cell, styles.placeName]}>{row.placeName}</Text>
							<Text style={[styles.cell, styles.addressFirstLine]}>{row.addressFirstLine}</Text>
							<Text style={[styles.cell, styles.addressSecondLine]}>{row.addressSecondLine}</Text>
							<Text style={[styles.cell, styles.placePhoneNumber]}>{row.placePhoneNumber}</Text>
							<Text style={[styles.cell, styles.captainFullName]}>{noCaptain ? "" : row.captainFullName}</Text>
							<Text style={[styles.cell, styles.captainPhoneNumber]}>{noCaptain ? "" : row.captainPhoneNumber}</Text>
							<Text style={[styles.cell, styles.divisionInfo, styles.lastCell]}>{row.divisionInfo}</Text>
						</View>
					);
				})}
			</View>
			<ReportsFooter />
		</Page>
	</Document>
);

export default ListsReportTeamsListJoinDateReport;
