import { useEffect, useState } from 'react';

/**
 * "Houston Now" ticker: a slim, auto-scrolling strip of what is happening in
 * Houston — the next game for each Houston pro team plus the latest local
 * headlines. Both sources allow cross-origin reads, so the strip is live in the
 * browser instead of being frozen at build time:
 * - ESPN public schedule API (Rockets, Astros, Texans, Dynamo, Dash)
 * - Houston Public Media and ABC13 RSS feeds
 *
 * Everything is best-effort: a failed fetch drops that item, and a curated
 * fallback keeps the strip useful when the network or an API is unavailable.
 */

type BuzzItem = {
  kind: 'sport' | 'event' | 'news';
  emoji: string;
  text: string;
  url?: string;
};

const HOUSTON_TZ = 'America/Chicago';
const CACHE_KEY = 'avalimo-houston-buzz-v3';
const CACHE_MS = 30 * 60 * 1000;

const TEAMS = [
  { sport: 'basketball', league: 'nba', id: '10', name: 'Rockets', emoji: '🏀' },
  { sport: 'baseball', league: 'mlb', id: '18', name: 'Astros', emoji: '⚾' },
  { sport: 'football', league: 'nfl', id: '34', name: 'Texans', emoji: '🏈' },
  { sport: 'soccer', league: 'usa.1', id: '6077', name: 'Dynamo', emoji: '⚽' },
  { sport: 'soccer', league: 'usa.nwsl', id: '17346', name: 'Dash', emoji: '⚽' },
];

type Feed = { url: string; limit: number; defaultKind: BuzzItem['kind']; localOnly?: boolean };

const FEEDS: Feed[] = [
  // Local news
  { url: 'https://www.houstonpublicmedia.org/feed/', limit: 4, defaultKind: 'news' },
  { url: 'https://abc13.com/feed/', limit: 3, defaultKind: 'news' },
  // Concerts, festivals, arts and entertainment
  { url: 'https://abc13.com/feed/entertainment/', limit: 3, defaultKind: 'event', localOnly: true },
  { url: 'https://www.houstonpublicmedia.org/tag/arts-culture/feed/', limit: 3, defaultKind: 'event' },
  // Houston sports headlines (game schedules arrive from ESPN above)
  { url: 'https://abc13.com/feed/sports/', limit: 2, defaultKind: 'sport', localOnly: true },
];

const FALLBACK: BuzzItem[] = [
  { kind: 'sport', emoji: '🏀', text: 'Rockets at Toyota Center · Astros at Minute Maid Park · Texans at NRG Stadium' },
  { kind: 'event', emoji: '🎸', text: 'Live music, rodeo and festivals across Houston — plan the ride before the show' },
  { kind: 'news', emoji: '🚗', text: 'Flat-rate IAH & Hobby transfers, 24/7 dispatch: (832) 567-8050' },
];

const truncate = (value: string, max: number) => {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const boundary = cut.lastIndexOf(' ');
  return (boundary > max * 0.6 ? cut.slice(0, boundary) : cut).replace(/[\s,;:.\-–—]+$/, '');
};

const fetchWithTimeout = async (url: string, ms = 7000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers: { Accept: '*/*' } });
  } finally {
    clearTimeout(timer);
  }
};

const whenLabel = (date: Date) => {
  const day = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: HOUSTON_TZ,
  });
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: HOUSTON_TZ,
  });
  return `${day} · ${time}`;
};

const teamBuzz = async (team: (typeof TEAMS)[number]): Promise<BuzzItem | null> => {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${team.sport}/${team.league}/teams/${team.id}/schedule`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) return null;
  const data = await response.json();
  const events = (data.events || []).map((event: any) => {
    const competition = event.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const own = competitors.find((entry: any) => entry.team?.displayName?.includes(team.name));
    const opponent = competitors.find((entry: any) => entry.team?.displayName !== own?.team?.displayName);
    const state = competition.status?.type?.state as string | undefined;
    return {
      date: new Date(event.date),
      state,
      venue: competition.venue?.fullName as string | undefined,
      ownScore: own?.score?.displayValue as string | undefined,
      opponentScore: opponent?.score?.displayValue as string | undefined,
      opponent: (opponent?.team?.shortDisplayName || opponent?.team?.displayName || 'TBD') as string,
      homeAway: own?.homeAway as string | undefined,
    };
  }).filter((event: any) => !Number.isNaN(event.date.getTime()));

  const now = Date.now();
  const live = events.find(
    (event: any) => event.state === 'in' && Math.abs(event.date.getTime() - now) < 24 * 3600 * 1000
  );
  if (live) {
    const score =
      live.ownScore && live.opponentScore ? `${live.ownScore}–${live.opponentScore} ` : '';
    return {
      kind: 'sport',
      emoji: team.emoji,
      text: `${team.name} ${score}vs ${live.opponent} · LIVE`,
    };
  }

  const latestFinal = events
    .filter((event: any) => event.state === 'post' && now - event.date.getTime() < 12 * 3600 * 1000)
    .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())[0];
  if (latestFinal) {
    const score =
      latestFinal.ownScore && latestFinal.opponentScore
        ? `${latestFinal.ownScore}–${latestFinal.opponentScore} `
        : '';
    return {
      kind: 'sport',
      emoji: team.emoji,
      text: `${team.name} ${score}${latestFinal.homeAway === 'home' ? 'vs' : 'at'} ${latestFinal.opponent} · Final`,
    };
  }

  const next = events
    .filter((event: any) => event.date.getTime() > now - 3 * 3600 * 1000 && event.state !== 'post')
    .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())[0];
  if (!next || next.date.getTime() - now > 30 * 24 * 3600 * 1000) return null;
  return {
    kind: 'sport',
    emoji: team.emoji,
    text: `${team.name} ${next.homeAway === 'home' ? 'vs' : 'at'} ${next.opponent} · ${whenLabel(next.date)}${next.venue ? ` · ${next.venue}` : ''}`,
  };
};

const classify = (title: string): { emoji: string; kind: BuzzItem['kind'] } => {
  if (/concert|festival|rodeo|live music|show|tour|theater|theatre|arts|museum|event/i.test(title))
    return { emoji: '🎸', kind: 'event' };
  if (/rockets|astros|texans|dynamo|dash|game|score|playoff|coach|nfl|nba|mlb|soccer/i.test(title))
    return { emoji: '🏟', kind: 'sport' };
  return { emoji: '📰', kind: 'news' };
};

const EMOJI: Record<BuzzItem['kind'], string> = { sport: '🏟', event: '🎸', news: '📰' };
const NOISE = /engines of our ingenuity|weather forecast|traffic alert/i;
const LOCAL = /houston|texas|tx\b|katy|sugar land|galveston|the woodlands|nrg|toyota center|minute maid|downtown|bayou|rockets|astros|texans|dynamo|dash|cougars|owls/i;

const feedBuzz = async (feed: Feed): Promise<BuzzItem[]> => {
  const response = await fetchWithTimeout(feed.url);
  if (!response.ok) return [];
  const xml = new DOMParser().parseFromString(await response.text(), 'text/xml');
  return [...xml.querySelectorAll('item')]
    .slice(0, feed.limit + 2)
    .map((item) => {
      const title = (item.querySelector('title')?.textContent || '')
        .replace(/\s*[-|–]\s*(Houston Public Media|ABC13|abc13\.com).*$/i, '')
        .trim();
      const link = item.querySelector('link')?.textContent?.trim();
      const detected = classify(title);
      // Section feeds know their own topic where the headline does not say it.
      const kind = detected.kind === 'news' ? feed.defaultKind : detected.kind;
      return { kind, emoji: detected.kind === 'news' ? EMOJI[kind] : detected.emoji, text: truncate(title, 96), url: link } as BuzzItem;
    })
    .filter((item) => item.text.length > 20 && !NOISE.test(item.text) && (!feed.localOnly || LOCAL.test(item.text)))
    .slice(0, feed.limit);
};

const collect = async (): Promise<BuzzItem[]> => {
  const [sports, feeds] = await Promise.all([
    Promise.allSettled(TEAMS.map(teamBuzz)),
    Promise.allSettled(FEEDS.map(feedBuzz)),
  ]);

  const sportItems = sports
    .map((result) => (result.status === 'fulfilled' ? result.value : null))
    .filter((item): item is BuzzItem => Boolean(item));

  const seen = new Set<string>();
  const headlineItems = feeds
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .filter((item) => {
      const key = item.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Games first (they are time-sensitive), then events, then news.
  const rank: Record<BuzzItem['kind'], number> = { sport: 0, event: 1, news: 2 };
  const items = [...sportItems, ...headlineItems.sort((a, b) => rank[a.kind] - rank[b.kind])].slice(0, 14);
  return items.length >= 2 ? items : FALLBACK;
};

export default function HoustonBuzz() {
  const [items, setItems] = useState<BuzzItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { at: number; items: BuzzItem[] };
          if (Date.now() - parsed.at < CACHE_MS && Array.isArray(parsed.items) && parsed.items.length) {
            if (!cancelled) setItems(parsed.items);
            return;
          }
        }
      } catch {
        /* storage unavailable — fetch below */
      }

      try {
        const fresh = await collect();
        if (cancelled) return;
        setItems(fresh);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: fresh }));
        } catch {
          /* ignore quota errors */
        }
      } catch {
        if (!cancelled) setItems(FALLBACK);
      }
    };

    const idle = (window as any).requestIdleCallback;
    const handle = idle
      ? idle(() => void load(), { timeout: 2500 })
      : window.setTimeout(() => void load(), 1200);

    return () => {
      cancelled = true;
      if (idle && (window as any).cancelIdleCallback) (window as any).cancelIdleCallback(handle);
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="houston-buzz" role="region" aria-label="What is happening in Houston">
      <span className="houston-buzz-label">
        <span className="houston-buzz-dot" aria-hidden="true" />
        Houston Now
      </span>
      <div className="houston-buzz-viewport">
        <div className="houston-buzz-track">
          {[...items, ...items].map((item, index) =>
            item.url ? (
              <a
                key={`${item.text}-${index}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="houston-buzz-item"
                tabIndex={index >= items.length ? -1 : 0}
                aria-hidden={index >= items.length}
              >
                <span aria-hidden="true">{item.emoji}</span> {item.text}
              </a>
            ) : (
              <span
                key={`${item.text}-${index}`}
                className="houston-buzz-item"
                aria-hidden={index >= items.length}
              >
                <span aria-hidden="true">{item.emoji}</span> {item.text}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
