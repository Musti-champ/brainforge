import { Puzzle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Puzzle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">API Puzzle Quest</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Master APIs through interactive puzzles and real-world challenges.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white" data-testid="twitter-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" data-testid="github-link">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" data-testid="discord-link">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Learning Paths</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white" data-testid="rest-fundamentals-link">REST API Fundamentals</a></li>
              <li><a href="#" className="hover:text-white" data-testid="api-auth-link">API Authentication</a></li>
              <li><a href="#" className="hover:text-white" data-testid="graphql-link">GraphQL Mastery</a></li>
              <li><a href="#" className="hover:text-white" data-testid="api-testing-link">API Testing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white" data-testid="postman-collections-link">Postman Collections</a></li>
              <li><a href="#" className="hover:text-white" data-testid="api-docs-link">API Documentation</a></li>
              <li><a href="#" className="hover:text-white" data-testid="community-link">Community Forum</a></li>
              <li><a href="#" className="hover:text-white" data-testid="tutorials-link">Video Tutorials</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white" data-testid="help-center-link">Help Center</a></li>
              <li><a href="#" className="hover:text-white" data-testid="contact-link">Contact Us</a></li>
              <li><a href="#" className="hover:text-white" data-testid="bug-reports-link">Bug Reports</a></li>
              <li><a href="#" className="hover:text-white" data-testid="feature-requests-link">Feature Requests</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 API Puzzle Quest. Built for the Postman API Network Challenge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
