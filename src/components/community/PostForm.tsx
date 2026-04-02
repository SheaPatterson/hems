import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { useAuth } from '@/components/AuthGuard';

interface PostFormProps {
    onPostSuccess: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostSuccess }) => {
    const { user } = useAuth();
    const { createPost, isCreating } = useCommunityPosts();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (title.trim() === '' || content.trim() === '') {
            return;
        }

        try {
            await createPost({
                title,
                content,
                user_id: user.id,
            });
            setTitle('');
            setContent('');
            onPostSuccess();
        } catch (e) {
            // Error handled by hook
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title / Subject</Label>
                        <Input 
                            id="title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="e.g., Best practice for Scene Call weather checks?"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Details</Label>
                        <Textarea 
                            id="content" 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            placeholder="Provide details about your question or discussion topic."
                            rows={4}
                            required
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
                </form>
            </CardContent>
        </Card>
    );
};

export default PostForm;