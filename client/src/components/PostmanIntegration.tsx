import { useState } from "react";
import { ExternalLink, Download, Share, FileText, Code, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeEditor from "./CodeEditor";

interface PostmanCollection {
  id: string;
  name: string;
  description: string;
  challenges: string[];
  requestCount: number;
  downloadUrl: string;
  runInPostmanUrl: string;
  category: string;
}

export default function PostmanIntegration() {
  const [selectedCollection, setSelectedCollection] = useState<string>("rest-fundamentals");

  const collections: PostmanCollection[] = [
    {
      id: "rest-fundamentals",
      name: "REST API Fundamentals",
      description: "Complete collection covering basic REST API concepts, HTTP methods, and response handling",
      challenges: ["Your First API Call", "Weather API Integration", "Data Parsing Challenge"],
      requestCount: 12,
      downloadUrl: "https://api.postman.com/collections/rest-fundamentals",
      runInPostmanUrl: "https://app.getpostman.com/run-collection/rest-fundamentals",
      category: "Beginner"
    },
    {
      id: "auth-mastery",
      name: "API Authentication Mastery",
      description: "OAuth 2.0, JWT, API keys, and secure authentication patterns for modern APIs",
      challenges: ["OAuth 2.0 Flow Mastery", "JWT Token Handling", "API Key Security"],
      requestCount: 18,
      downloadUrl: "https://api.postman.com/collections/auth-mastery",
      runInPostmanUrl: "https://app.getpostman.com/run-collection/auth-mastery",
      category: "Advanced"
    },
    {
      id: "graphql-explorer",
      name: "GraphQL API Explorer",
      description: "Learn GraphQL queries, mutations, subscriptions with real-world examples",
      challenges: ["GraphQL Basics", "Complex Queries", "Real-time Subscriptions"],
      requestCount: 15,
      downloadUrl: "https://api.postman.com/collections/graphql-explorer",
      runInPostmanUrl: "https://app.getpostman.com/run-collection/graphql-explorer",
      category: "Intermediate"
    }
  ];

  const selectedCollectionData = collections.find(c => c.id === selectedCollection);

  const generatePostmanCollection = (collection: PostmanCollection) => {
    return {
      info: {
        name: collection.name,
        description: collection.description,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Get Random Quote",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "https://api.quotable.io/random",
              host: ["api", "quotable", "io"],
              path: ["random"]
            }
          },
          response: []
        },
        {
          name: "Weather API with Key",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "https://api.openweathermap.org/data/2.5/weather?q={{city}}&appid={{api_key}}",
              host: ["api", "openweathermap", "org"],
              path: ["data", "2.5", "weather"],
              query: [
                {
                  key: "q",
                  value: "{{city}}"
                },
                {
                  key: "appid",
                  value: "{{api_key}}"
                }
              ]
            }
          },
          response: []
        }
      ],
      variable: [
        {
          key: "city",
          value: "London,UK"
        },
        {
          key: "api_key",
          value: "YOUR_API_KEY"
        }
      ]
    };
  };

  const downloadCollection = (collection: PostmanCollection) => {
    const collectionData = generatePostmanCollection(collection);
    const blob = new Blob([JSON.stringify(collectionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.id}-collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            <span>Postman Collections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {collections.map((collection) => (
              <Card 
                key={collection.id}
                className={`cursor-pointer transition-all ${
                  selectedCollection === collection.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedCollection(collection.id)}
                data-testid={`collection-${collection.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {collection.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {collection.requestCount} requests
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 mb-1">
                    {collection.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {collection.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCollectionData && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {selectedCollectionData.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedCollectionData.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {selectedCollectionData.requestCount}
                      </div>
                      <div className="text-sm text-gray-600">API Requests</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/5 rounded-lg">
                      <div className="text-2xl font-bold text-secondary">
                        {selectedCollectionData.challenges.length}
                      </div>
                      <div className="text-sm text-gray-600">Challenges</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Included Challenges</h4>
                    <ul className="space-y-1">
                      {selectedCollectionData.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => window.open(selectedCollectionData.runInPostmanUrl, '_blank')}
                    data-testid="run-in-postman"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run in Postman
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => downloadCollection(selectedCollectionData)}
                    data-testid="download-collection"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    This collection includes {selectedCollectionData.requestCount} carefully crafted API requests 
                    that demonstrate real-world usage patterns and best practices.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">GET Random Quote</h4>
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Fetch inspiring quotes from the Quotable API
                    </p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      https://api.quotable.io/random
                    </code>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">GET Weather Data</h4>
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Retrieve current weather information with API key authentication
                    </p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      https://api.openweathermap.org/data/2.5/weather
                    </code>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Export Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <ExternalLink className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Postman App</h4>
                            <p className="text-xs text-gray-600">Import directly into Postman</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(selectedCollectionData.runInPostmanUrl, '_blank')}
                          data-testid="import-to-postman"
                        >
                          Import to Postman
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Download className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">JSON File</h4>
                            <p className="text-xs text-gray-600">Download collection file</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => downloadCollection(selectedCollectionData)}
                          data-testid="download-json"
                        >
                          Download JSON
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Collection Preview</h4>
                  <CodeEditor
                    language="json"
                    code={JSON.stringify(generatePostmanCollection(selectedCollectionData), null, 2)}
                    readOnly={true}
                  />
                </div>

                <Alert>
                  <Share className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Share with your team:</strong> Use the "Run in Postman" button to create a 
                    shareable link that others can use to import this collection directly into their Postman workspace.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}