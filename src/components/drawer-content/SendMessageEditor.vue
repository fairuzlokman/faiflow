<script setup lang="ts">
import { computed, ref } from 'vue'
import { Image, Plus, Trash2, Upload } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { useCanvasStore } from '@/stores/canvas'
import { useNodeMutation } from '@/composables/useNodeMutation'
import type { MessagePayload } from '@/api/node'

const props = defineProps<{ nodeId: string }>()

const store = useCanvasStore()
const { updateNode } = useNodeMutation()

const node = computed(() => store.getNode(props.nodeId))
const payload = computed<MessagePayload[]>(() => {
	const data = node.value?.data as { payload?: MessagePayload[] } | undefined
	return data?.payload ?? []
})

const newText = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const persistPayload = (next: MessagePayload[]) => {
	updateNode(props.nodeId, { data: { payload: next } })
}

const updateText = (index: number, value: string) => {
	const next = payload.value.map((item, i) =>
		i === index && item.type === 'text' ? { ...item, text: value } : item,
	)
	persistPayload(next)
}

const removeItem = (index: number) => {
	persistPayload(payload.value.filter((_, i) => i !== index))
}

const addText = () => {
	const trimmed = newText.value.trim()
	if (!trimmed) return
	persistPayload([...payload.value, { type: 'text', text: trimmed }])
	newText.value = ''
}

// Upload reads each file as a data URL — purely client-side, no backend
// required. Larger files will bloat localStorage; for an assessment that's
// an acceptable tradeoff and the README notes it.
const onFileChange = (event: Event) => {
	const input = event.target as HTMLInputElement
	const files = input.files
	if (!files || files.length === 0) return

	const readers: Promise<MessagePayload>[] = []
	for (const file of files) {
		readers.push(
			new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () =>
					resolve({ type: 'attachment', attachment: String(reader.result) })
				reader.onerror = () => reject(reader.error)
				reader.readAsDataURL(file)
			}),
		)
	}
	Promise.all(readers)
		.then((added) => persistPayload([...payload.value, ...added]))
		.finally(() => {
			input.value = ''
		})
}
</script>

<template>
	<div class="space-y-4">
		<header>
			<h3 class="text-sm font-semibold">Message content</h3>
			<p class="text-xs text-muted-foreground">Add text messages and attachments.</p>
		</header>

		<ul class="space-y-2">
			<li
				v-for="(item, index) in payload"
				:key="index"
				class="flex items-start gap-2 rounded-md border bg-background p-2"
			>
				<template v-if="item.type === 'text'">
					<textarea
						:value="item.text"
						rows="2"
						class="flex-1 resize-none rounded-md border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						@change="(e) => updateText(index, (e.target as HTMLTextAreaElement).value)"
					/>
				</template>
				<template v-else>
					<div class="flex flex-1 items-center gap-2">
						<img
							:src="item.attachment"
							alt="attachment preview"
							class="size-12 rounded object-cover"
						/>
						<span class="truncate text-xs text-muted-foreground">
							{{
								item.attachment.startsWith('data:')
									? 'Uploaded image'
									: item.attachment
							}}
						</span>
					</div>
				</template>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Remove item"
					@click="removeItem(index)"
				>
					<Trash2 class="size-3.5 text-destructive" />
				</Button>
			</li>
			<li v-if="payload.length === 0" class="text-xs text-muted-foreground">
				<Image class="mr-1 inline size-3.5" />
				No content yet.
			</li>
		</ul>

		<div class="space-y-2 rounded-md border bg-muted/30 p-2">
			<label for="new-text" class="text-xs font-medium text-muted-foreground">
				Add text
			</label>
			<div class="flex gap-2">
				<input
					id="new-text"
					v-model="newText"
					type="text"
					placeholder="Type a message…"
					class="flex-1 rounded-md border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
					@keydown.enter.prevent="addText"
				/>
				<Button size="sm" :disabled="!newText.trim()" @click="addText">
					<Plus class="size-3.5" />
					Add
				</Button>
			</div>
		</div>

		<div>
			<input
				ref="fileInput"
				type="file"
				accept="image/*"
				multiple
				class="hidden"
				@change="onFileChange"
			/>
			<Button variant="outline" class="w-full" @click="fileInput?.click()">
				<Upload class="size-3.5" />
				Upload attachment
			</Button>
		</div>
	</div>
</template>
