"use strict";

import Vue from 'vue';
import axios from "axios";
import { handleHttpError } from '@/js/alertHandlers';

const Axios = {
  install(Vue) {
    const _axios = axios.create();

    _axios.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        // Check for handleError config. If unset, call handleHttpError.
        // If set to false, skip error handling.
        // If string, use it as error message for the handleHttpError function.
        // If function, invoke it.
        // If none of the above, throw type error.
        const { handleError } = error.response.config;
        if (handleError === undefined) {
          handleHttpError(error);
        } else if (typeof(handleError) === 'string') {
          handleHttpError(error, handleError);
        } else if (typeof(handleError) === 'function') {
          handleError();
        } else if (handleError === false) {
          return;
        } else {
          throw new TypeError('handleError must be a string');
        }

        // Return error for any additional error handling
        return Promise.reject(error);
      }
   );

    Vue.prototype.$axios = _axios;
  }
};

Vue.use(Axios);

export default Axios;
