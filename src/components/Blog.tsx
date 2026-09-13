import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

const posts = [
  {
    id: 1,
    title: 'How to Book a Reliable Houston Airport Car Service',
    excerpt: 'Avoid rideshare surprises. Learn why flat-rate black car service is the smart choice for IAH and Hobby airport pickups.',
    date: 'September 2026',
    category: 'Airport Tips',
    slug: '#'
  },
  {
    id: 2,
    title: 'Galveston Cruise Transfer Guide 2026',
    excerpt: 'Everything you need to know about private transfers from Houston airports and hotels to the Port of Galveston cruise terminals.',
    date: 'August 2026',
    category: 'Cruise Travel',
    slug: '#'
  },
  {
    id: 3,
    title: 'Why Corporate Executives Choose AvaLimo',
    excerpt: 'Confidentiality, punctuality, and mobile office amenities make AvaLimo the preferred executive car service in Houston.',
    date: 'July 2026',
    category: 'Corporate',
    slug: '#'
  }
];

const Blog: React.FC = () => {
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
          {posts.map((post) => (
            <article key={post.id} className="bg-luxury border border-white/5 rounded-2xl p-8 hover:border-gold/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] text-black bg-[var(--gold)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{post.category}</span>
                <span className="text-[11px] text-white/40 flex items-center gap-1">
                  <Calendar size={12} /> {post.date}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-3">{post.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">{post.excerpt}</p>
              <a href={post.slug} className="inline-flex items-center gap-2 text-[var(--gold)] text-[11px] font-bold uppercase tracking-wider hover:text-white transition-colors">
                Read More <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
