import jsPDF from 'jspdf';

export function generateBookingPDF(details: {
  customerName: string;
  companyName: string;
  email: string;
  date: string;
  time: string;
  reference: string;
}) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text("AI VARSH", 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Intelligence. Creativity. Growth.", 20, 38);
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("BOOKING CONFIRMATION / PROFORMA INVOICE", 20, 60);
  
  // Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 65, 190, 65);
  
  // Details
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  const startY = 80;
  const lineSpacing = 10;
  
  doc.text(`Reference: ${details.reference}`, 20, startY);
  doc.text(`Customer: ${details.customerName}`, 20, startY + lineSpacing);
  doc.text(`Company: ${details.companyName}`, 20, startY + lineSpacing * 2);
  doc.text(`Email: ${details.email}`, 20, startY + lineSpacing * 3);
  
  doc.text(`Service: WhatsApp Automation Consultation`, 20, startY + lineSpacing * 5);
  doc.text(`Date: ${details.date}`, 20, startY + lineSpacing * 6);
  doc.text(`Time: ${details.time}`, 20, startY + lineSpacing * 7);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Amount: $0.00 / Consultation`, 20, startY + lineSpacing * 9);
  doc.text(`Status: CONFIRMED`, 20, startY + lineSpacing * 10);
  
  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for choosing AI VARSH. We look forward to speaking with you.", 20, 270);
  
  return doc;
}
