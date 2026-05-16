<script setup lang="ts">
	import { computed, reactive, watch } from 'vue'

	import { Button } from '@/components/ui/button'
	import { useCanvasStore } from '@/stores/canvas'
	import { useNodeMutation } from '@/composables/useNodeMutation'
	import { validateTime } from '@/lib/validation'
	import type { BusinessHourSlot, DayKey } from '@/api/node'
	import { Save } from 'lucide-vue-next'

	const props = defineProps<{ nodeId: string; saveMetaData: () => void }>()

	const store = useCanvasStore()
	const { updateNode } = useNodeMutation()

	const DAYS: { key: DayKey; label: string }[] = [
		{ key: 'mon', label: 'Monday' },
		{ key: 'tue', label: 'Tuesday' },
		{ key: 'wed', label: 'Wednesday' },
		{ key: 'thu', label: 'Thursday' },
		{ key: 'fri', label: 'Friday' },
		{ key: 'sat', label: 'Saturday' },
		{ key: 'sun', label: 'Sunday' },
	]

	type DayState = { enabled: boolean; startTime: string; endTime: string }

	const node = computed(() => store.getNode(props.nodeId))
	const stored = computed(() => {
		const data = node.value?.data as
			| {
					times?: BusinessHourSlot[]
					timezone?: string
					connectors?: string[]
					action?: string
			  }
			| undefined
		return {
			times: data?.times ?? [],
			timezone: data?.timezone ?? 'UTC',
			connectors: data?.connectors,
			action: data?.action,
		}
	})

	const draft = reactive({
		timezone: stored.value.timezone,
		days: {} as Record<DayKey, DayState>,
		error: null as string | null,
	})

	const seedFromStored = () => {
		draft.timezone = stored.value.timezone
		draft.error = null
		for (const { key } of DAYS) {
			const slot = stored.value.times.find((t) => t.day === key)
			draft.days[key] = slot
				? { enabled: true, startTime: slot.startTime, endTime: slot.endTime }
				: { enabled: false, startTime: '09:00', endTime: '17:00' }
		}
	}

	seedFromStored()
	watch(() => props.nodeId, seedFromStored)

	const handleSaveBusinessHours = () => {
		const times: BusinessHourSlot[] = []
		for (const { key } of DAYS) {
			const state = draft.days[key]
			if (!state?.enabled) continue
			if (!validateTime(state.startTime).ok || !validateTime(state.endTime).ok) {
				draft.error = `Check the time format for ${key}.`
				return
			}
			if (state.startTime >= state.endTime) {
				draft.error = `End time must be after start time for ${key}.`
				return
			}
			times.push({ day: key, startTime: state.startTime, endTime: state.endTime })
		}
		draft.error = null
		updateNode(props.nodeId, {
			data: {
				times,
				timezone: draft.timezone || 'UTC',
				...(stored.value.connectors ? { connectors: stored.value.connectors } : {}),
				...(stored.value.action ? { action: stored.value.action } : {}),
			},
		})
		props.saveMetaData()
	}
</script>

<template>
	<div class="space-y-3">
		<header class="flex items-end justify-between gap-2">
			<div>
				<h3 class="text-sm font-semibold">Business hours</h3>
				<p class="text-xs text-muted-foreground">Toggle days and adjust the window.</p>
			</div>
			<div>
				<label for="bh-tz" class="text-xs font-medium text-muted-foreground"
					>Timezone</label
				>
				<input
					id="bh-tz"
					v-model="draft.timezone"
					type="text"
					class="mt-1 w-24 rounded-md border bg-background px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>
		</header>

		<ul class="space-y-1">
			<li
				v-for="day in DAYS"
				:key="day.key"
				class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md border bg-background px-2 py-1.5"
			>
				<label class="flex items-center gap-2 text-xs">
					<input
						v-model="draft.days[day.key].enabled"
						type="checkbox"
						class="accent-primary"
					/>
					<span class="w-16 font-medium">{{ day.label }}</span>
				</label>
				<span />
				<input
					v-model="draft.days[day.key].startTime"
					type="time"
					:disabled="!draft.days[day.key].enabled"
					class="rounded-md border bg-background px-2 py-1 text-xs outline-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
				/>
				<input
					v-model="draft.days[day.key].endTime"
					type="time"
					:disabled="!draft.days[day.key].enabled"
					class="rounded-md border bg-background px-2 py-1 text-xs outline-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</li>
		</ul>

		<p v-if="draft.error" class="text-xs text-destructive">{{ draft.error }}</p>

		<Button class="w-full" @click="handleSaveBusinessHours"> <Save />Save changes </Button>
	</div>
</template>
