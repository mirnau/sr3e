export async function pickImagePath(current?: string): Promise<string> {
	return new Promise((resolve) => {
		const FP = foundry.applications.apps.FilePicker.implementation;
		const picker = new FP({ type: "image", current } as never);
		picker.callback = (path: string) => resolve(path);
		// @ts-ignore - render exists on picker
		picker.render({ force: true });
	});
}

export async function openFilePicker(document: Actor | Item): Promise<string> {
	const path = await pickImagePath(document.img as string);
	// @ts-ignore - img exists on Actor and Item at runtime
	document.update({ img: path });
	return path;
}

export function localize(key: string): string {
	return game.i18n.localize(key);
}