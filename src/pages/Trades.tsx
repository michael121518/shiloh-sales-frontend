import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, RefreshCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Trade } from "@/types/trade";
import TradeTable from "@/components/TradeTable";
import Layout from "@/components/Layout";

const TradesPage = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Define filter states
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const API_URL = `${import.meta.env.VITE_API_URL}/trades/`;

  const fetchTrades = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      
      const mappedTrades: Trade[] = data.map((t: any) => ({
        buyerName: t.buyer_name || "",
        amountINR: Number(t.amount_inr),
        orderId: t.order_id || "",
        usdtRate: Number(t.usdt_rate),
        date: t.trade_date ? String(t.trade_date).split('T')[0] : "", 
      }));

      setTrades(mappedTrades);
    } catch (error) {
      console.error("Load Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // 2. The Filter Logic (Handles Search + Date together)
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // Name Match (Case Insensitive)
      const matchesName = trade.buyerName
        .toLowerCase()
        .includes(nameFilter.toLowerCase().trim());

      // Date Match (Match YYYY-MM-DD strings)
      let matchesDate = true;
      if (dateFilter) {
        const selectedDateString = format(dateFilter, "yyyy-MM-dd");
        matchesDate = trade.date === selectedDateString;
      }

      return matchesName && matchesDate;
    });
  }, [trades, nameFilter, dateFilter]); // Re-runs when any of these change

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trade History</h2>
            <p className="text-muted-foreground text-sm"></p>
          </div>
          <Button onClick={fetchTrades} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} /> Refresh
          </Button>
        </div>

        {/* 3. Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 glass-card rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by buyer name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)} // Updates state immediately
              className="pl-9 bg-secondary/30"
            />
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn("w-[200px] justify-start", !dateFilter && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "dd MMM yyyy") : "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar 
                  mode="single" 
                  selected={dateFilter} 
                  onSelect={setDateFilter} 
                />
              </PopoverContent>
            </Popover>

            {/* Clear Button: Only shows if a filter is active */}
            {(nameFilter || dateFilter) && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setNameFilter(""); setDateFilter(undefined); }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 4. Display Table (Passing filteredTrades, not trades) */}
        <div className="glass-card rounded-xl p-6">
          {isLoading ? (
            <div className="text-center py-20">Loading database...</div>
          ) : (
            <TradeTable 
              trades={filteredTrades} 
              onDelete={fetchTrades} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TradesPage;
