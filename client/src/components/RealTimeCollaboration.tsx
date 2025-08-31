
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, Share2, Copy, MessageCircle, Video, Settings, Crown, UserPlus, Code, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "./CodeEditor";

interface CollaborationSession {
  id: string;
  challengeId: string;
  challengeTitle: string;
  hostUserId: string;
  hostUsername: string;
  isActive: boolean;
  maxParticipants: number;
  currentParticipants: number;
  createdAt: string;
  sessionCode: string;
  difficulty: string;
  category: string;
}

interface SessionParticipant {
  id: string;
  userId: string;
  username: string;
  joinedAt: string;
  isActive: boolean;
  isHost: boolean;
  cursorPosition?: { line: number; column: number };
  currentCode?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: "message" | "system" | "code_share";
}

export default function RealTimeCollaboration({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);
  const [isInSession, setIsInSession] = useState(false);
  const [sessionCode, setSessionCode] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sharedCode, setSharedCode] = useState("");
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    challengeId: "",
    maxParticipants: 2
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock available challenges for collaboration
  const mockChallenges = [
    { id: "challenge-1", title: "REST API Basics", difficulty: "beginner", category: "REST" },
    { id: "challenge-2", title: "Weather API Integration", difficulty: "intermediate", category: "Integration" },
    { id: "challenge-3", title: "OAuth 2.0 Implementation", difficulty: "advanced", category: "Security" }
  ];

  // Mock active sessions
  const mockSessions: CollaborationSession[] = [
    {
      id: "session-1",
      challengeId: "challenge-1",
      challengeTitle: "REST API Basics",
      hostUserId: "user-2",
      hostUsername: "api_master",
      isActive: true,
      maxParticipants: 3,
      currentParticipants: 2,
      createdAt: "2025-01-15T10:30:00Z",
      sessionCode: "ABC123",
      difficulty: "beginner",
      category: "REST"
    },
    {
      id: "session-2",
      challengeId: "challenge-2",
      challengeTitle: "Weather API Integration",
      hostUserId: "user-3",
      hostUsername: "weather_dev",
      isActive: true,
      maxParticipants: 2,
      currentParticipants: 1,
      createdAt: "2025-01-15T11:15:00Z",
      sessionCode: "DEF456",
      difficulty: "intermediate",
      category: "Integration"
    }
  ];

  // Mock participants for active session
  const mockParticipants: SessionParticipant[] = [
    {
      id: "participant-1",
      userId: "user-2",
      username: "api_master",
      joinedAt: "2025-01-15T10:30:00Z",
      isActive: true,
      isHost: true,
      cursorPosition: { line: 15, column: 8 }
    },
    {
      id: "participant-2",
      userId: userId,
      username: "current_user",
      joinedAt: "2025-01-15T10:45:00Z",
      isActive: true,
      isHost: false,
      cursorPosition: { line: 23, column: 12 }
    }
  ];

  // Mock chat messages
  const mockMessages: ChatMessage[] = [
    {
      id: "msg-1",
      userId: "user-2",
      username: "api_master",
      message: "Welcome to the session! Let's work through this REST API challenge together.",
      timestamp: "2025-01-15T10:30:15Z",
      type: "message"
    },
    {
      id: "msg-2",
      userId: userId,
      username: "current_user",
      message: "Thanks! I'm excited to learn. Should we start with the authentication part?",
      timestamp: "2025-01-15T10:31:00Z",
      type: "message"
    },
    {
      id: "msg-3",
      userId: "system",
      username: "System",
      message: "api_master shared code snippet",
      timestamp: "2025-01-15T10:32:00Z",
      type: "system"
    }
  ];

  // Create collaboration session
  const createSessionMutation = useMutation({
    mutationFn: async (data: { challengeId: string; maxParticipants: number }) => {
      return apiRequest("POST", "/api/collaboration/sessions", data);
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaboration/sessions"] });
      setIsCreateModalOpen(false);
      setSelectedSession(session);
      setIsInSession(true);
      toast({
        title: "Session Created",
        description: `Session code: ${session.sessionCode}. Share this with collaborators!`,
      });
    },
  });

  // Join session
  const joinSessionMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", `/api/collaboration/sessions/join`, { sessionCode: code });
    },
    onSuccess: (session) => {
      setSelectedSession(session);
      setIsInSession(true);
      setSessionCode("");
      toast({
        title: "Joined Session",
        description: "Successfully joined the collaboration session!",
      });
    },
  });

  // Send chat message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: userId,
      username: "current_user",
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: "message"
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  // Share code snippet
  const shareCode = () => {
    if (!sharedCode.trim() || !selectedSession) return;

    const codeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: userId,
      username: "current_user",
      message: sharedCode,
      timestamp: new Date().toISOString(),
      type: "code_share"
    };

    setChatMessages(prev => [...prev, codeMessage]);
    setSharedCode("");
    toast({
      title: "Code Shared",
      description: "Your code snippet has been shared with the session.",
    });
  };

  // Copy session code to clipboard
  const copySessionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Session code copied to clipboard.",
    });
  };

  // Leave session
  const leaveSession = () => {
    setIsInSession(false);
    setSelectedSession(null);
    setChatMessages([]);
    setParticipants([]);
    toast({
      title: "Left Session",
      description: "You have left the collaboration session.",
    });
  };

  // Initialize mock data when in session
  useEffect(() => {
    if (isInSession && selectedSession) {
      setChatMessages(mockMessages);
      setParticipants(mockParticipants);
    }
  }, [isInSession, selectedSession]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Real-time Collaboration</h2>
        <p className="text-gray-600">
          Work together with other developers to solve API challenges in real-time
        </p>
      </div>

      {!isInSession ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Sessions</TabsTrigger>
            <TabsTrigger value="join">Join Session</TabsTrigger>
            <TabsTrigger value="create">Create Session</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{session.challengeTitle}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={
                            session.difficulty === "beginner" ? "bg-green-100 text-green-800" :
                            session.difficulty === "intermediate" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {session.difficulty}
                          </Badge>
                          <Badge variant="outline">{session.category}</Badge>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {session.currentParticipants}/{session.maxParticipants}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{session.hostUsername.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-1">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{session.hostUsername}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Started {new Date(session.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        disabled={session.currentParticipants >= session.maxParticipants}
                        onClick={() => {
                          setSelectedSession(session);
                          setIsInSession(true);
                        }}
                        data-testid={`join-session-${session.id}`}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {session.currentParticipants >= session.maxParticipants ? "Full" : "Join"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copySessionCode(session.sessionCode)}
                        data-testid={`copy-code-${session.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="join" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Join Session by Code</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter the 6-character session code shared by the session host.
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      className="flex-1"
                      data-testid="session-code-input"
                    />
                    <Button
                      onClick={() => joinSessionMutation.mutate(sessionCode)}
                      disabled={sessionCode.length !== 6 || joinSessionMutation.isPending}
                      data-testid="join-by-code"
                    >
                      {joinSessionMutation.isPending ? "Joining..." : "Join"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Create New Session</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Start a collaborative session and invite others to work together.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Challenge
                      </label>
                      <Select
                        value={newSessionData.challengeId}
                        onValueChange={(value) => setNewSessionData(prev => ({ ...prev, challengeId: value }))}
                      >
                        <SelectTrigger data-testid="challenge-select">
                          <SelectValue placeholder="Select a challenge..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockChallenges.map((challenge) => (
                            <SelectItem key={challenge.id} value={challenge.id}>
                              {challenge.title} ({challenge.difficulty})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Participants: {newSessionData.maxParticipants}
                      </label>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">2</span>
                        <input
                          type="range"
                          min="2"
                          max="6"
                          value={newSessionData.maxParticipants}
                          onChange={(e) => setNewSessionData(prev => ({ 
                            ...prev, 
                            maxParticipants: parseInt(e.target.value) 
                          }))}
                          className="flex-1"
                          data-testid="max-participants-slider"
                        />
                        <span className="text-sm">6</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => createSessionMutation.mutate(newSessionData)}
                      disabled={!newSessionData.challengeId || createSessionMutation.isPending}
                      data-testid="create-session"
                    >
                      {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Active Session Interface
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Code Editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-primary" />
                    <span>{selectedSession?.challengeTitle}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {participants.length} Active
                    </Badge>
                    <Button variant="outline" size="sm" onClick={leaveSession}>
                      Leave Session
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-blue-900">Session Code:</span>
                      <code className="ml-2 font-mono text-blue-800">{selectedSession?.sessionCode}</code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copySessionCode(selectedSession?.sessionCode || "")}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <CodeEditor
                    initialCode={`// Working on: ${selectedSession?.challengeTitle}
// Collaborative session with ${participants.length} participants

fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    // TODO: Process the API response
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`}
                    language="javascript"
                    onChange={(code) => {
                      // In a real implementation, this would sync with other participants
                      console.log('Code updated:', code);
                    }}
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </Button>
                      <Button variant="outline" size="sm">
                        Test API
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>All participants connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants & Chat */}
          <div className="space-y-4">
            {/* Participants Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Participants</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {participant.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          {participant.isHost && <Crown className="h-3 w-3 text-yellow-500" />}
                          <span className="text-sm font-medium">{participant.username}</span>
                        </div>
                        {participant.cursorPosition && (
                          <div className="text-xs text-gray-500">
                            Line {participant.cursorPosition.line}
                          </div>
                        )}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        participant.isActive ? "bg-green-500" : "bg-gray-300"
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-600">
                            {message.username}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {message.type === "code_share" ? (
                          <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded">
                            {message.message}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-800">{message.message}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        data-testid="chat-input"
                      />
                      <Button size="sm" onClick={sendMessage}>
                        Send
                      </Button>
                    </div>

                    <div>
                      <Textarea
                        value={sharedCode}
                        onChange={(e) => setSharedCode(e.target.value)}
                        placeholder="Share code snippet..."
                        rows={3}
                        data-testid="code-share-input"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={shareCode}
                        disabled={!sharedCode.trim()}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Share Code
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
