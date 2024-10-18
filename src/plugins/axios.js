"use strict";

import Vue from 'vue';
import axios from "axios";

const Axios = {
  install(Vue) {
    const _axios = axios.create();
    Vue.prototype.$axios = _axios;
  }
};

Vue.use(Axios);

export default Axios;
