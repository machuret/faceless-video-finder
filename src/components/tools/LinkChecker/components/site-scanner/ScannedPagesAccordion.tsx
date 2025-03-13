
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScannedPage } from '@/hooks/link-checker/types';

interface ScannedPagesAccordionProps {
  scannedPages: ScannedPage[];
}

const ScannedPagesAccordion: React.FC<ScannedPagesAccordionProps> = ({ scannedPages }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="scanned-pages">
        <AccordionTrigger className="text-sm font-medium">
          Pages Scanned ({scannedPages.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="max-h-64 overflow-y-auto border rounded-md mt-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {scannedPages.map((page, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2">
                      <div className="truncate max-w-xs">
                        <a 
                          href={page.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {page.url.replace(window.location.origin, '')}
                        </a>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {page.totalLinks} {page.brokenLinks.length > 0 && (
                        <span className="text-red-500 ml-1">({page.brokenLinks.length} broken)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {page.scanned ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-yellow-500">...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ScannedPagesAccordion;
