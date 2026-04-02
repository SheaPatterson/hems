import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Loader2, FileText, Eye, Code, ArrowLeft } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useContentManagement } from '@/hooks/useContentManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SanitizedHTML from '@/components/SanitizedHTML';

const AdminContentEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const { data: initialContent, isLoading: isQueryLoading, isError } = useContent(slug || '');
  const { upsertContent, isSaving } = useContentManagement();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);

  useEffect(() => {
    if (initialContent) {
      setTitle(initialContent.title);
      setBody(initialContent.body || '');
      setContentId(initialContent.id);
    } else if (!isQueryLoading && !isError && slug) {
      setTitle(slug.charAt(0).toUpperCase() + slug.slice(1));
      setBody(`<h1>${slug}</h1>\n<p>Start editing...</p>`);
      setContentId(null);
    }
  }, [initialContent, isQueryLoading, isError, slug]);

  const handleSave = async () => {
    if (!slug) return;
    try {
      await upsertContent({ id: contentId, slug, title, body });
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isQueryLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl h-[calc(100vh-100px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/content')}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-primary" /> Content Engine
                </h1>
                <p className="text-muted-foreground text-xs font-mono uppercase">Path Identifier: /{slug}</p>
            </div>
        </div>
        <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isSaving} className="h-12 px-8 font-black italic shadow-lg">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                PUSH TO PRODUCTION
            </Button>
        </div>
      </div>

      <div className="space-y-4 flex-grow flex flex-col">
        <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Public Page Header</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-12 border-2 font-bold text-lg" />
        </div>

        <Tabs defaultValue="edit" className="flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="edit" className="rounded-lg font-bold"><Code className="w-4 h-4 mr-2" /> SOURCE CODE</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg font-bold"><Eye className="w-4 h-4 mr-2" /> LIVE PREVIEW</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="flex-grow mt-4">
                <Textarea 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)} 
                    className="font-mono text-sm h-full min-h-[500px] resize-none p-6 border-2 focus-visible:ring-primary rounded-2xl bg-card/50"
                    placeholder="Enter HTML or Content here..."
                />
            </TabsContent>
            <TabsContent value="preview" className="flex-grow mt-4 border-2 rounded-2xl p-10 overflow-y-auto bg-card shadow-inner">
                <article className="prose prose-orange dark:prose-invert max-w-none">
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase mb-8 border-b-4 border-primary pb-4">{title}</h1>
                    <SanitizedHTML html={body} />
                </article>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminContentEditor;