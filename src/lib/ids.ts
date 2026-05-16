export const newNodeId = (): string => {
	const bytes = new Uint8Array(3)
	crypto.getRandomValues(bytes)
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
