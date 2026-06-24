# Drone Player Tracking & Analytics

A standalone, offline computer-vision pipeline that follows football players (and
the ball) in a **fixed, roughly-overhead drone recording** and produces movement,
possession and passing analytics.

This is intentionally separate from the React/Supabase team-manager app — it's a
pure Python tool that ingests a video file and emits CSVs, plots and a JSON report.

## Why this design

A top-down fixed camera is the *easy* case for sports tracking: little player
occlusion, small/stable perspective distortion, and a **constant** image→pitch
mapping you calibrate once. We assemble mature, off-the-shelf components rather
than training a bespoke model — closely following Roboflow's open-source
[`roboflow/sports`](https://github.com/roboflow/sports) reference pipeline.

## Pipeline

| Stage | Script | What it does |
|------|--------|--------------|
| 2 | `calibrate.py` | Click ≥4 pitch landmarks once → image→pitch homography |
| 3 | `detect_track.py` | YOLO11 person detection + ByteTrack ids |
| 5 | `assign_teams.py` | KMeans jersey-colour clustering → team per track |
| 4 | `track_ball.py` | Ball detection + short-gap interpolation |
| 7 | `project.py` | Homography → pitch metres + Savitzky-Golay smoothing |
| 7b | `possession.py` | Nearest-player control → possession % + pass events |
| 9 | `analytics.py` | Distance/speed/heatmaps + pass maps + `report.json` |
| — | `pipeline.py` | Runs stages 3→9 in order |

## Setup

```bash
cd tracking
pip install -r requirements.txt   # GPU strongly recommended for YOLO stages
```

## Usage

```bash
# 1. Calibrate once (interactive window; click the prompted landmarks).
python calibrate.py --video match.mp4 --work work/
#    Headless alternative: --points points.json  ({"corner_top_left":[x,y],...})

# 2. Run everything.
python pipeline.py --video match.mp4 --work work/ --fps 25 --preview
#    Add --no-ball to skip possession/passing if the ball isn't trackable.
```

Outputs land in `work/`:
- `report.json` — movement, team shape, possession %, passing summary
- `player_stats.csv` — per-player distance, speed, sprints, time-on-ball
- `plots/heatmap_team*.png`, `plots/passmap_team*.png`
- `*_preview.mp4` — annotated clips for visual QA (with `--preview`)

## The ball is the gating factor

Possession and passing depend on **ball tracking**, the hardest part from above.
`track_ball.py` prints a detection rate and a **GO/NO-GO** warning. If it's low:

1. Fly the drone lower / use higher resolution.
2. Fine-tune a ball model (label a few hundred frames in Roboflow, export to
   `ball.pt`) — far more reliable than the generic COCO `sports ball` class.
3. Or run with `--no-ball` and keep just the movement analytics.

**Possession %** degrades gracefully; **per-pass** stats are the most fragile and
may warrant manual review.

## Known limitations

- **ID switches** in crowded moments (corners, scrums) — ByteTrack's motion model
  and the team-colour constraint help, but per-player season stats may need light
  manual correction.
- **Very high drones** shrink players to a few pixels; enable SAHI tiling
  (`detection.tiled`, hook in `detect_track.py`) or fine-tune the detector.

## Tests

```bash
python tests/test_smoke.py   # runs project→possession→analytics on synthetic
                             # data; no video/GPU needed
```

## Tuning

Everything lives in `config.yaml` — pitch size, model paths, confidence
thresholds, control radius, smoothing, and sanity bounds.
