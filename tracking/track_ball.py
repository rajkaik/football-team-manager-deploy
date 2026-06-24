"""Stage 4 — ball detection + tracking (gates possession & passing).

Detects the ball each frame (highest-confidence box), then linearly interpolates
across short gaps where the ball was missed/occluded. Writes ``ball_track.csv``:
frame, bx, by, conf, interpolated.

    python track_ball.py --video match.mp4 --work work/ [--preview]

EARLY GO/NO-GO CHECK: look at the printed detection rate and the preview. If the
ball is detected in only a small fraction of frames at your drone altitude,
possession/passing stats will be unreliable — drop altitude or fine-tune a ball
model before relying on those outputs (see README).

If ``ball.model`` (config) is missing, falls back to the player model's generic
'sports ball' class, which is markedly less reliable.
"""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

import cv2
import numpy as np

from common import load_config


def detect_ball_stream(video, model, class_id, conf, imgsz):
    """Yield (frame_idx, (bx, by, conf) or None) per frame."""
    results = model.predict(source=video, stream=True, classes=[class_id],
                            conf=conf, imgsz=imgsz, verbose=False)
    for idx, res in enumerate(results):
        b = res.boxes
        if b is None or len(b) == 0:
            yield idx, None
            continue
        best = int(np.argmax(b.conf.cpu().numpy()))
        x1, y1, x2, y2 = b.xyxy[best].cpu().tolist()
        yield idx, ((x1 + x2) / 2.0, (y1 + y2) / 2.0, float(b.conf[best].cpu()))


def interpolate(raw: dict[int, tuple], n_frames: int, max_gap: int) -> list[dict]:
    """Fill short gaps between detections with linear interpolation."""
    rows = []
    detected_frames = sorted(raw)
    for i, f in enumerate(detected_frames):
        bx, by, conf = raw[f]
        rows.append({"frame": f, "bx": bx, "by": by, "conf": conf, "interpolated": 0})
        if i + 1 < len(detected_frames):
            nxt = detected_frames[i + 1]
            gap = nxt - f
            if 1 < gap <= max_gap:
                nbx, nby, _ = raw[nxt]
                for k in range(1, gap):
                    t = k / gap
                    rows.append({"frame": f + k,
                                 "bx": bx + t * (nbx - bx),
                                 "by": by + t * (nby - by),
                                 "conf": 0.0, "interpolated": 1})
    rows.sort(key=lambda r: r["frame"])
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--work", default="work")
    ap.add_argument("--config")
    ap.add_argument("--preview", action="store_true")
    args = ap.parse_args()

    cfg = load_config(args.config)
    bcfg = cfg["ball"]
    work = Path(args.work)
    work.mkdir(parents=True, exist_ok=True)

    from ultralytics import YOLO

    if Path(bcfg["model"]).exists():
        model, class_id = YOLO(bcfg["model"]), 0
        print(f"Using fine-tuned ball model: {bcfg['model']}")
    else:
        model = YOLO(cfg["detection"]["model"])
        class_id = bcfg["sports_ball_class_id"]
        print("[warn] no fine-tuned ball model; falling back to COCO 'sports ball'.")

    raw: dict[int, tuple] = {}
    n_frames = 0
    for idx, det in detect_ball_stream(args.video, model, class_id,
                                       bcfg["conf"], cfg["detection"]["imgsz"]):
        n_frames = idx + 1
        if det is not None:
            raw[idx] = det

    rate = len(raw) / max(1, n_frames)
    rows = interpolate(raw, n_frames, int(bcfg["max_gap_frames"]))

    with open(work / "ball_track.csv", "w", newline="") as fh:
        wr = csv.DictWriter(fh, fieldnames=["frame", "bx", "by", "conf", "interpolated"])
        wr.writeheader()
        for r in rows:
            wr.writerow({**r, "bx": f"{r['bx']:.1f}", "by": f"{r['by']:.1f}",
                         "conf": f"{r['conf']:.3f}"})

    print(f"Ball detected in {len(raw)}/{n_frames} frames ({rate:.0%}); "
          f"{len(rows)} rows after interpolation.")
    if rate < 0.30:
        print("[GO/NO-GO] Low detection rate (<30%). Possession/passing will be "
              "unreliable — see README before relying on those stats.")

    if args.preview:
        _write_preview(args.video, {r["frame"]: r for r in rows}, work, cfg)


def _write_preview(video, by_frame, work, cfg):
    cap = cv2.VideoCapture(video)
    fps = cfg["video"]["fps_override"] or cap.get(cv2.CAP_PROP_FPS) or 25.0
    n = min(int(60 * fps), int(cap.get(cv2.CAP_PROP_FRAME_COUNT)))
    wd = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(str(work / "ball_preview.mp4"),
                          cv2.VideoWriter_fourcc(*"mp4v"), fps, (wd, h))
    for f in range(n):
        ok, frame = cap.read()
        if not ok:
            break
        r = by_frame.get(f)
        if r:
            colour = (0, 165, 255) if r["interpolated"] else (0, 0, 255)
            cv2.circle(frame, (int(float(r["bx"])), int(float(r["by"]))), 8, colour, 2)
        out.write(frame)
    cap.release()
    out.release()
    print(f"Wrote {work/'ball_preview.mp4'} (red=detected, orange=interpolated).")


if __name__ == "__main__":
    main()
