"""Grobe Vorschau der Karte aus der Zeichenliste (Formen, Wege, Texte), ohne SVG-Renderer."""
import json, sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle

quelle, ziel, modus, breite_px = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
d = json.load(open(quelle))
W, H, liste = d["W"], d["H"], d["liste"]
s = breite_px / W
dpi = 100
fig = plt.figure(figsize=(W * s / dpi, H * s / dpi), dpi=dpi)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.axis("off")
ax.add_patch(Rectangle((0, 0), W, H, color="#efe2c3"))
FL = {"sumpf": "#aab785", "totholz": "#a9a184", "wald": "#97a66c", "berge": "#b9a27c", "felder": "#d2bb72", "mangroven": "#8fa46d"}
for x in liste:
    if x["typ"] == "flaeche":
        ax.add_patch(Polygon(x["pts"], closed=True, color=FL.get(x["art"], "#aaa"), alpha=0.45, lw=0))
for x in liste:
    if x["typ"] == "meer":
        ax.add_patch(Polygon(x["pts"], closed=True, color="#c5d5cf", lw=1.5, ec="#4b5f61"))
for x in liste:
    if x["typ"] != "weg":
        continue
    xs = [p[0] for p in x["pts"]]; ys = [p[1] for p in x["pts"]]
    if x.get("trasse"):
        ax.plot(xs, ys, color="#8e3b22", alpha=0.18, lw=15 * s, solid_capstyle="round")
    ink = "#8e3b22" if x.get("bekannt") == "karte" else "#3b3028"
    art = x["art"]
    st = {"strasse": dict(color=ink, lw=3.2 * s), "damm": dict(color=ink, lw=6 * s), "knueppeldamm": dict(color=ink, lw=5 * s, ls=(0, (1, 2))),
          "wasser": dict(color="#3f6c84", lw=2.8 * s, ls="--"), "graben": dict(color="#3f6c84", lw=2 * s, ls=":"),
          "pfad": dict(color=ink, lw=2.8 * s, ls=":"), "unvermessen": dict(color="#8e3b22", lw=2.4 * s, ls=(0, (5, 3)))}[art]
    if x.get("bekannt") == "gehoert":
        st["alpha"] = 0.6
    ax.plot(xs, ys, **st)
for x in liste:
    if x["typ"] == "ort":
        ax.plot([x["x"]], [x["y"]], "o", ms=max(3, 22 * s), mfc="#efe2c3", mec="#3b3028", mew=1.5)
    if x["typ"] == "kasten":
        ax.add_patch(Rectangle((x["x"], x["y"]), x["b"], x["h"], fc="#efe2c3", ec="#8b6d45", lw=1.5))
HA = {"start": "left", "middle": "center", "end": "right"}
for x in liste:
    if x["typ"] != "text" or (modus == "standard" and x.get("rang") == 2):
        continue
    for i, z in enumerate(str(x["t"]).split("\n")):
        ax.text(x["x"], x["y"] + i * x["gr"] * 1.1, z, ha=HA[x["anker"]], va="baseline", fontsize=x["gr"] * s * 72 / dpi,
                family="Liberation Serif", style="italic" if x.get("kursiv") else "normal",
                color="#8e3b22" if x.get("rang") == 2 and modus == "zoom" else "#2b231c",
                bbox=dict(boxstyle="square,pad=0", fc="none", ec="#d04", lw=0.4))
fig.savefig(ziel, dpi=dpi)
print("ok", ziel, round(W * s), "x", round(H * s))
