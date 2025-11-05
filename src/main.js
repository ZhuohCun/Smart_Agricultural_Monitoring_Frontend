import './assets/main.css'

import{ createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css';

createApp(App).use(ElementPlus).use(router).mount('#app');

