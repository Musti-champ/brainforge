import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, ThumbsUp, CheckCircle, Plus, Search, Filter, HelpCircle, Lightbulb } from "lucide-react";
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

interface ForumPost {
  id: string;
  challengeId?: string;
  challengeTitle?: string;
  authorId: string;
  authorUsername: string;
  title: string;
  content: string;
  postType: "discussion" | "question" | "solution";
  upvotes: number;
  isResolved: boolean;
  createdAt: string;
  replies: Array<{
    id: string;
    authorId: string;
    authorUsername: string;
    content: string;
    upvotes: number;
    isAcceptedAnswer: boolean;
    createdAt: string;
  }>;
}

export default function CommunityForum({ challengeId }: { challengeId?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    postType: "discussion" as const
  });
  const [newReply, setNewReply] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get forum posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/forum/posts", challengeId, searchQuery, selectedCategory],
    queryFn: () => apiRequest("GET", `/api/forum/posts?${new URLSearchParams({
      ...(challengeId && { challengeId }),
      ...(searchQuery && { search: searchQuery }),
      ...(selectedCategory !== "all" && { category: selectedCategory })
    })}`),
  });

  // Create new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest("POST", "/api/forum/posts", {
        ...postData,
        challengeId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setIsCreatePostOpen(false);
      setNewPost({ title: "", content: "", postType: "discussion" });
      toast({
        title: "Post Created",
        description: "Your post has been published to the community.",
      });
    },
  });

  // Add reply
  const addReplyMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return apiRequest("POST", `/api/forum/posts/${postId}/replies`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setNewReply("");
      toast({
        title: "Reply Added",
        description: "Your reply has been posted.",
      });
    },
  });

  // Upvote post or reply
  const upvoteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "post" | "reply"; id: string }) => {
      return apiRequest("POST", `/api/forum/${type}s/${id}/upvote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
  });

  // Mock data for demonstration
  const mockPosts: ForumPost[] = [
    {
      id: "post-1",
      challengeId: "challenge-1",
      challengeTitle: "Your First API Call",
      authorId: "user-2",
      authorUsername: "api_ninja",
      title: "Best practices for handling API responses?",
      content: "I'm working on the first API challenge and wondering about the best ways to handle different types of API responses. Should I always check the status code first?",
      postType: "question",
      upvotes: 12,
      isResolved: true,
      createdAt: "2025-08-15T10:30:00Z",
      replies: [
        {
          id: "reply-1",
          authorId: "user-3",
          authorUsername: "code_explorer",
          content: "Yes, always check the status code first! Use response.ok to check if the status is in the 200-299 range. Here's a good pattern:\n\nif (!response.ok) {\n  throw new Error(`HTTP error! status: ${response.status}`);\n}",
          upvotes: 8,
          isAcceptedAnswer: true,
          createdAt: "2025-08-15T11:15:00Z"
        },
        {
          id: "reply-2",
          authorId: "user-4",
          authorUsername: "rest_warrior",
          content: "Also consider using try/catch blocks around your fetch calls to handle network errors gracefully!",
          upvotes: 3,
          isAcceptedAnswer: false,
          createdAt: "2025-08-15T12:00:00Z"
        }
      ]
    },
    {
      id: "post-2",
      challengeId: "challenge-2",
      challengeTitle: "Weather API Integration",
      authorId: "user-5",
      authorUsername: "query_master",
      title: "Temperature conversion helper function",
      content: "I created a reusable function for converting temperatures in the weather challenge. Thought it might help others!\n\nfunction kelvinToCelsius(kelvin) {\n  return Math.round(kelvin - 273.15);\n}\n\nfunction kelvinToFahrenheit(kelvin) {\n  return Math.round((kelvin - 273.15) * 9/5 + 32);\n}",
      postType: "solution",
      upvotes: 15,
      isResolved: false,
      createdAt: "2025-08-14T16:45:00Z",
      replies: [
        {
          id: "reply-3",
          authorId: "user-1",
          authorUsername: "developer",
          content: "This is really helpful! I was doing the conversion inline and it was getting messy. Thanks for sharing!",
          upvotes: 2,
          isAcceptedAnswer: false,
          createdAt: "2025-08-14T17:20:00Z"
        }
      ]
    },
    {
      id: "post-3",
      authorId: "user-6",
      authorUsername: "api_enthusiast", 
      title: "API rate limiting strategies discussion",
      content: "Let's discuss different approaches to handling API rate limits. What strategies have worked best for you in production applications?",
      postType: "discussion",
      upvotes: 7,
      isResolved: false,
      createdAt: "2025-08-13T14:20:00Z",
      replies: []
    }
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
      case "solution":
        return <Lightbulb className="h-4 w-4 text-green-500" />;
      case "discussion":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case "question":
        return "bg-blue-100 text-blue-800";
      case "solution":
        return "bg-green-100 text-green-800";
      case "discussion":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || post.postType === selectedCategory;
    
    const matchesChallenge = !challengeId || post.challengeId === challengeId;
    
    return matchesSearch && matchesCategory && matchesChallenge;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Forum</h2>
          <p className="text-gray-600">
            {challengeId ? "Discussion for this challenge" : "Connect with other developers and share knowledge"}
          </p>
        </div>
        
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
                  value={newPost.postType} 
                  onValueChange={(value: any) => setNewPost(prev => ({ ...prev, postType: value }))}
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
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive title..."
                  data-testid="post-title-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, code, or question..."
                  rows={6}
                  data-testid="post-content-input"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatePostOpen(false)}
                  data-testid="cancel-post"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => createPostMutation.mutate(newPost)}
                  disabled={!newPost.title.trim() || !newPost.content.trim() || createPostMutation.isPending}
                  data-testid="submit-post"
                >
                  {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-posts"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40" data-testid="category-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
              <SelectItem value="discussion">Discussions</SelectItem>
              <SelectItem value="solution">Solutions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-4">
                {challengeId 
                  ? "Be the first to start a discussion about this challenge!"
                  : "No posts match your search criteria."
                }
              </p>
              <Button onClick={() => setIsCreatePostOpen(true)} data-testid="create-first-post">
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {post.authorUsername.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getPostTypeIcon(post.postType)}
                          <h3 className="font-medium text-gray-900 cursor-pointer hover:text-primary"
                              onClick={() => setSelectedPost(post)}>
                            {post.title}
                          </h3>
                          <Badge className={`text-xs ${getPostTypeBadge(post.postType)}`}>
                            {post.postType}
                          </Badge>
                          {post.isResolved && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{post.authorUsername}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          {post.challengeTitle && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{post.challengeTitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => upvoteMutation.mutate({ type: "post", id: post.id })}
                          className="text-gray-500 hover:text-primary"
                          data-testid={`upvote-post-${post.id}`}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.upvotes}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPost(post)}
                          className="text-gray-500 hover:text-primary"
                          data-testid={`view-post-${post.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.replies.length}
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  {getPostTypeIcon(selectedPost.postType)}
                  <DialogTitle>{selectedPost.title}</DialogTitle>
                  <Badge className={`text-xs ${getPostTypeBadge(selectedPost.postType)}`}>
                    {selectedPost.postType}
                  </Badge>
                  {selectedPost.isResolved && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{selectedPost.authorUsername}</span>
                  <span>•</span>
                  <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  {selectedPost.challengeTitle && (
                    <>
                      <span>•</span>
                      <span className="text-primary">{selectedPost.challengeTitle}</span>
                    </>
                  )}
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Original Post */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {selectedPost.content}
                  </pre>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => upvoteMutation.mutate({ type: "post", id: selectedPost.id })}
                      data-testid="upvote-post-detail"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {selectedPost.upvotes} upvotes
                    </Button>
                  </div>
                </div>
                
                {/* Replies */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">
                    Replies ({selectedPost.replies.length})
                  </h3>
                  
                  {selectedPost.replies.map((reply) => (
                    <div key={reply.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {reply.authorUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-sm">{reply.authorUsername}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                            {reply.isAcceptedAnswer && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted Answer
                              </Badge>
                            )}
                          </div>
                          
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans mb-3">
                            {reply.content}
                          </pre>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => upvoteMutation.mutate({ type: "reply", id: reply.id })}
                            data-testid={`upvote-reply-${reply.id}`}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {reply.upvotes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Reply */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <Textarea
                      placeholder="Add your reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      rows={4}
                      data-testid="reply-input"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={() => addReplyMutation.mutate({ 
                          postId: selectedPost.id, 
                          content: newReply 
                        })}
                        disabled={!newReply.trim() || addReplyMutation.isPending}
                        data-testid="submit-reply"
                      >
                        {addReplyMutation.isPending ? "Posting..." : "Post Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}