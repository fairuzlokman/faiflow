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
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger,
	} from '@/components/ui/alert-dialog'
	import { Button, buttonVariants } from '@/components/ui/button'
	import { useSelectedNode } from '@/composables/useSelectedNode'
	import { useNodeMutation } from '@/composables/useNodeMutation'
	import { validateDescription, validateTitle } from '@/lib/validation'
	import { getNodeMeta } from '@/lib/nodeTypes'

	import SendMessageEditor from './SendMessageEditor.vue'
	import AddCommentEditor from './AddCommentEditor.vue'
	import BusinessHoursEditor from './BusinessHoursEditor.vue'
	import { toast } from 'vue-sonner'

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

	const handleSaveMetaData = () => {
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

	const handleConfirmDelete = () => {
		if (!selected.value) return
		deleteNode(selected.value.id)
		close()

		toast.success('Node deleted successfully')
	}

	const handleOpenChange = (open: boolean) => {
		if (!open) close()
	}
</script>

<template>
	<Drawer :open="isOpen" direction="right" @update:open="handleOpenChange">
		<DrawerContent>
			<template v-if="selected">
				<DrawerHeader class="border-b">
					<DrawerTitle>{{ titleInput || 'Untitled' }}</DrawerTitle>
					<DrawerDescription>{{ typeLabel }} · ID {{ selected.id }}</DrawerDescription>
				</DrawerHeader>

				<div class="flex-1 space-y-6 overflow-y-auto p-4">
					<section class="space-y-4">
						<div>
							<label
								for="node-title"
								class="text-xs font-medium text-muted-foreground"
							>
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
							<p v-if="titleError" class="mt-1 text-xs text-destructive">
								{{ titleError }}
							</p>
						</div>
						<div>
							<label
								for="node-desc"
								class="text-xs font-medium text-muted-foreground"
							>
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
						<SendMessageEditor
							:node-id="selected.id"
							:save-meta-data="handleSaveMetaData"
						/>
					</section>
					<section v-else-if="selected.type === 'addComment'" class="border-t pt-4">
						<AddCommentEditor
							:node-id="selected.id"
							:save-meta-data="handleSaveMetaData"
						/>
					</section>
					<section v-else-if="selected.type === 'dateTime'" class="border-t pt-4">
						<BusinessHoursEditor
							:node-id="selected.id"
							:save-meta-data="handleSaveMetaData"
						/>
					</section>
				</div>

				<DrawerFooter>
					<!-- <Button class="w-full" @click="handleSaveChanges">Save changes</Button> -->
					<div class="flex gap-2">
						<DrawerClose as-child>
							<Button variant="outline" class="flex-1">Cancel</Button>
						</DrawerClose>
						<div class="flex-1">
							<AlertDialog>
								<AlertDialogTrigger as-child>
									<Button variant="destructive" class="w-full">
										<Trash2 class="size-4" />
										Delete node
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Delete this node?</AlertDialogTitle>
										<AlertDialogDescription>
											This will delete this node and all of its children.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											:class="buttonVariants({ variant: 'destructive' })"
											@click="handleConfirmDelete"
										>
											Delete node
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				</DrawerFooter>
			</template>
		</DrawerContent>
	</Drawer>
</template>
