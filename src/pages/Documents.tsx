import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload, FileText, Image, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const API_BASE = `${import.meta.env.VITE_API_URL}/documents`;

const DocumentsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [docs, setDocs] = useState<any[]>([]);
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchDocs = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/${dateStr}`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Database connection failed");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [dateStr]);

  const kycDocs = useMemo(() => docs.filter(d => d.type === 'kyc'), [docs]);
  const slipDocs = useMemo(() => docs.filter(d => d.type === 'chargeSlips'), [docs]);

  const handleFileUpload = (type: "kyc" | "chargeSlips") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        // Safe string ID for the TEXT column in DB
        const generatedId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const payload = {
          id: generatedId,
          name: file.name,
          type: type,
          file_type: file.type,
          data_url: ev.target?.result as string,
          trade_date: dateStr,
        };

        try {
          const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            toast.success("Saved to PostgreSQL");
            fetchDocs();
          } else {
            const err = await res.json();
            toast.error(err.error || "Upload failed");
          }
        } catch (err) {
          toast.error("Server connection error");
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted");
        fetchDocs();
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const FileCard = ({ file }: { file: any }) => (
    <div className="glass-card rounded-lg p-3 flex items-center gap-3 group border border-border/40 hover:border-primary/30 transition-all">
      <div className="h-10 w-10 rounded-md bg-secondary/50 flex items-center justify-center shrink-0">
        {file.file_type.startsWith("image/") ? <Image className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-[10px] text-muted-foreground">{format(new Date(file.uploaded_at), "dd MMM, HH:mm")}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewFile(file)}>
          <Eye className="h-3.5 w-3.5 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => handleRemove(file.id)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold">Document Manager</h2>
            <p className="text-muted-foreground text-sm"></p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 flex items-center gap-4 border border-border/50">
          <label className="text-sm font-medium">Trade Date:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {format(selectedDate, "dd MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} />
            </PopoverContent>
          </Popover>
          {isSyncing && <span className="text-[10px] animate-pulse uppercase tracking-widest text-primary">Syncing...</span>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KYC Section */}
          <div className="glass-card rounded-xl p-6 border border-border/50 bg-secondary/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" /> KYC Documents</h3>
              <Button onClick={() => handleFileUpload("kyc")} size="sm" className="gap-2 shadow-lg shadow-primary/20">
                <Upload className="h-4 w-4" /> Upload
              </Button>
            </div>
            {kycDocs.length === 0 ? <p className="text-xs text-center py-10 text-muted-foreground italic border border-dashed rounded-lg">No KYC uploaded for this date</p> : 
              <div className="grid grid-cols-1 gap-2">{kycDocs.map(f => <FileCard key={f.id} file={f} />)}</div>
            }
          </div>

          {/* Charge Slips Section */}
          <div className="glass-card rounded-xl p-6 border border-border/50 bg-secondary/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2 text-lg"><Image className="h-5 w-5 text-primary" /> Charge Slips</h3>
              <Button onClick={() => handleFileUpload("chargeSlips")} size="sm" className="gap-2 shadow-lg shadow-primary/20">
                <Upload className="h-4 w-4" /> Upload
              </Button>
            </div>
            {slipDocs.length === 0 ? <p className="text-xs text-center py-10 text-muted-foreground italic border border-dashed rounded-lg">No slips uploaded for this date</p> : 
              <div className="grid grid-cols-1 gap-2">{slipDocs.map(f => <FileCard key={f.id} file={f} />)}</div>
            }
          </div>
        </div>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-card rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-primary/20" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b bg-secondary/10">
              <h3 className="font-bold text-lg truncate pr-4">{previewFile.name}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-black/5">
              {previewFile.file_type.startsWith("image/") ? (
                <img src={previewFile.data_url} className="w-full h-auto rounded-lg mx-auto" alt="preview" />
              ) : (
                <iframe src={previewFile.data_url} className="w-full h-[70vh] rounded-lg bg-white" />
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DocumentsPage;
