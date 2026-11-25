# N4 Textbook Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 교재 어휘와 해설형 N4 객관식 문제를 기존 JLPT 앱에 추가한다.

**Architecture:** 기존 정적 데이터 구조를 유지한다. 문제 데이터와 채점 순수 함수를 분리하고, 클라이언트 퀴즈 페이지는 현재 문항과 선택 상태만 관리한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-11-25-n4-textbook-quiz-design.md`

## Global Constraints

- 새 의존성을 추가하지 않는다.
- 교재 원문과 생성 문제를 출처로 구분한다.
- 답을 고른 뒤 모든 보기의 읽기·한국어 뜻·피드백을 표시한다.

## Review Focus

- 정답 인덱스가 보기 범위를 벗어나면 데이터 검증에서 잡혀야 한다.
- 선택 전에는 정답 여부가 노출되지 않아야 한다.
- 선택 후 다음 문제로 이동하면 선택 상태가 초기화되어야 한다.
- 마지막 문제 후에는 점수와 다시 풀기가 보여야 한다.
- 모바일 웹뷰에서 버튼 터치 영역과 긴 일본어 문장이 잘리지 않아야 한다.

---

### Task 1: 문제 모델과 채점

**Files:**
- Create: `lib/quiz.ts`
- Create: `lib/quiz.test.ts`
- Create: `data/questions.ts`

**Interfaces:**
- Produces: `Question`, `ChoiceFeedback`, `gradeChoice(question, index)`

- [ ] 채점 결과와 잘못된 인덱스를 검증하는 실패 테스트를 작성한다.
- [ ] 테스트가 모듈 부재로 실패하는지 확인한다.
- [ ] 최소 타입과 채점 함수를 구현하고 테스트를 통과시킨다.
- [ ] 15문제 데이터를 추가하고 각 문제의 보기·피드백 개수를 검증한다.

### Task 2: 퀴즈 화면과 홈 연결

**Files:**
- Create: `app/quiz/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `QUESTIONS`, `gradeChoice`

- [ ] 한 문제씩 선택하고 해설을 펼치는 화면을 구현한다.
- [ ] 다음 문제, 최종 점수, 다시 풀기 흐름을 구현한다.
- [ ] 홈에 문제 풀이 진입 카드를 추가한다.

### Task 3: 교재 단어와 전체 검증

**Files:**
- Modify: `data/words.json`

- [ ] 중복을 제외한 교재 어휘 24개를 추가한다.
- [ ] 전체 테스트, 린트, 빌드, 한자 데이터 검사를 실행한다.
- [ ] 변경만 커밋하고 최신 `origin/main`에 푸시한다.
