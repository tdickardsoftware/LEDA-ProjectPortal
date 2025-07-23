import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ListsPlaces } from "@/lib/definitions";
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
	ledaId: { width: "10%" },
	name: { width: "18%" },
	phoneNumber: { width: "13%" },
	contact: { width: "13%" },
	email: { width: "13%" },
	addressOne: { width: "13%" },
	addressTwo: { width: "10%" },
	city: { width: "7%" },
	state: { width: "3%" },
	zip: { width: "6%" },
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface Props {
	data: ListsPlaces[];
	desc: string;
	reportDate?: string;
}

const ListsReportPlacesListJoinDateReport: React.FC<Props> = ({
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
				title="PLACES LIST (By Established Date)"
				reportDate={reportDate}
				subtitle={desc}
			/>
			<View style={styles.table}>
				<View style={styles.tableHeader}>
					<Text style={[styles.cell, styles.ledaId, styles.tableHeaderText]}>LEDA ID</Text>
					<Text style={[styles.cell, styles.name, styles.tableHeaderText]}>Place Name</Text>
					<Text style={[styles.cell, styles.phoneNumber, styles.tableHeaderText]}>Phone Number</Text>
					<Text style={[styles.cell, styles.contact, styles.tableHeaderText]}>Contact Name</Text>
					<Text style={[styles.cell, styles.email, styles.tableHeaderText]}>Email</Text>
					<Text style={[styles.cell, styles.addressOne, styles.tableHeaderText]}>Address Line 1</Text>
					<Text style={[styles.cell, styles.addressTwo, styles.tableHeaderText]}>Address Line 2</Text>
					<Text style={[styles.cell, styles.city, styles.tableHeaderText]}>City</Text>
					<Text style={[styles.cell, styles.state, styles.tableHeaderText]}>State</Text>
					<Text style={[styles.cell, styles.zip, styles.tableHeaderText, styles.lastCell]}>Zip Code</Text>
				</View>
				{data.map((row, idx) => (
					<View style={styles.tableRow} key={idx}>
						<Text style={[styles.cell, styles.ledaId]}>{row.ledaId}</Text>
						<Text style={[styles.cell, styles.name]}>{row.name}</Text>
						<Text style={[styles.cell, styles.phoneNumber]}>{row.phoneNumber}</Text>
						<Text style={[styles.cell, styles.contact]}>{row.contact}</Text>
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

export default ListsReportPlacesListJoinDateReport;
