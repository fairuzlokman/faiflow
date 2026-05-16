import { readNodes, writeNodes } from '@/lib/persistence'

export const nodesDataQuery = ['nodes-data'] as const

// -----------------------------------------------------------------------------
// Domain types
// -----------------------------------------------------------------------------
// A FlowNode is the canonical record we store and persist. VueFlow's runtime
// Node shape (with `position`) is derived from this — see `src/lib/nodeMap.ts`.
// `parentId` of -1 marks the root (the trigger).

export type NodeType =
	| 'sendMessage'
	| 'addComment'
	| 'dateTime'
	| 'dateTimeConnector'
	| 'trigger'

export type TextPayload = { type: 'text'; text: string }
export type AttachmentPayload = { type: 'attachment'; attachment: string }
export type MessagePayload = TextPayload | AttachmentPayload

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type BusinessHourSlot = { day: DayKey; startTime: string; endTime: string }

export type NodeData =
	| { payload: MessagePayload[] }
	| { comment: string }
	| {
			times: BusinessHourSlot[]
			timezone: string
			connectors?: string[]
			action?: 'businessHours'
	  }
	| { connectorType: 'success' | 'failure' }
	| { type: string; oncePerContact?: boolean }
	| Record<string, unknown>

export type FlowNode = {
	id: string
	parentId: string | number
	type: NodeType
	title?: string
	description?: string
	data?: NodeData
	position?: { x: number; y: number }
}

// -----------------------------------------------------------------------------
// Query / mutation functions
// -----------------------------------------------------------------------------
// `getNodes` prefers a localStorage mirror when present so user edits survive a
// refresh; otherwise it falls back to the seed file in /public. `editNodes`
// persists the whole canonical array — keeping the API surface simple lets the
// caller batch any CRUD operation into one write.

const SIMULATED_LATENCY_MS = 250

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getNodes = async (): Promise<FlowNode[]> => {
	await wait(SIMULATED_LATENCY_MS)
	const cached = readNodes()
	if (cached) return cached

	const response = await fetch('/data.json')
	if (!response.ok) {
		throw new Error(`Failed to fetch nodes data: ${response.status}`)
	}
	return response.json()
}

export const editNodes = async (nodes: FlowNode[]): Promise<FlowNode[]> => {
	await wait(SIMULATED_LATENCY_MS)
	writeNodes(nodes)
	return nodes
}
