
import { Link } from "react-router-dom";
import { Calculator, DollarSign, BarChart, TrendingUp } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const YouTubeTools = () => {
  const tools = [
    {
      title: "YouTube Shorts Calculator",
      description: "Estimate your potential earnings from YouTube Shorts",
      icon: <Calculator className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
      link: "/calculator"
    },
    {
      title: "Channel Earnings Estimator",
      description: "Calculate estimated earnings for any YouTube channel",
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
      link: "/channel-earnings"
    },
    {
      title: "Reach Calculator",
      description: "Estimate the ad value of your YouTube content",
      icon: <BarChart className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
      link: "/reach-calculator"
    },
    {
      title: "Growth Rate Calculator",
      description: "Calculate your channel's subscriber growth rate",
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
      link: "/growth-calculator"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="font-crimson text-2xl font-bold mb-6 text-gray-800">YouTube Creator Tools</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Tool</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell>
                  <div className={`${tool.bgColor} p-3 rounded-full flex items-center justify-center`}>
                    {tool.icon}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{tool.title}</TableCell>
                <TableCell className="hidden md:table-cell text-gray-600">{tool.description}</TableCell>
                <TableCell>
                  <Link
                    to={tool.link}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2"
                  >
                    Use
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default YouTubeTools;
