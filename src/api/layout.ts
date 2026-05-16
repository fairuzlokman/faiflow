import { readLayout, writeLayout } from '@/lib/storage'

export const layoutDataQuery = ['layout-data'] as const

// -----------------------------------------------------------------------------
// Domain types
// -----------------------------------------------------------------------------
export type LayoutPosition = { x: number; y: number }

export const getLayout = async (): Promise<Record<string, LayoutPosition> | null> => {
	try {
		return readLayout()
	} catch (error) {
		console.error('Failed to get layout:', error)
		return null
	}
}

export const editLayout = async (layout: Record<string, LayoutPosition>): Promise<void> => {
	try {
		writeLayout(layout)
	} catch (error) {
		console.error('Failed to edit layout:', error)
		throw error
	}
}
