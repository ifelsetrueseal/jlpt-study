/**
 * 일본어 음성 읽기. 브라우저·웹뷰에 내장된 speechSynthesis 만 쓴다 —
 * 음성 파일도, 외부 API 도 필요 없다.
 *
 * iOS 웹뷰는 사용자 조작(탭) 안에서 호출해야 소리가 난다. 그래서
 * 자동 재생은 하지 않고 탭했을 때만 읽는다.
 */
// 목소리 목록은 비동기로 채워진다. 첫 탭에서 일본어 목소리를 못 골라
// 기본 목소리로 읽히는 걸 막으려고 미리 불러 둔다.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
}

export function speak(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const clean = text.trim();
  if (!clean) return;

  // 앞의 발화가 남아 있으면 겹쳐서 들린다
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "ja-JP";
  u.rate = 0.9; // 학습용이라 조금 느리게
  // 목소리 목록은 늦게 채워지기도 한다. 없으면 lang 만 보고 기기가 고른다.
  const ja = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
  if (ja) u.voice = ja;

  window.speechSynthesis.speak(u);
}

/** 훈독 표기의 오쿠리가나 경계를 떼어낸다. やす.む → やすむ */
export const plainReading = (r: string) => r.replace(".", "");
