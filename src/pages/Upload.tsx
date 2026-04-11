import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { parseCSVLine, addTrades } from "@/lib/tradeStorage";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const UploadPage = () => {
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string);
      toast.info("File loaded! Review and click Upload.");
    };
    reader.readAsText(file);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Upload Trades</h2>
          <p className="text-muted-foreground text-sm">Add daily P2P trade records</p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trade Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-border/50">
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Trade Data</label>
              <label className="cursor-pointer">
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                <span className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <FileText className="h-3 w-3" /> Import file
                </span>
              </label>
            </div>
            <Textarea
              placeholder={"BUYER NAME,AMOUNT INR,ORDER ID,USDT RATE\nDHARMENDRASINH RANJEETSINH PARMAR,6500,22875436809660768256,102.2\nSAPKAL HARSHEL ASHOK,9000,22875438529773518848,102.2"}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={10}
              className="font-mono text-xs bg-secondary/50 border-border/50"
            />
            <p className="text-xs text-muted-foreground">
              One trade per line: <span className="text-primary">Name, Amount (INR), Order ID, USDT Rate</span>
            </p>
          </div>

          <Button onClick={handleUpload} className="w-full gap-2 glow-primary">
            <Upload className="h-4 w-4" /> Upload Trades
          </Button>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Format Guide</h3>
          <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs space-y-1 text-muted-foreground">
            <p>DHARMENDRASINH RANJEETSINH PARMAR,6500,22875436809660768256,102.2</p>
            <p>SAPKAL HARSHEL ASHOK,9000,22875438529773518848,102.2</p>
            <p>AKASH PATIL,10000,22875445871381422080,102.2</p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
            <div className="bg-secondary/30 rounded p-2 text-center">Buyer Name</div>
            <div className="bg-secondary/30 rounded p-2 text-center">Amount ₹</div>
            <div className="bg-secondary/30 rounded p-2 text-center">Order ID</div>
            <div className="bg-secondary/30 rounded p-2 text-center">USDT Rate</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
