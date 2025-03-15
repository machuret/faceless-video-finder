
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Upload, FileText, Calculator, Users, UserCog } from "lucide-react";

const AdminActionCards = () => {
  const cards = [
    {
      title: "Add Channel",
      description: "Add a new YouTube channel to the database",
      icon: <Plus className="h-8 w-8 text-blue-500" />,
      link: "/admin/channels/add",
      buttonText: "Add Channel",
    },
    {
      title: "Bulk Upload",
      description: "Upload multiple channels at once",
      icon: <Upload className="h-8 w-8 text-purple-500" />,
      link: "#bulk-upload", // Links to section on same page
      buttonText: "Upload CSV",
      isAnchor: true,
    },
    {
      title: "Link Checker",
      description: "Check for broken links on your site",
      icon: <FileText className="h-8 w-8 text-emerald-500" />,
      link: "/admin/tools/link-checker",
      buttonText: "Check Links",
    },
    {
      title: "Calculators",
      description: "Access YouTube channel calculators",
      icon: <Calculator className="h-8 w-8 text-amber-500" />,
      link: "/calculators",
      buttonText: "View Calculators",
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users className="h-8 w-8 text-white" />,
      link: "/admin/users",
      buttonText: "Manage Users",
      highlight: true,
      priority: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className={`p-6 flex flex-col justify-between ${card.highlight ? 'border-red-500 bg-red-500 shadow-md' : ''}`}
        >
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-50 mb-4">
              {card.icon}
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${card.highlight ? 'text-white' : ''}`}>{card.title}</h3>
            <p className={`${card.highlight ? 'text-white' : 'text-gray-500'} text-sm mb-4`}>{card.description}</p>
          </div>
          {card.isAnchor ? (
            <a href={card.link}>
              <Button className="w-full">{card.buttonText}</Button>
            </a>
          ) : (
            <Link to={card.link}>
              <Button className={`w-full ${card.highlight ? 'bg-white text-red-600 hover:bg-gray-100' : ''}`}>
                {card.buttonText}
              </Button>
            </Link>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AdminActionCards;
