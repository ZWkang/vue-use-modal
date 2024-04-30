import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import TDesign from 'tdesign-vue-next';
import { setDialogContext } from '../../../';

// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
// createApp(App).mount('#app')
const app = createApp(App);
app.use(TDesign);

setDialogContext(app._context);

app.mount('#app');
