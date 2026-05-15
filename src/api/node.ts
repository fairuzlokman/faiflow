export const nodesDataQuery = ['nodes-data'] as const

export type FlowNode = {
	id: string | number
	parentId?: string | number
	type: string
	name?: string
	data?: Record<string, unknown>
}

export const getNodes = async (): Promise<FlowNode[]> => {
	await new Promise((resolve) => setTimeout(resolve, 400))
	const response = await fetch('/data.json')
	if (!response.ok) {
		throw new Error(`Failed to fetch nodes data: ${response.status}`)
	}
	return response.json()
}
