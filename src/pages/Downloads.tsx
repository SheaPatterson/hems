import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, Loader2, FileText, Tag, Monitor, Apple, Coffee, Cpu } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useDownloads } from '@/hooks/useDownloads';
import SanitizedHTML from '@/components/SanitizedHTML';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

const Downloads = () => {
  const { data: pageContent, isLoading: isContentLoading } = useContent('downloads');
  const { downloads, isLoading: isDownloadsLoading } = useDownloads();

  const isLoading = isContentLoading || isDownloadsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-20 flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing Resource Library...</p>
      </div>
    );
  }

  const categories = [...new Set(downloads.map(item => item.category))];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-12 max-w-6xl">
      <PageHeader 
        title="Tactical Resource Center"
        description="Official standalone bridge releases and operational assets hosted via Box."
        icon={Download}
      />

      {/* Primary Standalone Releases */}
      <section className="space-y-6">
          <div className="flex items-center space-x-4">
              <Cpu className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Standalone Clients</h2>
              <Separator className="flex-grow opacity-50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Windows */}
              <Card className="p-8 border-2 border-primary/20 bg-primary/5 rounded-[2rem] flex flex-col items-center text-center shadow-xl group hover:border-primary transition-all">
                  <Monitor className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold uppercase italic">Windows PC</h3>
                  <p className="text-xs text-muted-foreground mb-6">v5.3.0 | 64-bit EXE (Box)</p>
                  <Button asChild className="w-full h-12 font-black italic rounded-xl shadow-lg">
                      <a href="https://app.box.com/s/8dn32k55blx4isbtmu2pe9j4zpwn2vs9" target="_blank" rel="noopener noreferrer">GET INSTALLER</a>
                  </Button>
              </Card>

              {/* Mac ARM */}
              <Card className="p-8 border-2 border-primary/20 bg-primary/5 rounded-[2rem] flex flex-col items-center text-center shadow-xl group hover:border-primary transition-all">
                  <Apple className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold uppercase italic">Mac Silicon</h3>
                  <p className="text-xs text-muted-foreground mb-6">v5.3.0 | Apple ARM (Box)</p>
                  <Button asChild className="w-full h-12 font-black italic rounded-xl shadow-lg">
                      <a href="https://app.box.com/s/yr29vbkfgi58hbyhc2u062htvnw33qh1" target="_blank" rel="noopener noreferrer">GET INSTALLER</a>
                  </Button>
              </Card>

              {/* Mac Intel */}
              <Card className="p-8 border-2 border-primary/20 bg-primary/5 rounded-[2rem] flex flex-col items-center text-center shadow-xl group hover:border-primary transition-all">
                  <Apple className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold uppercase italic">Mac Intel</h3>
                  <p className="text-xs text-muted-foreground mb-6">v5.3.0 | Legacy Intel (Box)</p>
                  <Button asChild variant="outline" className="w-full h-12 font-black italic rounded-xl border-2">
                      <a href="https://app.box.com/s/2tlvlms9suw0bm62zo158y6dt5zg2ji0" target="_blank" rel="noopener noreferrer">GET INSTALLER</a>
                  </Button>
              </Card>
          </div>
      </section>

      {/* Dynamic Introduction Content */}
      {pageContent?.body && (
        <Card className="bg-muted/30 border-2 rounded-3xl overflow-hidden">
          <CardContent className="pt-8 px-8">
            <SanitizedHTML 
              html={pageContent.body} 
              className="prose dark:prose-invert max-w-none text-muted-foreground" 
            />
          </CardContent>
        </Card>
      )}

      {/* General Asset Registry */}
      {downloads.length > 0 && (
        <div className="space-y-16 pt-10">
            {categories.map(category => (
                <section key={category} className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Tag className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-foreground">{category}</h2>
                        <Separator className="flex-grow opacity-50" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {downloads.filter(d => d.category === category).map(item => (
                            <Card key={item.id} className="hover:border-primary transition-all group bg-card/40 backdrop-blur-sm border-2 rounded-2xl shadow-sm">
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">{item.title}</CardTitle>
                                            <CardDescription className="text-xs font-medium leading-relaxed italic">
                                                {item.description || 'Standard operational resource.'}
                                            </CardDescription>
                                        </div>
                                        <FileText className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <Button asChild size="lg" className="w-full h-12 font-black italic uppercase shadow-lg rounded-xl">
                                        <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4 mr-2" /> DOWNLOAD
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            ))}
        </div>
      )}

      <footer className="pt-32">
        <Card className="bg-primary/5 border-2 border-primary/20 rounded-[3rem] overflow-hidden">
            <CardContent className="p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-4">
                    <h4 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Support Development</h4>
                    <p className="text-lg text-muted-foreground font-medium max-w-lg">HEMS OPS-CENTER is free and community-supported. Help us keep the link alive.</p>
                </div>
                <Button asChild size="lg" className="h-20 px-14 text-xl font-black italic uppercase shadow-2xl rounded-2xl bg-primary text-black">
                    <Link to="/support">
                        <Coffee className="w-8 h-8 mr-3" /> SUPPORT THE MISSION
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </footer>
    </div>
  );
};

export default Downloads;