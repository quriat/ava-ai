import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Newspaper, Phone } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';

const AUTHOR_LINE = 'AvaLimo Houston Chauffeur Team';

export const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<{ slug: string; title: string; summary: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog?limit=all')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[85vh] pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
      <div className="mb-12">
        <div className="inline-flex items-center space-x-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">
          <Newspaper size={14} />
          <span>AvaLimo Journal</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold mb-4">Houston Travel Blog & Guides</h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
          Airport transfer tips, event transportation guides and everything Houston — from your chauffeur team.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-500 text-sm">No posts yet — check back soon.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center text-[11px] text-gray-500 mb-3">
                  <CalendarDays size={12} className="mr-1.5 text-amber-500" />
                  {post.date || 'Latest'}
                </div>
                <h2 className="text-lg font-serif font-bold text-white mb-3 group-hover:text-amber-400 transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">{post.summary}</p>
              </div>
              <div className="mt-5 text-amber-400 text-xs font-bold uppercase tracking-wider">Read Article →</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

interface BlogPostPageProps {
  slug: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
  const [post, setPost] = useState<{ title: string; summary: string; content: string; date: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
      .then((d) => setPost(d.post || null))
      .catch(() => setNotFound(true));
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-[85vh] pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-white">
      <a
        href="/blog"
        className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-amber-400 hover:text-amber-300 mb-8"
      >
        <ArrowLeft size={14} className="mr-1.5" />
        Back to all posts
      </a>

      {notFound && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-serif font-bold mb-3">Post not found</h1>
          <p className="text-gray-400 text-sm">This article may have been moved. Browse all posts instead.</p>
        </div>
      )}

      {post && (
        <article>
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <CalendarDays size={13} className="mr-1.5 text-amber-500" />
            {post.date || 'Latest'} <span className="mx-2">•</span> {AUTHOR_LINE}
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight mb-5">{post.title}</h1>
          <p className="text-amber-300/90 text-base sm:text-lg font-light leading-relaxed border-l-2 border-amber-500/50 pl-4 mb-10">
            {post.summary}
          </p>

          <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="mt-14 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg mb-1">Need a chauffeur in Houston?</h3>
              <p className="text-gray-400 text-xs">Flat rates, flight tracking, 24/7 dispatch — we handle the rest.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <a
                href="/#booking-section"
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-lg transition-colors text-center"
              >
                Book a Ride
              </a>
              <a
                href={`tel:+18329176331`}
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-200 hover:text-amber-300 text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-lg transition-colors text-center inline-flex items-center justify-center"
              >
                <Phone size={13} className="mr-1.5" />
                AI Line
              </a>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
