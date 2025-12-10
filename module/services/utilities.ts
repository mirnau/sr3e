export async function openFilePicker(document: Actor | Item): Promise<string> {
	return new Promise((resolve) => {
		const picker = new FilePicker();
		picker.type = "image";
		picker.callback = (path: string) => {
			// @ts-ignore - img exists on Actor and Item at runtime
			document.update({ img: path });
			resolve(path);
		};
		// @ts-ignore - render exists on picker
		picker.render({ force: true });
	});
}

export function localize(key: string): string {
	return game.i18n.localize(key);
}