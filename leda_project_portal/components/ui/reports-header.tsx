/**
 * ReportsHeader component
 *
 * React-PDF page header rendered on every page of a generated report.
 * Displays the LEDA organisation logo alongside the organisation name,
 * address, the report title, and the run date.  All layout is defined using
 * React-PDF StyleSheet.
 */
import React from "react";
import { View, Text, StyleSheet, Image as PDFImage } from "@react-pdf/renderer";

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		marginBottom: 20,
		alignItems: "flex-start",
	},
	logoContainer: {
		width: 60,
		height: 60,
		marginRight: 20,
		border: "1 solid black",
		padding: 3,
	},
	logo: {
		width: "100%",
		height: "100%",
	},
	headerText: {
		flex: 1,
		alignItems: "center",
	},
	organizationName: {
		fontSize: 11,
		fontWeight: "bold",
		marginBottom: 2,
	},
	address: {
		fontSize: 9,
		marginBottom: 1,
	},
	title: {
		fontSize: 12,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 15,
		marginTop: 5,
	},
	dateContainer: {
		position: "relative",
		top: 0,
		right: 0,
	},
	dateLabel: {
		fontSize: 8,
		fontWeight: "bold",
	},
	dateValue: {
		fontSize: 8,
		marginBottom: 4,
	},
	pageInfo: {
		fontSize: 8,
	},
});

interface ReportsHeaderProps {
	title: string;
	reportDate: string;
	subtitle?: string;
	showPageNumbers?: boolean;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
	title,
	reportDate,
	subtitle,
	showPageNumbers = false,
}) => (
	<View style={styles.header} fixed>
		<View style={styles.logoContainer}>
			<PDFImage style={styles.logo} src="/leda-reports-logo.png" />
		</View>
		<View style={styles.headerText}>
			<Text style={styles.organizationName}>
				Lake Erie Dart Association, Inc.
			</Text>
			<Text style={styles.address}>7537 Mentor Ave. Suite #107</Text>
			<Text style={styles.address}>Mentor, OH 44060</Text>
			<Text style={styles.title}>{title}</Text>
			{subtitle && (
				<Text style={{ fontSize: 9, textAlign: "center", marginBottom: 5 }}>
					{subtitle}
				</Text>
			)}
		</View>
		<View style={styles.dateContainer}>
			<Text style={styles.dateLabel}>DATE</Text>
			<Text style={styles.dateValue}>{reportDate}</Text>
			{showPageNumbers && (
				<Text
					style={styles.pageInfo}
					render={({ pageNumber, totalPages }) =>
						`Page: ${pageNumber} of ${totalPages}`
					}
				/>
			)}
		</View>
	</View>
);

export default ReportsHeader;
