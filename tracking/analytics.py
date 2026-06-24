"""Stage 9 — analytics & reporting (the deliverable).

Consumes the projected positions, possession and passes and produces:
  - report.json            structured summary (movement, possession, passing)
  - player_stats.csv       per-player distance / speed / time-on-ball
  - plots/heatmap_*.png     per-team position heatmaps
  - plots/passmap_team*.png passing networks (nodes = avg position, edges = volume)

    python analytics.py --work work/ --fps 25

``--fps`` (or config video.fps_override) sets the time scale for speed/distance.
Speeds above analytics.max_speed_kmh are treated as tracking glitches (usually
id switches) and dropped from distance/speed so they don't inflate the numbers.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from common import PitchModel, load_config
from viz import draw_pitch

MS_TO_KMH = 3.6


def player_movement(pos: pd.DataFrame, fps: float, max_speed_kmh: float) -> pd.DataFrame:
    max_ms = max_speed_kmh / MS_TO_KMH
    sprint_ms = 25.0 / MS_TO_KMH  # sprint threshold ~25 km/h
    out = []
    for tid, g in pos.sort_values("frame").groupby("track_id"):
        g = g.reset_index(drop=True)
        df = g["frame"].diff().to_numpy()
        dx = g["x"].diff().to_numpy()
        dy = g["y"].diff().to_numpy()
        dt = df / fps
        step = np.hypot(dx, dy)
        with np.errstate(invalid="ignore", divide="ignore"):
            speed = np.where(dt > 0, step / dt, 0.0)
        valid = (speed * MS_TO_KMH) <= max_speed_kmh  # drop teleports
        valid[0] = False
        dist = float(np.nansum(step[valid]))
        spd = speed[valid]
        out.append({
            "track_id": int(tid),
            "team": int(g["team"].mode().iloc[0]) if not g["team"].mode().empty else -1,
            "frames": int(len(g)),
            "distance_km": round(dist / 1000.0, 3),
            "avg_speed_kmh": round(float(np.nanmean(spd) * MS_TO_KMH), 2) if len(spd) else 0.0,
            "max_speed_kmh": round(float(np.nanmax(spd) * MS_TO_KMH), 2) if len(spd) else 0.0,
            "sprints": int(np.sum(spd > sprint_ms)),
            "avg_x": round(float(g["x"].mean()), 2),
            "avg_y": round(float(g["y"].mean()), 2),
        })
    return pd.DataFrame(out)


def team_shape(pos: pd.DataFrame) -> dict:
    shape = {}
    for team, g in pos.groupby("team"):
        if team < 0:
            continue
        per_frame = g.groupby("frame")[["x", "y"]].mean()
        shape[int(team)] = {
            "centroid_x": round(float(per_frame["x"].mean()), 2),
            "centroid_y": round(float(per_frame["y"].mean()), 2),
            "avg_width_m": round(float(g.groupby("frame")["y"].agg(lambda s: s.max() - s.min()).mean()), 2),
            "avg_depth_m": round(float(g.groupby("frame")["x"].agg(lambda s: s.max() - s.min()).mean()), 2),
        }
    return shape


def heatmap(pos: pd.DataFrame, pitch: PitchModel, team: int, out: Path):
    g = pos[pos["team"] == team]
    fig, ax = plt.subplots(figsize=(8, 5.4))
    draw_pitch(ax, pitch)
    if not g.empty:
        ax.hist2d(g["x"], g["y"], bins=[36, 24],
                  range=[[0, pitch.length], [0, pitch.width]],
                  cmap="hot", alpha=0.6, zorder=2)
    ax.set_title(f"Team {team} position heatmap", color="white")
    fig.savefig(out, dpi=120, bbox_inches="tight", facecolor="#1b1b1b")
    plt.close(fig)


def pass_map(passes: pd.DataFrame, stats: pd.DataFrame, pitch: PitchModel, team: int, out: Path):
    avg = stats.set_index("track_id")[["avg_x", "avg_y"]].to_dict("index")
    tp = passes[(passes["from_team"] == team) & (passes["completed"] == 1)]
    edges = tp.groupby(["from_id", "to_id"]).size().reset_index(name="n")
    fig, ax = plt.subplots(figsize=(8, 5.4))
    draw_pitch(ax, pitch)
    for _, e in edges.iterrows():
        a, b = avg.get(int(e["from_id"])), avg.get(int(e["to_id"]))
        if a and b:
            ax.plot([a["avg_x"], b["avg_x"]], [a["avg_y"], b["avg_y"]],
                    color="cyan", lw=0.5 + 2.0 * e["n"] / edges["n"].max(), alpha=0.7, zorder=2)
    team_ids = stats[stats["team"] == team]["track_id"]
    for tid in team_ids:
        a = avg.get(int(tid))
        if a:
            ax.scatter(a["avg_x"], a["avg_y"], s=260, color="white", edgecolor="black", zorder=3)
            ax.text(a["avg_x"], a["avg_y"], str(int(tid)), ha="center", va="center",
                    fontsize=8, zorder=4)
    ax.set_title(f"Team {team} passing network", color="white")
    fig.savefig(out, dpi=120, bbox_inches="tight", facecolor="#1b1b1b")
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", default="work")
    ap.add_argument("--config")
    ap.add_argument("--fps", type=float)
    args = ap.parse_args()

    cfg = load_config(args.config)
    pitch = PitchModel(**cfg["pitch"])
    acfg = cfg["analytics"]
    work = Path(args.work)
    plots = work / "plots"
    plots.mkdir(exist_ok=True)
    fps = args.fps or cfg["video"]["fps_override"] or 25.0

    pos = pd.read_csv(work / "positions.csv")
    stats = player_movement(pos, fps, acfg["max_speed_kmh"])
    stats.to_csv(work / "player_stats.csv", index=False)

    report: dict = {"fps": fps, "n_tracks": int(pos["track_id"].nunique())}
    report["team_shape"] = team_shape(pos)

    # Per-team heatmaps.
    for team in sorted(t for t in pos["team"].unique() if t >= 0):
        heatmap(pos, pitch, int(team), plots / f"heatmap_team{int(team)}.png")

    # Possession & passing (only if the ball stage ran).
    poss_csv, pass_csv = work / "possession.csv", work / "passes.csv"
    if poss_csv.exists() and pass_csv.exists():
        ctrl = pd.read_csv(poss_csv)
        held = ctrl[ctrl["team"] >= 0]
        report["possession_pct"] = (held["team"].value_counts(normalize=True)
                                    .mul(100).round(1).to_dict()) if not held.empty else {}
        passes = pd.read_csv(pass_csv)
        pass_summary = {}
        for team, g in passes.groupby("from_team"):
            if team < 0:
                continue
            comp = int(g["completed"].sum())
            pass_summary[int(team)] = {
                "attempts": int(len(g)), "completed": comp,
                "completion_pct": round(100 * comp / len(g), 1) if len(g) else 0.0,
            }
            pass_map(passes, stats, pitch, int(team), plots / f"passmap_team{int(team)}.png")
        report["passing"] = pass_summary
    else:
        report["possession_pct"] = report["passing"] = "n/a (ball stage not run)"

    # Sanity flags.
    flags = []
    for _, r in stats.iterrows():
        if r["distance_km"] > acfg["max_match_distance_km"]:
            flags.append(f"track {int(r.track_id)} distance {r.distance_km} km exceeds bound")
        if r["max_speed_kmh"] > acfg["max_speed_kmh"]:
            flags.append(f"track {int(r.track_id)} max speed {r.max_speed_kmh} km/h exceeds bound")
    report["sanity_flags"] = flags
    report["player_stats"] = stats.to_dict("records")

    (work / "report.json").write_text(json.dumps(report, indent=2))
    print(f"Wrote report.json, player_stats.csv and {len(list(plots.glob('*.png')))} plots.")
    if flags:
        print(f"[sanity] {len(flags)} flagged values — see report.json (often id switches).")


if __name__ == "__main__":
    main()
