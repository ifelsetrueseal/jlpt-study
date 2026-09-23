#!/usr/bin/env python3
"""연상 암기법 데이터 점검. 규칙은 docs/mnemonics.md 참고.

  python3 scripts/check_kanji.py        칩 이름 ↔ 스토리 대조
  python3 scripts/check_kanji.py --ids  자형 대조까지(IDS 데이터 내려받음)
"""
import json, os, re, subprocess, sys, tempfile

DATA = "data/kanji.json"
IDS_URL = "https://raw.githubusercontent.com/cjkvi/cjkvi-ids/master/ids.txt"
IDC = "⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻⿼⿽⿾⿿"

# 눈에 보이는 모양이 같은 이체자끼리 묶는다 — 코드포인트만 다르다
ALIAS = {
    "亻": "人", "刂": "刀", "扌": "手", "氵": "水", "艹": "艸", "忄": "心", "礻": "示",
    "訁": "言", "糹": "糸", "飠": "食", "阝": "阜", "⺌": "小", "⺍": "小", "𭕄": "小",
    "⺈": "刀", "𠂊": "刀", "𠂇": "又", "彐": "彑", "⺕": "彑", "帚": "彑", "牜": "牛",
    "耂": "老", "𥫗": "竹", "灬": "火", "龰": "止", "⺀": "冫", "⺊": "卜", "丆": "厂",
    "匚": "匸", "㐅": "乂", "兑": "兌", "㑒": "僉", "开": "幵", "𠮠": "另", "𠦝": "龺",
    "𤴓": "正", "巳": "己", "毋": "母", "𦘒": "聿", "𦣻": "頁", "𦍌": "羊", "朩": "木",
    "𠃜": "尸", "𡗗": "龹", "亼": "人",
}
# 칩 이름을 자연스럽게 바꿔 부른 것들 — 규칙 4 가 허용한다("갓머리(집)" ↔ "지붕").
# 여기 없는 조합이 뜨면 뜻이 어긋난 것이니 새로 판단해야 한다.
SYNONYM = {
    ("一", "기준선"), ("一", "선"), ("与", "준다"), ("丨", "꿰뚫은"),
    ("丨", "시위"), ("丶", "알갱이"), ("主", "한곳"), ("丿", "덜어내면"),
    ("乂", "갈라"), ("乂", "베어"), ("也", "구불구불"), ("亍", "오른발"),
    ("云", "웅얼대는"), ("亼", "뚜껑"), ("介", "끼어든"), ("从", "따라"),
    ("兌", "기뻐한다"), ("冖", "지붕"), ("冫", "장식"), ("几", "받침"),
    ("化", "바꾸면"), ("厶", "몫"), ("另", "갈라"), ("可", "옳으냐"),
    ("合", "맞는"), ("吾", "내"), ("哥", "겹쳐"), ("土", "땅"),
    ("大", "것"), ("娄", "겹친"), ("宀", "지붕"), ("小", "것"),
    ("少", "조금씩"), ("工", "파"), ("巾", "천"), ("广", "지붕"),
    ("廿", "스무"), ("彳", "걸어와"), ("彳", "걸음"), ("彳", "왼발"),
    ("攵", "쳐서"), ("攵", "치며"), ("日", "쓰고"), ("日", "입"),
    ("昜", "해"), ("更", "고쳐"), ("欠", "벌리면"), ("正", "바르게"),
    ("母", "어머니"), ("气", "김"), ("生", "태어난다"), ("甬", "통"),
    ("立", "서서"), ("立", "선"), ("羽", "날개"), ("耂", "노인"),
    ("至", "이르는"), ("艮", "멎는"), ("良", "것"), ("袁", "길게"),
    ("袁", "옷자락"), ("見", "지켜보는"), ("貝", "값어치"), ("走", "달려"),
    ("采", "캐서"), ("重", "것"),
}

# IDS 로는 확인할 수 없어 사람이 판단한 것들 (docs/mnemonics.md 참고)
ALLOWED = {
    ("業", "木"), ("赤", "火"), ("寒", "艹"), ("夜", "夕"),
    ("画", "田"), ("今", "丶"), ("旅", "从"),
}
norm = lambda c: ALIAS.get(c, c)


def load():
    return json.load(open(DATA, encoding="utf-8"))


def check_names(data):
    """스토리가 조각을 칩과 다른 뜻으로 부르는 곳을 찾는다."""
    def stem(w):
        return re.sub(r"(하다|한다|하는|해서|하고|으로|이|가|은|는|을|를|에|의|고|며|서|면|아|어|다)$", "", w)

    bad = []
    for k in data:
        for p in k["parts"]:
            for m in re.finditer(r"([가-힣]+)\(" + re.escape(p["char"]) + r"\)", k["mnemonic"]):
                called = m.group(1)
                words = re.findall(r"[가-힣]+", p["name"])
                hit = any(called in w or w in called or (stem(called)[:2] and stem(called)[:2] in w) for w in words)
                if not hit and (p["char"], called) not in SYNONYM:
                    bad.append(f'{k["char"]} : 칩 "{p["char"]} {p["name"]}" ↔ 스토리 "{called}({p["char"]})"')
    return bad


def check_shapes(data):
    """내가 적은 조각이 그 한자 안에 실제로 있는지 IDS 로 대조한다."""
    path = os.path.join(tempfile.gettempdir(), "cjkvi-ids.txt")
    if not os.path.exists(path):
        print(f"IDS 데이터 내려받는 중… → {path}")
        subprocess.run(["curl", "-sL", "-o", path, IDS_URL], check=True)

    ids = {}
    for line in open(path, encoding="utf-8"):
        if line.startswith("#"):
            continue
        cols = line.rstrip("\n").split("\t")
        if len(cols) < 3:
            continue
        forms = [re.sub(r"\[[A-Z]+\]$", "", c) for c in cols[2:]]
        jp = [f for c, f in zip(cols[2:], forms) if "J" in (re.search(r"\[([A-Z]+)\]$", c) or [None, ""])[1]]
        ids[cols[1]] = (jp or forms)[0]

    def leaves(ch, depth=0, seen=frozenset()):
        out = {ch}
        if depth > 6 or ch in seen:
            return out
        seen = seen | {ch}
        body = ids.get(ch, "")
        if body == ch or not body:
            return out
        for c in body:
            if c not in IDC and c != ch:
                out |= leaves(c, depth + 1, seen)
        return out

    bad = []
    for k in data:
        ch = k["char"]
        # IDS 가 분해를 등록하지 않은 글자는 어원 설명을 그대로 인정한다
        if ids.get(ch) == ch:
            continue
        tree = leaves(ch)
        tree |= {norm(c) for c in tree}
        for p in k["parts"]:
            c = p["char"]
            if (ch, c) in ALLOWED:
                continue
            if len(c) > 1 and all(norm(x) in tree or x in tree for x in c):
                continue
            if norm(c) in tree or c in tree:
                continue
            bad.append(f'{ch} ({ids.get(ch, "?")}) 안에 {c}({p["name"]}) 가 없다')
    return bad


def main():
    data = load()
    problems = check_names(data)
    label = ["칩 이름 ↔ 스토리"]
    if "--ids" in sys.argv:
        problems += check_shapes(data)
        label.append("자형(IDS)")

    print(f"한자 {len(data)}자 / 검사: {', '.join(label)}")
    if not problems:
        print("문제 없음")
        return 0
    print(f"문제 {len(problems)}건\n")
    for p in problems:
        print("  " + p)
    return 1


if __name__ == "__main__":
    sys.exit(main())
