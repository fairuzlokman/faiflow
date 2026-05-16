import { readNodes, writeNodes } from '@/lib/storage'

export const nodesDataQuery = ['nodes-data'] as const

// -----------------------------------------------------------------------------
// Domain types
// -----------------------------------------------------------------------------

export type NodeType = 'sendMessage' | 'addComment' | 'dateTime' | 'dateTimeConnector' | 'trigger'

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

export const getNodes = async (): Promise<FlowNode[]> => {
	try {
		const cached = readNodes()
		if (cached) return cached

		const response = await fetch('/data.json')
		if (!response.ok) {
			throw new Error(`Failed to fetch nodes data: ${response.status}`)
		}
		return response.json()
	} catch (error) {
		console.error('Failed to get nodes:', error)
		throw error
	}
}

export const editNodes = async (nodes: FlowNode[]): Promise<FlowNode[]> => {
	try {
		writeNodes(nodes)
		return nodes
	} catch (error) {
		console.error('Failed to edit nodes:', error)
		throw error
	}
}
