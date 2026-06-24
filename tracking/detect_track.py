"""Stage 3 — player detection + multi-object tracking.

Runs YOLO (person class) with Ultralytics' built-in ByteTrack/BoT-SORT to get a
stable track id per player, and writes one row per (frame, player) to
``player_tracks.csv``.

    python detect_track.py --video match.mp4 --work work/ [--preview]

``--preview`` also writes ``tracking_preview.mp4`` (boxes + ids) for the first
``--preview-seconds`` so you can eyeball id stability before a full run.

Output columns: frame, track_id, cls, x1, y1, x2, y2, cx, cy, conf
(cx, cy is the bottom-centre "foot" point used later for pitch projection.)
"""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

import cv2

from common import load_config


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--work", default="work")
    ap.add_argument("--config")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--preview-seconds", type=float, default=60.0)
    args = ap.parse_args()

    cfg = load_config(args.config)
    det = cfg["detection"]
    stride = max(1, int(cfg["video"]["frame_stride"]))
    work = Path(args.work)
    work.mkdir(parents=True, exist_ok=True)

    from ultralytics import YOLO  # imported here so other stages don't need it

    if det.get("tiled"):
        print("[warn] tiled (SAHI) inference is not wired into the built-in "
              "tracker; running standard inference. See README for the SAHI hook.")

    model = YOLO(det["model"])
    cap = cv2.VideoCapture(args.video)
    fps = cfg["video"]["fps_override"] or cap.get(cv2.CAP_PROP_FPS) or 25.0
    cap.release()

    writer = None
    preview_max = int(args.preview_seconds * fps)

    out_csv = open(work / "player_tracks.csv", "w", newline="")
    w = csv.writer(out_csv)
    w.writerow(["frame", "track_id", "cls", "x1", "y1", "x2", "y2", "cx", "cy", "conf"])

    # stream=True yields per-frame Results; persist=True keeps track state.
    results = model.track(
        source=args.video, stream=True, persist=True,
        classes=[det["person_class_id"]], conf=det["conf"], imgsz=det["imgsz"],
        tracker=cfg["tracker"], verbose=False,
    )

    n_rows = 0
    for frame_idx, res in enumerate(results):
        if frame_idx % stride != 0:
            continue
        boxes = res.boxes
        if boxes is None or boxes.id is None:
            ids = []
        else:
            ids = boxes.id.int().cpu().tolist()
        for i, tid in enumerate(ids):
            x1, y1, x2, y2 = boxes.xyxy[i].cpu().tolist()
            conf = float(boxes.conf[i].cpu())
            cx, cy = (x1 + x2) / 2.0, y2  # bottom-centre = feet
            w.writerow([frame_idx, tid, "player", f"{x1:.1f}", f"{y1:.1f}",
                        f"{x2:.1f}", f"{y2:.1f}", f"{cx:.1f}", f"{cy:.1f}", f"{conf:.3f}"])
            n_rows += 1

        if args.preview and frame_idx < preview_max:
            annotated = res.plot()
            if writer is None:
                h, wd = annotated.shape[:2]
                writer = cv2.VideoWriter(str(work / "tracking_preview.mp4"),
                                         cv2.VideoWriter_fourcc(*"mp4v"), fps, (wd, h))
            writer.write(annotated)

    out_csv.close()
    if writer is not None:
        writer.release()
    print(f"Wrote {n_rows} player rows to {work/'player_tracks.csv'}.")


if __name__ == "__main__":
    main()
