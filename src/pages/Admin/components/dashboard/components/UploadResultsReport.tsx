
import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { UploadResult } from "../hooks/useBulkChannelUpload";

interface UploadResultsReportProps {
  results: UploadResult[];
  onClose: () => void;
}

const UploadResultsReport: React.FC<UploadResultsReportProps> = ({ results, onClose }) => {
  if (!results.length) return null;
  
  const newChannels = results.filter(r => r.success && r.isNew).length;
  const updatedChannels = results.filter(r => r.success && !r.isNew).length;
  const failedChannels = results.filter(r => !r.success).length;
  
  return (
    <Card className="p-6 mb-4 bg-gray-50 border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bulk Upload Results</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 border border-green-100 rounded p-3 text-center">
          <div className="flex justify-center mb-1">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-700">New Channels</p>
          <p className="text-xl font-semibold text-green-700">{newChannels}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded p-3 text-center">
          <div className="flex justify-center mb-1">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-700">Updated</p>
          <p className="text-xl font-semibold text-blue-700">{updatedChannels}</p>
        </div>
        
        <div className="bg-red-50 border border-red-100 rounded p-3 text-center">
          <div className="flex justify-center mb-1">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm text-gray-700">Failed</p>
          <p className="text-xl font-semibold text-red-700">{failedChannels}</p>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Channel
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={index} className={result.success ? "bg-white" : "bg-red-50"}>
                <td className="px-4 py-2 text-sm">
                  <div className="font-medium text-gray-900 truncate max-w-[200px]">
                    {result.channelTitle}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">
                    {result.url}
                  </div>
                </td>
                <td className="px-4 py-2">
                  {result.success ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {result.isNew ? "Added" : "Updated"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {result.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UploadResultsReport;
