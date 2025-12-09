export async function openFilePicker(document: Actor | Item): Promise<string> {
	return new Promise((resolve) => {
		new foundry.applications.apps.FilePicker({
			type: "image",
			current: document.img,
			callback: (path: string) => {
				document.update({ img: path }, { render: true });
				resolve(path);
			},
		}).render(true);
	});
}

export function localize(key: string): string {
	return game.i18n.localize(key);
}
