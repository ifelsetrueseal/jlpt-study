# -*- coding: utf-8 -*-
"""내가 적은 조각이 그 한자 안에 실제로 들어 있는지 IDS 로 대조한다."""
import json, re, sys

SP = sys.argv[1]
IDC = "⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻⿼⿽⿾⿿"

ids = {}
for line in open(f"{SP}/ids.txt", encoding="utf-8"):
    if line.startswith("#"): continue
    cols = line.rstrip("\n").split("\t")
    if len(cols) < 3: continue
    ch = cols[1]
    # 여러 이체가 오면 일본 자형(J)을 우선, 없으면 첫 번째
    forms = [re.sub(r"\[[A-Z]+\]$", "", c) for c in cols[2:]]
    jp = [f for c, f in zip(cols[2:], forms) if "J" in (re.search(r"\[([A-Z]+)\]$", c) or [None, ""])[1]]
    ids[ch] = (jp or forms)[0]

def leaves(ch, depth=0, seen=None):
    """그 글자를 끝까지 쪼갠 조각 전부(자기 자신 포함)"""
    seen = seen or set()
    out = {ch}
    if depth > 6 or ch in seen: return out
    seen = seen | {ch}
    body = ids.get(ch, "")
    if body == ch or not body: return out
    for c in body:
        if c in IDC or c == ch: continue
        out |= leaves(c, depth + 1, seen)
    return out

# 자형이 사실상 같은 이체자끼리 묶어 오탐을 줄인다
ALIAS = {
    "亻":"人","刂":"刀","扌":"手","氵":"水","艹":"艸","犭":"犬","忄":"心","礻":"示","衤":"衣",
    "訁":"言","飠":"食","糹":"糸","阝":"阜","⺌":"小","⺍":"小","⺈":"刀","𠂊":"刀","𠂇":"又",
    "彐":"彑","⺕":"彑","牜":"牛","耂":"老","𥫗":"竹","龶":"龶","龹":"𡗗","灬":"火","𭕄":"⺍",
}
def norm(c): return ALIAS.get(c, c)

d = json.load(open("data/kanji.json"))
missing = []
for k in d:
    tree = {norm(c) for c in leaves(k["char"])} | leaves(k["char"])
    for p in k["parts"]:
        c = p["char"]
        if len(c) > 1:   # 幺幺 처럼 내가 묶어 쓴 것
            if all(norm(x) in tree or x in tree for x in c): continue
        if norm(c) in tree or c in tree: continue
        missing.append((k["char"], c, p["name"], ids.get(k["char"], "?")))

print(f"검사 {len(d)}자 / IDS 없음 {sum(1 for k in d if k['char'] not in ids)}자")
print(f"글자 안에서 못 찾은 조각: {len(missing)}건\n")
for ch, part, name, tree in missing:
    print(f"  {ch} ({tree})  ← 내가 적은 조각: {part} {name}")
