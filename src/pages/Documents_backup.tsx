import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Upload, FileText, Image, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getDocuments, addDocument, removeDocument, getDocumentsByDate } from "@/lib/tradeStorage";
import { StoredFile } from "@/types/trade";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const DocumentsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [docs, setDocs] = useState(getDocuments());
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const currentDocs = useMemo(() => getDocumentsByDate(dateStr), [docs, dateStr]);

  // Get unique dates that have documents
  const datesWithDocs = useMemo(() => {
    return docs.map((d) => d.date).sort((a, b) => b.localeCompare(a));
  }, [docs]);

  const handleFileUpload = (type: "kyc" | "chargeSlips") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const storedFile: StoredFile = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            dataUrl: ev.target?.result as string,
            uploadedAt: new Date().toISOString(),
          };
          addDocument(dateStr, type, storedFile);
          setDocs(getDocuments());
          toast.success(`${file.name} uploaded`);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const handleRemove = (type: "kyc" | "chargeSlips", fileId: string) => {
    removeDocument(dateStr, type, fileId);
    setDocs(getDocuments());
    toast.success("File removed");
  };

  const FileCard = ({ file, type }: { file: StoredFile; type: "kyc" | "chargeSlips" }) => (
    <div className="glass-card rounded-lg p-3 flex items-center gap-3 group">
      <div className="h-10 w-10 rounded-md bg-secondary/50 flex items-center justify-center shrink-0">
        {file.type.startsWith("image/") ? (
          <Image className="h-5 w-5 text-primary" />
        ) : (
          <FileText className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {format(new Date(file.uploadedAt), "dd MMM yyyy, HH:mm")}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10" onClick={() => setPreviewFile(file)}>
          <Eye className="h-3.5 w-3.5 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => handleRemove(type, file.id)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Documents</h2>
            <p className="text-muted-foreground text-sm">View KYC & charge slips date-wise</p>
          </div>
        </div>

        {/* Date Picker */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <label className="text-sm font-medium whitespace-nowrap">Select Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[220px] justify-start border-border/50">
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {format(selectedDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {datesWithDocs.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {datesWithDocs.slice(0, 5).map((d) => (
                  <Button
                    key={d}
                    variant={d === dateStr ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedDate(parseISO(d))}
                  >
                    {format(parseISO(d), "dd MMM")}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KYC Section */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              KYC Documents
            </h3>
            <Button onClick={() => handleFileUpload("kyc")} size="sm" className="gap-2 glow-primary">
              <Upload className="h-4 w-4" /> Upload KYC
            </Button>
          </div>
          {currentDocs.kyc.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No KYC documents for this date</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentDocs.kyc.map((f) => <FileCard key={f.id} file={f} type="kyc" />)}
            </div>
          )}
        </div>

        {/* Charge Slips Section */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Charge Slips
            </h3>
            <Button onClick={() => handleFileUpload("chargeSlips")} size="sm" className="gap-2 glow-primary">
              <Upload className="h-4 w-4" /> Upload Slip
            </Button>
          </div>
          {currentDocs.chargeSlips.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No charge slips for this date</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentDocs.chargeSlips.map((f) => <FileCard key={f.id} file={f} type="chargeSlips" />)}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="glass-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold truncate">{previewFile.name}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {previewFile.type.startsWith("image/") ? (
              <img src={previewFile.dataUrl} alt={previewFile.name} className="w-full rounded-lg" />
            ) : (
              <iframe src={previewFile.dataUrl} className="w-full h-[70vh] rounded-lg" title={previewFile.name} />
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DocumentsPage;
