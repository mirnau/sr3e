export type JournalOption = {
   value: string;
   type: "entry" | "page";
   label: string;
   entryId?: string;
   pageId?: string;
};

type JournalContent = {
   entry: any;
   page: any;
};

export function resolveJournalContent(id: string | null): JournalContent | null {
   if (!id) return null;

   const parsed = parseJournalId(id);
   if (parsed.pageId) {
      const entry = game.journal.get(parsed.entryId);
      const page = entry?.pages?.get?.(parsed.pageId) ?? entry?.pages?.contents?.find((p: any) => p.id === parsed.pageId);
      return entry && page ? { entry, page } : null;
   }

   const entry = game.journal.get(id);
   if (entry) return { entry, page: entry.pages?.contents?.[0] ?? null };

   for (const candidate of game.journal.contents) {
      const page = candidate.pages?.get?.(id) ?? candidate.pages?.contents?.find((p: any) => p.id === id);
      if (page) return { entry: candidate, page };
   }

   return null;
}

export function journalPageValue(entryId: string, pageId: string): string {
   return `${entryId}:${pageId}`;
}

export async function enrichJournalContent(id: string | null): Promise<string> {
   const content = resolveJournalContent(id)?.page?.text?.content ?? "";
   if (!content) return "";

   return (foundry.applications.ux.TextEditor as any).enrichHTML(content, {
      secrets: false,
      documents: false,
   }) as Promise<string>;
}

export function openJournalSheet(id: string | null) {
   resolveJournalContent(id)?.entry?.sheet?.render(true);
}

function parseJournalId(id: string): { entryId: string; pageId?: string } {
   const [entryId = "", pageId] = id.split(":");
   return pageId ? { entryId, pageId } : { entryId };
}
