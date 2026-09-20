import { notFound } from "next/navigation";
import { isDeckId } from "@/lib/decks";
import { Session } from "@/components/session";

/** 정적 내보내기라 어떤 덱이 있는지 빌드 때 알려줘야 한다 */
export function generateStaticParams() {
  return [{ deck: "kanji" }, { deck: "word" }];
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck } = await params;
  if (!isDeckId(deck)) notFound();
  return <Session deck={deck} />;
}
