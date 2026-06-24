"""Stage 2 — one-time pitch calibration (image -> pitch homography).

Because the drone is fixed, the image->pitch mapping is constant for the whole
match, so we solve it once and store it.

Two ways to provide the correspondences:

  Interactive (a window opens on the first frame; click the prompted landmarks):
      python calibrate.py --video match.mp4 --work work/

  Headless (supply pixel coords for >=4 landmarks as JSON):
      python calibrate.py --video match.mp4 --work work/ --points points.json
      # points.json: {"corner_top_left": [x, y], "center_spot": [x, y], ...}

After solving, a verification image (``calibration_check.png``) is written with
the standard pitch outline re-projected onto the frame — the lines should sit
on the real pitch markings.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np

from common import PitchModel, apply_homography, load_config, save_homography


def grab_frame(video: str, index: int = 0) -> np.ndarray:
    cap = cv2.VideoCapture(video)
    cap.set(cv2.CAP_PROP_POS_FRAMES, index)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise RuntimeError(f"Could not read frame {index} from {video}")
    return frame


def collect_points_interactive(frame: np.ndarray, names: list[str]) -> dict[str, list[float]]:
    """Open a window and let the user click each landmark in turn."""
    picked: dict[str, list[float]] = {}
    order = iter(names)
    state = {"current": next(order, None)}

    def redraw():
        disp = frame.copy()
        for name, (x, y) in picked.items():
            cv2.circle(disp, (int(x), int(y)), 6, (0, 255, 0), -1)
            cv2.putText(disp, name, (int(x) + 8, int(y)), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (0, 255, 0), 1, cv2.LINE_AA)
        msg = (f"Click: {state['current']}" if state["current"]
               else "Done - press ENTER (s=skip current, u=undo, q=quit)")
        cv2.putText(disp, msg, (15, 30), cv2.FONT_HERSHEY_SIMPLEX,
                    0.8, (0, 200, 255), 2, cv2.LINE_AA)
        cv2.imshow("calibrate", disp)

    def on_mouse(event, x, y, flags, _):
        if event == cv2.EVENT_LBUTTONDOWN and state["current"]:
            picked[state["current"]] = [float(x), float(y)]
            state["current"] = next(order, None)
            redraw()

    cv2.namedWindow("calibrate", cv2.WINDOW_NORMAL)
    cv2.setMouseCallback("calibrate", on_mouse)
    redraw()
    while True:
        key = cv2.waitKey(50) & 0xFF
        if key in (13, 10):          # ENTER
            break
        if key == ord("q"):
            picked.clear()
            break
        if key == ord("s"):          # skip current landmark
            state["current"] = next(order, None)
            redraw()
        if key == ord("u") and picked:  # undo last
            last = list(picked)[-1]
            del picked[last]
            state["current"] = last
            redraw()
    cv2.destroyAllWindows()
    return picked


def solve(points_px: dict[str, list[float]], pitch: PitchModel):
    lm = pitch.landmarks
    names = [n for n in points_px if n in lm]
    if len(names) < 4:
        raise ValueError(f"Need >=4 known landmarks, got {len(names)}: {names}")
    src = np.array([points_px[n] for n in names], dtype=np.float64)
    dst = np.array([lm[n] for n in names], dtype=np.float64)
    H, mask = cv2.findHomography(src, dst, cv2.RANSAC, 5.0)
    if H is None:
        raise RuntimeError("findHomography failed — check that points are not collinear")
    # Reprojection error of the clicked points (in metres).
    proj = apply_homography(H, src)
    err = float(np.mean(np.linalg.norm(proj - dst, axis=1)))
    return H, names, err


def write_check_image(frame: np.ndarray, H: np.ndarray, pitch: PitchModel, out: Path):
    """Re-project the pitch outline (metres -> pixels) for visual verification."""
    H_inv = np.linalg.inv(H)
    disp = frame.copy()
    for a, b in pitch.outline_segments():
        pa = apply_homography(H_inv, np.array([a]))[0]
        pb = apply_homography(H_inv, np.array([b]))[0]
        cv2.line(disp, tuple(pa.astype(int)), tuple(pb.astype(int)), (0, 255, 0), 2)
    cv2.imwrite(str(out), disp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--work", default="work")
    ap.add_argument("--frame", type=int, default=0, help="frame index to calibrate on")
    ap.add_argument("--points", help="JSON of {landmark: [px, py]} for headless use")
    ap.add_argument("--config")
    args = ap.parse_args()

    cfg = load_config(args.config)
    pitch = PitchModel(**cfg["pitch"])
    work = Path(args.work)
    work.mkdir(parents=True, exist_ok=True)

    frame = grab_frame(args.video, args.frame)

    if args.points:
        points_px = json.loads(Path(args.points).read_text())
    else:
        print("Landmarks to click (left button), in order. "
              "s=skip, u=undo, ENTER=finish, q=abort.")
        points_px = collect_points_interactive(frame, list(pitch.landmarks))
    if not points_px:
        raise SystemExit("No points collected — aborting.")

    H, used, err = solve(points_px, pitch)
    save_homography(H, {"landmarks_used": used, "reproj_error_m": err,
                        "frame": args.frame, "points_px": points_px}, work)
    write_check_image(frame, H, pitch, work / "calibration_check.png")
    print(f"Saved homography ({len(used)} pts, mean reproj error {err:.2f} m).")
    print(f"Inspect {work/'calibration_check.png'} — outline should hug the pitch lines.")


if __name__ == "__main__":
    main()
