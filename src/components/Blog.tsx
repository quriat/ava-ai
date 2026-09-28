import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Calendar } from 'lucide-react';

interface BlogPost {
  title: string;
  summary: string;
  content: string;
  date: string;
  read: string;
  emoji: string;
  cat: string;
  slug: string;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/blog_posts.json')
      .then((res) => res.json())
      .then((data: BlogPost[]) => {
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(sorted.slice(0, 3));
      })
      .catch((err) => {
        console.error('Failed to load blog posts:', err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <section id="blog" className="py-24 bg-dark-900 border-t border-gold-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold text-gold-400 tracking-widest block mb-2">
            Houston Travel Insights
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            AvaLimo Travel Blog
          </h2>
          <p className="text-slate-400 text-sm">
            Expert guides on navigating Houston airports, Galveston cruise departure schedules, and executive logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center text-slate-400 text-sm">Loading latest posts…</div>
          ) : posts.length === 0 ? (
            <div className="col-span-3 text-center text-slate-400 text-sm">No blog posts available.</div>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="glass-panel rounded-3xl overflow-hidden glass-panel-hover flex flex-col justify-between">
                <div>
                  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-gold-500/10 border-b border-gold-500/20">
                    <span className="text-5xl drop-shadow-lg" dangerouslySetInnerHTML={{ __html: post.emoji }} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] uppercase font-bold text-black bg-gold-500 px-2 py-0.5 rounded-full tracking-wider">
                        {post.cat}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(post.date)}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-white mb-3">{post.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                      {post.summary}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <a href={`/blog/${post.slug}`} className="text-xs font-bold text-gold-400 hover:text-white transition-colors inline-flex items-center gap-1">
                    Read Travel Guide <ArrowUpRight size={12} />
                  </a>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="text-center mt-14">
          <a href="/blog" className="inline-flex items-center gap-2 border-2 border-gold-500/40 text-gold-400 px-8 py-3 rounded-full text-[11px] font-extrabold tracking-[0.2em] uppercase hover:bg-gold-500 hover:text-black transition-all">
            View All Articles <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;