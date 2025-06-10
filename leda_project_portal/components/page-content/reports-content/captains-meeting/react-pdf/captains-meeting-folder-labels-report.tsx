import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
} from "@react-pdf/renderer";
import { CaptainsMtgFolderLabels } from "@/lib/definitions";

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 30,
		fontSize: 10,
		fontFamily: "Helvetica",
		margin: 10,
	},
	container: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 10,
	},
	labelBox: {
		width: "30%",
		marginBottom: 20,
		padding: 10,
		minHeight: 100,
		backgroundColor: "#FFFFFF",
		break: false, // Prevent breaking inside a label
	},
	locationRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
		paddingBottom: 4,
	},
	placeName: {
		fontSize: 11,
		fontWeight: "bold",
		flex: 1,
		marginRight: 5,
	},
	divisionInfo: {
		fontSize: 11,
		fontWeight: "bold",
		marginLeft: 3,
	},
	teamNameContainer: {
		border: "2 solid black",
		marginBottom: 8,
		paddingBottom: 4,
		padding: 4,
	},
	teamName: {
		fontSize: 11,
		fontWeight: "bold",
	},
	captainName: {
		fontSize: 10,
		marginTop: 6,
	},
});

interface CaptainsMeetingFolderLabelsReportProps {
	data: CaptainsMtgFolderLabels[];
	seasonCode?: string;
}

export const CaptainsMeetingFolderLabelsReport: React.FC<
	CaptainsMeetingFolderLabelsReportProps
> = ({ data }) => {
	// Sort data by place name, then by subdivision for consistent ordering
	const sortedData = [...data].sort((a, b) => {
		if (a.placeName !== b.placeName) {
			return a.placeName.localeCompare(b.placeName);
		}
		if (a.divisionLetter !== b.divisionLetter) {
			return a.divisionLetter.localeCompare(b.divisionLetter);
		}
		if (a.subdivisionNumber !== b.subdivisionNumber) {
			return a.subdivisionNumber.localeCompare(b.subdivisionNumber);
		}
		return a.teamLetter.localeCompare(b.teamLetter);
	});

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.container}>
					{sortedData.map((team, index) => (
						<View key={index} style={styles.labelBox}>
							<View style={styles.locationRow}>
								<Text style={styles.placeName}>
									{team.placeName}
								</Text>
								<Text style={styles.divisionInfo}>
									{team.divisionLetter}
								</Text>
								<Text style={styles.divisionInfo}>
									{team.subdivisionNumber}
								</Text>
								<Text style={styles.divisionInfo}>
									{team.teamLetter}
								</Text>
							</View>
							<View style={styles.teamNameContainer}>
								<Text style={styles.teamName}>
									{team.teamName}
								</Text>
							</View>
							<Text style={styles.captainName}>
								{team.captainFullName}
							</Text>
						</View>
					))}
				</View>
			</Page>
		</Document>
	);
};

export default CaptainsMeetingFolderLabelsReport;
