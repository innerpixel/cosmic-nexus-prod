import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { configure, defineRule } from 'vee-validate'
import { required, email, min, confirmed } from '@vee-validate/rules'
import App from './App.vue'
import router from './router'
import './style.css'

// Define validation rules
defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('confirmed', confirmed)

// Configure Vee-Validate
configure({
  validateOnInput: true,
  validateOnChange: true,
  validateOnBlur: true,
  validateOnModelUpdate: true
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
