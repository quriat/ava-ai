import React, { useEffect, useState } from 'react';
import { Newspaper, ArrowRight, CalendarDays, ChevronRight } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  date: string;
}

const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('blog unavailable'))))
      .then((d) => setPosts((d.posts || []).slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-neutral-950 text-white relative" id="blog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-2">
              <Newspaper size={14} />
              <span>AvaLimo Journal</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
              Houston Travel Insights & Guides
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
              Airport transfer tips, event transportation guides and everything Houston — from your chauffeur team.
            </p>
          </div>
          <a
            href="/blog"
            className="flex items-center text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/60 px-5 py-3 rounded transition-all whitespace-nowrap"
          >
            Read All Posts
            <ArrowRight size={14} className="ml-2" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center text-[11px] text-gray-500 mb-3">
                  <CalendarDays size={12} className="mr-1.5 text-amber-500" />
                  {post.date || 'Latest'}
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-3 group-hover:text-amber-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>
              <div className="mt-5 flex items-center text-amber-400 text-xs font-bold uppercase tracking-wider">
                Read Article
                <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
