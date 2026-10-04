"""Extracts the balance catalog XML and GameStrings from packaged .SC2Mod archives (MPQ).

    python tools/extract-mod.py [current.SC2Mod [previous.SC2Mod]]

Defaults (relative to the repository root's sc2-mod folder):
  current   BPM_Core_v1.4.3_Fix1.SC2Mod   -> tools/mod-extract/current
  previous  BPM_Core_v1.4.2_Fix4.SC2Mod   -> tools/mod-extract/previous  (the build before v1.4.3, shown as v1.4.1)
Output is git-ignored and regenerated on demand. Needs `pip install mpyq`.
"""
import os
import sys

try:
    import mpyq
except ImportError:
    sys.exit("mpyq is required: pip install mpyq")

here = os.path.dirname(os.path.abspath(__file__))
mods = os.path.normpath(os.path.join(here, "..", "..", "..", "sc2-mod"))
jobs = [
    ("current", sys.argv[1] if len(sys.argv) > 1 else os.path.join(mods, "BPM_Core_v1.4.3_Fix1.SC2Mod")),
    ("previous", sys.argv[2] if len(sys.argv) > 2 else os.path.join(mods, "BPM_Core_v1.4.2_Fix4.SC2Mod")),
]
for label, src in jobs:
    out = os.path.join(here, "mod-extract", label)
    os.makedirs(out, exist_ok=True)
    archive = mpyq.MPQArchive(src)
    count = 0
    for raw in archive.files or []:
        name = raw.decode("utf-8", "ignore") if isinstance(raw, bytes) else raw
        low = name.lower()
        if not (low.endswith(".xml") or low.endswith("gamestrings.txt")):
            continue
        data = archive.read_file(name)
        if data is None:
            continue
        with open(os.path.join(out, name.replace("\\", "__")), "wb") as f:
            f.write(data)
        count += 1
    with open(os.path.join(out, "SOURCE.txt"), "w", encoding="utf-8") as f:
        f.write(os.path.basename(src) + "\n")
    print("%-8s %d files from %s" % (label, count, os.path.basename(src)))
