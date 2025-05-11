"use client"

import { useState } from "react"
import { Upload, X, FileDown, CheckCircle2 } from "lucide-react"
import { useData } from "@/lib/context/data-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function DataUploader() {
  const { uploadGdpGrowthData, uploadTradeBalanceData, selectedCountry, downloadTemplateCSV, lastUpdated, setSelectedCountry } = useData()
  const [isUploading, setIsUploading] = useState(false)
  const [gdpFile, setGdpFile] = useState<File | null>(null)
  const [tradeFile, setTradeFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<{gdp: boolean, trade: boolean}>({gdp: false, trade: false})
  const [lastUploadedCountry, setLastUploadedCountry] = useState<string | null>(null)

  const handleGdpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGdpFile(e.target.files[0])
    }
  }

  const handleTradeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTradeFile(e.target.files[0])
    }
  }

  const clearFile = (type: 'gdp' | 'trade') => {
    if (type === 'gdp') {
      setGdpFile(null)
    } else {
      setTradeFile(null)
    }
  }

  const handleUploadGdp = async () => {
    if (!gdpFile) return

    try {
      setIsUploading(true)
      await uploadGdpGrowthData(gdpFile, true) // Always use bulk upload
      setUploadSuccess({...uploadSuccess, gdp: true})
      setLastUploadedCountry(selectedCountry)
      toast.success(`GDP Growth data uploaded successfully`)

      // Auto-select most recently updated country
      const entries = Object.entries(lastUpdated)
      const timestamps = entries.map(([country, ts]) => ({ country, time: new Date(ts).getTime() }))
      const maxTime = Math.max(...timestamps.map(t => t.time))
      const recent = timestamps.find(t => t.time === maxTime)?.country
      if (recent && recent !== 'all') {
        setSelectedCountry(recent)
      }

      setGdpFile(null)
    } catch (error) {
      toast.error('Error uploading GDP data: ' + (error as Error).message)
      setUploadSuccess({...uploadSuccess, gdp: false})
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadTrade = async () => {
    if (!tradeFile) return

    try {
      setIsUploading(true)
      await uploadTradeBalanceData(tradeFile, true) // Always use bulk upload
      setUploadSuccess({...uploadSuccess, trade: true})
      setLastUploadedCountry(selectedCountry)
      toast.success(`Trade Balance data uploaded successfully`)

      // Auto-select most recently updated country
      const entries = Object.entries(lastUpdated)
      const timestamps = entries.map(([country, ts]) => ({ country, time: new Date(ts).getTime() }))
      const maxTime = Math.max(...timestamps.map(t => t.time))
      const recent = timestamps.find(t => t.time === maxTime)?.country
      if (recent && recent !== 'all') {
        setSelectedCountry(recent)
      }

      setTradeFile(null)
    } catch (error) {
      toast.error('Error uploading Trade data: ' + (error as Error).message)
      setUploadSuccess({...uploadSuccess, trade: false})
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = (type: 'gdp' | 'trade') => {
    downloadTemplateCSV(type)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Data
          {lastUploadedCountry && (
            <span className="ml-1 text-xs text-emerald-500">
              <CheckCircle2 className="h-3 w-3 inline-block mr-1" />
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Data</DialogTitle>
          <div className="space-y-2">
            <DialogDescription>
              Upload data for all countries in a single CSV file
            </DialogDescription>
            {lastUploadedCountry && (
              <p className="mt-1 text-xs text-emerald-500 font-medium flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Last uploaded for: {lastUploadedCountry}
              </p>
            )}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="gdp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gdp">GDP Growth</TabsTrigger>
            <TabsTrigger value="trade">Trade Balance</TabsTrigger>
          </TabsList>
          <TabsContent value="gdp" className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="gdp-file">Upload GDP Components CSV</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDownloadTemplate('gdp')}
                  className="h-6 px-2 text-xs"
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  Template
                </Button>
              </div>
              {gdpFile ? (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="text-sm truncate">{gdpFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => clearFile('gdp')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input id="gdp-file" type="file" accept=".csv" onChange={handleGdpFileChange} />
              )}
              <p className="text-xs text-muted-foreground">
                CSV format: country, year, consumption, investment, government, netExports, tradeVolume
              </p>
            </div>
            <Button 
              onClick={handleUploadGdp} 
              disabled={!gdpFile || isUploading} 
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload GDP Data"}
            </Button>
          </TabsContent>
          <TabsContent value="trade" className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="trade-file">Upload Trade Balance CSV</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDownloadTemplate('trade')}
                  className="h-6 px-2 text-xs"
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  Template
                </Button>
              </div>
              {tradeFile ? (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="text-sm truncate">{tradeFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => clearFile('trade')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input id="trade-file" type="file" accept=".csv" onChange={handleTradeFileChange} />
              )}
              <p className="text-xs text-muted-foreground">
                CSV format: country, year, exports, imports, balance
              </p>
            </div>
            <Button 
              onClick={handleUploadTrade} 
              disabled={!tradeFile || isUploading} 
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Trade Data"}
            </Button>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 