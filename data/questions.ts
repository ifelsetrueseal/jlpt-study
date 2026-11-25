import { validateQuestions, type Question } from "../lib/quiz";

type Definition = Omit<Question, "choiceFeedback" | "source"> & {
  translations: string[];
  readings?: string[];
  feedback?: string[];
  source: Question["source"];
};

function question(definition: Definition): Question {
  const { translations, readings, feedback, ...questionData } = definition;
  return {
    ...questionData,
    choiceFeedback: questionData.choices.map((choice, index) => ({
      reading: readings?.[index] ?? choice,
      translationKo: translations[index],
      feedbackKo: feedback?.[index] ?? (index === questionData.answerIndex
        ? "표시된 한자의 올바른 읽기입니다."
        : `표시된 한자의 읽기가 아닙니다. 정답은 ${questionData.choices[questionData.answerIndex]}입니다.`),
    })),
  };
}

const textbook = (
  id: number,
  prompt: string,
  target: string,
  choices: string[],
  answerIndex: number,
  translations: string[],
  explanationKo: string,
) =>
  question({
    id: `tb3194-q${id}`,
    type: "reading",
    prompt,
    target,
    choices,
    answerIndex,
    translations,
    explanationKo,
    source: { type: "textbook", image: "IMG_3194.jpg", questionNumber: id },
  });

export const QUESTIONS = validateQuestions([
  textbook(1, "じゅぎょうちゅう とても 眠かった。", "眠かった", ["あつかった", "いたかった", "さむかった", "ねむかった"], 3, ["더웠다", "아팠다", "추웠다", "졸렸다"], "眠い의 읽기는 ねむい입니다."),
  textbook(2, "かいがんには きれいな 石が いっぱいです。", "石", ["あし", "いし", "あわ", "いわ"], 1, ["다리·발", "돌", "거품", "바위"], "石의 읽기는 いし입니다."),
  textbook(3, "習った ことを すぐ 忘れて しまいます。", "習った", ["あらった", "わらった", "ならった", "もらった"], 2, ["씻었다", "웃었다", "배웠다", "받았다"], "習った의 읽기는 ならった입니다."),
  textbook(4, "へやの なかは 暗くて なにも 見えませんでした。", "暗くて", ["くらくて", "ぐらくて", "あふなくて", "あぶなくて"], 0, ["어두워서", "올바른 읽기가 아님", "올바른 읽기가 아님", "위험해서"], "暗くて의 읽기는 くらくて입니다."),
  textbook(5, "今度の 試合は ぜひ 勝ちたいです。", "今度", ["こんど", "さんど", "なんど", "まいど"], 0, ["이번·다음번", "세 번", "몇 번", "매번"], "今度의 읽기는 こんど입니다."),
  textbook(6, "妹は 母に 顔が にて います。", "顔", ["そら", "かお", "はな", "くち"], 1, ["하늘", "얼굴", "코·꽃", "입"], "顔의 읽기는 かお입니다."),
  textbook(7, "むすめは 赤い ふくを きて いる。", "赤い", ["しろい", "あおい", "くろい", "あかい"], 3, ["하얗다", "파랗다", "검다", "빨갛다"], "赤い의 읽기는 あかい입니다."),
  textbook(8, "これは なんの 薬ですか。", "薬", ["くせり", "くすり", "くさ", "くし"], 1, ["올바른 읽기가 아님", "약", "풀", "빗"], "薬의 읽기는 くすり입니다."),
  textbook(9, "この へんに 食料品を 売って いる みせは ありませんか。", "食料品", ["しょくりょうひん", "しょりょうひん", "しょくりょうぴん", "しょつりょうて"], 0, ["식료품", "올바른 읽기가 아님", "올바른 읽기가 아님", "올바른 읽기가 아님"], "食料品의 읽기는 しょくりょうひん입니다."),
  textbook(10, "この 問題に ついて すずきさんの 意見を 聞かせて ください。", "意見", ["いか", "いし", "いけん", "いみ"], 2, ["이하", "돌·의지", "의견", "의미"], "意見의 읽기는 いけん입니다."),
  question({ id: "gen-q1", type: "context", prompt: "この部屋では、たばこを（　　　）。", choices: ["すってもいいです", "すってはいけません", "すわなくてもいいです", "すったことがあります"], answerIndex: 1, translations: ["피워도 됩니다", "피우면 안 됩니다", "피우지 않아도 됩니다", "피운 적이 있습니다"], feedback: ["禁煙 장소에서 허용을 나타내면 뜻이 반대가 됩니다.", "금연 장소의 금지를 자연스럽게 나타냅니다.", "문법적으로 가능하지만 금연 규칙은 보통 금지 표현으로 말합니다.", "경험 표현이라 현재의 금연 규칙을 나타내지 않습니다."], explanationKo: "禁煙인 방에서는 담배를 피우면 안 됩니다.", source: { type: "generated", basedOnWord: "禁煙", level: "N4" } }),
  question({ id: "gen-q2", type: "context", prompt: "来月、大阪へ（　　　）ので、今は荷物を整理しています。", choices: ["引っ越す", "喜ぶ", "増える", "忘れる"], readings: ["ひっこす", "よろこぶ", "ふえる", "わすれる"], answerIndex: 0, translations: ["이사하다", "기뻐하다", "늘다", "잊다"], feedback: ["새집으로 옮기기 위해 짐을 정리하는 문맥에 맞습니다.", "기뻐한다는 뜻으로 짐 정리와 연결되지 않습니다.", "수가 늘어난다는 뜻으로 이동 문맥과 맞지 않습니다.", "잊는다는 뜻으로 이사 준비 문맥과 맞지 않습니다."], explanationKo: "짐을 정리하는 문맥에는 引っ越す가 자연스럽습니다.", source: { type: "generated", basedOnWord: "引っ越す", level: "N4" } }),
  question({ id: "gen-q3", type: "synonym", prompt: "「用意します」と意味がいちばん近いものはどれですか。", choices: ["準備します", "忘れます", "運転します", "説明します"], readings: ["じゅんびします", "わすれます", "うんてんします", "せつめいします"], answerIndex: 0, translations: ["준비합니다", "잊습니다", "운전합니다", "설명합니다"], feedback: ["用意する와 같이 준비한다는 뜻입니다.", "잊는다는 뜻으로 반대 문맥입니다.", "차량을 운전한다는 뜻입니다.", "내용을 설명한다는 뜻입니다."], explanationKo: "用意する와 準備する는 준비하다는 뜻으로 가깝습니다.", source: { type: "generated", basedOnWord: "用意", level: "N4" } }),
  question({ id: "gen-q4", type: "usage", prompt: "「必要」の使い方として正しいものはどれですか。", choices: ["申し込みには写真が必要です。", "パンが必要に増えました。", "駅まで必要を歩きます。", "妹は必要を喜びました。"], readings: ["もうしこみには しゃしんが ひつようです。", "パンが ひつように ふえました。", "えきまで ひつようを あるきます。", "いもうとは ひつようを よろこびました。"], answerIndex: 0, translations: ["신청에는 사진이 필요합니다.", "빵이 필요하게 늘었습니다.", "역까지 필요를 걷습니다.", "여동생은 필요를 기뻐했습니다."], feedback: ["必要だ의 자연스러운 사용입니다.", "必要に増える라는 연결은 자연스럽지 않습니다.", "必要를 걷는 대상으로 사용할 수 없습니다.", "必要를 기뻐하는 대상으로 사용할 수 없습니다."], explanationKo: "必要だ는 무엇이 필요하다고 말할 때 씁니다.", source: { type: "generated", basedOnWord: "必要", level: "N4" } }),
  question({ id: "gen-q5", type: "context", prompt: "このパンはかたくありません。とても（　　　）です。", choices: ["柔らかい", "暗い", "眠い", "危ない"], readings: ["やわらかい", "くらい", "ねむい", "あぶない"], answerIndex: 0, translations: ["부드럽다", "어둡다", "졸리다", "위험하다"], feedback: ["かたくない와 같은 방향의 뜻입니다.", "밝기의 상태라서 빵의 단단함과 관계없습니다.", "사람의 졸린 상태를 나타냅니다.", "위험한 상태를 나타내며 촉감과 관계없습니다."], explanationKo: "かたくない와 의미가 이어지는 말은 柔らかい입니다.", source: { type: "generated", basedOnWord: "柔らかい", level: "N4" } }),
]);
