import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, MessageCircle, Star, Clock, CheckCircle, UserCheck, Heart, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Mentor {
  id: string;
  username: string;
  bio: string;
  skillAreas: string[];
  experience: string;
  rating: number;
  totalMentees: number;
  availableSlots: number;
  responseTime: string;
  isAvailable: boolean;
  sessionRate: number; // XP cost
}

interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId?: string;
  skillArea: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
  updatedAt: string;
  mentorInfo?: Mentor;
  menteeInfo?: {
    id: string;
    username: string;
  };
}

interface MentorshipSession {
  id: string;
  mentorId: string;
  menteeId: string;
  skillArea: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  goals: string[];
  notes: string;
  rating?: number;
  feedback?: string;
}

export default function MentorshipSystem({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("find-mentor");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestForm, setRequestForm] = useState({
    skillArea: "",
    message: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available mentors
  const { data: mentors } = useQuery({
    queryKey: ["/api/mentorship/mentors"],
  });

  // Get user's mentorship requests
  const { data: requests } = useQuery({
    queryKey: ["/api/mentorship/requests", userId],
  });

  // Get user's mentorship sessions
  const { data: sessions } = useQuery({
    queryKey: ["/api/mentorship/sessions", userId],
  });

  // Mock data for demonstration
  const mockMentors: Mentor[] = [
    {
      id: "mentor-1",
      username: "api_veteran",
      bio: "Senior API architect with 8+ years building scalable REST and GraphQL APIs. Passionate about helping developers master API design patterns and best practices.",
      skillAreas: ["REST APIs", "GraphQL", "API Design", "System Architecture"],
      experience: "8+ years",
      rating: 4.9,
      totalMentees: 45,
      availableSlots: 3,
      responseTime: "< 2 hours",
      isAvailable: true,
      sessionRate: 200 // XP cost
    },
    {
      id: "mentor-2", 
      username: "security_expert",
      bio: "Cybersecurity specialist focused on API security, OAuth implementation, and secure authentication patterns. Help developers build secure, production-ready APIs.",
      skillAreas: ["API Security", "OAuth 2.0", "Authentication", "Authorization"],
      experience: "6+ years",
      rating: 4.8,
      totalMentees: 32,
      availableSlots: 5,
      responseTime: "< 4 hours",
      isAvailable: true,
      sessionRate: 250
    },
    {
      id: "mentor-3",
      username: "performance_guru",
      bio: "Performance optimization expert specializing in API scalability, caching strategies, and database optimization. Previously at tech giants optimizing high-traffic APIs.",
      skillAreas: ["Performance Optimization", "Caching", "Database Design", "Scalability"],
      experience: "10+ years",
      rating: 5.0,
      totalMentees: 28,
      availableSlots: 1,
      responseTime: "< 6 hours",
      isAvailable: true,
      sessionRate: 300
    },
    {
      id: "mentor-4",
      username: "devops_master",
      bio: "DevOps engineer with expertise in API deployment, monitoring, and CI/CD pipelines. Help developers deploy and maintain production APIs successfully.",
      skillAreas: ["DevOps", "Monitoring", "CI/CD", "Cloud Deployment"],
      experience: "7+ years",
      rating: 4.7,
      totalMentees: 38,
      availableSlots: 0,
      responseTime: "< 3 hours",
      isAvailable: false,
      sessionRate: 220
    }
  ];

  const mockRequests: MentorshipRequest[] = [
    {
      id: "req-1",
      menteeId: userId,
      mentorId: "mentor-1",
      skillArea: "REST APIs",
      message: "I'm struggling with designing RESTful endpoints for my e-commerce API. Would love guidance on resource modeling and HTTP methods.",
      status: "accepted",
      createdAt: "2025-08-14T10:00:00Z",
      updatedAt: "2025-08-14T11:30:00Z",
      mentorInfo: mockMentors[0]
    },
    {
      id: "req-2",
      menteeId: userId,
      skillArea: "API Security",
      message: "Need help implementing OAuth 2.0 properly in my Node.js application. Want to make sure I'm following security best practices.",
      status: "pending",
      createdAt: "2025-08-15T09:15:00Z",
      updatedAt: "2025-08-15T09:15:00Z"
    }
  ];

  const mockSessions: MentorshipSession[] = [
    {
      id: "session-1",
      mentorId: "mentor-1",
      menteeId: userId,
      skillArea: "REST APIs",
      scheduledAt: "2025-08-16T15:00:00Z",
      duration: 60,
      status: "scheduled",
      goals: [
        "Review current API design",
        "Learn resource modeling best practices",
        "Understand proper HTTP status codes"
      ],
      notes: ""
    },
    {
      id: "session-2",
      mentorId: "mentor-2",
      menteeId: userId,
      skillArea: "API Security",
      scheduledAt: "2025-08-13T14:00:00Z",
      duration: 45,
      status: "completed",
      goals: [
        "Implement JWT authentication",
        "Set up proper CORS configuration",
        "Review security headers"
      ],
      notes: "Great session! Implemented JWT successfully and learned about common security pitfalls.",
      rating: 5,
      feedback: "Excellent mentor, very knowledgeable and patient. Helped me understand complex security concepts clearly."
    }
  ];

  // Send mentorship request
  const sendRequestMutation = useMutation({
    mutationFn: async (data: { mentorId: string; skillArea: string; message: string }) => {
      return apiRequest("POST", "/api/mentorship/requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorship/requests"] });
      setIsRequestModalOpen(false);
      setRequestForm({ skillArea: "", message: "" });
      setSelectedMentor(null);
      toast({
        title: "Request Sent",
        description: "Your mentorship request has been sent to the mentor.",
      });
    },
  });

  // Accept/reject mentorship request (for mentors)
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "accept" | "reject" }) => {
      return apiRequest("POST", `/api/mentorship/requests/${requestId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorship/requests"] });
      toast({
        title: "Request Updated",
        description: "The mentorship request has been updated.",
      });
    },
  });

  const handleSendRequest = () => {
    if (!selectedMentor || !requestForm.skillArea || !requestForm.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    sendRequestMutation.mutate({
      mentorId: selectedMentor.id,
      skillArea: requestForm.skillArea,
      message: requestForm.message
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": case "scheduled": return "bg-amber-100 text-amber-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentorship Program</h2>
        <p className="text-gray-600">
          Connect with experienced developers and accelerate your API development skills
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="find-mentor">Find Mentor</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="become-mentor">Become Mentor</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockMentors.map((mentor) => (
              <Card key={mentor.id} className={`${!mentor.isAvailable ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-white">
                          {mentor.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-gray-900">{mentor.username}</h3>
                        <div className="flex items-center space-x-1">
                          {renderStars(mentor.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            ({mentor.rating}) • {mentor.totalMentees} mentees
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={mentor.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {mentor.isAvailable ? "Available" : "Busy"}
                    </Badge>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Expertise Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {mentor.skillAreas.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Experience:</span>
                        <div className="font-medium">{mentor.experience}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Response time:</span>
                        <div className="font-medium">{mentor.responseTime}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Available slots:</span>
                        <div className="font-medium">{mentor.availableSlots}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Session cost:</span>
                        <div className="font-medium">{mentor.sessionRate} XP</div>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={!mentor.isAvailable || mentor.availableSlots === 0}
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setIsRequestModalOpen(true);
                      }}
                      data-testid={`request-mentor-${mentor.id}`}
                    >
                      {mentor.isAvailable ? "Request Mentorship" : "Currently Unavailable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          {mockRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Mentorship Requests</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by requesting mentorship from experts.</p>
                <Button onClick={() => setActiveTab("find-mentor")}>
                  Find a Mentor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{request.skillArea}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        {request.mentorInfo && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {request.mentorInfo.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>Mentor: {request.mentorInfo.username}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>Sent {new Date(request.createdAt).toLocaleDateString()}</div>
                        {request.status !== "pending" && (
                          <div>Updated {new Date(request.updatedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Your Message:</h4>
                      <p className="text-gray-700 text-sm">{request.message}</p>
                    </div>

                    {request.status === "accepted" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Request Accepted!</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          Your mentor will contact you soon to schedule your first session.
                        </p>
                      </div>
                    )}

                    {request.status === "rejected" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-red-800 font-medium">Request Declined</div>
                        <p className="text-red-700 text-sm mt-1">
                          This mentor is currently unavailable. Try requesting mentorship from another expert.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {mockSessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Scheduled</h3>
                <p className="text-gray-600">Your mentorship sessions will appear here once scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{session.skillArea}</h3>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(session.scheduledAt).toLocaleString()}</span>
                          </div>
                          <span>Duration: {session.duration} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Session Goals</h4>
                        <ul className="space-y-1">
                          {session.goals.map((goal, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {session.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Session Notes</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{session.notes}</p>
                        </div>
                      )}

                      {session.rating && session.feedback && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Your Feedback</h4>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center space-x-1 mb-2">
                              {renderStars(session.rating)}
                              <span className="text-sm text-gray-600 ml-2">({session.rating}/5 stars)</span>
                            </div>
                            <p className="text-sm text-gray-700">{session.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {session.status === "scheduled" && (
                      <div className="flex space-x-3 mt-4">
                        <Button size="sm">Join Session</Button>
                        <Button variant="outline" size="sm">Reschedule</Button>
                      </div>
                    )}

                    {session.status === "completed" && !session.rating && (
                      <div className="mt-4">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 mr-2" />
                          Rate Session
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="become-mentor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>Become a Mentor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Why Become a Mentor?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Share Knowledge</h4>
                        <p className="text-sm text-gray-600">Help other developers grow and succeed</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Earn XP & Recognition</h4>
                        <p className="text-sm text-gray-600">Get rewarded for your mentoring efforts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Build Network</h4>
                        <p className="text-sm text-gray-600">Connect with talented developers</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Heart className="h-5 w-5 text-red-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Give Back</h4>
                        <p className="text-sm text-gray-600">Contribute to the developer community</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Complete at least 10 challenges with advanced difficulty
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Maintain a minimum 4.0 star rating from mentees
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Have 2+ years of professional API development experience
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Pass our mentor assessment and background check
                    </li>
                  </ul>
                </div>

                <Button className="w-full" data-testid="apply-mentor">
                  Apply to Become a Mentor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Mentorship Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white">
                    {selectedMentor.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedMentor.username}</h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedMentor.rating)}
                    <span className="text-sm text-gray-600 ml-1">({selectedMentor.rating})</span>
                  </div>
                  <p className="text-sm text-gray-600">Session cost: {selectedMentor.sessionRate} XP</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Area
                  </label>
                  <Select 
                    value={requestForm.skillArea} 
                    onValueChange={(value) => setRequestForm(prev => ({ ...prev, skillArea: value }))}
                  >
                    <SelectTrigger data-testid="skill-area-select">
                      <SelectValue placeholder="Select a skill area..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMentor.skillAreas.map((skill) => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Mentor
                  </label>
                  <Textarea
                    value={requestForm.message}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe what you'd like to learn and any specific goals for the mentorship..."
                    rows={4}
                    data-testid="mentor-message-input"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    setSelectedMentor(null);
                    setRequestForm({ skillArea: "", message: "" });
                  }}
                  data-testid="cancel-request"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendRequest}
                  disabled={sendRequestMutation.isPending || !requestForm.skillArea || !requestForm.message.trim()}
                  data-testid="send-request"
                >
                  {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}