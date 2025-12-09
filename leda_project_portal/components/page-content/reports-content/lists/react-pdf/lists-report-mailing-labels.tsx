import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MailingList } from "@/lib/definitions";

const styles = StyleSheet.create({
	page: {
		flexDirection: "row",
		padding: 24,
	},
	column: {
		flex: 1,
		flexDirection: "column",
		gap: 12,
	},
	label: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		marginBottom: 8,
	},
	name: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
	},
	address: {
		fontSize: 11,
		fontFamily: "Helvetica",
	},
});

function formatLabel(label: MailingList) {
	return [
		label.name,
		label.addressLineOne,
		label.addressLineTwo,
	].filter(Boolean);
}

const LABELS_PER_PAGE = 30; // 10 labels per column × 3 columns

export default function ListsReportMailingLabels({
	data,
}: {
	data: MailingList[];
}) {
	// Split data into pages
	const pages: MailingList[][] = [];
	for (let i = 0; i < data.length; i += LABELS_PER_PAGE) {
		pages.push(data.slice(i, i + LABELS_PER_PAGE));
	}

	return (
		<Document>
			{pages.map((pageData, pageIdx) => {
				// 3 columns per page, fill top to bottom then left to right
				const columns = [[], [], []] as MailingList[][];
				pageData.forEach((item, idx) => {
					columns[idx % 3].push(item);
				});

				return (
					<Page key={pageIdx} size="LETTER" style={styles.page}>
						{columns.map((col, colIdx) => (
							<View key={colIdx} style={styles.column}>
								{col.map((row, idx) => {
									const lines = formatLabel(row);
									return (
										<View key={idx} style={styles.label}>
											<Text style={styles.name}>{lines[0]}</Text>
											{lines[1] && <Text style={styles.address}>{lines[1]}</Text>}
											{lines[2] && <Text style={styles.address}>{lines[2]}</Text>}
										</View>
									);
								})}
							</View>
						))}
					</Page>
				);
			})}
		</Document>
	);
}
