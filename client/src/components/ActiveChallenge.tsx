import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, ExternalLink, Info, Check, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeEditor from "./CodeEditor";

export default function ActiveChallenge() {
  const [httpMethod, setHttpMethod] = useState("GET");
  const [apiUrl, setApiUrl] = useState("https://api.openweathermap.org/data/2.5/weather");
  const [queryParams, setQueryParams] = useState([
    { key: "q", value: "London,UK" },
    { key: "appid", value: "YOUR_API_KEY" }
  ]);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: challenge } = useQuery({
    queryKey: ["/api/challenges/challenge-2"],
  });

  const handleTestRequest = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      queryParams.forEach(param => {
        if (param.key && param.value) {
          params.append(param.key, param.value);
        }
      });
      
      const fullUrl = `${apiUrl}?${params.toString()}`;
      const response = await fetch("/api/test-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: httpMethod,
          url: fullUrl,
        }),
      });
      
      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "" }]);
  };

  const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  if (!challenge) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Challenge 4: {challenge.title}</CardTitle>
                    <p className="text-gray-600 mt-2">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="text-lg font-bold text-primary">2/4</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Setup Request</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Add API Key</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <span className="text-sm font-medium text-primary">Handle Response</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-bold">4</span>
                    </div>
                    <span className="text-sm text-gray-400">Error Handling</span>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <h4 className="font-medium mb-1">Current Task</h4>
                      <p className="text-sm">Parse the weather response and extract the temperature, humidity, and description fields. Display them in a user-friendly format.</p>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>API Request Builder</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleTestRequest}
                      disabled={isLoading}
                      data-testid="test-request"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isLoading ? "Testing..." : "Test Request"}
                    </Button>
                    <Button variant="outline" data-testid="run-in-postman">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Run in Postman
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Select value={httpMethod} onValueChange={setHttpMethod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="Enter API endpoint"
                      data-testid="api-url-input"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Query Parameters</h4>
                    <div className="space-y-2">
                      {queryParams.map((param, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input 
                            value={param.key}
                            onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                            placeholder="Key"
                            className="w-32"
                            data-testid={`param-key-${index}`}
                          />
                          <Input 
                            value={param.value}
                            onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                            placeholder="Value"
                            className="flex-1"
                            data-testid={`param-value-${index}`}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeQueryParam(index)}
                            className="text-destructive"
                            data-testid={`remove-param-${index}`}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addQueryParam}
                        data-testid="add-param"
                      >
                        + Add Parameter
                      </Button>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript">
                    <CodeEditor 
                      language="javascript"
                      code={challenge.sampleCode}
                      readOnly={false}
                    />
                  </TabsContent>
                  <TabsContent value="python">
                    <CodeEditor 
                      language="python"
                      code={`import requests

response = requests.get('${apiUrl}', params={
    'q': 'London,UK',
    'appid': 'YOUR_API_KEY'
})

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f'Error: {response.status_code}')`}
                      readOnly={true}
                    />
                  </TabsContent>
                  <TabsContent value="curl">
                    <CodeEditor 
                      language="bash"
                      code={`curl -X GET "${apiUrl}?q=London,UK&appid=YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                      readOnly={true}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Response</CardTitle>
              </CardHeader>
              <CardContent>
                {response && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-secondary" />
                        <span className="font-medium text-green-800">
                          {response.status} {response.statusText}
                        </span>
                        <span className="text-sm text-green-600">Response received</span>
                      </div>
                    </div>
                    
                    <CodeEditor 
                      language="json"
                      code={JSON.stringify(response.data, null, 2)}
                      readOnly={true}
                    />

                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <h4 className="font-medium mb-1">Complete the Task</h4>
                        <p className="text-sm mb-3">Extract the following fields from the response and format them properly:</p>
                        <ul className="text-sm space-y-1 mb-3">
                          <li>• Temperature (convert from Kelvin to Celsius)</li>
                          <li>• Humidity percentage</li>
                          <li>• Weather description</li>
                        </ul>
                        <Button data-testid="submit-solution">
                          Submit Solution
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>💡 Helpful Hints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenge.hints.map((hint, index) => (
                    <Alert key={index}>
                      <AlertDescription>
                        <h4 className="text-sm font-medium mb-1">Hint {index + 1}</h4>
                        <p className="text-sm">{hint}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    data-testid="reveal-hint"
                  >
                    🔒 Unlock Next Hint
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📚 API Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                    <div className="font-medium text-sm text-gray-900">OpenWeather API</div>
                    <div className="text-xs text-gray-500">Current Weather Data</div>
                  </div>
                  <Button 
                    className="w-full"
                    data-testid="open-postman-collection"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Run in Postman
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🛠️ Developer Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    data-testid="json-validator"
                  >
                    <Check className="h-4 w-4 mr-2 text-secondary" />
                    JSON Validator
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    data-testid="api-tester"
                  >
                    <Play className="h-4 w-4 mr-2 text-primary" />
                    API Tester
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    data-testid="error-analyzer"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                    Error Analyzer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
