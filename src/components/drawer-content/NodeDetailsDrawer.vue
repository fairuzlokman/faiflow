<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useSelectedNode } from '@/composables/useSelectedNode'
import { useNodeMutation } from '@/composables/useNodeMutation'
import { validateDescription, validateTitle } from '@/lib/validation'
import { getNodeMeta } from '@/lib/nodeTypes'

import SendMessageEditor from './SendMessageEditor.vue'
import AddCommentEditor from './AddCommentEditor.vue'
import BusinessHoursEditor from './BusinessHoursEditor.vue'

// The drawer's open state is driven by the URL — see useSelectedNode. When
// the selected node changes, we seed the local form refs from the domain
// record so the inputs are controlled but un-coupled from the store until
// the user clicks Save.

const { selected, isOpen, close } = useSelectedNode()
const { updateNode, deleteNode } = useNodeMutation()

const titleInput = ref('')
const descriptionInput = ref('')
const titleError = ref<string | null>(null)
const descriptionError = ref<string | null>(null)

watch(
	selected,
	(node) => {
		if (!node) return
		titleInput.value = node.title ?? ''
		descriptionInput.value = node.description ?? ''
		titleError.value = null
		descriptionError.value = null
	},
	{ immediate: true },
)

const meta = computed(() => (selected.value ? getNodeMeta(selected.value.type) : null))
const typeLabel = computed(() => meta.value?.label ?? '')

function save() {
	if (!selected.value) return

	const titleResult = validateTitle(titleInput.value)
	const descResult = validateDescription(descriptionInput.value)
	titleError.value = titleResult.ok ? null : titleResult.message
	descriptionError.value = descResult.ok ? null : descResult.message
	if (!titleResult.ok || !descResult.ok) return

	updateNode(selected.value.id, {
		title: titleInput.value.trim(),
		description: descriptionInput.value.trim(),
	})
	close()
}

function remove() {
	if (!selected.value) return
	const confirmed = window.confirm('Delete this node and all of its children?')
	if (!confirmed) return
	deleteNode(selected.value.id)
	close()
}

// vaul-vue's <Drawer> uses v-model for open. We bridge the URL-driven state
// onto its v-model and route to / when the user closes via overlay or Esc.
function onOpenChange(open: boolean) {
	if (!open) close()
}
</script>

<template>
	<Drawer :open="isOpen" direction="right" @update:open="onOpenChange">
		<DrawerContent>
			<template v-if="selected">
				<DrawerHeader class="border-b">
					<DrawerTitle>{{ titleInput || 'Untitled' }}</DrawerTitle>
					<DrawerDescription>{{ typeLabel }} · ID {{ selected.id }}</DrawerDescription>
				</DrawerHeader>

				<div class="flex-1 space-y-6 overflow-y-auto p-4">
					<section class="space-y-4">
						<div>
							<label for="node-title" class="text-xs font-medium text-muted-foreground">
								Title
							</label>
							<input
								id="node-title"
								v-model="titleInput"
								type="text"
								autocomplete="off"
								class="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
								:aria-invalid="titleError ? 'true' : 'false'"
								@input="titleError = null"
							/>
							<p v-if="titleError" class="mt-1 text-xs text-destructive">{{ titleError }}</p>
						</div>
						<div>
							<label for="node-desc" class="text-xs font-medium text-muted-foreground">
								Description
							</label>
							<textarea
								id="node-desc"
								v-model="descriptionInput"
								rows="3"
								class="mt-1 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
								:aria-invalid="descriptionError ? 'true' : 'false'"
								@input="descriptionError = null"
							/>
							<p v-if="descriptionError" class="mt-1 text-xs text-destructive">
								{{ descriptionError }}
							</p>
						</div>
					</section>

					<section v-if="selected.type === 'sendMessage'" class="border-t pt-4">
						<SendMessageEditor :node-id="selected.id" />
					</section>
					<section v-else-if="selected.type === 'addComment'" class="border-t pt-4">
						<AddCommentEditor :node-id="selected.id" />
					</section>
					<section v-else-if="selected.type === 'dateTime'" class="border-t pt-4">
						<BusinessHoursEditor :node-id="selected.id" />
					</section>
				</div>

				<DrawerFooter class="border-t">
					<Button class="w-full" @click="save">Save changes</Button>
					<div class="flex gap-2">
						<DrawerClose as-child>
							<Button variant="outline" class="flex-1">Cancel</Button>
						</DrawerClose>
						<Button variant="destructive" class="flex-1" @click="remove">
							<Trash2 class="size-4" />
							Delete node
						</Button>
					</div>
				</DrawerFooter>
			</template>
		</DrawerContent>
	</Drawer>
</template>
