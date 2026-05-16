import type { FlowNode } from '@/api/node'

// localStorage mirror of the canonical node list. We version the key so a
// future schema change can be detected and reset cleanly instead of crashing
// hydration on stale shapes.
const STORAGE_KEY = 'faiflow:nodes:v1'

export function readNodes(): FlowNode[] | null {
	if (typeof localStorage === 'undefined') return null
	const raw = localStorage.getItem(STORAGE_KEY)
	if (!raw) return null
	try {
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? (parsed as FlowNode[]) : null
	} catch {
		return null
	}
}

export function writeNodes(nodes: FlowNode[]): void {
	if (typeof localStorage === 'undefined') return
	localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes))
}

export function clearNodes(): void {
	if (typeof localStorage === 'undefined') return
	localStorage.removeItem(STORAGE_KEY)
}
