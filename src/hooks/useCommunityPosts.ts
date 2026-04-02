import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

const fetchPosts = async (): Promise<CommunityPost[]> => {
  const response = await azureClient.functions.invoke('community-posts', { method: 'GET' });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("Error fetching community posts:", err);
    throw new Error(err.error || 'Failed to fetch community posts');
  }
  return await response.json() as CommunityPost[];
};

const createPost = async (post: { title: string; content: string; user_id: string }): Promise<CommunityPost> => {
  const response = await azureClient.functions.invoke('community-posts', {
    method: 'POST',
    body: post,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create post');
  }
  return await response.json() as CommunityPost;
};

const deletePost = async (id: string): Promise<void> => {
  const response = await azureClient.functions.invoke(`community-posts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete post');
  }
};

export const useCommunityPosts = () => {
  const queryClient = useQueryClient();
  const queryKey = ['communityPosts'];

  const postsQuery = useQuery({
    queryKey,
    queryFn: fetchPosts,
    staleTime: 1000 * 60, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Post deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    }
  });

  return {
    posts: postsQuery.data || [],
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
    createPost: createMutation.mutateAsync,
    deletePost: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
