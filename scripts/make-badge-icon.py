"""Generate public/icons/badge-96.png — the monochrome status-bar icon Android
shows for push notifications (it renders only the alpha channel).
Source: KiwiChurch_Old_White.png (white logo on transparent). Requires Pillow.
Run: python scripts/make-badge-icon.py
"""
from PIL import Image

SRC = 'KiwiChurch_Old_White.png'
OUT = 'public/icons/badge-96.png'
SIZE = 96
PAD = 6

im = Image.open(SRC).convert('RGBA')
im = im.crop(im.getchannel('A').getbbox())
side = max(im.size)
square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
square.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
inner = square.resize((SIZE - 2 * PAD, SIZE - 2 * PAD), Image.LANCZOS)
out = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
# Force pure white; keep the logo's alpha as the shape.
white = Image.new('RGBA', inner.size, (255, 255, 255, 255))
white.putalpha(inner.getchannel('A'))
out.paste(white, (PAD, PAD))
out.save(OUT)
print('wrote', OUT)
