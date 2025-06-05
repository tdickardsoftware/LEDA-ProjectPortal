import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import { TrailsSavePointsLetter } from '@/lib/definitions';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
    padding: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  headerText: {
    flex: 1,
  },
  organizationName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  address: {
    fontSize: 10,
    marginBottom: 1,
  },
  rightSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: 200,
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 15,
  },
  dateValue: {
    fontSize: 10,
    marginBottom: 10,
  },
  recipientSection: {
    marginBottom: 20,
  },
  recipientName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  recipientAddress: {
    fontSize: 10,
    marginBottom: 1,
  },
  reminderParagraph: {
    fontSize: 9,
    textAlign: 'justify',
    marginBottom: 15,
    lineHeight: 1.3,
  },
  directorText: {
    fontSize: 9,
    textAlign: 'right',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  memberInfoSection: {
    marginBottom: 20,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  memberName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  memberNumber: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    fontSize: 9,
  },
  infoLabel: {
    width: '70%',
  },
  infoValue: {
    width: '30%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  rulesText: {
    fontSize: 9,
    textAlign: 'justify',
    marginBottom: 10,
    lineHeight: 1.3,
  },
  savePointsBox: {
    border: '1 solid black',
    padding: 8,
    marginVertical: 15,
  },
  savePointsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    textDecoration: 'underline',
  },
  savePointsText: {
    fontSize: 9,
    textAlign: 'justify',
    lineHeight: 1.3,
  },
  signatureSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  signatureLine: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  paymentBox: {
    marginTop: 15,
    marginBottom: 20,
  },
  paymentText: {
    fontSize: 9,
    textAlign: 'justify',
    lineHeight: 1.3,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
  },
});

interface TrailsSavePointsLetterReportProps {
  data: TrailsSavePointsLetter[];
  reportDate?: string;
}

export const TrailsSavePointsLetterReport: React.FC<TrailsSavePointsLetterReportProps> = ({
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
  const getDeadlineDate = (lastTrailsDate: Date) => {
    const deadline = new Date(lastTrailsDate);
    deadline.setMonth(deadline.getMonth() + 4);
    return deadline.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Document>
      {data.map((member, index) => (
        <Page key={index} size="A4" style={styles.page}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.leftSection}>
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
              </View>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.title}>LAKE ERIE DART ASSOCIATION</Text>
              <Text style={styles.title}>TOURNAMENT TRAILS REMINDER</Text>
              <Text style={styles.dateLabel}>Date of Letter:</Text>
              <Text style={styles.dateValue}>{reportDate}</Text>
            </View>
          </View>

          {/* Recipient Address */}
          <View style={styles.recipientSection}>
            <Text style={styles.recipientName}>{member.fullName}</Text>
            <Text style={styles.recipientAddress}>{member.addressFirstLine}</Text>
            <Text style={styles.recipientAddress}>{member.addressSecondLine}</Text>
          </View>

          {/* Main Content */}
          <Text style={styles.reminderParagraph}>
            This reminder is issued as a courtesy to participants in the Tournament Trails Program. Players should note that failure 
            to receive this letter does not waiver the LEDA&apos;s right to remove a participant from the Tournament Trails list 
            (with forfeiture of ALL points accumulated to date). If the LEDA claims a forfeit of your points, you have the right to 
            petition the Director to review your attendance history and must show good cause why program rules were not adhered to.
          </Text>

          <Text style={styles.directorText}>
            Tournament Trails Director - Dusty Schulz
          </Text>

          {/* Member Information */}
          <View style={styles.memberInfoSection}>
            <View style={styles.memberHeader}>
              <Text style={styles.memberName}>{member.fullName}</Text>
              <Text style={styles.memberNumber}># {member.ledaId}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Our records indicate that your last participation in tournament Trails was on:</Text>
              <Text style={styles.infoValue}>
                {new Date(member.lastTrailsDate).toLocaleDateString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Your Total Points as of that date amount to:</Text>
              <Text style={styles.infoValue}>{member.totalpoints}</Text>
            </View>
          </View>

          {/* Rules Text */}
          <Text style={styles.rulesText}>
            In order to remain eligible within the Trails Program you must participate a minimum of once every 
            four (4) months as stated in the Trails Rules, which indicate that you must play in a Trails match 
            prior to {getDeadlineDate(new Date(member.lastTrailsDate))} or remit the Save Points Fee listed below. You must also have a current paid 
            membership with the LEDA.
          </Text>

          <Text style={styles.rulesText}>
            Please choose one of the above conditions that pertains to your situation. Non-compliance will result 
            in the loss of Trails Points accumulated to date.
          </Text>

          {/* Save Points Section */}
          <View style={styles.savePointsBox}>
            <Text style={styles.savePointsTitle}>SAVE POINTS:</Text>
            <Text style={styles.savePointsText}>
              I am unable to attend a Trails Match within the specified time period. I am enclosing the $7.00 Save 
              Points Fee and my membership fee (if applicable) to begin and/or continue my participation in the Trails Program 
              to date. I understand that my eligibility will be updated upon the Club&apos;s receipt of these funds and I 
              will be a Member in Good Standing in Trails for the next four (4) months.
            </Text>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <Text style={styles.signatureLine}>Please Sign Here: _________________________________</Text>
            <Text style={styles.noteText}>(NOTE: UPON PAYMENT FOUR (4) TRAILS POINTS ARE ADDED TO YOUR TOTAL)</Text>
            <Text style={styles.noteText}>Make Check Payable To: LEDA</Text>
            <Text style={styles.noteText}>Return to the return address printed at the top of this page.</Text>
          </View>

          {/* Payment Instructions */}
          <View style={styles.paymentBox}>
            <Text style={styles.paymentText}>
              Please do not forget to include your membership payment. We can not 
              save your points without a current paid membership to the LEDA. If you 
              are not playing in league, please include your $20 partial membership fee. 
              Thank you
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>440-975-9775 Office</Text>
            <Text style={styles.footerText}>440-975-9220 Fax</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default TrailsSavePointsLetterReport;
