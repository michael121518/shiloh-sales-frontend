import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Trade } from "@/types/trade";
import { format, parseISO } from "date-fns";

const COMPANY = {
  name: "SHILOH DIGITAL PVT LTD",
  address: [
    "3-54A, East West Street, Kannapuram,",
    "Kjhhgladi Tk, Ramanathapuram Dist,",
    "Tamil Nadu – 623 909, India",
  ],
  gst: "JKFJFHJHJFY8778776",
  phone: "+91 98875 15489",
  email: "shilhhh12@gmail.com",
  upi: "asfdhhhiike@kjjjkiob",
};

export function generateInvoicePDF(trade: Trade): void {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const usdt = (trade.amountINR / trade.usdtRate).toFixed(2);

  // ── Header band ──
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pw, 50, "F");

  // Gold accent line
  doc.setFillColor(245, 196, 0);
  doc.rect(0, 50, pw, 2, "F");

  // Company name
  doc.setTextColor(245, 196, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.name, 15, 20);

  // Address in header
  doc.setFontSize(8);
  doc.setTextColor(180, 185, 200);
  doc.setFont("helvetica", "normal");
  COMPANY.address.forEach((line, i) => {
    doc.text(line, 15, 28 + i * 4);
  });

  // INVOICE label + number (right side)
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pw - 15, 20, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(245, 196, 0);
  doc.text(trade.invoiceNo, pw - 15, 28, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(180, 185, 200);
  doc.text(`Date: ${format(parseISO(trade.date), "dd MMM yyyy")}`, pw - 15, 35, { align: "right" });

  // ── Company & Buyer info side-by-side ──
  const infoY = 62;
  doc.setTextColor(100, 100, 110);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FROM", 15, infoY);
  doc.text("BILL TO", 115, infoY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 50);
  doc.setFontSize(9);

  // From details
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.name, 15, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`GSTIN: ${COMPANY.gst}`, 15, infoY + 13);
  doc.text(`Phone: ${COMPANY.phone}`, 15, infoY + 18);
  doc.text(`Email: ${COMPANY.email}`, 15, infoY + 23);

  // Bill To details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(trade.buyerName, 115, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Order ID: ${trade.orderId}`, 115, infoY + 13);

  // ── Divider ──
  doc.setDrawColor(220, 220, 230);
  doc.line(15, infoY + 30, pw - 15, infoY + 30);

  // ── Trade details table ──
  autoTable(doc, {
    startY: infoY + 36,
    head: [["#", "Description", "Rate (₹)", "Qty (USDT)", "Amount (₹)"]],
    body: [
      [
        "1",
        "P2P USDT Trade",
        `₹${trade.usdtRate.toLocaleString("en-IN")}`,
        usdt,
        `₹${trade.amountINR.toLocaleString("en-IN")}`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [245, 196, 0],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { textColor: [40, 40, 50], fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    styles: { cellPadding: 6, lineWidth: 0.1, lineColor: [220, 220, 230] },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right", fontStyle: "bold" },
    },
  });

  const tableEndY = (doc as any).lastAutoTable.finalY;

  // ── Summary box (right-aligned) ──
  const summaryX = pw - 85;
  const summaryY = tableEndY + 8;

  doc.setFillColor(248, 249, 252);
  doc.roundedRect(summaryX - 5, summaryY - 3, 80, 36, 2, 2, "F");

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text("Subtotal:", summaryX, summaryY + 5);
  doc.text("Tax:", summaryX, summaryY + 13);

  doc.setTextColor(40, 40, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`₹${trade.amountINR.toLocaleString("en-IN")}`, pw - 15, summaryY + 5, { align: "right" });
  doc.text("N/A", pw - 15, summaryY + 13, { align: "right" });

  // Total row
  doc.setDrawColor(15, 23, 42);
  doc.line(summaryX - 3, summaryY + 18, pw - 12, summaryY + 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Total:", summaryX, summaryY + 28);
  doc.text(`₹${trade.amountINR.toLocaleString("en-IN")}`, pw - 15, summaryY + 28, { align: "right" });

  // ── Payment details box ──
  const payY = summaryY + 45;

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, payY, pw - 30, 30, 2, 2, "F");

  doc.setTextColor(245, 196, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT DETAILS", 22, payY + 9);

  doc.setTextColor(220, 225, 240);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`UPI ID: ${COMPANY.upi}`, 22, payY + 17);
  doc.text(`Phone: ${COMPANY.phone}  |  Email: ${COMPANY.email}`, 22, payY + 23);

  // ── Terms & notes ──
  const termsY = payY + 40;
  doc.setTextColor(130, 130, 140);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("Terms & Conditions:", 15, termsY);
  doc.setFont("helvetica", "normal");
  doc.text("1. This is a computer-generated invoice and does not require a physical signature.", 15, termsY + 5);
  doc.text("2. Payment should be made via the UPI ID mentioned above.", 15, termsY + 10);
  doc.text("3. All disputes are subject to the jurisdiction of courts in Ramanathapuram, Tamil Nadu.", 15, termsY + 15);

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(248, 249, 252);
  doc.rect(0, footerY - 5, pw, 20, "F");
  doc.setTextColor(150, 150, 160);
  doc.setFontSize(7);
  doc.text(`Generated on ${format(new Date(), "dd MMM yyyy, HH:mm")}  •  ${COMPANY.name}`, pw / 2, footerY + 2, { align: "center" });

  doc.save(`${trade.invoiceNo}-${trade.buyerName.replace(/\s+/g, "_")}.pdf`);
}
