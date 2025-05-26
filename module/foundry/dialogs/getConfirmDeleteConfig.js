export default function getConfirmDeleteConfig(name) {
	return {
		window: {
			title: "Confirm Deletion",
			classes: ["sr3e-dialog", "confirm-delete-dialog"]
		},
		content: `
			<div class="confirm-delete-content">
				<p>Are you sure you want to delete <strong>${name}</strong>?</p>
			</div>
		`,
		buttons: [
			{
				action: "no",
				label: "No",
				icon: "fa-solid fa-xmark",
				callback: () => false
			}
		]
	};
}
