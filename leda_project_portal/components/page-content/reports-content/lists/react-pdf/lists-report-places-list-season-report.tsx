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
		paddingVertical: 3,
		paddingHorizontal: 2,
	},
	tableRow: {
		flexDirection: "row",
		borderLeft: "1 solid #888",
		borderRight: "1 solid #888",
		borderBottom: "1 solid #ccc",
		paddingVertical: 3,
		paddingHorizontal: 2,
	},
	cell: {
		fontSize: 7.5,
		padding: 2,
		borderRight: "1 solid #ccc",
		minHeight: 14,
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
	},
	ledaId: { width: "7%", justifyContent: "center" },
	name: { width: "15%" },
	phoneNumber: { width: "10%" },
	contact: { width: "12%" },
	email: { width: "16%" },
	addressOne: { width: "14%" },
	addressTwo: { width: "12%" },
	city: { width: "8%" },
	state: { width: "4%", justifyContent: "center" },
	zip: { width: "6%", justifyContent: "center" },
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 8,
		fontWeight: "bold",
	},
});

interface Props {
	data: ListsPlaces[];
	desc: string;
	reportDate?: string;
}

const ROWS_PER_PAGE = 20;

const ListsReportPlacesListSeasonReport: React.FC<Props> = ({
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
	const chunkData = (arr: ListsPlaces[], size: number) => {
		const chunks: ListsPlaces[][] = [];
		for (let i = 0; i < arr.length; i += size) {
			chunks.push(arr.slice(i, i + size));
		}
		return chunks;
	};

	const pages = chunkData(data, ROWS_PER_PAGE);

	return (
		<Document>
			{pages.map((pageData, pageIdx) => (
				<Page size="A4" style={styles.page} key={pageIdx}>
					<ReportsHeader
						title="PLACES LIST (By Season)"
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
						{pageData.map((row, idx) => (
							<View style={styles.tableRow} key={idx} wrap={false}>
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
			))}
		</Document>
	);
};

export default ListsReportPlacesListSeasonReport;
