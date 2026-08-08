#!/usr/bin/env python3
"""Refresh data/episodes.json from the Lawn Chair Sports RSS feed.

Run this whenever a new episode drops:
    python3 update-episodes.py
"""
import json, re, html, urllib.request
import xml.etree.ElementTree as ET
from difflib import SequenceMatcher
from email.utils import parsedate_to_datetime
from pathlib import Path

FEED_URL = 'https://anchor.fm/s/1091017c4/podcast/rss'
ROOT = Path(__file__).parent
NS = {'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'}


def clean(s):
    if not s:
        return ''
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()


def _norm_title(s):
    s = re.sub(r'\|.*$', '', s)  # drop "| Ep. 51"-style suffixes
    s = re.sub(r'[^a-z0-9 ]', '', s.lower())
    return re.sub(r'\s+', ' ', s).strip()


def _maxres_ok(video_id):
    """True if the video has a real maxresdefault thumbnail."""
    url = f'https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg'
    try:
        req = urllib.request.Request(url, method='HEAD')
        return urllib.request.urlopen(req, timeout=10).status == 200
    except Exception:
        return False


def merge_youtube_art(eps):
    """Match episodes to YouTube videos by title; use the (better) YouTube
    thumbnail as cover art and attach the videoId so the site can offer Watch.
    Needs data/videos.json — run update-videos.py first."""
    vpath = ROOT / 'data' / 'videos.json'
    if not vpath.exists():
        print('⚠️  data/videos.json not found — skipping YouTube art merge '
              '(run update-videos.py first)')
        return
    vids = [v for v in json.loads(vpath.read_text())['videos'] if v['kind'] == 'video']
    matched = 0
    for ep in eps:
        best, score = None, 0.0
        for v in vids:
            r = SequenceMatcher(None, _norm_title(ep['title']), _norm_title(v['title'])).ratio()
            if r > score:
                best, score = v, r
        if best and score >= 0.75:
            quality = 'maxresdefault' if _maxres_ok(best['id']) else 'hqdefault'
            ep['image'] = f'https://i.ytimg.com/vi/{best["id"]}/{quality}.jpg'
            ep['videoId'] = best['id']
            matched += 1
    print(f'🎬 YouTube art: matched {matched} episode(s) to videos')


def main():
    print(f'Fetching {FEED_URL} …')
    raw = urllib.request.urlopen(FEED_URL, timeout=30).read()
    (ROOT / 'data' / 'feed.xml').write_bytes(raw)
    ch = ET.fromstring(raw).find('channel')

    eps = []
    for it in ch.findall('item'):
        dt = parsedate_to_datetime(it.findtext('pubDate'))
        enc = it.find('enclosure')
        dur = it.findtext('itunes:duration', namespaces=NS) or ''
        if dur.isdigit():
            s = int(dur)
            h, r = divmod(s, 3600)
            m, s2 = divmod(r, 60)
            dur = f'{h}:{m:02d}:{s2:02d}' if h else f'{m}:{s2:02d}'
        img = it.find('itunes:image', NS)
        epnum = it.findtext('itunes:episode', namespaces=NS)
        eps.append({
            'title': (it.findtext('title') or '').strip(),
            'date': dt.strftime('%Y-%m-%d'),
            'dateDisplay': dt.strftime('%b %-d, %Y'),
            'description': clean(it.findtext('description'))[:600],
            'duration': dur,
            'audio': enc.get('url') if enc is not None else None,
            'image': img.get('href') if img is not None else None,
            'episode': int(epnum) if epnum else None,
        })

    merge_youtube_art(eps)

    out = {
        'show': {
            'title': ch.findtext('title'),
            'description': clean(ch.findtext('description')),
            'image': ch.find('itunes:image', NS).get('href'),
        },
        'episodes': eps,
    }
    (ROOT / 'data' / 'episodes.json').write_text(json.dumps(out, indent=1))
    print(f'✅ Wrote {len(eps)} episodes to data/episodes.json')
    print(f'   Latest: {eps[0]["title"]}')


if __name__ == '__main__':
    main()
