"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Link as LinkIcon, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  name: string;
  defaultValue?: string;
  className?: string;
}

export function ImageUpload({ name, defaultValue = "", className }: ImageUploadProps) {
  const [url, setUrl] = useState(defaultValue);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUrl(data.url);
        toast.success("Imagen subida exitosamente");
      } else {
        toast.error(data.error || "Error al subir la imagen");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al subir la imagen");
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearImage = () => {
    setUrl("");
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Hidden input to hold the actual URL for form submission */}
      <input type="hidden" name={name} value={url} />

      <div className="flex bg-muted/50 p-1 rounded-md w-fit">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-8 px-4 text-xs font-medium", mode === "upload" && "bg-background shadow-sm")}
          onClick={() => setMode("upload")}
        >
          <Upload className="w-3 h-3 mr-2" />
          Subir Archivo
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-8 px-4 text-xs font-medium", mode === "url" && "bg-background shadow-sm")}
          onClick={() => setMode("url")}
        >
          <LinkIcon className="w-3 h-3 mr-2" />
          Pegar URL
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
        {/* Preview Area */}
        <div className="relative w-full sm:w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden group shrink-0">
          {url ? (
            <>
              <Image src={url} alt="Vista previa" fill className="object-contain p-1" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={clearImage}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Sin Imagen</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full flex-1 pt-2 min-w-0">
          {mode === "upload" ? (
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-dashed border-2 hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                    Subiendo a Cloudinary...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2 text-muted-foreground" />
                    Seleccionar imagen (Max 5MB)
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Soporta JPG, PNG, WEBP.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pega la dirección URL directa a una imagen pública.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
