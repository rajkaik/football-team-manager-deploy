"""Shared utilities for the drone tracking pipeline.

Coordinate convention for the *pitch* (metric) space:
    origin (0, 0) = one corner flag
    x axis  -> along the length of the pitch  (0 .. pitch.length)
    y axis  -> along the width  of the pitch  (0 .. pitch.width)

Every stage reads/writes plain CSV/JSON in a single ``work`` directory so the
steps can be run and inspected independently.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import yaml

# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #


def load_config(path: str | Path = None) -> dict:
    """Load config.yaml (defaults to the one next to this file)."""
    path = Path(path) if path else Path(__file__).with_name("config.yaml")
    with open(path) as fh:
        return yaml.safe_load(fh)


# --------------------------------------------------------------------------- #
# Pitch model & calibration landmarks
# --------------------------------------------------------------------------- #


@dataclass
class PitchModel:
    """A standard pitch and the metric coordinates of named landmarks.

    The landmark names are what ``calibrate.py`` asks the user to click. Pick
    any 4+ that are clearly visible from above; more points → better fit.
    """

    length: float = 105.0
    width: float = 68.0

    @property
    def landmarks(self) -> dict[str, tuple[float, float]]:
        L, W = self.length, self.width
        # Penalty area: 16.5 m deep, 40.32 m wide (centred on the goal).
        pa_d, pa_w = 16.5, 40.32
        pa_lo, pa_hi = (W - pa_w) / 2, (W + pa_w) / 2
        return {
            "corner_top_left": (0.0, 0.0),
            "corner_top_right": (L, 0.0),
            "corner_bottom_left": (0.0, W),
            "corner_bottom_right": (L, W),
            "halfway_top": (L / 2, 0.0),
            "halfway_bottom": (L / 2, W),
            "center_spot": (L / 2, W / 2),
            "left_penalty_top": (pa_d, pa_lo),
            "left_penalty_bottom": (pa_d, pa_hi),
            "right_penalty_top": (L - pa_d, pa_lo),
            "right_penalty_bottom": (L - pa_d, pa_hi),
        }

    def outline_segments(self) -> list[tuple[tuple, tuple]]:
        """Line segments (in metres) used to verify a homography by re-projecting
        the pitch onto the source frame."""
        L, W = self.length, self.width
        lm = self.landmarks
        return [
            ((0, 0), (L, 0)), ((L, 0), (L, W)), ((L, W), (0, W)), ((0, W), (0, 0)),
            ((L / 2, 0), (L / 2, W)),  # halfway line
            (lm["left_penalty_top"], lm["left_penalty_bottom"]),
            (lm["right_penalty_top"], lm["right_penalty_bottom"]),
        ]


# --------------------------------------------------------------------------- #
# Geometry
# --------------------------------------------------------------------------- #


def apply_homography(H: np.ndarray, pts: np.ndarray) -> np.ndarray:
    """Map (N, 2) points through a 3x3 homography. Returns (N, 2)."""
    pts = np.asarray(pts, dtype=np.float64).reshape(-1, 2)
    ones = np.ones((pts.shape[0], 1))
    hom = np.hstack([pts, ones]) @ H.T
    return hom[:, :2] / hom[:, 2:3]


def save_homography(H: np.ndarray, meta: dict, work: Path) -> None:
    np.save(work / "homography.npy", H)
    (work / "homography_meta.json").write_text(json.dumps(meta, indent=2))


def load_homography(work: Path) -> np.ndarray:
    return np.load(work / "homography.npy")


# --------------------------------------------------------------------------- #
# Work directory helpers
# --------------------------------------------------------------------------- #


@dataclass
class Paths:
    """Canonical file locations for one processing run."""

    work: Path
    homography: Path = field(init=False)
    player_tracks: Path = field(init=False)
    ball_track: Path = field(init=False)
    positions: Path = field(init=False)            # players in metric space
    ball_positions: Path = field(init=False)
    possession: Path = field(init=False)
    passes: Path = field(init=False)
    report: Path = field(init=False)
    plots: Path = field(init=False)

    def __post_init__(self):
        self.work = Path(self.work)
        self.work.mkdir(parents=True, exist_ok=True)
        self.homography = self.work / "homography.npy"
        self.player_tracks = self.work / "player_tracks.csv"
        self.ball_track = self.work / "ball_track.csv"
        self.positions = self.work / "positions.csv"
        self.ball_positions = self.work / "ball_positions.csv"
        self.possession = self.work / "possession.csv"
        self.passes = self.work / "passes.csv"
        self.report = self.work / "report.json"
        self.plots = self.work / "plots"
        self.plots.mkdir(exist_ok=True)
