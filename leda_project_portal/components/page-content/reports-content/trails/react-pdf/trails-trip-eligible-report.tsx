import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import { TrailsTripEligible } from '@/lib/definitions';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 20,
    border: '1 solid black',
    padding: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  organizationName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  address: {
    fontSize: 9,
    marginBottom: 1,
  },
  dateContainer: {
    position: 'relative',
    top: 0,
    right: 0,
  },
  dateLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  dateValue: {
    fontSize: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  pointsHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
    width: '15%',
    fontSize: 8,
    paddingRight: 5,
    borderRight: '0.5 solid #ccc',
  },
  nameColumn: {
    width: '30%',
    fontSize: 8,
    paddingRight: 5,
    paddingLeft: 5,
    borderRight: '0.5 solid #ccc',
  },
  pointsColumn: {
    width: '10%',
    fontSize: 8,
    textAlign: 'center',
    paddingRight: 5,
    paddingLeft: 5,
    borderRight: '0.5 solid #ccc',
  },
  addressColumn: {
    width: '45%',
    fontSize: 8,
    paddingLeft: 5,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTop: '1 solid #ccc',
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 8,
    color: '#666',
  },
});

interface TrailsTripEligibleReportProps {
  data: TrailsTripEligible[];
  reportDate?: string;
}

export const TrailsTripEligibleReport: React.FC<TrailsTripEligibleReportProps> = ({ 
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
        {/* Header Section */}
        <View style={styles.header} fixed>
          <View style={styles.logoContainer}>
            <PDFImage 
              style={styles.logo}
              src="/leda-reports-logo.png"
            />
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.organizationName}>Lake Erie Dart Association, Inc.</Text>
            <Text style={styles.address}>7537 Mentor Ave. Suite #107</Text>
            <Text style={styles.address}>Mentor, OH 44060</Text>
            <Text style={styles.title}>Trails Trip Eligible List</Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>DATE</Text>
            <Text style={styles.dateValue}>{reportDate}</Text>
          </View>
        </View>

        {/* Data Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.ledaIdColumn, styles.tableHeaderText]}>LEDA ID</Text>
            <Text style={[styles.nameColumn, styles.tableHeaderText]}>Full Name</Text>
            <Text style={[styles.pointsColumn, styles.tableHeaderText]}>Points</Text>
            <Text style={[styles.addressColumn, styles.tableHeaderText]}>Address</Text>
          </View>
          
          {/* Table Rows */}
          {data.map((member) => (
            <View key={member.ledaId} style={styles.tableRow}>
              <Text style={styles.ledaIdColumn}>
                {member.ledaId}
              </Text>
              <Text style={styles.nameColumn}>
                {member.fullName}
              </Text>
              <Text style={styles.pointsColumn}>
                {member.totalpoints}
              </Text>
              <Text style={styles.addressColumn}>
                {member.addressFull}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer Section */}
        <View style={styles.footer} fixed>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => 
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
};

export default TrailsTripEligibleReport;
