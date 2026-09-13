import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

interface BlogPost {
  id: number;
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
      .then(res => res.json())
      .then((data: BlogPost[]) => {
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(sorted.slice(0, 3));
      })
      .catch(err => {
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
    <section id="blog" className="w-full py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            From the Blog
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Houston Travel Insights
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Tips, guides, and updates for airport transfers, cruise travel, and luxury ground transportation in Houston.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center text-white/40 text-sm">Loading latest posts…</div>
          ) : posts.length === 0 ? (
            <div className="col-span-3 text-center text-white/40 text-sm">No blog posts available.</div>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="bg-luxury border border-white/5 rounded-2xl p-8 hover:border-gold/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] text-black bg-[var(--gold)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{post.cat}</span>
                  <span className="text-[11px] text-white/40 flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(post.date)}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-3">{post.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">{post.summary}</p>
                <a href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[var(--gold)] text-[11px] font-bold uppercase tracking-wider hover:text-white transition-colors">
                  Read More <ArrowRight size={14} />
                </a>
              </article>
            ))
          )}
        </div>

        <div className="text-center mt-14">
          <a href="/blog" className="inline-flex items-center gap-2 border-2 border-gold/40 text-[var(--gold)] px-8 py-3 rounded-full text-[11px] font-extrabold tracking-[0.2em] uppercase hover:bg-[var(--gold)] hover:text-black transition-all">
            View All Articles <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;
