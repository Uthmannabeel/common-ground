"""Common Ground marks, drawn from the World's own geometry.

The scene is a cone of flame with an arc of lantern posts standing around it,
so the logo is exactly that and nothing else. Flat colour, no gradients, no
stock glow: the same palette the scene ships with.
"""
import math
from PIL import Image, ImageDraw, ImageFont

DUSK = (36, 23, 51)        # dusk sky the World is pinned to
FLAME_OUT = (255, 122, 41)  # scene FLAME albedo #FF7A29
FLAME_IN = (255, 179, 71)   # scene emissive #FFB347
LANTERN = (255, 179, 71)
POST = (74, 55, 40)         # scene POST #4A3728
GROUND = (45, 32, 42)       # the plaza floor, a shade warmer than the sky
CREAM = (243, 233, 220)     # scene INK #F3E9DC
DIM = (150, 132, 150)

S = 4  # supersample


def cone(d, cx, base_y, half_w, height, outer, inner):
    """The campfire: a cone, as the scene renders it."""
    d.polygon([(cx, base_y - height), (cx - half_w, base_y), (cx + half_w, base_y)], fill=outer)
    d.polygon(
        [(cx, base_y - height * 0.62), (cx - half_w * 0.44, base_y), (cx + half_w * 0.44, base_y)],
        fill=inner,
    )


def lantern(d, x, ground_y, head, post_h, post_w):
    """One answer someone left: a lit head on a thin post."""
    d.rectangle([x - post_w / 2, ground_y - post_h, x + post_w / 2, ground_y], fill=POST)
    d.rectangle(
        [x - head / 2, ground_y - post_h - head, x + head / 2, ground_y - post_h], fill=LANTERN
    )


def lantern_arc(d, cx, cy, rx, ry, count, k):
    """Lanterns standing in one arc behind the fire, on the plaza floor.

    They sit on the back half of the floor ellipse, so the ones furthest away
    are higher on screen and smaller -- the arc the scene actually builds.
    """
    # Spaced evenly across the width, not by angle: equal angles crowd the
    # ellipse's extremes and the outer lanterns collide.
    pts = []
    for i in range(count):
        u = -0.93 + 1.86 * (i / (count - 1))
        x = cx + rx * u
        y = cy - ry * math.sqrt(max(0.0, 1 - u * u))
        pts.append((x, y))
    for x, y in sorted(pts, key=lambda p: p[1]):
        depth = (y - (cy - ry)) / ry          # 0 at the far centre, 1 at the sides
        f = k * (0.70 + 0.42 * depth)
        lantern(d, x, y, head=30 * f, post_h=52 * f, post_w=7.5 * f)


def floor(d, cx, cy, rx, ry, fill):
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=fill)


def font(name, size):
    for candidate in (name, "georgia.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(rf"C:\Windows\Fonts\{candidate}", size)
        except OSError:
            continue
    return ImageFont.load_default()


def text_w(d, s, f, tracking=0):
    return sum(d.textlength(ch, font=f) + tracking for ch in s) - tracking


def tracked(d, s, f, cx, y, fill, tracking):
    x = cx - text_w(d, s, f, tracking) / 2
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + tracking


def square(size=512):
    W = size * S
    im = Image.new("RGB", (W, W), DUSK)
    d = ImageDraw.Draw(im)
    cx, cy = W / 2, W * 0.655
    k = S * (size / 512)
    floor(d, cx, cy, W * 0.40, W * 0.145, GROUND)
    lantern_arc(d, cx, cy, W * 0.335, W * 0.122, 7, k)
    cone(d, cx, cy + W * 0.055, W * 0.132, W * 0.435, FLAME_OUT, FLAME_IN)
    return im.resize((size, size), Image.LANCZOS)


def cover(w=1200, h=630):
    W, H = w * S, h * S
    im = Image.new("RGB", (W, H), DUSK)
    d = ImageDraw.Draw(im)
    cx, cy = W * 0.235, H * 0.615
    k = S * (w / 1200) * 1.05
    floor(d, cx, cy, W * 0.175, H * 0.125, GROUND)
    lantern_arc(d, cx, cy, W * 0.147, H * 0.105, 7, k)
    cone(d, cx, cy + H * 0.048, W * 0.055, H * 0.375, FLAME_OUT, FLAME_IN)

    tx = W * 0.635
    title = font("georgiab.ttf", int(H * 0.115))
    sub = font("georgia.ttf", int(H * 0.049))
    small = font("georgia.ttf", int(H * 0.038))
    tracked(d, "COMMON", title, tx, H * 0.285, CREAM, W * 0.004)
    tracked(d, "GROUND", title, tx, H * 0.285 + H * 0.135, CREAM, W * 0.004)
    tracked(d, "A campfire plaza built out of", sub, tx, H * 0.575, CREAM, W * 0.0008)
    tracked(d, "what strangers share", sub, tx, H * 0.575 + H * 0.068, CREAM, W * 0.0008)
    tracked(d, "commonground.dcl.eth", small, tx, H * 0.755, DIM, W * 0.0022)
    return im.resize((w, h), Image.LANCZOS)


if __name__ == "__main__":
    out = r"C:\Users\Nabeel Uthman\Downloads"
    square(512).save(rf"{out}\commonground-logo.png", optimize=True)
    square(1024).save(rf"{out}\commonground-logo-1024.png", optimize=True)
    cover().save(rf"{out}\commonground-cover.png", optimize=True)
    print("wrote commonground-logo.png (512), commonground-logo-1024.png, commonground-cover.png")
