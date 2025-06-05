import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
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

export const ReportsFooter: React.FC = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => 
      `Page ${pageNumber} of ${totalPages}`
    } />
  </View>
);

export default ReportsFooter;
