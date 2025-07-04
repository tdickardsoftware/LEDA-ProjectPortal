import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TopDarter } from "@/lib/definitions";
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
	columnsContainer: {
		flexDirection: "row",
		width: "100%",
	},
	column: {
		flexDirection: "column",
		width: "20%", // 5 columns per page
	},
	row: {
		flexDirection: "row",
		marginBottom: 2,
	},
	divisionInfo: {
		width: "38%",
		fontSize: 8,
	},
	fullName: {
		width: "42%",
		fontSize: 8,
	},
	points: {
		width: "20%",
		fontSize: 8,
		textAlign: "right",
	},
});

interface TopDarterReportProps {
	data: TopDarter[];
	desc: string;
	minimumPoints: string;
	reportDate?: string;
}

const COLUMNS_PER_PAGE = 5;
const ROWS_PER_COLUMN = 30;

function chunkColumns<T>(data: T[], rowsPerCol: number, cols: number): T[][][] {
	const columns: T[][] = [];
	let idx = 0;
	while (idx < data.length) {
		columns.push(data.slice(idx, idx + rowsPerCol));
		idx += rowsPerCol;
	}
	const pages: T[][][] = [];
	for (let i = 0; i < columns.length; i += cols) {
		pages.push(columns.slice(i, i + cols));
	}
	return pages;
}

const LeaguePlayTopDarterReport: React.FC<TopDarterReportProps> = ({
	data,
	desc,
	minimumPoints,
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
	const pages = chunkColumns(data, ROWS_PER_COLUMN, COLUMNS_PER_PAGE);

	return (
		<Document>
			{pages.map((columns, pageIdx) => (
				<Page key={pageIdx} size="A4" style={styles.page} wrap>
					<ReportsHeader
						title="TOP DARTER STATS"
						reportDate={reportDate}
						subtitle={`${desc} - Minimum Points ${minimumPoints}`}
					/>
					<View style={styles.columnsContainer}>
						{columns.map((col, colIdx) => (
							<View style={styles.column} key={colIdx}>
								{col.map((row, rowIdx) => (
									<View style={styles.row} key={rowIdx}>
										<Text style={styles.divisionInfo}>{row.divisionInfo}</Text>
										<Text style={styles.fullName}>{row.fullName}</Text>
										<Text style={styles.points}>{row.totalPoints}</Text>
									</View>
								))}
							</View>
						))}
					</View>
					<ReportsFooter />
				</Page>
			))}
		</Document>
	);
};

export default LeaguePlayTopDarterReport;
