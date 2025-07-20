import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ListsMembership } from "@/lib/definitions";
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
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
	playerId: { width: "10%" },
	fullName: { width: "18%" },
	phoneNumber: { width: "13%" },
	email: { width: "17%" },
	addressOne: { width: "13%" },
	addressTwo: { width: "10%" },
	city: { width: "8%" },
	state: { width: "5%" },
	zip: { width: "6%" },
});

interface Props {
	data: ListsMembership[];
	desc: string;
	reportDate?: string;
}

const ListsReportMembershipListJoinDateReport: React.FC<Props> = ({
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
				title="MEMBERSHIP LIST (By Established Date)"
				reportDate={reportDate}
				subtitle={desc}
			/>
			<View style={styles.table}>
				<View style={styles.tableHeader}>
					<Text style={[styles.cell, styles.playerId, styles.tableHeaderText]}>LEDA ID</Text>
					<Text style={[styles.cell, styles.fullName, styles.tableHeaderText]}>Name</Text>
					<Text style={[styles.cell, styles.phoneNumber, styles.tableHeaderText]}>Phone Number</Text>
					<Text style={[styles.cell, styles.email, styles.tableHeaderText]}>Email</Text>
					<Text style={[styles.cell, styles.addressOne, styles.tableHeaderText]}>Address Line 1</Text>
					<Text style={[styles.cell, styles.addressTwo, styles.tableHeaderText]}>Address Line 2</Text>
					<Text style={[styles.cell, styles.city, styles.tableHeaderText]}>City</Text>
					<Text style={[styles.cell, styles.state, styles.tableHeaderText]}>State</Text>
					<Text style={[styles.cell, styles.zip, styles.tableHeaderText, styles.lastCell]}>Zip Code</Text>
				</View>
				{data.map((row, idx) => (
					<View style={styles.tableRow} key={idx}>
						<Text style={[styles.cell, styles.playerId]}>{row.playerId}</Text>
						<Text style={[styles.cell, styles.fullName]}>{row.fullName}</Text>
						<Text style={[styles.cell, styles.phoneNumber]}>{row.phoneNumber}</Text>
						<Text style={[styles.cell, styles.email]}>{row.email}</Text>
						<Text style={[styles.cell, styles.addressOne]}>{row.addressOne}</Text>
						<Text style={[styles.cell, styles.addressTwo]}>{row.addressTwo}</Text>
						<Text style={[styles.cell, styles.city]}>{row.city}</Text>
						<Text style={[styles.cell, styles.state]}>{row.state}</Text>
						<Text style={[styles.cell, styles.zip, styles.lastCell]}>{row.zip}</Text>
					</View>
				))}
			</View>
			<ReportsFooter />
		</Page>
	</Document>
);

export default ListsReportMembershipListJoinDateReport;
