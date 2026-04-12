import { Trade } from "@/types/trade";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileDown } from "lucide-react";
import { deleteTrade } from "@/lib/tradeStorage";
import { generateInvoicePDF } from "@/lib/invoiceGenerator";

interface Props {
  trades: Trade[];
  onDelete: () => void;
}

const TradeTable = ({ trades, onDelete }: Props) => {
  const handleDelete = (id: string) => {
    deleteTrade(id);
    onDelete();
  };

  if (trades.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No trades found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Invoice</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Buyer</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">INR</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Rate</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">USDT</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((t, i) => (
            <TableRow
              key={t.id}
              className="border-border/30 hover:bg-secondary/30 animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <TableCell className="font-mono text-xs text-primary font-semibold">
                {t.invoiceNo || "—"}
              </TableCell>
              <TableCell className="font-medium text-sm">{t.buyerName}</TableCell>
              <TableCell className="text-right text-sm text-primary font-semibold">
                ₹{t.amountINR.toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {t.orderId.slice(0, 8)}…{t.orderId.slice(-4)}
              </TableCell>
              <TableCell className="text-right text-sm">₹{t.usdtRate}</TableCell>
              <TableCell className="text-right text-sm text-success font-medium">
                {(t.amountINR / t.usdtRate).toFixed(2)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => generateInvoicePDF(t)}
                    className="h-8 w-8 hover:bg-primary/10"
                    title="Download Invoice"
                  >
                    <FileDown className="h-3.5 w-3.5 text-primary/70" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TradeTable;
