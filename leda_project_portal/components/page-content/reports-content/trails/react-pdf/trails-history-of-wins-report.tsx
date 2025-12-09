import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TrailsHistoryOfWins } from "@/lib/definitions";
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
		border: "1 solid black",
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#f0f0f0",
		borderBottom: "1 solid black",
		padding: 5,
	},
	tableRow: {
		flexDirection: "row",
		borderBottom: "0.5 solid #ccc",
		padding: 5,
		breakInside: "avoid",
	},
	ledaIdColumn: {
		width: "12%",
		fontSize: 8,
		paddingRight: 5,
		borderRight: "0.5 solid #ccc",
	},
	nameColumn: {
		width: "28%",
		fontSize: 8,
		paddingRight: 5,
		paddingLeft: 5,
		borderRight: "0.5 solid #ccc",
	},
	placeColumn: {
		width: "8%",
		fontSize: 8,
		textAlign: "center",
		paddingRight: 2,
		paddingLeft: 2,
		borderRight: "0.5 solid #ccc",
	},
	lastPlaceColumn: {
		width: "8%",
		fontSize: 8,
		textAlign: "center",
		paddingRight: 2,
		paddingLeft: 2,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface TrailsHistoryOfWinsReportProps {
	data: TrailsHistoryOfWins[];
	reportDate?: string;
}

const ROWS_PER_PAGE = 30;

export const TrailsHistoryOfWinsReport: React.FC<
	TrailsHistoryOfWinsReportProps
> = ({
	data,
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
	const chunkData = (arr: TrailsHistoryOfWins[], size: number) => {
		const chunks: TrailsHistoryOfWins[][] = [];
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
						title="Trails History of Wins"
						reportDate={reportDate}
					/>

					<View style={styles.table}>
						{/* First header row: group headers */}
						<View style={styles.tableHeader} fixed>
							<Text
								style={[
									styles.ledaIdColumn,
									styles.tableHeaderText,
								]}
							></Text>
							<Text
								style={[styles.nameColumn, styles.tableHeaderText]}
							></Text>
							<Text
								style={[
									{
										width: "32%",
										textAlign: "center",
										fontSize: 9,
										fontWeight: "bold",
										borderRight: "0.5 solid #ccc",
									},
								]}
							>
								Singles # of Places
							</Text>
							<Text
								style={[
									{
										width: "32%",
										textAlign: "center",
										fontSize: 9,
										fontWeight: "bold",
									},
								]}
							>
								Doubles # of Places
							</Text>
						</View>
						{/* Second header row: sub-headers */}
						<View style={styles.tableHeader} fixed>
							<Text
								style={[
									styles.ledaIdColumn,
									styles.tableHeaderText,
								]}
							>
								LEDA ID
							</Text>
							<Text
								style={[styles.nameColumn, styles.tableHeaderText]}
							>
								Full Name
							</Text>
							<Text
								style={[styles.placeColumn, styles.tableHeaderText]}
							>
								1st
							</Text>
							<Text
								style={[styles.placeColumn, styles.tableHeaderText]}
							>
								2nd
							</Text>
							<Text
								style={[styles.placeColumn, styles.tableHeaderText]}
							>
								3rd
							</Text>
							<Text
								style={[styles.placeColumn, styles.tableHeaderText]}
							>
								4th
							</Text>
							<Text
								style={[styles.placeColumn, styles.tableHeaderText]}
							>
								1st
							</Text>
							<Text
								style={[styles.placeColumn, styles.tableHeaderText]}
							>
								2nd
							</Text>
							<Text
								style={[styles.placeColumn, styles.tableHeaderText]}
							>
								3rd
							</Text>
							<Text
								style={[
									styles.lastPlaceColumn,
									styles.tableHeaderText,
								]}
							>
								4th
							</Text>
						</View>
						{pageData.map((member) => (
							<View key={member.ledaId} style={styles.tableRow} wrap={false}>
								<Text style={styles.ledaIdColumn}>
									{member.ledaId}
								</Text>
								<Text style={styles.nameColumn}>
									{member.fullName}
								</Text>
								<Text style={styles.placeColumn}>
									{member.singlesPlace1}
								</Text>
								<Text style={styles.placeColumn}>
									{member.singlesPlace2}
								</Text>
								<Text style={styles.placeColumn}>
									{member.singlesPlace3}
								</Text>
								<Text style={styles.placeColumn}>
									{member.singlesPlace4}
								</Text>
								<Text style={styles.placeColumn}>
									{member.doublesPlace1}
								</Text>
								<Text style={styles.placeColumn}>
									{member.doublesPlace2}
								</Text>
								<Text style={styles.placeColumn}>
									{member.doublesPlace3}
								</Text>
								<Text style={styles.lastPlaceColumn}>
									{member.doublesPlace4}
								</Text>
							</View>
						))}
					</View>

					<ReportsFooter />
				</Page>
			))}
		</Document>
	);
};

export default TrailsHistoryOfWinsReport;
