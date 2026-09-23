<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 브랜치와 배포

- `main` 은 배포 전용이다. 여기에 들어간 것이 곧
  https://ifelsetrueseal.github.io/jlpt-study/ 에 올라간다.
- 작업은 별도 브랜치에서 한다. 푸시하면 `.github/workflows/ci.yml` 이
  타입·린트·테스트·빌드를 돌린다.
- 배포하려면 작업 브랜치를 `main` 으로 합친다. `main` 푸시에
  `.github/workflows/pages.yml` 이 붙어 자동으로 배포된다.

# 한자 데이터

`data/kanji.json` 의 연상법을 쓰거나 고치기 전에 **`docs/mnemonics.md` 를
먼저 읽는다.** 조각 글자는 그 한자에 실제로 보이는 자형이어야 하고,
신자체를 구자체 기준으로 쪼개면 안 되는 등 지켜야 할 것이 있다.

고친 뒤에는 검사를 돌린다. 앞의 것은 CI 에서도 돈다.

```
python3 scripts/check_kanji.py          # 칩 이름 ↔ 스토리 대조
python3 scripts/check_kanji.py --ids    # 자형 대조까지
```

# 코드 품질 기준

Toss [Frontend Fundamentals](https://github.com/toss/frontend-fundamentals/tree/main/fundamentals/code-quality/code)
를 이 저장소의 기준으로 삼는다. 좋은 코드는 **변경하기 쉬운 코드**이고,
네 가지로 판단한다. 넷을 동시에 만족할 수는 없으니, 상충하면 어느 쪽을
택했는지 코드에 주석으로 남긴다.

## 1. 가독성 — 읽는 사람이 한 번에 쥐는 맥락을 줄인다

- **같이 실행되지 않는 코드는 나눈다.** 한 컴포넌트가 분기로 두 모드를
  처리하면 읽는 사람이 두 흐름을 동시에 따라가야 한다. 분기를 한 군데로
  모으고 각 모드는 제 컴포넌트에서 자기 것만 다루게 한다.
- **구현 상세는 감싼다.** 화면의 본 줄거리와 상관없는 절차는 래퍼나 훅으로
  빼서 이름만 남긴다.
- **로직 종류로 묶지 않는다.** "상태 전부", "쿼리 파라미터 전부" 같은
  기준으로 훅을 만들면 책임이 무한정 늘어난다. 관심사 단위로 쪼갠다.
- **복잡한 조건과 숫자에는 이름을 붙인다.** `p.stage >= 3` 이 아니라
  `LEARNED_STAGE`, 중첩된 `filter`/`&&` 는 이름 붙인 변수로 꺼낸다.
- **위에서 아래로 읽히게 한다.** 값 하나를 이해하려고 파일과 함수를 세 번
  오가야 한다면 펼쳐서 그 자리에 드러내는 쪽이 낫다.
- **삼항 연산자를 중첩하지 않는다.** 분기가 둘을 넘으면 `if` 로 푼다.
- **범위 조건은 왼쪽에서 오른쪽으로.** `min <= x && x <= max` 형태로 쓴다.

## 2. 예측 가능성 — 이름·인자·반환값만 보고 동작을 알 수 있게

- **이름이 같으면 동작도 같아야 한다.** 라이브러리와 같은 이름을 붙이지
  않는다.
- **같은 종류의 함수는 반환 타입을 맞춘다.** 한쪽은 객체, 한쪽은 값을
  주면 쓸 때마다 확인해야 한다.
- **숨은 로직을 두지 않는다.** 이름에 없는 일(로깅, 모듈 로드 시 부작용)을
  몰래 하지 않는다. 필요하면 따로 떼어 호출하는 쪽이 보이게 한다.

## 3. 응집도 — 같이 고쳐야 할 것이 같이 고쳐지게

- **함께 수정되는 파일은 같은 디렉토리에.** 지금은 파일이 적어 `components/`,
  `lib/` 평면 구조를 쓴다. 한 기능의 파일이 늘어나면 그 기능 디렉토리로
  묶는다.
- **매직 넘버를 없앤다.** 애니메이션을 300ms 로 바꿨는데 기다리는 쪽이
  그대로면 조용히 깨진다. 같이 움직여야 할 값은 한 상수를 보게 한다.
- 위험이 낮으면 중복을 허용하고 가독성을 택한다. 한쪽만 고쳐지면 깨지는
  경우에만 공통화한다.

## 4. 결합도 — 고쳤을 때 번지는 범위를 좁게

- **책임은 하나씩.** 훅이나 컴포넌트가 여러 관심사를 들고 있으면 그것에
  기대는 코드가 늘어나 수정 범위가 급격히 커진다.
- **섣불리 공통화하지 않는다.** 지금 비슷해 보여도 요구사항이 갈라지면
  공통 코드에 분기가 쌓인다. 결합을 늘릴 바엔 중복을 둔다.
- **Props Drilling 을 지운다.** 부모가 받아서 그대로 자식에게 넘기는 prop 이
  보이면 합성이나 컨텍스트로 끊는다.
