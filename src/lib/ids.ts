// Produces a short hex id (6 hex chars) matching the style of the seed data.
// crypto.getRandomValues is available in modern browsers and in jsdom, so
// tests don't need a polyfill.
export function newNodeId(): string {
	const bytes = new Uint8Array(3)
	crypto.getRandomValues(bytes)
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
