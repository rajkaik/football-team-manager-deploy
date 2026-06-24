"""Minimal pitch drawing for heatmaps and pass maps (matplotlib)."""
from __future__ import annotations

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle

from common import PitchModel


def draw_pitch(ax, pitch: PitchModel):
    L, W = pitch.length, pitch.width
    ax.add_patch(Rectangle((0, 0), L, W, fill=False, ec="white", lw=2))
    ax.plot([L / 2, L / 2], [0, W], color="white", lw=2)
    ax.add_patch(Circle((L / 2, W / 2), 9.15, fill=False, ec="white", lw=2))
    ax.add_patch(Circle((L / 2, W / 2), 0.4, color="white"))
    pa_w = 40.32
    for x0, anchor in ((0, "left"), (L - 16.5, "right")):
        ax.add_patch(Rectangle((x0, (W - pa_w) / 2), 16.5, pa_w,
                               fill=False, ec="white", lw=2))
        ga = 18.32
        gx = 0 if anchor == "left" else L - 5.5
        ax.add_patch(Rectangle((gx, (W - ga) / 2), 5.5, ga, fill=False, ec="white", lw=2))
    ax.set_xlim(-3, L + 3)
    ax.set_ylim(-3, W + 3)
    ax.set_aspect("equal")
    ax.set_facecolor("#2e7d32")
    ax.invert_yaxis()  # match image convention (y grows downward)
    ax.set_xticks([])
    ax.set_yticks([])
