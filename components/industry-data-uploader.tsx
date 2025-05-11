"use client"

import { useState } from "react"
import { Upload, X, FileDown, CheckCircle2 } from "lucide-react"
import { useIndustryData } from "@/lib/context/industry-data-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function IndustryDataUploader() {
  const { uploadIndustryData, downloadIndustryTemplateCSV, lastUpdated } = useIndustryData()
  const [isUploading, setIsUploading] = useState(false)
  const [industryFile, setIndustryFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)

  const handleIndustryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIndustryFile(e.target.files[0])
    }
  }

  const clearFile = () => {
    setIndustryFile(null)
  }

  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      // Clear all possible storage mechanisms
      localStorage.removeItem('asean_industry_data');
      sessionStorage.removeItem('asean_industry_data');
      
      // Clear any IndexedDB storage if used
      try {
        indexedDB.deleteDatabase('asean_industry_data');
      } catch (e) {
        console.log('No IndexedDB to clear');
      }
      
      // Force a hard refresh to clear any in-memory data
      window.location.href = window.location.href.split('#')[0];
    }
  }

  const handleUpload = async () => {
    if (!industryFile) return

    try {
      setIsUploading(true)
      
      // First clear any existing data completely
      if (typeof window !== 'undefined') {
        localStorage.removeItem('asean_industry_data');
      }
      
      // Now upload the new data
      await uploadIndustryData(industryFile)
      setUploadSuccess(true)
      
      // Show success message
      toast.success(`Industry data uploaded successfully, refreshing view...`)
      console.log("Upload successful, refreshing page...")
      
      setIndustryFile(null)
      
      // Force a full page refresh to completely reload the app
      window.location.href = window.location.href.split('#')[0];
    } catch (error) {
      console.error("Upload error:", error)
      toast.error('Error uploading industry data: ' + (error as Error).message)
      setUploadSuccess(false)
    } finally {
      setIsUploading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Industry Data
          {uploadSuccess && (
            <span className="ml-1 text-xs text-emerald-500">
              <CheckCircle2 className="h-3 w-3 inline-block mr-1" />
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Industry Impact Data</DialogTitle>
          <div className="space-y-2">
            <DialogDescription>
              Upload industry trade impact data in CSV format
            </DialogDescription>
            {lastUpdated && (
              <p className="mt-1 text-xs text-emerald-500 font-medium flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Last updated: {formatDate(lastUpdated)}
              </p>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="industry-file">Upload Industry Data CSV</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={downloadIndustryTemplateCSV}
                className="h-6 px-2 text-xs"
              >
                <FileDown className="h-3 w-3 mr-1" />
                Template
              </Button>
            </div>
            {industryFile ? (
              <div className="flex items-center justify-between p-2 border rounded-md">
                <span className="text-sm truncate">{industryFile.name}</span>
                <Button variant="ghost" size="sm" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Input id="industry-file" type="file" accept=".csv" onChange={handleIndustryFileChange} />
            )}
            <p className="text-xs text-muted-foreground">
              CSV format: id, name, exportValue, importValue, tariffImpact, gdpImpact, riskLevel, country, productName, productImpact, companies
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={!industryFile || isUploading} 
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Industry Data"}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearAllData} 
              className="w-full"
            >
              Clear All Data & Refresh
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 