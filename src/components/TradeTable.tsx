import { Trade } from "@/types/trade";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTrade } from "@/lib/tradeStorage";

interface Props {
  trades: Trade[];
  onDelete: () => void;
}

const TradeTable = ({ trades, onDelete }: Props) => {
  const handleDelete = (id: string) => {
    deleteTrade(id);
    onDelete();
  };

  const totalINR = trades.reduce((s, t) => s + t.amountINR, 0);
  const avgRate = trades.length ? trades.reduce((s, t) => s + t.usdtRate, 0) / trades.length : 0;
  const totalUSDT = trades.reduce((s, t) => s + t.amountINR / t.usdtRate, 0);

  if (trades.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No trades found for the selected filters.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Trades</p>
          <p className="text-2xl font-bold">{trades.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total INR</p>
          <p className="text-2xl font-bold">₹{totalINR.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total USDT</p>
          <p className="text-2xl font-bold">{totalUSDT.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Avg USDT Rate</p>
          <p className="text-2xl font-bold">₹{avgRate.toFixed(2)}</p>
        </div>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer Name</TableHead>
              <TableHead className="text-right">Amount (INR)</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead className="text-right">USDT Rate</TableHead>
              <TableHead className="text-right">USDT</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.buyerName}</TableCell>
                <TableCell className="text-right">₹{t.amountINR.toLocaleString("en-IN")}</TableCell>
                <TableCell className="font-mono text-xs">{t.orderId}</TableCell>
                <TableCell className="text-right">₹{t.usdtRate}</TableCell>
                <TableCell className="text-right">{(t.amountINR / t.usdtRate).toFixed(2)}</TableCell>
                <TableCell>{t.date}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TradeTable;
