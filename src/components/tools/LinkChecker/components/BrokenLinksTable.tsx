
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BrokenLink {
  url: string;
  text: string;
  status: number;
  pageUrl?: string;
  error?: string;
}

interface BrokenLinksTableProps {
  brokenLinks: BrokenLink[];
}

const BrokenLinksTable: React.FC<BrokenLinksTableProps> = ({ brokenLinks }) => {
  const getStatusBadge = (status: number) => {
    if (status === 404) {
      return <Badge variant="destructive">Not Found (404)</Badge>;
    } else if (status >= 500) {
      return <Badge variant="destructive">Server Error ({status})</Badge>;
    } else if (status >= 400) {
      return <Badge variant="destructive">Client Error ({status})</Badge>;
    } else if (status === 302) {
      return <Badge variant="warning">Redirect (302)</Badge>;
    } else {
      return <Badge variant="destructive">Error ({status})</Badge>;
    }
  };

  return (
    <div className="max-h-64 overflow-y-auto border rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {brokenLinks.map((link, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 whitespace-nowrap text-sm">
                <div className="font-medium text-gray-900 truncate max-w-xs flex items-center">
                  {link.url}
                  <a 
                    href={link.url.startsWith('http') ? link.url : `${window.location.origin}${link.url.startsWith('/') ? '' : '/'}${link.url}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="text-gray-500 truncate max-w-xs">{link.text}</div>
                {link.pageUrl && (
                  <div className="text-gray-400 text-xs truncate max-w-xs mt-1">
                    Found on: {link.pageUrl}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm">
                {getStatusBadge(link.status)}
                {link.error && <div className="text-xs text-gray-500 mt-1">{link.error}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrokenLinksTable;
