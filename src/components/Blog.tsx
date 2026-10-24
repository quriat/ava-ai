import React, { useMemo, useState } from 'react';
import { ArrowRight, Calendar, X } from 'lucide-react';
import rawPosts from '../../blog_posts.json';

type RawPost = {
  title?: string;
  blog_title?: string;
  blog_excerpt?: string;
  summary?: string;
  blog_content?: string;
  content?: string;
  blog_slug?: string;
  slug?: string;
  date?: string;
  cat?: string;
};

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  ts: number;
  category: string;
};

function normalize(p: RawPost, i: number): Post | null {
  const title = p.blog_title || p.title;
  if (!title) return null;
  const ts = p.date ? Date.parse(p.date) : NaN;
  return {
    id: p.blog_slug || p.slug || `post-${i}`,
    title,
    excerpt: p.blog_excerpt || p.summary || '',
    content: p.blog_content || p.content || '',
    date: p.date || '',
    ts: Number.isNaN(ts) ? 0 : ts,
    category: p.cat || 'AvaLimo',
  };
}

const Blog: React.FC = () => {
  const [open, setOpen] = useState<Post | null>(null);

  const posts = useMemo(() => {
    const list = (rawPosts as RawPost[]).map(normalize).filter(Boolean) as Post[];
    return list.sort((a, b) => b.ts - a.ts).slice(0, 6);
  }, []);

  return (
    <section id="blog" className="w-full py-20 md:py-28 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            From the Blog
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Houston Travel Insights
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Tips, guides, and updates for airport transfers, cruise travel, and luxury ground transportation in Houston — a new post every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-[#101010] border border-white/[0.07] p-8 hover:border-gold/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] text-black bg-[var(--gold)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{post.category}</span>
                <span className="text-[11px] text-white/40 flex items-center gap-1">
                  <Calendar size={12} /> {post.date}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-3">{post.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">{post.excerpt}</p>
              <button
                onClick={() => setOpen(post)}
                className="inline-flex items-center gap-2 text-[var(--gold)] text-[11px] font-bold uppercase tracking-wider hover:text-white transition-colors"
              >
                Read More <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-[#101010] border border-white/10 max-w-3xl w-full my-8 p-8 md:p-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(null)}
              aria-label="Close article"
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X size={22} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] text-black bg-[var(--gold)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{open.category}</span>
              <span className="text-[11px] text-white/40 flex items-center gap-1">
                <Calendar size={12} /> {open.date}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">{open.title}</h3>
            <div
              className="text-white/70 text-sm md:text-base leading-relaxed space-y-4 [&_h2]:text-white [&_h2]:font-serif [&_h2]:text-xl [&_h2]:mt-6 [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: open.content }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;
