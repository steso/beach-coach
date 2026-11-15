#!/usr/bin/env python3
"""Embed canonical content so index.html is also usable directly from disk."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
data = json.loads((root / 'library.json').read_text())
page = root / 'index.html'
html = page.read_text()
for constant, value, next_marker in [
    ('SEED_LIB', data['library'], 'const SEED_PLAN='),
    ('EXTRA_PLANS', data['plans'], 'SEED_PLAN.push'),
]:
    replacement = f'const {constant}=' + json.dumps(value, ensure_ascii=False, indent=2) + ';\n'
    html, count = re.subn(rf'const {constant}=.*?;\n(?={re.escape(next_marker)})', lambda _: replacement, html, flags=re.S)
    if count != 1:
        raise SystemExit(f'Expected one {constant} block, found {count}')
page.write_text(html)
