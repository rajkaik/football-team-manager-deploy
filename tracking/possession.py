"""Stage 7b — possession & passing from ball + player pitch positions.

Per frame, the player nearest the ball (within ``control_radius_m``) is the
controller. Consecutive frames of control by the same player form a control
segment; the transition between two segments is a possession change, which we
classify as a pass:

  same team  -> completed pass
  other team -> turnover (incomplete pass for the losing team)

    python possession.py --work work/

Writes:
  possession.csv  frame, controller_id, team        (-1 team = no controller)
  passes.csv      from_id, to_id, from_team, to_team, completed, start_frame,
                  end_frame, air_frames
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

from common import load_config


def nearest_controller_per_frame(pos: pd.DataFrame, ball: pd.DataFrame, radius: float):
    """For each ball frame, the (track_id, team) nearest within radius, else None."""
    pos_by_frame = {f: g for f, g in pos.groupby("frame")}
    rows = []
    for _, b in ball.iterrows():
        f = int(b["frame"])
        g = pos_by_frame.get(f)
        if g is None or g.empty:
            rows.append((f, -1, -1))
            continue
        d = np.hypot(g["x"].to_numpy() - b["x"], g["y"].to_numpy() - b["y"])
        i = int(np.argmin(d))
        if d[i] <= radius:
            rows.append((f, int(g.iloc[i]["track_id"]), int(g.iloc[i]["team"])))
        else:
            rows.append((f, -1, -1))
    return pd.DataFrame(rows, columns=["frame", "controller_id", "team"])


def control_segments(ctrl: pd.DataFrame, min_frames: int):
    """Collapse per-frame controllers into [id, team, start, end] segments."""
    segs = []
    cur = None
    for _, r in ctrl.iterrows():
        cid = int(r["controller_id"])
        if cid == -1:
            continue
        if cur and cur["id"] == cid:
            cur["end"] = int(r["frame"])
        else:
            if cur and (cur["end"] - cur["start"] + 1) >= min_frames:
                segs.append(cur)
            cur = {"id": cid, "team": int(r["team"]), "start": int(r["frame"]), "end": int(r["frame"])}
    if cur and (cur["end"] - cur["start"] + 1) >= min_frames:
        segs.append(cur)
    return segs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", default="work")
    ap.add_argument("--config")
    args = ap.parse_args()

    cfg = load_config(args.config)
    pc = cfg["possession"]
    work = Path(args.work)

    pos = pd.read_csv(work / "positions.csv")
    ball_csv = work / "ball_positions.csv"
    if not ball_csv.exists():
        raise SystemExit("ball_positions.csv missing — run track_ball.py + project.py.")
    ball = pd.read_csv(ball_csv)
    if ball.empty:
        raise SystemExit("No ball positions — cannot compute possession.")

    ctrl = nearest_controller_per_frame(pos, ball, pc["control_radius_m"])
    ctrl.to_csv(work / "possession.csv", index=False)

    segs = control_segments(ctrl, int(pc["min_control_frames"]))

    passes = []
    for a, b in zip(segs, segs[1:]):
        air = b["start"] - a["end"]
        if air > pc["pass_max_air_frames"]:
            continue  # likely a stoppage/restart, not a single pass
        passes.append({
            "from_id": a["id"], "to_id": b["id"],
            "from_team": a["team"], "to_team": b["team"],
            "completed": int(a["team"] == b["team"]),
            "start_frame": a["end"], "end_frame": b["start"], "air_frames": air,
        })
    pd.DataFrame(passes, columns=["from_id", "to_id", "from_team", "to_team",
                                  "completed", "start_frame", "end_frame", "air_frames"]
                 ).to_csv(work / "passes.csv", index=False)

    # Quick summary.
    held = ctrl[ctrl["team"] >= 0]
    if not held.empty:
        share = held["team"].value_counts(normalize=True).mul(100).round(1).to_dict()
        print(f"Possession % by team: {share}")
    n_comp = sum(p["completed"] for p in passes)
    print(f"{len(segs)} control segments, {len(passes)} passes "
          f"({n_comp} completed, {len(passes) - n_comp} turnovers).")


if __name__ == "__main__":
    main()
