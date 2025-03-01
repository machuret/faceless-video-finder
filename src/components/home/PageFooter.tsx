
import { Github, Twitter, Mail, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const PageFooter = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-crimson text-xl font-bold mb-4">YT Channel Explorer</h3>
            <p className="text-gray-400 mb-4">
              Discover and analyze faceless YouTube channel ideas to help you grow your online presence.
            </p>
            <div className="flex space-x-4">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:contact@example.com" className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold mb-4 text-sm uppercase tracking-wider">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/calculator" className="text-gray-400 hover:text-white">
                  Shorts Calculator
                </Link>
              </li>
              <li>
                <Link to="/channel-earnings" className="text-gray-400 hover:text-white">
                  Channel Earnings
                </Link>
              </li>
              <li>
                <Link to="/reach-calculator" className="text-gray-400 hover:text-white">
                  Reach Calculator
                </Link>
              </li>
              <li>
                <Link to="/growth-calculator" className="text-gray-400 hover:text-white">
                  Growth Rate Calculator
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white">
                  How This Works
                </Link>
              </li>
              <li>
                <Link to="/channel-types" className="text-gray-400 hover:text-white">
                  Channel Types
                </Link>
              </li>
              <li>
                <Link to="/training" className="text-gray-400 hover:text-white">
                  Training
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works#terms" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#cookies" className="text-gray-400 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#disclaimer" className="text-gray-400 hover:text-white">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} YT Channel Explorer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
