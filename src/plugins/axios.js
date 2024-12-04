"use strict";

import Vue from 'vue';
import axios from "axios";
import { handleCustomError, handleHttpError } from '@/js/alertHandlers';

const Axios = {
  install(Vue) {
    const _axios = axios.create();

    _axios.interceptors.response.use(
      function (response) {
        const {
          config: { returnFullResponse },
          data: { gkstatus, gkresult, error },
        } = response;
        // Handle custom error represented by non-zero gkstatus
        if (gkstatus > 0) {
          handleCustomError(gkstatus, error);
        }
        // The config option returnFullResponse is used to determine whether to
        // return gkresult (if applicable) or to return the full response.
        if (!returnFullResponse && gkstatus === 0 && gkresult) {
          return gkresult;
        }
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
