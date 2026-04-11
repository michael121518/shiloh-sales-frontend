import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getTrades } from "@/lib/tradeStorage";
import { Trade } from "@/types/trade";
import TradeUploadForm from "@/components/TradeUploadForm";
import TradeTable from "@/components/TradeTable";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Shiloh Digital Pvt Ltd</h1>
            <p className="text-xs text-muted-foreground">P2P Trade Management</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{format(new Date(), "dd MMM yyyy")}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="trades">
          <TabsList>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
            <TabsTrigger value="upload">Upload Trades</TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by buyer name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full sm:w-[200px] justify-start", !dateFilter && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "dd MMM yyyy") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {(nameFilter || dateFilter) && (
                <Button variant="ghost" onClick={() => { setNameFilter(""); setDateFilter(undefined); }}>
                  Clear
                </Button>
              )}
            </div>
            <TradeTable trades={filtered} onDelete={refresh} />
          </TabsContent>

          <TabsContent value="upload" className="mt-4 max-w-lg">
            <TradeUploadForm onUpload={refresh} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
