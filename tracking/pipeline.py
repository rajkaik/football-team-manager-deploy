"""Stage orchestrator — run the whole pipeline on one video.

Calibration is interactive and only needs doing once per fixed camera, so run it
first yourself:

    python calibrate.py --video match.mp4 --work work/

Then:

    python pipeline.py --video match.mp4 --work work/ [--fps 25] [--preview] [--no-ball]

This runs: detect_track -> assign_teams -> [track_ball] -> project ->
[possession] -> analytics. Skip the ball/possession stages with --no-ball if the
GO/NO-GO check showed the ball isn't reliably detectable.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from common import load_config

HERE = Path(__file__).parent


def run(script: str, *cli_args: str):
    cmd = [sys.executable, str(HERE / script), *cli_args]
    print(f"\n=== {script} {' '.join(cli_args)} ===")
    subprocess.run(cmd, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--work", default="work")
    ap.add_argument("--config")
    ap.add_argument("--fps")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--no-ball", action="store_true", help="skip ball/possession/passing")
    args = ap.parse_args()

    work = Path(args.work)
    cfg_args = ["--config", args.config] if args.config else []

    if not (work / "homography.npy").exists():
        raise SystemExit(f"No homography in {work}. Run calibrate.py first.")

    common_io = ["--video", args.video, "--work", args.work, *cfg_args]
    preview = ["--preview"] if args.preview else []

    run("detect_track.py", *common_io, *preview)
    run("assign_teams.py", *common_io)
    if not args.no_ball:
        run("track_ball.py", *common_io, *preview)
    run("project.py", "--work", args.work, *cfg_args)
    if not args.no_ball and (work / "ball_positions.csv").exists():
        run("possession.py", "--work", args.work, *cfg_args)

    analytics_args = ["--work", args.work, *cfg_args]
    if args.fps:
        analytics_args += ["--fps", args.fps]
    run("analytics.py", *analytics_args)

    print(f"\nDone. See {work}/report.json, player_stats.csv and {work}/plots/.")


if __name__ == "__main__":
    main()
