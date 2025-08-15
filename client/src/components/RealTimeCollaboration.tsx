import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, Mic, MicOff, Video, VideoOff, Share, MessageCircle, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "./CodeEditor";

interface CollaborationSession {
  id: string;
  challengeId: string;
  hostUserId: string;
  isActive: boolean;
  maxParticipants: number;
  participants: Array<{
    id: string;
    username: string;
    joinedAt: string;
    isActive: boolean;
  }>;
  sharedCode: string;
  messages: Array<{
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string;
  }>;
}

export default function RealTimeCollaboration({ challengeId }: { challengeId: string }) {
  const [isInSession, setIsInSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sharedCode, setSharedCode] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  // Query active sessions for this challenge
  const { data: activeSessions } = useQuery({
    queryKey: ["/api/collaboration/sessions", challengeId],
    enabled: !isInSession,
  });

  // Get current session details
  const { data: currentSession } = useQuery({
    queryKey: ["/api/collaboration/sessions", sessionId],
    enabled: isInSession && !!sessionId,
    refetchInterval: 2000,
  });

  // Create new collaboration session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/collaboration/sessions", {
        challengeId,
        maxParticipants: 2
      });
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      setIsInSession(true);
      connectWebSocket(data.id);
      toast({
        title: "Session Created",
        description: "Waiting for participants to join...",
      });
    },
  });

  // Join existing session
  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest("POST", `/api/collaboration/sessions/${sessionId}/join`);
    },
    onSuccess: () => {
      setIsInSession(true);
      connectWebSocket(sessionId!);
      toast({
        title: "Joined Session",
        description: "You're now collaborating on this challenge!",
      });
    },
  });

  // Leave session
  const leaveSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/collaboration/sessions/${sessionId}/leave`);
    },
    onSuccess: () => {
      setIsInSession(false);
      setSessionId(null);
      disconnectWebSocket();
      queryClient.invalidateQueries({ queryKey: ["/api/collaboration/sessions"] });
      toast({
        title: "Left Session",
        description: "You've left the collaboration session.",
      });
    },
  });

  // WebSocket connection for real-time updates
  const connectWebSocket = (sessionId: string) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/collaboration/${sessionId}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log("Connected to collaboration session");
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "code_update":
          setSharedCode(data.code);
          break;
        case "chat_message":
          // Chat messages are handled by the session query refetch
          queryClient.invalidateQueries({ 
            queryKey: ["/api/collaboration/sessions", sessionId] 
          });
          break;
        case "participant_joined":
          toast({
            title: "Participant Joined",
            description: `${data.username} joined the session`,
          });
          queryClient.invalidateQueries({ 
            queryKey: ["/api/collaboration/sessions", sessionId] 
          });
          break;
        case "participant_left":
          toast({
            title: "Participant Left",
            description: `${data.username} left the session`,
          });
          queryClient.invalidateQueries({ 
            queryKey: ["/api/collaboration/sessions", sessionId] 
          });
          break;
      }
    };
    
    wsRef.current.onclose = () => {
      console.log("Disconnected from collaboration session");
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    setSharedCode(newCode);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "code_update",
        code: newCode
      }));
    }
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!chatMessage.trim() || !wsRef.current) return;
    
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat_message",
        message: chatMessage
      }));
    }
    
    setChatMessage("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  if (!isInSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Pair Programming</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Collaborate with other developers to solve this challenge together in real-time.
            </p>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => createSessionMutation.mutate()}
                disabled={createSessionMutation.isPending}
                data-testid="create-session"
              >
                <Share className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </div>

            {activeSessions && activeSessions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Active Sessions</h4>
                <div className="space-y-2">
                  {activeSessions.map((session: any) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-sm">{session.hostUsername}'s Session</div>
                        <div className="text-xs text-gray-600">
                          {session.participantCount}/{session.maxParticipants} participants
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSessionId(session.id);
                          joinSessionMutation.mutate(session.id);
                        }}
                        disabled={joinSessionMutation.isPending || session.participantCount >= session.maxParticipants}
                        data-testid={`join-session-${session.id}`}
                      >
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Collaboration Session</span>
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => leaveSessionMutation.mutate()}
              disabled={leaveSessionMutation.isPending}
              data-testid="leave-session"
            >
              Leave Session
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentSession?.participants.map((participant: any) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {participant.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{participant.username}</span>
                  {participant.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  ) : (
                    <Badge variant="outline">Offline</Badge>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="toggle-mute"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsVideoOff(!isVideoOff)}
                data-testid="toggle-video"
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared Code Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-secondary" />
            <span>Shared Code Editor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeEditor
            language="javascript"
            code={sharedCode}
            onChange={handleCodeChange}
            readOnly={false}
          />
        </CardContent>
      </Card>

      {/* Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-accent" />
            <span>Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ScrollArea className="h-64 w-full border border-gray-200 rounded-lg p-3">
              <div className="space-y-3">
                {currentSession?.messages?.map((message: any) => (
                  <div key={message.id} className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {message.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{message.username}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{message.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendChatMessage();
                  }
                }}
                data-testid="chat-input"
              />
              <Button 
                onClick={sendChatMessage}
                disabled={!chatMessage.trim()}
                data-testid="send-message"
              >
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}