import { NewsMessage } from "./NewsMessage";
import { NewsConfig } from "./NewsConfig";

/**
 * Estimates marquee duration based on content width and scroll speed.
 */
export class DurationEstimator {
	constructor(
		private readonly scrollSpeed = NewsConfig.SCROLL_SPEED,
		private readonly defaultMs = NewsConfig.DEFAULT_MS,
		private readonly estimatedTickerWidth = NewsConfig.ESTIMATED_TICKER_WIDTH
	) {}

	estimate(buffer: NewsMessage[]): number {
		if (!Array.isArray(buffer) || buffer.length === 0) return this.defaultMs;

		const FONT_SIZE_PX = 24; // 1.5rem = 24px typically

		const calculateTextWidth = (text: string = ""): number => {
			let totalWidth = 0;

			for (const char of text) {
				const code = char.codePointAt(0);
				if (!code) continue;

				if (
					(code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
					(code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
					(code >= 0x3040 && code <= 0x309f) || // Hiragana
					(code >= 0x30a0 && code <= 0x30ff) || // Katakana
					(code >= 0xac00 && code <= 0xd7af) // Hangul
				) {
					totalWidth += FONT_SIZE_PX * 1.0; // Full width
				} else if (code >= 0x0400 && code <= 0x04ff) {
					// Cyrillic
					totalWidth += FONT_SIZE_PX * 0.75;
				} else if (
					(code >= 0x0590 && code <= 0x05ff) || // Hebrew
					(code >= 0x0600 && code <= 0x06ff) // Arabic
				) {
					// Arabic/Hebrew
					totalWidth += FONT_SIZE_PX * 0.65;
				} else if (code >= 0x0e00 && code <= 0x0e7f) {
					// Thai
					totalWidth += FONT_SIZE_PX * 0.6;
				} else if (code >= 0x0900 && code <= 0x097f) {
					// Devanagari
					totalWidth += FONT_SIZE_PX * 0.7;
				} else if ("iltfj".includes(char)) {
					// Latin narrow
					totalWidth += FONT_SIZE_PX * 0.4;
				} else if ("wmMW".includes(char)) {
					// Latin wide
					totalWidth += FONT_SIZE_PX * 1.2;
				} else if (code < 0x0080) {
					// Default Latin
					totalWidth += FONT_SIZE_PX * 0.75;
				} else {
					// Fallback
					totalWidth += FONT_SIZE_PX * 0.8;
				}
			}

			return totalWidth;
		};

		const marqueeWidth = buffer.reduce((sum, msg) => {
			const senderWidth = calculateTextWidth(msg.sender);
			const headlineWidth = calculateTextWidth(msg.headline);
			const itemPadding = 64; // 2rem left + 2rem right
			return sum + senderWidth + headlineWidth + itemPadding;
		}, 0);

		const totalDistance = this.estimatedTickerWidth + marqueeWidth;
		const duration = (totalDistance / this.scrollSpeed) * 1000;

		return Math.max(Math.ceil(duration), this.defaultMs);
	}
}
