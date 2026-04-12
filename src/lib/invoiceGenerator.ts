import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Trade } from "@/types/trade";
import { format, parseISO } from "date-fns";

export function generateInvoicePDF(trade: Trade): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(20, 24, 35);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Company name
  doc.setTextColor(245, 196, 0);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SHILOH DIGITAL PVT LTD", 15, 22);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 190);
  doc.text("P2P Trade Invoice", 15, 32);

  // Invoice number badge
  doc.setTextColor(245, 196, 0);
  doc.setFontSize(12);
  doc.text(trade.invoiceNo, pageWidth - 15, 22, { align: "right" });
  doc.setTextColor(180, 180, 190);
  doc.setFontSize(9);
  doc.text(`Date: ${format(parseISO(trade.date), "dd MMM yyyy")}`, pageWidth - 15, 32, { align: "right" });

  // Reset colors
  doc.setTextColor(40, 40, 50);

  // Trade details table
  const usdt = (trade.amountINR / trade.usdtRate).toFixed(2);
  autoTable(doc, {
    startY: 55,
    head: [["Field", "Details"]],
    body: [
      ["Invoice No", trade.invoiceNo],
      ["Buyer Name", trade.buyerName],
      ["Amount (INR)", `₹${trade.amountINR.toLocaleString("en-IN")}`],
      ["USDT Rate", `₹${trade.usdtRate}`],
      ["USDT Amount", usdt],
      ["Order ID", trade.orderId],
      ["Trade Date", format(parseISO(trade.date), "dd MMMM yyyy")],
    ],
    theme: "grid",
    headStyles: { fillColor: [20, 24, 35], textColor: [245, 196, 0], fontStyle: "bold" },
    bodyStyles: { textColor: [40, 40, 50] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    styles: { fontSize: 11, cellPadding: 6 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 130);
  doc.text("This is a computer-generated invoice by Shiloh Digital Private Limited.", 15, finalY);
  doc.text(`Generated on ${format(new Date(), "dd MMM yyyy, HH:mm")}`, 15, finalY + 6);

  doc.save(`${trade.invoiceNo}-${trade.buyerName.replace(/\s+/g, "_")}.pdf`);
}
