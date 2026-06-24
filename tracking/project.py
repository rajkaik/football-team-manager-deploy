"""Stage 7 — project image coords to pitch metres + smooth trajectories.

Applies the calibrated homography to each player's foot point and the ball
centre, then smooths each trajectory (Savitzky-Golay) to remove pixel jitter
before speed/distance are computed.

    python project.py --work work/

Writes:
  positions.csv       frame, track_id, team, x, y     (metres)
  ball_positions.csv  frame, x, y, interpolated        (metres)
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.signal import savgol_filter

from common import PitchModel, apply_homography, load_config, load_homography


def smooth_series(values: np.ndarray, window: int, poly: int) -> np.ndarray:
    """Savitzky-Golay smoothing, gracefully shrinking the window for short tracks."""
    n = len(values)
    if n < poly + 2:
        return values
    win = min(window, n if n % 2 == 1 else n - 1)
    if win <= poly:
        return values
    if win % 2 == 0:
        win -= 1
    return savgol_filter(values, win, poly)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", default="work")
    ap.add_argument("--config")
    args = ap.parse_args()

    cfg = load_config(args.config)
    pitch = PitchModel(**cfg["pitch"])
    pcfg = cfg["projection"]
    work = Path(args.work)

    H = load_homography(work)

    # --- players ---
    players = pd.read_csv(work / "player_tracks.csv")
    if "team" not in players.columns:
        players["team"] = -1
    xy = apply_homography(H, players[["cx", "cy"]].to_numpy())
    players["x"], players["y"] = xy[:, 0], xy[:, 1]

    out = []
    for tid, g in players.sort_values("frame").groupby("track_id"):
        g = g.copy()
        g["x"] = smooth_series(g["x"].to_numpy(), pcfg["smoothing_window"], pcfg["smoothing_polyorder"])
        g["y"] = smooth_series(g["y"].to_numpy(), pcfg["smoothing_window"], pcfg["smoothing_polyorder"])
        out.append(g[["frame", "track_id", "team", "x", "y"]])
    pos = pd.concat(out, ignore_index=True)
    # Clip to a small margin outside the pitch (keeps throw-ins, drops wild outliers).
    pos["x"] = pos["x"].clip(-5, pitch.length + 5)
    pos["y"] = pos["y"].clip(-5, pitch.width + 5)
    pos.sort_values(["frame", "track_id"]).to_csv(work / "positions.csv", index=False)

    # --- ball ---
    ball_csv = work / "ball_track.csv"
    if ball_csv.exists():
        ball = pd.read_csv(ball_csv)
        if not ball.empty:
            bxy = apply_homography(H, ball[["bx", "by"]].to_numpy())
            ball["x"], ball["y"] = bxy[:, 0], bxy[:, 1]
            ball = ball.sort_values("frame")
            ball["x"] = smooth_series(ball["x"].to_numpy(), pcfg["smoothing_window"], pcfg["smoothing_polyorder"])
            ball["y"] = smooth_series(ball["y"].to_numpy(), pcfg["smoothing_window"], pcfg["smoothing_polyorder"])
            ball[["frame", "x", "y", "interpolated"]].to_csv(work / "ball_positions.csv", index=False)
            print(f"Projected {len(ball)} ball frames.")
    print(f"Projected {len(pos)} player rows for {pos['track_id'].nunique()} tracks.")


if __name__ == "__main__":
    main()
