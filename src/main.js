import '@babel/polyfill';
import 'mutationobserver-shim';
import Vue from 'vue';
import './plugins/axios';
import './plugins/bootstrap-vue';
import App from './App.vue';
import router from './router';
import wb from './registerServiceWorker';
import store from './store';
import '@/scss/main.scss';
import GetTextPlugin from 'vue-gettext';
import translations from './locales/translations.json';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import globalMixins from '@/mixins/global.js';
import gkConfig from '@/js/config/gkConfig';

Vue.config.productionTip = false;
Vue.prototype.$workbox = wb;

Vue.use(GetTextPlugin, {
  availableLanguages: {
    en: 'English',
    hi: 'हिन्दी',
    ml: 'മലയാളം',
    mr: 'मराठी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
  },
  defaultLanguage: 'en',
  translations: translations,
  autoAddKeyAttributes: true,
  silent: true,
});

Vue.component('VSelect', vSelect);

Vue.prototype.$reload = () => location.reload();

globalMixins.data = function() {
  return {
    sidebarToggle: false,
    user_role: Number,
    gkConfig: gkConfig,
  };
};
Vue.mixin(globalMixins);

window.gkVue = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
