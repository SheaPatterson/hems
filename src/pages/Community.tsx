import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { MessageSquare, Loader2, Trash2, User } from 'lucide-react';
import { useCommunityPosts, CommunityPost } from '@/hooks/useCommunityPosts';
import PostForm from '@/components/community/PostForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthGuard';

const PostItem: React.FC<{ post: CommunityPost, currentUserId: string | undefined }> = ({ post, currentUserId }) => {
    const { deletePost, isDeleting } = useCommunityPosts();
    const isOwner = post.user_id === currentUserId;

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePost(post.id);
        } catch (e) {
            // Error handled by hook
        }
    };

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-primary">{post.title}</CardTitle>
                    {isOwner && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleDelete} 
                            disabled={isDeleting}
                            className="w-8 h-8 shrink-0"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                        </Button>
                    )}
                </div>
                <CardDescription className="flex items-center text-xs text-muted-foreground">
                    <User className="w-3 h-3 mr-1" /> 
                    Posted by User ID: {post.user_id.substring(0, 8)}... on {new Date(post.created_at).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                {/* Future: Add Reply/Comment section here */}
            </CardContent>
        </Card>
    );
};

const Community = () => {
    const { posts, isLoading, isError } = useCommunityPosts();
    const { user } = useAuth();
    // Ref applied to the inner scrollable content div
    const scrollRef = useRef<HTMLDivElement>(null); 

    const handlePostSuccess = () => {
        // Scroll to the top of the list to see the new post
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6 max-w-4xl">
            <header className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 mr-3 text-primary" /> Community Q&A Board
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Ask questions, share knowledge, and discuss operational topics with other HEMS personnel.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Post Submission Form */}
                <div className="lg:col-span-1">
                    <PostForm onPostSuccess={handlePostSuccess} />
                </div>

                {/* Post List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Recent Discussions ({posts.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : isError ? (
                                <p className="text-destructive p-4">Error loading community posts.</p>
                            ) : posts.length === 0 ? (
                                <p className="text-muted-foreground p-4">No posts yet. Be the first to ask a question!</p>
                            ) : (
                                <ScrollArea className="h-[600px] p-4">
                                    <div className="space-y-4" ref={scrollRef}>
                                        {posts.map((post) => (
                                            <PostItem key={post.id} post={post} currentUserId={user?.id} />
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Community;