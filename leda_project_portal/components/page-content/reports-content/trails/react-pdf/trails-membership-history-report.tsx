/**
 * TrailsMembershipHistoryReport
 *
 * React-PDF document displaying the full membership history for all trails
 * participants. Rendered in a multi-column layout using the `getTableChunks`
 * helper (constants: `COLUMNS_PER_TABLE = 3`, `ROWS_PER_COLUMN = 30`,
 * `TABLES_PER_PAGE = 1`). Columns: member name, trails points, and year.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TrailsMembershipHistory } from "@/lib/definitions";
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
	tableGap: {
		height: 20, // Gap between tables
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
	ledaIdColumn: {
		width: "10%",
		fontWeight: "bold",
	},
	nameColumn: {
		width: "23.33%",
	},
	// For the last cell in a row, remove the right border
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface TrailsMembershipHistoryReportProps {
	data: TrailsMembershipHistory[];
	reportDate?: string;
}

const COLUMNS_PER_TABLE = 3;
const ROWS_PER_COLUMN = 30;
const TABLES_PER_PAGE = 1;

function getTableChunks(
	data: TrailsMembershipHistory[],
	rowsPerCol: number,
	cols: number
): TrailsMembershipHistory[][][] {
	// Split data into tables, each table has rowsPerCol * cols entries
	const tables: TrailsMembershipHistory[][][] = [];
	let idx = 0;
	while (idx < data.length) {
		const tableData = data.slice(idx, idx + rowsPerCol * cols);
		// Fill columns top-to-bottom, left-to-right
		const columns: TrailsMembershipHistory[][] = [];
		for (let c = 0; c < cols; c++) {
			columns.push(tableData.slice(c * rowsPerCol, (c + 1) * rowsPerCol));
		}
		tables.push(columns);
		idx += rowsPerCol * cols;
	}
	return tables;
}

export const TrailsMembershipHistoryReport: React.FC<
	TrailsMembershipHistoryReportProps
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
	// Prepare tables: each table is an array of columns, each column is an array of rows
	const tables = getTableChunks(data, ROWS_PER_COLUMN, COLUMNS_PER_TABLE);
	// Split tables into pages of TABLES_PER_PAGE tables
	const pages = [];
	for (let i = 0; i < tables.length; i += TABLES_PER_PAGE) {
		pages.push(tables.slice(i, i + TABLES_PER_PAGE));
	}

	return (
		<Document>
			{pages.map((tablesOnPage, pageIdx) => (
				<Page key={pageIdx} size="A4" style={styles.page} wrap>
					<ReportsHeader
						title="Trails Membership History"
						reportDate={reportDate}
					/>
					{Array.from({ length: TABLES_PER_PAGE }).map(
						(_, slotIdx) => {
							const tableData = tablesOnPage[slotIdx];

							// If no table data for this slot, render empty space to maintain layout
							if (!tableData) {
								return (
									<View
										key={slotIdx}
										style={styles.tableGap}
									/>
								);
							}

							// Determine how many columns are actually needed for this table
							const actualColumns = tableData.filter(
								(col) => col.length > 0
							);

							// If no actual data in any columns, render empty space
							if (actualColumns.length === 0) {
								return (
									<View
										key={slotIdx}
										style={styles.tableGap}
									/>
								);
							}

							return (
								<View key={slotIdx}>
									<View style={styles.table}>
										{/* Table Header */}
										<View style={styles.tableHeader}>
											{actualColumns.map((_, colIdx) => (
												<React.Fragment key={colIdx}>
													<Text
														style={[
															styles.cell,
															styles.ledaIdColumn,
															styles.tableHeaderText,
														]}
													>
														LEDA#
													</Text>
													<Text
														style={[
															styles.cell,
															styles.nameColumn,
															styles.tableHeaderText,
															...(colIdx ===
															actualColumns.length -
																1
																? [
																		styles.lastCell,
																  ]
																: []),
														]}
													>
														Name
													</Text>
												</React.Fragment>
											))}
										</View>
										{/* Table Rows */}
										{Array.from({
											length: ROWS_PER_COLUMN,
										}).map((_, rowIdx) => {
											// Only render row if at least one column has data for this row
											const hasData = actualColumns.some(
												(col) => col[rowIdx]
											);
											if (!hasData) return null;
											return (
												<View
													style={styles.tableRow}
													key={rowIdx}
												>
													{actualColumns.map(
														(col, colIdx) => {
															const member =
																col[rowIdx];
															return (
																<React.Fragment
																	key={colIdx}
																>
																	<Text
																		style={[
																			styles.cell,
																			styles.ledaIdColumn,
																		]}
																	>
																		{member
																			? member.ledaId
																			: ""}
																	</Text>
																	<Text
																		style={[
																			styles.cell,
																			styles.nameColumn,
																			...(colIdx ===
																			actualColumns.length -
																				1
																				? [
																						styles.lastCell,
																				  ]
																				: []),
																		]}
																	>
																		{member
																			? member.fullName
																			: ""}
																	</Text>
																</React.Fragment>
															);
														}
													)}
												</View>
											);
										})}
									</View>
									{slotIdx < TABLES_PER_PAGE - 1 && (
										<View style={styles.tableGap} />
									)}
								</View>
							);
						}
					)}
					<ReportsFooter />
				</Page>
			))}
		</Document>
	);
};

export default TrailsMembershipHistoryReport;
