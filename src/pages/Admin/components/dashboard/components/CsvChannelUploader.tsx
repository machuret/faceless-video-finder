
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, Download, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processCsvImport, downloadCsvTemplate } from '@/services/channelCsvImport';
import { Progress } from "@/components/ui/progress";

const CsvChannelUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    duplicates: number;
    errors: string[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setIsUploading(true);
    setProgress(10);
    setUploadResults(null);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target?.result) {
          toast.error('Failed to read file');
          setIsUploading(false);
          return;
        }
        
        const csvContent = e.target.result as string;
        setProgress(30);
        
        try {
          const result = await processCsvImport(csvContent);
          setProgress(100);
          setUploadResults(result);
          
          // Show appropriate toast based on results
          if (result.success > 0) {
            toast.success(`Successfully imported ${result.success} channels`);
          }
          
          if (result.duplicates > 0) {
            toast.info(`Skipped ${result.duplicates} duplicate channels`);
          }
          
          if (result.failed > 0) {
            toast.error(`Failed to import ${result.failed} channels`);
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          toast.error('Error processing CSV file');
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Error reading file');
        setIsUploading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error handling file:', error);
      toast.error('Error uploading file');
      setIsUploading(false);
    }
  };
  
  const renderResults = () => {
    if (!uploadResults) return null;
    
    return (
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 p-3 rounded-md border border-green-100 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-lg font-semibold">{uploadResults.success}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium">Duplicates</p>
              <p className="text-lg font-semibold">{uploadResults.duplicates}</p>
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md border border-red-100 flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm font-medium">Failed</p>
              <p className="text-lg font-semibold">{uploadResults.failed}</p>
            </div>
          </div>
        </div>
        
        {uploadResults.errors.length > 0 && (
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrors(!showErrors)}
              className="mb-2"
            >
              {showErrors ? 'Hide' : 'Show'} Errors ({uploadResults.errors.length})
            </Button>
            
            {showErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 text-xs space-y-1 max-h-40 overflow-y-auto">
                    {uploadResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Bulk Channel CSV Import</h2>
      <p className="text-gray-600 mb-4">
        Upload a CSV file containing YouTube channel information.
        The CSV should include columns for channel name, channel URL, starting date, and niche.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button 
          onClick={() => downloadCsvTemplate()}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
        
        <div className="relative w-full">
          <Button
            variant="secondary"
            className="w-full relative"
            disabled={isUploading}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileUp className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Select CSV File'}
          </Button>
        </div>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between mb-2 text-sm">
            <span>Processing CSV file...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {renderResults()}
      
      <div className="mt-4 border border-gray-200 rounded p-3 bg-gray-50">
        <h3 className="text-sm font-semibold mb-2">Required CSV Format</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>channel_name</strong>: Full channel name</p>
          <p><strong>channel_url</strong>: Complete YouTube URL (e.g., https://www.youtube.com/@channelname)</p>
          <p><strong>starting_date</strong>: Channel launch date (YYYY-MM-DD)</p>
          <p><strong>niche</strong>: Channel's content category</p>
        </div>
      </div>
    </Card>
  );
};

export default CsvChannelUploader;
