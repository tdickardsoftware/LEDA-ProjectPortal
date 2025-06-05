import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TrailsPointsList } from '@/lib/definitions';
import ReportsHeader from '@/components/ui/reports-header';
import ReportsFooter from '@/components/ui/reports-footer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  table: {
    width: '100%',
    border: '1 solid black',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1 solid black',
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #ccc',
    padding: 5,
    breakInside: 'avoid',
  },
  ledaIdColumn: {
    width: '12%',
    fontSize: 8,
    paddingRight: 5,
    borderRight: '0.5 solid #ccc',
  },
  nameColumn: {
    width: '25%',
    fontSize: 8,
    paddingRight: 5,
    paddingLeft: 5,
    borderRight: '0.5 solid #ccc',
  },
  pointsColumn: {
    width: '12%',
    fontSize: 8,
    textAlign: 'center',
    paddingRight: 5,
    paddingLeft: 5,
    borderRight: '0.5 solid #ccc',
  },
  dateColumn: {
    width: '15%',
    fontSize: 8,
    textAlign: 'center',
    paddingRight: 5,
    paddingLeft: 5,
    borderRight: '0.5 solid #ccc',
  },
  duesColumn: {
    width: '12%',
    fontSize: 8,
    textAlign: 'center',
    paddingLeft: 5,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});

interface TrailsPointsListReportProps {
  data: TrailsPointsList[];
  reportDate?: string;
}

export const TrailsPointsListReport: React.FC<TrailsPointsListReportProps> = ({
  data,
  reportDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '')
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <ReportsHeader title="Trails Points List" reportDate={reportDate} />

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.ledaIdColumn, styles.tableHeaderText]}>LEDA ID</Text>
            <Text style={[styles.nameColumn, styles.tableHeaderText]}>Full Name</Text>
            <Text style={[styles.pointsColumn, styles.tableHeaderText]}>Prev Points</Text>
            <Text style={[styles.pointsColumn, styles.tableHeaderText]}>Total Points</Text>
            <Text style={[styles.pointsColumn, styles.tableHeaderText]}>Change</Text>
            <Text style={[styles.dateColumn, styles.tableHeaderText]}>Trails Date</Text>
            <Text style={[styles.duesColumn, styles.tableHeaderText]}>Paid Dues</Text>
          </View>
          {data.map((member, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.ledaIdColumn}>{member.ledaId}</Text>
              <Text style={styles.nameColumn}>{member.fullname}</Text>
              <Text style={styles.pointsColumn}>{member.previousTotalPoints}</Text>
              <Text style={styles.pointsColumn}>{member.totalPoints}</Text>
              <Text style={styles.pointsColumn}>{member.changeBy}</Text>
              <Text style={styles.dateColumn}>
                {new Date(member.trailsDate).toLocaleDateString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: 'numeric' 
                })}
              </Text>
              <Text style={styles.duesColumn}>{member.paidDues ? 'X' : ''}</Text>
            </View>
          ))}
        </View>

        <ReportsFooter />
      </Page>
    </Document>
  );
};

export default TrailsPointsListReport;
