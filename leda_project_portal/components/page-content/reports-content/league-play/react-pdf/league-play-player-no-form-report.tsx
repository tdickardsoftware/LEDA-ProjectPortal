import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PlayerNoForm } from "@/lib/definitions";
import ReportsHeader from "@/components/ui/reports-header";
import ReportsFooter from "@/components/ui/reports-footer";

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
	seasonCodeColumn: {
		width: "20%",
		fontWeight: "bold",
	},
	ledaIdColumn: {
		width: "20%",
		fontWeight: "bold",
	},
	fullNameColumn: {
		width: "40%",
	},
	formOnFileColumn: {
		width: "20%",
	},
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface PlayerNoFormReportProps {
	data: PlayerNoForm[];
    desc: string;
	reportDate?: string;
}

const LeaguePlayPlayerNoFormReport: React.FC<PlayerNoFormReportProps> = ({
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
				title="Players No Form On File"
                subtitle={desc}
				reportDate={reportDate}
			/>
			<View style={styles.table}>
				<View style={styles.tableHeader}>
					<Text style={[styles.cell, styles.ledaIdColumn, styles.tableHeaderText]}>
						Player LEDA ID
					</Text>
					<Text style={[styles.cell, styles.fullNameColumn, styles.tableHeaderText]}>
						Full Name
					</Text>
					<Text style={[styles.cell, styles.formOnFileColumn, styles.tableHeaderText, styles.lastCell]}>
						Form On File
					</Text>
				</View>
				{data.map((row, idx) => (
					<View style={styles.tableRow} key={idx}>
						<Text style={[styles.cell, styles.ledaIdColumn]}>
							{row.ledaId}
						</Text>
						<Text style={[styles.cell, styles.fullNameColumn]}>
							{row.fullName}
						</Text>
						<Text style={[styles.cell, styles.formOnFileColumn, styles.lastCell]}>
							{row.formOnFile ? "Yes" : "No"}
						</Text>
					</View>
				))}
			</View>
			<ReportsFooter />
		</Page>
	</Document>
);

export default LeaguePlayPlayerNoFormReport;
