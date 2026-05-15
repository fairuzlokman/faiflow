import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/assets/main.css'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)

const queryClientConfig = {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			networkMode: 'always' as const,
			staleTime: Infinity,
			gcTime: 60 * 60 * 1000,
		},
	},
}

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClientConfig })

app.mount('#app')
