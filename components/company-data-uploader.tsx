"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { useCompanyData } from "@/lib/context/company-data-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export function CompanyDataUploader() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { uploadCompanyData, downloadCompanyTemplateCSV } = useCompanyData()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await uploadCompanyData(file)
      setIsLoading(false)
      setFile(null)
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading file')
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    downloadCompanyTemplateCSV()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2">
          <Upload className="mr-2 h-4 w-4" />
          Upload Company Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Company Data</DialogTitle>
          <DialogDescription>
            Upload CSV file with company data for impact analysis. Each row should include industryId, 
            industryName, subIndustryName, companyName and other fields.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data-file" className="col-span-4">
              CSV File
            </Label>
            <Input
              id="data-file"
              type="file"
              accept=".csv"
              className="col-span-4"
              onChange={handleFileChange}
            />
            {error && <p className="col-span-4 text-sm text-red-500">{error}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="col-span-4 justify-start text-left font-normal"
              onClick={handleDownloadTemplate}
            >
              Download Template CSV
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 