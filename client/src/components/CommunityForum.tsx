
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Pin, Star, Search, Filter, Plus, Reply, Flag, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorLevel: number;
  challengeId?: string;
  challengeTitle?: string;
  postType: "discussion" | "question" | "solution" | "announcement";
  upvotes: number;
  downvotes: number;
  replyCount: number;
  isResolved: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userVote?: "up" | "down" | null;
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorLevel: number;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  userVote?: "up" | "down" | null;
}

export default function CommunityForum({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [newPostData, setNewPostData] = useState({
    title: "",
    content: "",
    postType: "discussion" as const,
    challengeId: "",
    tags: [] as string[]
  });
  const [newReply, setNewReply] = useState("");
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock forum posts
  const mockPosts: ForumPost[] = [
    {
      id: "post-1",
      title: "Best practices for handling API rate limits?",
      content: "I'm working on a project that makes frequent API calls and I'm hitting rate limits. What are some effective strategies for handling this gracefully without impacting user experience?",
      authorId: "user-2",
      authorUsername: "api_enthusiast",
      authorLevel: 12,
      challengeId: "challenge-2",
      challengeTitle: "Weather API Integration",
      postType: "question",
      upvotes: 23,
      downvotes: 2,
      replyCount: 8,
      isResolved: true,
      isPinned: false,
      tags: ["rate-limiting", "best-practices", "api-design"],
      createdAt: "2025-01-14T10:30:00Z",
      updatedAt: "2025-01-14T15:45:00Z",
      userVote: "up"
    },
    {
      id: "post-2",
      title: "📢 New GraphQL Challenge Series Released!",
      content: "We're excited to announce a new series of GraphQL challenges that will take you from basic queries to advanced schema design. Perfect for developers looking to master modern API development patterns.",
      authorId: "admin-1",
      authorUsername: "admin",
      authorLevel: 50,
      postType: "announcement",
      upvotes: 45,
      downvotes: 0,
      replyCount: 12,
      isResolved: false,
      isPinned: true,
      tags: ["announcement", "graphql", "new-features"],
      createdAt: "2025-01-13T09:00:00Z",
      updatedAt: "2025-01-13T09:00:00Z"
    },
    {
      id: "post-3",
      title: "My solution to the OAuth 2.0 challenge - feedback welcome!",
      content: "Just completed the OAuth 2.0 implementation challenge and wanted to share my approach. I used PKCE for additional security and implemented refresh token rotation. Here's my solution:\n\n```javascript\n// Implementation details...\n```\n\nWould love to hear your thoughts and suggestions for improvement!",
      authorId: "user-3",
      authorUsername: "security_dev",
      authorLevel: 18,
      challengeId: "challenge-3",
      challengeTitle: "OAuth 2.0 Flow Mastery",
      postType: "solution",
      upvotes: 31,
      downvotes: 1,
      replyCount: 15,
      isResolved: false,
      isPinned: false,
      tags: ["oauth", "security", "solution-sharing"],
      createdAt: "2025-01-12T14:20:00Z",
      updatedAt: "2025-01-12T16:30:00Z",
      userVote: "up"
    },
    {
      id: "post-4",
      title: "Discussion: REST vs GraphQL - When to use each?",
      content: "I've been working with both REST and GraphQL APIs, and I'm curious about the community's thoughts on when to choose one over the other. What factors do you consider when making this architectural decision?",
      authorId: "user-4",
      authorUsername: "architect_jane",
      authorLevel: 25,
      postType: "discussion",
      upvotes: 18,
      downvotes: 3,
      replyCount: 22,
      isResolved: false,
      isPinned: false,
      tags: ["rest", "graphql", "architecture", "discussion"],
      createdAt: "2025-01-11T11:15:00Z",
      updatedAt: "2025-01-11T17:45:00Z"
    },
    {
      id: "post-5",
      title: "Help: Getting 'CORS policy' error in browser",
      content: "I'm working on the REST API basics challenge and keep getting CORS errors when making requests from my frontend. I've tried adding the Access-Control-Allow-Origin header but it's still not working. Any ideas?",
      authorId: "user-5",
      authorUsername: "newbie_dev",
      authorLevel: 3,
      challengeId: "challenge-1",
      challengeTitle: "REST API Basics",
      postType: "question",
      upvotes: 5,
      downvotes: 0,
      replyCount: 6,
      isResolved: false,
      isPinned: false,
      tags: ["cors", "browser", "troubleshooting", "beginner"],
      createdAt: "2025-01-10T16:30:00Z",
      updatedAt: "2025-01-10T18:20:00Z"
    }
  ];

  // Mock replies for selected post
  const mockReplies: ForumReply[] = [
    {
      id: "reply-1",
      postId: selectedPost?.id || "",
      content: "Great question! I've dealt with rate limiting extensively. Here are some strategies that work well:\n\n1. **Exponential backoff** - Start with short delays and increase exponentially\n2. **Request queuing** - Queue requests and process them at the allowed rate\n3. **Caching** - Cache responses to reduce API calls\n4. **Batch requests** - Combine multiple operations when the API supports it\n\nThe key is to be respectful of the API provider's limits while maintaining good UX.",
      authorId: "user-6",
      authorUsername: "rate_limit_pro",
      authorLevel: 22,
      upvotes: 15,
      downvotes: 0,
      isAcceptedAnswer: true,
      createdAt: "2025-01-14T11:00:00Z"
    },
    {
      id: "reply-2",
      postId: selectedPost?.id || "",
      content: "Adding to the previous answer - consider implementing a circuit breaker pattern. This prevents cascading failures when the API is consistently unavailable or rate-limited.",
      authorId: "user-7",
      authorUsername: "resilience_expert",
      authorLevel: 19,
      upvotes: 8,
      downvotes: 0,
      isAcceptedAnswer: false,
      createdAt: "2025-01-14T12:30:00Z"
    },
    {
      id: "reply-3",
      postId: selectedPost?.id || "",
      content: "Don't forget to check if the API provides webhooks as an alternative to polling. This can significantly reduce your API call volume.",
      authorId: "user-8",
      authorUsername: "webhook_wizard",
      authorLevel: 16,
      upvotes: 6,
      downvotes: 1,
      isAcceptedAnswer: false,
      createdAt: "2025-01-14T13:45:00Z"
    }
  ];

  // Create new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPostData) => {
      return apiRequest("POST", "/api/forum/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setIsCreatePostOpen(false);
      setNewPostData({
        title: "",
        content: "",
        postType: "discussion",
        challengeId: "",
        tags: []
      });
      toast({
        title: "Post Created",
        description: "Your post has been published to the community forum.",
      });
    },
  });

  // Vote on post
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: "up" | "down" }) => {
      return apiRequest("POST", `/api/forum/posts/${postId}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
  });

  // Add reply
  const replyMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return apiRequest("POST", `/api/forum/posts/${postId}/replies`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/replies"] });
      setNewReply("");
      toast({
        title: "Reply Added",
        description: "Your reply has been posted.",
      });
    },
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "question": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "solution": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "announcement": return <Pin className="h-4 w-4 text-purple-500" />;
      case "discussion": return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPostTypeBadgeColor = (type: string) => {
    switch (type) {
      case "question": return "bg-blue-100 text-blue-800";
      case "solution": return "bg-green-100 text-green-800";
      case "announcement": return "bg-purple-100 text-purple-800";
      case "discussion": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newPostData.tags.includes(tagInput.trim().toLowerCase())) {
      setNewPostData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredPosts = mockPosts
    .filter(post => {
      if (activeTab === "questions") return post.postType === "question";
      if (activeTab === "solutions") return post.postType === "solution";
      if (activeTab === "discussions") return post.postType === "discussion";
      return true;
    })
    .filter(post => {
      if (searchQuery) {
        return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
      }
      return true;
    })
    .filter(post => {
      if (filterBy === "resolved") return post.isResolved;
      if (filterBy === "unresolved") return !post.isResolved && post.postType === "question";
      if (filterBy === "pinned") return post.isPinned;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "popular") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      if (sortBy === "replies") return b.replyCount - a.replyCount;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Forum</h2>
        <p className="text-gray-600">
          Connect with fellow developers, share solutions, and get help with challenges
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, tags, or content..."
                  className="pl-10"
                  data-testid="forum-search"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="replies">Most Replies</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="create-post">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post Type
                      </label>
                      <Select
                        value={newPostData.postType}
                        onValueChange={(value: any) => setNewPostData(prev => ({ ...prev, postType: value }))}
                      >
                        <SelectTrigger data-testid="post-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discussion">Discussion</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="solution">Solution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        value={newPostData.title}
                        onChange={(e) => setNewPostData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter a descriptive title..."
                        data-testid="post-title-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <Textarea
                        value={newPostData.content}
                        onChange={(e) => setNewPostData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts, ask questions, or provide solutions..."
                        rows={6}
                        data-testid="post-content-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag..."
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          data-testid="tag-input"
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {newPostData.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatePostOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => createPostMutation.mutate(newPostData)}
                        disabled={!newPostData.title.trim() || !newPostData.content.trim()}
                        data-testid="publish-post"
                      >
                        Publish Post
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posts List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredPosts.map((post) => (
                <Card 
                  key={post.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPost?.id === post.id ? 'ring-2 ring-primary' : ''
                  } ${post.isPinned ? 'border-purple-200 bg-purple-50/30' : ''}`}
                  onClick={() => setSelectedPost(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {post.authorUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              {post.isPinned && <Pin className="h-4 w-4 text-purple-500" />}
                              {getPostTypeIcon(post.postType)}
                              <Badge className={getPostTypeBadgeColor(post.postType)}>
                                {post.postType}
                              </Badge>
                              {post.isResolved && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">
                              {post.title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span>{post.authorUsername}</span>
                              <span>Level {post.authorLevel}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              {post.challengeTitle && (
                                <Badge variant="outline" className="text-xs">
                                  {post.challengeTitle}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {post.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{post.upvotes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Reply className="h-4 w-4" />
                              <span>{post.replyCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredPosts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery ? "No posts match your search criteria." : "Be the first to start a discussion!"}
                    </p>
                    <Button onClick={() => setIsCreatePostOpen(true)}>
                      Create First Post
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Post Details */}
            <div>
              {selectedPost ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getPostTypeIcon(selectedPost.postType)}
                        <Badge className={getPostTypeBadgeColor(selectedPost.postType)}>
                          {selectedPost.postType}
                        </Badge>
                        {selectedPost.isResolved && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{selectedPost.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {selectedPost.authorUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{selectedPost.authorUsername}</div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Award className="h-3 w-3" />
                            <span>Level {selectedPost.authorLevel}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {selectedPost.content}
                      </p>

                      {selectedPost.challengeTitle && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium">Related Challenge</div>
                          <div className="text-sm text-blue-800">{selectedPost.challengeTitle}</div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {selectedPost.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={selectedPost.userVote === "up" ? "text-blue-600" : ""}
                            onClick={() => voteMutation.mutate({ postId: selectedPost.id, voteType: "up" })}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {selectedPost.upvotes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={selectedPost.userVote === "down" ? "text-red-600" : ""}
                            onClick={() => voteMutation.mutate({ postId: selectedPost.id, voteType: "down" })}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {selectedPost.downvotes}
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {selectedPost.replyCount} replies
                        </div>
                      </div>

                      {/* Replies Section */}
                      <div className="space-y-3 border-t pt-4">
                        <h4 className="font-medium text-gray-900">Replies</h4>
                        
                        {mockReplies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {reply.authorUsername.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{reply.authorUsername}</span>
                                  <span className="text-xs text-gray-500">Level {reply.authorLevel}</span>
                                  {reply.isAcceptedAnswer && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Accepted
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                                  {reply.content}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {reply.upvotes}
                                  </Button>
                                  <span className="text-xs text-gray-400">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="space-y-2">
                          <Textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Write your reply..."
                            rows={3}
                            data-testid="reply-input"
                          />
                          <Button
                            size="sm"
                            onClick={() => replyMutation.mutate({ postId: selectedPost.id, content: newReply })}
                            disabled={!newReply.trim()}
                            data-testid="post-reply"
                          >
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Post</h3>
                    <p className="text-gray-600">
                      Click on any post to view details and join the discussion.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
