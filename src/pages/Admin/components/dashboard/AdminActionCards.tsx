
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UploadCloud, Upload, List, Tag, BookOpen, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const AdminActionCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <PlusCircle className="w-5 h-5 mr-2 text-primary" />
            Add New Channel
          </CardTitle>
          <CardDescription>Add a new YouTube channel entry</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Create a new channel record with detailed information about a YouTube channel.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/admin/channels/add">Add Channel</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <UploadCloud className="w-5 h-5 mr-2 text-primary" />
            Bulk Upload Channels
          </CardTitle>
          <CardDescription>Upload multiple channels at once</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Process a CSV file with multiple YouTube channels to add them in a batch.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Bulk Upload
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <List className="w-5 h-5 mr-2 text-primary" />
            Manage Channel Types
          </CardTitle>
          <CardDescription>Edit channel type definitions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Add, edit or remove channel type definitions with detailed information.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link to="/admin/channel-types">Manage Types</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Tag className="w-5 h-5 mr-2 text-primary" />
            Manage Niches
          </CardTitle>
          <CardDescription>Edit channel niche categories</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Add, edit or remove niche categories for better channel classification.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link to="/admin/niches">Manage Niches</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            Manage Did You Know Facts
          </CardTitle>
          <CardDescription>Manage facts shown on channel pages</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Add, edit or remove interesting facts that appear on channel detail pages.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link to="/admin/did-you-know-facts">Manage Facts</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            Check Broken Links
          </CardTitle>
          <CardDescription>Find and fix broken links</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Scan for broken links across the site to ensure all navigation works correctly.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link to="/admin/tools/link-checker">Check Links</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminActionCards;
