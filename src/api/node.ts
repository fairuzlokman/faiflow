export const nodesDataQuery = ['nodes-data'] as const

export type FlowNode = {
	id: string | number
	parentId: string | number
	type: string
	name?: string
	data?: Record<string, unknown>
}

export type FlowEdge = {
	id: string | number
	parentId: string | number
	type: string
}

export const getNodes = async (): Promise<FlowNode[]> => {
	await new Promise((resolve) => setTimeout(resolve, 400))
	const response = await fetch('/data.json')
	if (!response.ok) {
		throw new Error(`Failed to fetch nodes data: ${response.status}`)
	}
	return response.json()
}

// Edit includes adding, updating, and deleting nodes
export const editNodes = async (nodes: FlowNode[]): Promise<void> => {
	await new Promise((resolve) => setTimeout(resolve, 400))
	const response = await fetch('/data.json', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(nodes),
	})
	if (!response.ok) {
		throw new Error(`Failed to edit nodes data: ${response.status}`)
	}
}
