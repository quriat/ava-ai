import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Calendar, Clock, Phone } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { COMPANY_INFO } from '../data/avalimoData';

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

const SITE = 'https://avalimo.net';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: object | null) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = id;
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** Renders /blog (index) and /blog/:slug (single article). Returns null if path is not a blog path. */
const BlogArticle: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const path = window.location.pathname.replace(/\/+$/, '');
  const slug = path.startsWith('/blog/') ? decodeURIComponent(path.slice('/blog/'.length)) : null;

  useEffect(() => {
    fetch('/blog_posts.json')
      .then(res => res.json())
      .then((data: BlogPost[]) => {
        setPosts([...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const post = slug ? posts.find(p => p.slug === slug) : null;

  useEffect(() => {
    if (loading) return;
    if (slug && post) {
      const desc = post.summary?.slice(0, 160) || '';
      document.title = `${post.title} | AvaLimo Houston Blog`;
      setMeta('description', desc);
      setCanonical(`${SITE}/blog/${post.slug}`);
      setMeta('og:title', post.title, 'property');
      setMeta('og:description', desc, 'property');
      setMeta('og:url', `${SITE}/blog/${post.slug}`, 'property');
      setMeta('og:type', 'article', 'property');
      setMeta('twitter:title', post.title);
      setMeta('twitter:description', desc);
      setJsonLd('ld-article', {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: desc,
        datePublished: post.date,
        dateModified: post.date,
        author: { '@type': 'Organization', name: 'AvaLimo Houston', url: SITE },
        publisher: {
          '@type': 'Organization',
          name: 'AvaLimo Houston',
          logo: { '@type': 'ImageObject', url: `${SITE}/og-image.jpg` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${post.slug}` },
        image: `${SITE}/og-image.jpg`,
      });
    } else if (!slug) {
      document.title = 'Houston Travel Insights & Luxury Transport Blog | AvaLimo Houston';
      setMeta('description', 'Guides, tips, and updates on Houston airport transfers, Galveston cruise travel, corporate chauffeur service, and luxury ground transportation from AvaLimo.');
      setCanonical(`${SITE}/blog`);
      setJsonLd('ld-article', null);
    }
    return () => setJsonLd('ld-article', null);
  }, [loading, slug, post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    );
  }

  // /blog/:slug not found -> back to index
  if (slug && !post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Article not found</h1>
          <p className="text-white/60 mb-8">This post may have moved. Browse our latest Houston travel insights.</p>
          <a href="/blog" className="inline-flex items-center gap-2 text-[var(--gold)] font-bold uppercase tracking-wider text-sm">
            <ArrowLeft size={16} /> All Articles
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  // Single article view
  if (post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-24 md:py-32">
          <a href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--gold)] text-xs font-bold uppercase tracking-wider mb-8 transition-colors">
            <ArrowLeft size={14} /> All Articles
          </a>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] text-black bg-[var(--gold)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{post.cat}</span>
            <span className="text-[11px] text-white/40 flex items-center gap-1"><Calendar size={12} /> {formatDate(post.date)}</span>
            <span className="text-[11px] text-white/40 flex items-center gap-1"><Clock size={12} /> {post.read}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">{post.title}</h1>
          <article
            className="blog-content text-white/75 leading-relaxed space-y-5 [&_p]:mb-5 [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-white/75 [&_strong]:text-white [&_a]:text-[var(--gold)]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className="mt-14 p-8 rounded-2xl bg-luxury border border-gold/20 text-center">
            <h2 className="text-xl font-serif font-bold text-white mb-3">Ready to ride in style?</h2>
            <p className="text-white/60 text-sm mb-6">Book your Houston chauffeur or airport transfer with AvaLimo — 24/7 dispatch.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="inline-flex items-center justify-center gap-2 border-2 border-gold/40 text-[var(--gold)] px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase hover:bg-[var(--gold)] hover:text-black transition-all">
                <Phone size={14} /> Call {COMPANY_INFO.phone}
              </a>
              <a href="/#booking-section" className="inline-flex items-center justify-center gap-2 gold-gradient text-black px-6 py-3 rounded-full text-xs font-extrabold tracking-wider uppercase">
                Book Online <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // /blog index view
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="text-center mb-16">
          <span className="text-[var(--gold)] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">From the Blog</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Houston Travel Insights</h1>
          <p className="text-white/60 max-w-2xl mx-auto">Tips, guides, and updates for airport transfers, cruise travel, and luxury ground transportation in Houston.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(p => (
            <article key={p.slug} className="bg-luxury border border-white/5 rounded-2xl p-8 hover:border-gold/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] text-black bg-[var(--gold)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{p.cat}</span>
                <span className="text-[11px] text-white/40 flex items-center gap-1"><Calendar size={12} /> {formatDate(p.date)}</span>
              </div>
              <h2 className="text-lg font-serif font-bold text-white mb-3">
                <a href={`/blog/${p.slug}`} className="hover:text-[var(--gold)] transition-colors">{p.title}</a>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">{p.summary}</p>
              <a href={`/blog/${p.slug}`} className="inline-flex items-center gap-2 text-[var(--gold)] text-[11px] font-bold uppercase tracking-wider hover:text-white transition-colors">
                Read More <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogArticle;
