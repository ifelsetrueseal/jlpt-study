import { notFound } from "next/navigation";
import { isDeckId } from "@/lib/decks";
import { Session } from "@/components/session";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck } = await params;
  if (!isDeckId(deck)) notFound();
  return <Session deck={deck} />;
}
