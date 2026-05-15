import CanvasEditorView from '@/views/CanvasEditorView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		name: 'canvas',
		component: CanvasEditorView,
	},
	{
		path: '/node/:id',
		name: 'node',
		component: CanvasEditorView,
	},
]

const router = createRouter({
	// history: createWebHistory(import.meta.env.BASE_URL),
	history: createWebHistory(),
	routes,
})

export default router
