import {
	Clock,
	GitBranch,
	MessageCircle,
	MessageSquare,
	Zap,
	type LucideIcon,
} from 'lucide-vue-next'
import type { NodeType } from '@/api/node'

// Single source of truth for everything UI-facing about a node type: the
// human-readable label, the icon to show on the card, whether it can be
// edited via the drawer, and whether the user can create new ones of this
// type. Keeping this in one map avoids the constants drifting across the
// canvas, the drawer, and the Create dialog.

export type NodeTypeMeta = {
	label: string
	icon: LucideIcon
	editable: boolean
	creatable: boolean
}

export const NODE_TYPE_META: Record<NodeType, NodeTypeMeta> = {
	sendMessage: { label: 'Send Message', icon: MessageSquare, editable: true, creatable: true },
	addComment: { label: 'Add Comment', icon: MessageCircle, editable: true, creatable: true },
	dateTime: { label: 'Business Hours', icon: Clock, editable: true, creatable: true },
	trigger: { label: 'Trigger', icon: Zap, editable: false, creatable: false },
	dateTimeConnector: { label: 'Connector', icon: GitBranch, editable: false, creatable: false },
}

export const CREATABLE_NODE_TYPES = (Object.entries(NODE_TYPE_META) as [NodeType, NodeTypeMeta][])
	.filter(([, meta]) => meta.creatable)
	.map(([type, meta]) => ({ type, ...meta }))

export function getNodeMeta(type: NodeType): NodeTypeMeta {
	return NODE_TYPE_META[type]
}
