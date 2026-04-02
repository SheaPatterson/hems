import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { useAuth } from '@/components/AuthGuard';
import { useNavigate } from 'react-router-dom';

const FormPage = () => {
  const { user } = useAuth();
  const { createPost, isCreating } = useCommunityPosts();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
        toast.error("You must be logged in to submit a post.");
        return;
    }

    if (title.trim() === '' || content.trim() === '') {
        toast.error("Title and Content are required.");
        return;
    }

    try {
        await createPost({
            title,
            content,
            user_id: user.id,
        });
        
        // Clear form and redirect to community page
        setTitle('');
        setContent('');
        navigate('/community');

    } catch (e) {
        // Error handled by hook
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-primary" /> New Community Post
          </CardTitle>
          <CardDescription>Use this form to start a new discussion or ask a question on the community board.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title / Subject</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title" 
                required 
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content / Details</Label>
              <Textarea 
                id="content" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the detailed content of your post" 
                rows={8} 
                required 
                disabled={isCreating}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isCreating || !user}>
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Post
            </Button>
            {!user && <p className="text-sm text-destructive text-center">You must be logged in to post.</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormPage;