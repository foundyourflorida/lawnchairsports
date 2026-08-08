#!/usr/bin/env python3
"""Refresh data/videos.json from the Lawn Chair Sports YouTube channel.

Scrapes the channel's /videos and /shorts tabs (first page of each, ~30 items)
and merges view counts from the channel RSS feed where available.

Run whenever a new video drops:
    python3 update-videos.py
"""
import json, re, urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

CHANNEL_HANDLE = 'LawnChairSports'
CHANNEL_ID = 'UC9mL7yxBnKp9Aw14iL6pKtg'
ROOT = Path(__file__).parent
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')


def yt_initial_data(page_html):
    m = re.search(r'var ytInitialData = ({.*?});</script>', page_html, re.DOTALL)
    if not m:
        m = re.search(r'ytInitialData"?\s*[=:]\s*({.*?});', page_html, re.DOTALL)
    return json.loads(m.group(1)) if m else None


def walk(node, key, out):
    """Collect every dict under `node` containing `key`."""
    if isinstance(node, dict):
        if key in node:
            out.append(node[key])
        for v in node.values():
            walk(v, key, out)
    elif isinstance(node, list):
        for v in node:
            walk(v, key, out)


def text_of(runs_obj):
    if not runs_obj:
        return ''
    if 'simpleText' in runs_obj:
        return runs_obj['simpleText']
    return ''.join(r.get('text', '') for r in runs_obj.get('runs', []))


def scrape_videos_tab():
    """Long-form videos from the /videos tab (2026 lockupViewModel format,
    with videoRenderer fallback for the older layout)."""
    data = yt_initial_data(fetch(f'https://www.youtube.com/@{CHANNEL_HANDLE}/videos'))
    if not data:
        return []
    vids = []
    found = []
    walk(data, 'lockupViewModel', found)
    for lv in found:
        if lv.get('contentType') not in (None, 'LOCKUP_CONTENT_TYPE_VIDEO'):
            continue
        vid = lv.get('contentId')
        md = lv.get('metadata', {}).get('lockupMetadataViewModel', {})
        title = (md.get('title') or {}).get('content', '')
        views = published = ''
        rows = (md.get('metadata', {}).get('contentMetadataViewModel', {}) or {}).get('metadataRows', [])
        for row in rows:
            parts = [p.get('text', {}).get('content', '') for p in row.get('metadataParts', [])]
            for p in parts:
                if 'view' in p:
                    views = p
                elif 'ago' in p or 'Streamed' in p:
                    published = p
        duration = ''
        overlays = (lv.get('contentImage', {}).get('thumbnailViewModel', {}) or {}).get('overlays', [])
        for ov in overlays:
            for badge in ov.get('thumbnailBottomOverlayViewModel', {}).get('badges', []):
                t = badge.get('thumbnailBadgeViewModel', {}).get('text', '')
                if re.match(r'^[\d:]+$', t):
                    duration = t
        if vid:
            vids.append({'id': vid, 'title': title, 'published': published,
                         'views': views, 'duration': duration, 'kind': 'video'})
    if not vids:  # older layout fallback
        found = []
        walk(data, 'videoRenderer', found)
        for v in found:
            if v.get('videoId'):
                vids.append({'id': v['videoId'], 'title': text_of(v.get('title')),
                             'published': text_of(v.get('publishedTimeText')),
                             'views': text_of(v.get('viewCountText')),
                             'duration': text_of(v.get('lengthText')), 'kind': 'video'})
    return vids


def scrape_shorts_tab():
    """Shorts from the /shorts tab (shortsLockupViewModel or reelItemRenderer)."""
    data = yt_initial_data(fetch(f'https://www.youtube.com/@{CHANNEL_HANDLE}/shorts'))
    if not data:
        return []
    shorts = []
    found = []
    walk(data, 'shortsLockupViewModel', found)
    for s in found:
        try:
            vid = s['onTap']['innertubeCommand']['reelWatchEndpoint']['videoId']
        except (KeyError, TypeError):
            vid = None
        title = (s.get('overlayMetadata', {}).get('primaryText', {}) or {}).get('content', '')
        views = (s.get('overlayMetadata', {}).get('secondaryText', {}) or {}).get('content', '')
        if vid:
            shorts.append({'id': vid, 'title': title, 'published': '', 'views': views, 'duration': '', 'kind': 'short'})
    if not shorts:
        found = []
        walk(data, 'reelItemRenderer', found)
        for s in found:
            shorts.append({
                'id': s.get('videoId'),
                'title': text_of(s.get('headline')),
                'published': '', 'views': text_of(s.get('viewCountText')),
                'duration': '', 'kind': 'short',
            })
    return [s for s in shorts if s['id']]


def rss_dates():
    """videoId -> ISO date + view count from the channel RSS feed (latest 15)."""
    ns = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015',
          'media': 'http://search.yahoo.com/mrss/'}
    raw = fetch(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}')
    (ROOT / 'data' / 'youtube.xml').write_text(raw)
    root = ET.fromstring(raw)
    info = {}
    for e in root.findall('a:entry', ns):
        vid = e.findtext('yt:videoId', namespaces=ns)
        stats = e.find('media:group/media:community/media:statistics', ns)
        info[vid] = {
            'date': (e.findtext('a:published', namespaces=ns) or '')[:10],
            'views_exact': stats.get('views') if stats is not None else None,
        }
    return info


def main():
    print('Scraping videos tab…')
    videos = scrape_videos_tab()
    print(f'  {len(videos)} long-form videos')
    print('Scraping shorts tab…')
    shorts = scrape_shorts_tab()
    print(f'  {len(shorts)} shorts')
    print('Fetching RSS for exact dates…')
    extra = rss_dates()

    all_items, seen = [], set()
    for v in videos + shorts:
        if v['id'] in seen:
            continue
        seen.add(v['id'])
        v['thumbnail'] = f'https://i.ytimg.com/vi/{v["id"]}/hqdefault.jpg'
        v['thumbnail_hd'] = f'https://i.ytimg.com/vi/{v["id"]}/maxresdefault.jpg'
        v['url'] = f'https://www.youtube.com/watch?v={v["id"]}'
        if v['id'] in extra:
            v['date'] = extra[v['id']]['date']
            if extra[v['id']]['views_exact']:
                v['views_exact'] = extra[v['id']]['views_exact']
        all_items.append(v)

    out = {'channel': {'handle': CHANNEL_HANDLE, 'id': CHANNEL_ID,
                       'url': f'https://www.youtube.com/@{CHANNEL_HANDLE}'},
           'videos': all_items}
    (ROOT / 'data' / 'videos.json').write_text(json.dumps(out, indent=1))
    print(f'✅ Wrote {len(all_items)} items to data/videos.json')
    for v in all_items[:5]:
        print(f'   [{v["kind"]}] {v["title"][:60]} | {v.get("published") or v.get("date", "")} | {v["views"]}')


if __name__ == '__main__':
    main()
