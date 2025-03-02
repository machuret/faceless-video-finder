
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import YouTubeTools from "./YouTubeTools";

const ToolsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-crimson text-3xl font-bold text-gray-800 mb-4">
            Tools & Resources
          </h2>
          <p className="font-lato text-gray-600 max-w-3xl mx-auto">
            Explore our collection of free tools and resources designed to help you grow your faceless YouTube channel and maximize your earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-crimson text-xl font-bold mb-3">YouTube Tools</h3>
              <p className="font-lato text-gray-600 text-sm mb-4">
                Tools to help analyze and optimize your YouTube performance.
              </p>
              <Link to="/calculator" className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium text-sm">
                View All Tools <MoveRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-crimson text-xl font-bold mb-3">Faceless Channel Ideas</h3>
              <p className="font-lato text-gray-600 text-sm mb-4">
                Discover profitable faceless YouTube content ideas that you can create without showing your face on camera.
              </p>
              <Link to="/faceless-channel-ideas" className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium text-sm">
                Browse Ideas <MoveRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-crimson text-xl font-bold mb-3">YouTube Training</h3>
              <p className="font-lato text-gray-600 text-sm mb-4">
                Free training resources to help you grow your YouTube channel from scratch.
              </p>
              <Link to="/training" className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium text-sm">
                Start Learning <MoveRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <YouTubeTools />
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
