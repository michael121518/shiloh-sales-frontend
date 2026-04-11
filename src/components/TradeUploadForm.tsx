import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { parseCSVLine, addTrades } from "@/lib/tradeStorage";
import { toast } from "sonner";

interface Props {
  onUpload: () => void;
}

const TradeUploadForm = ({ onUpload }: Props) => {
  const [date, setDate] = useState<Date>(new Date());
  const [csvText, setCsvText] = useState("");

  const handleUpload = () => {
    if (!csvText.trim()) {
      toast.error("Please enter trade data");
      return;
    }
    const dateStr = format(date, "yyyy-MM-dd");
    const lines = csvText.trim().split("\n").filter(Boolean);
    const trades = lines.map((l) => parseCSVLine(l, dateStr)).filter(Boolean) as any[];
    if (trades.length === 0) {
      toast.error("No valid trades found. Check your format.");
      return;
    }
    addTrades(trades);
    toast.success(`${trades.length} trade(s) uploaded for ${format(date, "dd MMM yyyy")}`);
    setCsvText("");
    onUpload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5" /> Upload Daily Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Trade Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Trade Data (CSV)</label>
          <Textarea
            placeholder={"BUYER NAME,AMOUNT INR,ORDER ID,USDT RATE\nJohn Doe,5000,123456789,102.2"}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={8}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">One trade per line: Name, Amount (INR), Order ID, USDT Rate</p>
        </div>
        <Button onClick={handleUpload} className="w-full">
          Upload Trades
        </Button>
      </CardContent>
    </Card>
  );
};

export default TradeUploadForm;
