import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getTrades } from "@/lib/tradeStorage";
import { Trade } from "@/types/trade";
import TradeTable from "@/components/TradeTable";
import Layout from "@/components/Layout";

const TradesPage = () => {
  const [trades, setTrades] = useState<Trade[]>(getTrades());
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const refresh = useCallback(() => setTrades(getTrades()), []);

  const filtered = useMemo(() => {
    let result = trades;
    if (nameFilter.trim()) {
      const q = nameFilter.toLowerCase();
      result = result.filter((t) => t.buyerName.toLowerCase().includes(q));
    }
    if (dateFilter) {
      const ds = format(dateFilter, "yyyy-MM-dd");
      result = result.filter((t) => t.date === ds);
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [trades, nameFilter, dateFilter]);

  const exportCSV = () => {
    const header = "Buyer Name,Amount INR,Order ID,USDT Rate,USDT,Date\n";
    const rows = filtered.map((t) =>
      `${t.buyerName},${t.amountINR},${t.orderId},${t.usdtRate},${(t.amountINR / t.usdtRate).toFixed(2)},${t.date}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shiloh-trades-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trade History</h2>
            <p className="text-muted-foreground text-sm">View and manage all P2P trades</p>
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by buyer name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full sm:w-[200px] justify-start border-border/50", !dateFilter && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "dd MMM yyyy") : "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {(nameFilter || dateFilter) && (
              <Button variant="ghost" onClick={() => { setNameFilter(""); setDateFilter(undefined); }} className="text-primary">
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <TradeTable trades={filtered} onDelete={refresh} />
        </div>
      </div>
    </Layout>
  );
};

export default TradesPage;
