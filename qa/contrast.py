"""WCAG contrast of the jelly's label against its body in both themes, from qa/out/leg-*.png (each image is exactly the button).
Samples the band through the middle (30-70% across, clear of the eyes; 32-68% down), splits it into its darkest
and brightest sevenths (letters and body, whichever is which) and reports the ratio of their average colours.
    python3 qa/contrast.py [tag]"""
import struct, sys, zlib

def readpng(p):
    d = open(p, 'rb').read(); i = 8; idat = b''
    while i < len(d):
        l = struct.unpack('>I', d[i:i + 4])[0]; t = d[i + 4:i + 8]; c = d[i + 8:i + 8 + l]
        if t == b'IHDR': w, h, bd, ct = struct.unpack('>IIBB', c[:10]); ch = 3 if ct == 2 else 4
        if t == b'IDAT': idat += c
        i += 12 + l
    raw = zlib.decompress(idat); stride = w * ch; rows = []; prev = bytearray(stride); o = 0
    for y in range(h):
        f = raw[o]; o += 1; line = bytearray(raw[o:o + stride]); o += stride
        for x in range(stride):
            a = line[x - ch] if x >= ch else 0; b = prev[x]; c = prev[x - ch] if x >= ch else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                pp = a + b - c; pa = abs(pp - a); pb = abs(pp - b); pc = abs(pp - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line); prev = line
    return w, h, ch, rows

def lum(p):
    f = lambda c: (c / 255) / 12.92 if c / 255 <= 0.03928 else ((c / 255 + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2])

tag = sys.argv[1] if len(sys.argv) > 1 else ''
for theme in ['light', 'dark']:
  for scale in ['auto', '1']:
    for fl in ['pumpkin', 'slime', 'blood', 'plum']:
        w, h, ch, rows = readpng(f'qa/out/leg-{theme}-{fl}-{scale}{tag}.png')
        px = [(rows[y][x * ch], rows[y][x * ch + 1], rows[y][x * ch + 2])
              for y in range(int(h * 0.32), int(h * 0.68)) for x in range(int(w * 0.3), int(w * 0.7))]
        L = sorted(px, key=lum); n = max(1, len(L) // 7)
        avg = lambda a: [round(sum(p[i] for p in a) / len(a)) for i in range(3)]
        A, B = avg(L[:n]), avg(L[-n:])
        lo, hi = sorted([lum(A), lum(B)])
        r = (hi + 0.05) / (lo + 0.05)
        print(f'{theme:5} {fl:8} scale {scale:4}  dark {str(A):16} light {str(B):16} {r:4.1f}:1  {"ok" if r >= 4.5 else "LOW"}')
