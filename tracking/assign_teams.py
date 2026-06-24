"""Stage 5 — team assignment by jersey colour.

Samples player crops across the match, clusters their torso colour with KMeans
into ``teams.n_teams`` groups, then assigns each track to a team by majority
vote over all its appearances. Adds a ``team`` column (0..n-1) to
``player_tracks.csv`` in place.

    python assign_teams.py --video match.mp4 --work work/

Note: from directly overhead, goalkeepers and the referee may land in their own
colour region or get folded into the nearest team — inspect and, if needed,
raise n_teams to separate them.
"""
from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

import cv2
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans

from common import load_config


def torso_colour(frame: np.ndarray, box: tuple[float, float, float, float]) -> np.ndarray | None:
    """Mean HSV of the upper-middle of a bbox (the jersey, avoiding shorts/grass)."""
    x1, y1, x2, y2 = [int(v) for v in box]
    h, w = frame.shape[:2]
    x1, x2 = max(0, x1), min(w, x2)
    y1, y2 = max(0, y1), min(h, y2)
    if x2 - x1 < 3 or y2 - y1 < 4:
        return None
    # Upper 20-55% vertically, central 60% horizontally.
    ty1 = y1 + int(0.20 * (y2 - y1))
    ty2 = y1 + int(0.55 * (y2 - y1))
    tx1 = x1 + int(0.20 * (x2 - x1))
    tx2 = x1 + int(0.80 * (x2 - x1))
    crop = frame[ty1:ty2, tx1:tx2]
    if crop.size == 0:
        return None
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    return hsv.reshape(-1, 3).mean(axis=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--work", default="work")
    ap.add_argument("--config")
    args = ap.parse_args()

    cfg = load_config(args.config)
    n_teams = int(cfg["teams"]["n_teams"])
    sample_frames = int(cfg["teams"]["sample_frames"])
    work = Path(args.work)

    df = pd.read_csv(work / "player_tracks.csv")
    if df.empty:
        raise SystemExit("player_tracks.csv is empty — run detect_track.py first.")

    # Choose evenly spaced frames that actually contain detections.
    frames = sorted(df["frame"].unique())
    pick = set(np.linspace(0, len(frames) - 1, min(sample_frames, len(frames))).astype(int))
    sample_frame_ids = {frames[i] for i in pick}

    cap = cv2.VideoCapture(args.video)
    samples, sample_keys = [], []   # colour vector + (track_id)
    for fid in sorted(sample_frame_ids):
        cap.set(cv2.CAP_PROP_POS_FRAMES, fid)
        ok, frame = cap.read()
        if not ok:
            continue
        for _, r in df[df["frame"] == fid].iterrows():
            col = torso_colour(frame, (r.x1, r.y1, r.x2, r.y2))
            if col is not None:
                samples.append(col)
                sample_keys.append(int(r.track_id))
    cap.release()

    if len(samples) < n_teams:
        raise SystemExit("Not enough colour samples to cluster.")

    X = np.array(samples, dtype=np.float32)
    # Weight hue more than brightness so lighting changes matter less.
    X_scaled = X * np.array([2.0, 1.0, 0.5])
    labels = KMeans(n_clusters=n_teams, n_init=10, random_state=0).fit_predict(X_scaled)

    # Majority team per track id.
    votes: dict[int, Counter] = {}
    for tid, lab in zip(sample_keys, labels):
        votes.setdefault(tid, Counter())[int(lab)] += 1
    track_team = {tid: c.most_common(1)[0][0] for tid, c in votes.items()}

    df["team"] = df["track_id"].map(track_team).fillna(-1).astype(int)
    df.to_csv(work / "player_tracks.csv", index=False)

    counts = df.drop_duplicates("track_id")["team"].value_counts().to_dict()
    print(f"Assigned {len(track_team)} tracks to teams. Players per team: {counts}")
    print("(-1 = track never sampled; rare. Inspect a preview if counts look off.)")


if __name__ == "__main__":
    main()
