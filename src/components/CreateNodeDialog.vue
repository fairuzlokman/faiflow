<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from 'reka-ui'
import { Plus, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { CREATABLE_NODE_TYPES } from '@/lib/nodeTypes'
import { useNodeMutation } from '@/composables/useNodeMutation'
import { useCanvasStore } from '@/stores/canvas'
import { newNodeId } from '@/lib/ids'
import { validateDescription, validateTitle } from '@/lib/validation'
import { ROW_HEIGHT } from '@/lib/nodeMap'
import type { NodeType, NodeData } from '@/api/node'

const open = ref(false)
const store = useCanvasStore()
const { createNode } = useNodeMutation()

type FormState = {
	title: string
	description: string
	type: NodeType
	titleError: string | null
	descriptionError: string | null
}

function emptyForm(): FormState {
	return {
		title: '',
		description: '',
		type: CREATABLE_NODE_TYPES[0]?.type ?? 'sendMessage',
		titleError: null,
		descriptionError: null,
	}
}

const form = reactive<FormState>(emptyForm())

watch(open, (next) => {
	if (next) Object.assign(form, emptyForm())
})

// Default data for newly created nodes. Each type expects a particular
// shape — keeping the seed here means editors don't need to handle
// "missing data" cases.
function defaultDataFor(type: NodeType): NodeData {
	switch (type) {
		case 'sendMessage':
			return { payload: [] }
		case 'addComment':
			return { comment: '' }
		case 'dateTime':
			return { times: [], timezone: 'UTC' }
		default:
			return {}
	}
}

// Park new nodes one row below the lowest existing node so they don't
// overlap. Horizontal position resets to the left edge of the canvas.
function nextPosition(): { x: number; y: number } {
	let maxY = 0
	for (const node of store.allDomainNodes) {
		const y = node.position?.y ?? 0
		if (y > maxY) maxY = y
	}
	return { x: 0, y: maxY + ROW_HEIGHT }
}

function submit() {
	const titleResult = validateTitle(form.title)
	const descResult = validateDescription(form.description)
	form.titleError = titleResult.ok ? null : titleResult.message
	form.descriptionError = descResult.ok ? null : descResult.message
	if (!titleResult.ok || !descResult.ok) return

	createNode({
		id: newNodeId(),
		parentId: -1, // unattached; user can wire later via a future connection feature
		type: form.type,
		title: form.title.trim(),
		description: form.description.trim(),
		data: defaultDataFor(form.type),
		position: nextPosition(),
	})
	open.value = false
}
</script>

<template>
	<DialogRoot v-model:open="open">
		<DialogTrigger as-child>
			<Button>
				<Plus class="size-4" />
				Create New Node
			</Button>
		</DialogTrigger>
		<DialogPortal>
			<DialogOverlay
				class="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
			/>
			<DialogContent
				class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
			>
				<div class="mb-4">
					<DialogTitle class="text-lg font-semibold">Create a new node</DialogTitle>
					<DialogDescription class="text-sm text-muted-foreground">
						Pick a type, give it a title, and it'll appear on the canvas.
					</DialogDescription>
				</div>

				<form class="space-y-4" @submit.prevent="submit">
					<div>
						<label for="create-title" class="text-xs font-medium text-muted-foreground">
							Title
						</label>
						<input
							id="create-title"
							v-model="form.title"
							type="text"
							autocomplete="off"
							autofocus
							class="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
							:aria-invalid="form.titleError ? 'true' : 'false'"
							@input="form.titleError = null"
						/>
						<p v-if="form.titleError" class="mt-1 text-xs text-destructive">
							{{ form.titleError }}
						</p>
					</div>

					<div>
						<label for="create-desc" class="text-xs font-medium text-muted-foreground">
							Description
						</label>
						<textarea
							id="create-desc"
							v-model="form.description"
							rows="3"
							class="mt-1 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
							:aria-invalid="form.descriptionError ? 'true' : 'false'"
							@input="form.descriptionError = null"
						/>
						<p v-if="form.descriptionError" class="mt-1 text-xs text-destructive">
							{{ form.descriptionError }}
						</p>
					</div>

					<div>
						<label for="create-type" class="text-xs font-medium text-muted-foreground">
							Type
						</label>
						<select
							id="create-type"
							v-model="form.type"
							class="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<option v-for="entry in CREATABLE_NODE_TYPES" :key="entry.type" :value="entry.type">
								{{ entry.label }}
							</option>
						</select>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<DialogClose as-child>
							<Button type="button" variant="outline">Cancel</Button>
						</DialogClose>
						<Button type="submit">Create node</Button>
					</div>
				</form>

				<DialogClose
					aria-label="Close"
					class="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-accent"
				>
					<X class="size-4" />
				</DialogClose>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
