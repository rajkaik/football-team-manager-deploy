"""Smoke test for the GPU-free half of the pipeline.

Synthesises player + ball tracks and a known homography, then runs
project -> possession -> analytics end-to-end and checks the outputs are
sane. This exercises the real modules (no video, no YOLO, no GPU) so the
projection/possession/analytics maths is verified in CI.

    python tracking/tests/test_smoke.py
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
PKG = HERE.parent

SCALE = 10.0          # pixels per metre
N_FRAMES = 300
TEAM0 = [0, 1, 2, 3, 4]
TEAM1 = [5, 6, 7, 8, 9]


def synth_players():
    """10 players drifting slowly around base positions (in metres)."""
    rng = np.random.default_rng(0)
    bases = {tid: (15 + 8 * (tid % 5), 12 + 11 * (tid // 5)) for tid in TEAM0 + TEAM1}
    rows = []
    px_by_track_frame = {}
    for f in range(N_FRAMES):
        for tid, (bx, by) in bases.items():
            # slow sinusoidal drift, <0.4 m/frame so speed stays plausible
            x = bx + 3.0 * np.sin(0.02 * f + tid)
            y = by + 2.0 * np.cos(0.02 * f + tid)
            cx, cy = x * SCALE, y * SCALE
            team = 0 if tid in TEAM0 else 1
            rows.append({"frame": f, "track_id": tid, "cls": "player",
                         "x1": cx - 10, "y1": cy - 30, "x2": cx + 10, "y2": cy,
                         "cx": cx, "cy": cy, "conf": 0.9, "team": team})
            px_by_track_frame[(tid, f)] = (cx, cy)
    return pd.DataFrame(rows), px_by_track_frame


def synth_ball(px):
    """Ball glued to a controller: track0 -> track1 (pass) -> track5 (turnover)."""
    segments = [(0, 99, 0), (110, 199, 1), (210, 299, 5)]
    rows = []
    for start, end, tid in segments:
        for f in range(start, end + 1):
            bx, by = px[(tid, f)]
            rows.append({"frame": f, "bx": bx, "by": by, "conf": 0.8, "interpolated": 0})
    return pd.DataFrame(rows)


def run(script, *args):
    subprocess.run([sys.executable, str(PKG / script), *args], check=True)


def main():
    with tempfile.TemporaryDirectory() as td:
        work = Path(td)
        # Homography: pixels -> metres is just 1/SCALE (diagonal).
        H = np.array([[1 / SCALE, 0, 0], [0, 1 / SCALE, 0], [0, 0, 1]])
        np.save(work / "homography.npy", H)

        players, px = synth_players()
        players.to_csv(work / "player_tracks.csv", index=False)
        synth_ball(px).to_csv(work / "ball_track.csv", index=False)

        run("project.py", "--work", str(work))
        run("possession.py", "--work", str(work))
        run("analytics.py", "--work", str(work), "--fps", "25")

        # --- assertions ---
        report = json.loads((work / "report.json").read_text())
        stats = pd.read_csv(work / "player_stats.csv")
        passes = pd.read_csv(work / "passes.csv")

        assert len(stats) == 10, f"expected 10 players, got {len(stats)}"
        assert (stats["distance_km"] > 0).all(), "every player should cover >0 distance"
        assert (stats["distance_km"] < 14).all(), "distances must be within sanity bound"
        assert not report["sanity_flags"], f"unexpected sanity flags: {report['sanity_flags']}"

        poss = report["possession_pct"]
        assert abs(sum(poss.values()) - 100.0) < 0.5, f"possession must sum to 100: {poss}"

        # Two transitions: 0->1 (completed, team0) and 1->5 (turnover team0->team1).
        completed = passes[passes["completed"] == 1]
        turnovers = passes[passes["completed"] == 0]
        assert len(completed) >= 1, "expected a completed pass (track0->track1)"
        assert len(turnovers) >= 1, "expected a turnover (track1->track5)"

        for name in ["heatmap_team0.png", "heatmap_team1.png", "passmap_team0.png"]:
            assert (work / "plots" / name).exists(), f"missing plot {name}"

    print("SMOKE TEST PASSED — projection, possession and analytics all sane.")


if __name__ == "__main__":
    main()
