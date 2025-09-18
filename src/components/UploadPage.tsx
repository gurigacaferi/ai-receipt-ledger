import { useState, useCallback } from "react";
import { Upload, FileImage, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ParseStatus, ParsedReceipt } from "@/types/expense";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";


const UploadPage = () => {
  const [parseStatus, setParseStatus] = useState<ParseStatus>({ status: "idle" });
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageResize = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 1600;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const parseReceipt = async (file: File, receiptId: string) => {
    setParseStatus({ status: "parsing", message: "Parsing receipt..." });
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-receipt', {
        body: { receiptId }
      });

      if (error) {
        throw error;
      }

      setParsedData(data);
      setParseStatus({ 
        status: "done", 
        message: "Receipt parsed successfully!" 
      });
      
      toast({
        title: "Success",
        description: "Receipt has been parsed and expenses created.",
      });
      
    } catch (error: any) {
      console.error('Parse error:', error);
      setParseStatus({ 
        status: "error", 
        message: "Failed to parse receipt. Please try again." 
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to parse the receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setParseStatus({ status: "uploading", message: "Uploading image..." });
    
    try {
      const resizedFile = await handleImageResize(file);
      
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, resizedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // Create receipt record
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert([{
          user_id: user.id,
          file_url: publicUrl,
          file_name: file.name,
          parse_status: 'pending'
        }])
        .select()
        .single();

      if (receiptError) {
        throw receiptError;
      }

      // Parse the receipt
      await parseReceipt(resizedFile, receipt.id);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setParseStatus({ 
        status: "error", 
        message: error.message || "Upload failed. Please try again." 
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to upload the receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const getStatusIcon = () => {
    switch (parseStatus.status) {
      case "uploading":
      case "parsing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "done":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusVariant = () => {
    switch (parseStatus.status) {
      case "uploading":
      case "parsing":
        return "secondary";
      case "done":
        return "default";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Upload Receipt
        </h1>
        <p className="text-muted-foreground">
          Upload a photo of your receipt to automatically extract expense data
        </p>
      </div>

      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            className={cn(
              "flex flex-col items-center justify-center space-y-4 text-center",
              dragActive && "opacity-50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="p-6 bg-primary/10 rounded-full">
              <Upload className="h-12 w-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Drop your receipt here</h3>
              <p className="text-muted-foreground">
                Or click to select an image file
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="receipt-upload"
              disabled={parseStatus.status === "uploading" || parseStatus.status === "parsing"}
            />
            
            <Button
              asChild
              variant="outline"
              size="lg"
              disabled={parseStatus.status === "uploading" || parseStatus.status === "parsing"}
            >
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <FileImage className="h-4 w-4 mr-2" />
                Choose File
              </label>
            </Button>

            {parseStatus.status !== "idle" && (
              <Badge variant={getStatusVariant()} className="flex items-center gap-2">
                {getStatusIcon()}
                {parseStatus.message}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Receipt Data</CardTitle>
            <CardDescription>
              Review the extracted information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;