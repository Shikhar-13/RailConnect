import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Font 
} from "@react-pdf/renderer";
import { BookingResponse } from "../../types";

// Note: In a real app, you would register fonts here
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1A1A2E",
  },
  header: {
    backgroundColor: "#0F2D5E",
    padding: 20,
    borderRadius: 8,
    color: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSub: {
    fontSize: 8,
    opacity: 0.8,
    marginTop: 2,
    textTransform: "uppercase",
  },
  pnrSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  pnrLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
  },
  pnrValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F2D5E",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F2D5E",
    textTransform: "uppercase",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  col: {
    flexDirection: "column",
  },
  label: {
    fontSize: 8,
    color: "#64748B",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 11,
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableCell: {
    flex: 1,
  },
  tableCellNarrow: {
    width: 50,
  },
  tableCellText: {
    fontSize: 9,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#64748B",
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#000",
    borderRadius: 4,
  }
});

const TicketPDF = ({ booking }: { booking: BookingResponse }) => (
  <Document title={`Ticket-${booking.pnrNumber}`}>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>INDIAN RAILWAYS</Text>
          <Text style={styles.headerSub}>Electronic Reservation Slip (ERS)</Text>
        </View>
        <Text style={{ fontSize: 10, fontWeight: "bold" }}>RailBook Confirmed</Text>
      </View>

      {/* PNR Section */}
      <View style={styles.pnrSection}>
        <View>
          <Text style={styles.pnrLabel}>PNR Number</Text>
          <Text style={styles.pnrValue}>{booking.pnrNumber}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.pnrLabel}>Booking Status</Text>
          <Text style={{ ...styles.pnrValue, color: "#16A34A" }}>{booking.status}</Text>
        </View>
      </View>

      {/* Journey Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Journey Details</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Train Name/Number</Text>
            <Text style={styles.value}>{booking.trainName} ({booking.trainNumber})</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Class</Text>
            <Text style={styles.value}>{booking.classType}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Quota</Text>
            <Text style={styles.value}>{booking.bookingType}</Text>
          </View>
          </View>

        <View style={{ ...styles.row, marginTop: 15 }}>
          <View style={styles.col}>
            <Text style={styles.label}>From (Station Code)</Text>
            <Text style={styles.value}>{booking.fromStation || "New Delhi (NDLS)"}</Text>
            <Text style={{ ...styles.value, marginTop: 4 }}>06:00 AM | 30 Apr 2025</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>To (Station Code)</Text>
            <Text style={styles.value}>{booking.toStation || "Mumbai CSMT (CSMT)"}</Text>
            <Text style={{ ...styles.value, marginTop: 4 }}>10:30 PM | 30 Apr 2025</Text>
          </View>
        </View>
      </View>

      {/* Passenger Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Passenger Details</Text>
        <View style={styles.table}>
          <View style={{ ...styles.tableRow, ...styles.tableHeader }}>
            <Text style={{ ...styles.tableCell, ...styles.tableHeaderText, paddingLeft: 5 }}># Name</Text>
            <Text style={{ ...styles.tableCellNarrow, ...styles.tableHeaderText }}>Age/Sex</Text>
            <Text style={{ ...styles.tableCell, ...styles.tableHeaderText }}>Seat/Berth</Text>
            <Text style={{ ...styles.tableCellNarrow, ...styles.tableHeaderText, textAlign: "right", paddingRight: 5 }}>Status</Text>
          </View>
          {booking.passengers?.map((p, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={{ ...styles.tableCell, ...styles.tableCellText, paddingLeft: 5 }}>{p.firstName} {p.lastName}</Text>
              <Text style={{ ...styles.tableCellNarrow, ...styles.tableCellText }}>{p.age || "-"} / {p.gender ? p.gender.charAt(0) : "-"}</Text>
              <Text style={{ ...styles.tableCell, ...styles.tableCellText }}>{p.allocatedBerth || "Awaited"}</Text>
              <Text style={{ ...styles.tableCellNarrow, ...styles.tableCellText, textAlign: "right", fontWeight: "bold", color: "#16A34A", paddingRight: 5 }}>{p.passengerStatus || "-"}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Fare Details */}
      <View style={{ ...styles.section, marginTop: 10 }}>
        <Text style={styles.sectionTitle}>Transaction Summary</Text>
        <View style={{ ...styles.row, justifyContent: "flex-end", gap: 20 }}>
          <Text style={styles.label}>Base Fare:</Text>
          <Text style={{ ...styles.value, width: 80, textAlign: "right" }}>₹{(booking.totalFare * 0.95).toFixed(2)}</Text>
        </View>
        <View style={{ ...styles.row, justifyContent: "flex-end", gap: 20 }}>
          <Text style={styles.label}>GST (5%):</Text>
          <Text style={{ ...styles.value, width: 80, textAlign: "right" }}>₹{(booking.totalFare * 0.05).toFixed(2)}</Text>
        </View>
        <View style={{ ...styles.row, justifyContent: "flex-end", gap: 20, marginTop: 4, borderTopWidth: 1, borderTopColor: "#0F2D5E", paddingTop: 4 }}>
          <Text style={{ ...styles.label, fontWeight: "bold", color: "#0F2D5E" }}>Total Fare:</Text>
          <Text style={{ ...styles.value, width: 80, textAlign: "right", fontSize: 12, color: "#F97316" }}>₹{booking.totalFare.toFixed(2)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>This is a computer generated e-ticket and does not require a physical signature.</Text>
        <Text style={{ ...styles.footerText, marginTop: 4 }}>Please carry a valid original ID proof during travel. RailBook Technologies Pvt Ltd.</Text>
      </View>
    </Page>
  </Document>
);

export default TicketPDF;
