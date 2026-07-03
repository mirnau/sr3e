import { hooks } from "../../types/configuration-keys";

type DocumentIconName = "Actor" | "Item";

type DocumentIconKey = `${DocumentIconName}:${string}`;

type TypedDocumentSource = {
	type?: string;
	img?: string;
	system?: Record<string, unknown>;
	updateSource?: (changes: { img: string }) => void;
};

type DocumentIconRule = {
	documentName: DocumentIconName;
	type: string;
	img: string;
	matches: (source: TypedDocumentSource) => boolean;
};

const foundryDefaultIcons = new Set([
	"icons/svg/mystery-man.svg",
	"icons/svg/item-bag.svg",
]);

const documentTypeIcons = new Map<DocumentIconKey, string>();
const documentIconRules: DocumentIconRule[] = [];
const registeredIconPaths = new Set<string>();

export function registerDocumentTypeIcon(
	documentName: DocumentIconName,
	type: string,
	img: string
): void {
	documentTypeIcons.set(keyFor(documentName, type), img);
	registeredIconPaths.add(img);
}

export function registerDocumentTypeIconRule(
	documentName: DocumentIconName,
	type: string,
	matches: (source: TypedDocumentSource) => boolean,
	img: string
): void {
	documentIconRules.push({ documentName, type, matches, img });
	registeredIconPaths.add(img);
}

export function getDocumentTypeIcon(
	documentName: DocumentIconName,
	type: string
): string | undefined {
	return documentTypeIcons.get(keyFor(documentName, type));
}

export function registerDocumentTypeIconHooks(): void {
	Hooks.on(hooks.preCreateActor, (document: TypedDocumentSource, data: TypedDocumentSource) => {
		applyDocumentTypeIcon("Actor", document, data);
	});
	Hooks.on(hooks.preCreateItem, (document: TypedDocumentSource, data: TypedDocumentSource) => {
		applyDocumentTypeIcon("Item", document, data);
	});
}

function applyDocumentTypeIcon(
	documentName: DocumentIconName,
	document: TypedDocumentSource,
	data: TypedDocumentSource
): void {
	const type = data.type ?? document.type;
	if (!type) return;

	const source = { ...document, ...data, type };
	const img = getDocumentTypeIconForSource(documentName, type, source);
	if (!img || hasCustomIcon(data.img ?? document.img)) return;

	document.updateSource?.({ img });
}

function hasCustomIcon(img: string | undefined): boolean {
	return Boolean(img && !foundryDefaultIcons.has(img) && !registeredIconPaths.has(img));
}

function getDocumentTypeIconForSource(
	documentName: DocumentIconName,
	type: string,
	source: TypedDocumentSource
): string | undefined {
	return documentIconRules.find(rule =>
		rule.documentName === documentName &&
		rule.type === type &&
		rule.matches(source)
	)?.img ?? getDocumentTypeIcon(documentName, type);
}

function keyFor(documentName: DocumentIconName, type: string): DocumentIconKey {
	return `${documentName}:${type}`;
}
