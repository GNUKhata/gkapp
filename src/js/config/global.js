import { CONFIGS, PAGES, GST_REG_TYPE } from '../enum.js';
import axios from 'axios';

export default {
  state: {
    defConf: {
      general: {
        format: {
          date: 'dd-mm-yyyy',
        },
        default: {
          locale: 'en', //
        },
      },
      transaction: {
        format: {
          no: {
            prefix: false,
            separator: '/',
            suffix: {
              pattern: [
                {
                  type: 'string', // SL,PU
                },
                {
                  type: 'date',
                  format: 'yy', // yy, yyyy, yy-yy, yyyy-yyyy
                },
              ],
              separator: '-',
            },
          },
        },
        default: {
          payment: 'cash', // bank, cash, credit
          tax: 'None', // GST, VAT
          godown: '',
          allowNegativeStock: false,
          contacts: { customer: -1, supplier: -1 },
          partyVoucherFlag: true, // use customer/supplier ledgers for tracking transaction
        },
      },
    },
    customConf: {},
    constant: {
      gstRates: [0, 0.1, 0.25, 1, 1.5, 3, 5, 7.5, 12, 18, 28],
    },
    options: {
      general: {
        dateFormat: ['dd-mm-yyyy', 'yyyy-mm-dd', 'mm-dd-yyyy'],
      },
      transaction: {
        paymentMode: ['bank', 'cash', 'credit'],
        taxMode: ['None', 'GST', 'VAT', 'GST & VAT'],
        godowns: [],
        contacts: {
          customers: [],
          suppliers: [],
        },
      },
    },
    orgDetails: {},
  },
  getters: {
    getGlobalConfig: (state) => {
      return state.customConf;
    },
    getGlobalConfigOptions: (state) => {
      return state.options;
    },
    getOrgDetails: (state) => state.orgDetails,
    isIndia: (state) => {
      // Returns a boolean denoting if organisation country is India.
      // If country is not entered, for backwards compatibility, country will be
      // assumed as India.
      const { orgcountry } = state.orgDetails;
      if (orgcountry) {
        return orgcountry.trim().toLowerCase() === 'india';
      }
      return true;
    },
    getDateFormat: (state) => {
      return state.customConf.general
        ? state.customConf.general.format.date
        : state.defConf.general.format.date;
    },
    getTrnNoFormat: (state) => {
      return state.customConf.transaction
        ? state.customConf.transaction.format.no
        : state.defConf.transaction.format.no;
    },
    getDefaultPaymentMode(state) {
      return state.customConf.transaction
        ? state.customConf.transaction.default.payment
        : state.defConf.transaction.default.payment;
    },
    getDefaultTaxMode(state) {
      return state.customConf.transaction
        ? state.customConf.transaction.default.tax
        : state.defConf.transaction.default.tax;
    },
    isGstEnabled(state, getters) {
      const defaultTaxMode = state.customConf.transaction?.default?.tax;
      const isGstInTaxMode = ['GST', 'GST & VAT'].includes(defaultTaxMode);
      // As an additional precaution, also check country and GSTIN
      const { isIndia } = getters;
      const hasGstin = Object.keys(state.orgDetails.gstin ?? {}).length > 0;
      return isIndia && isGstInTaxMode && hasGstin;
    },
    isVatEnabled(state, getters) {
      const defaultTaxMode = state.customConf.transaction?.default?.tax;
      const isVatInTaxMode = ['VAT', 'GST & VAT'].includes(defaultTaxMode);
      // As an additional precaution, also check country and TIN
      const { isIndia } = getters;
      const hasTin = !!state.orgDetails.tin;
      return isIndia && isVatInTaxMode && hasTin;
    },
    getGstRates(state) {
      return state.constant.gstRates;
    },
    getPartyVoucherFlag(state) {
      return state.customConf.transaction
        ? state.customConf.transaction.default.partyVoucherFlag
        : state.defConf.transaction.default.partyVoucherFlag;
    },
    getDefaultGodown(state) {
      return state.customConf.transaction
        ? state.customConf.transaction.default.godown
        : state.defConf.transaction.default.godown;
    },
    getAllowNegativeStock(state) {
      return state.customConf.transaction
        ? state.customConf.transaction.default.allowNegativeStock
        : state.defConf.transaction.default.allowNegativeStock;
    },
    getDefaultContacts(state) {
      return state.customConf.transaction
        ? state.customConf.transaction.default.contacts
        : state.defConf.transaction.default.contacts;
    },
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so
    // config must be validated before commit
    setGlobalConfig(state, payload) {
      const { general, transaction } = payload.conf;
      state.customConf = Object.assign({}, { general }, { transaction })
      if (payload.lang && state.customConf.general) {
        if (state.customConf.general.default) {
          payload.lang.current = state.customConf.general.default.locale;
        }
      }
      if (payload.orgCode) {
        localStorage.setItem(
          `${payload.orgCode}-globalConf`,
          JSON.stringify(state.customConf)
        );
      }
    },

    setOrgDetails(state, payload) {
      state.orgDetails = Object.assign({}, payload);
    },

    setGodownList(state, payload) {
      const godowns = payload;
      state.options.transaction = Object.assign(
        {}, state.options.transaction, { godowns }
      );
    },

    setContactList(state, payload) {
      const contacts = {
        customers: payload.customers || [],
        suppliers: payload.suppliers || [],
      };
      state.options.transaction = Object.assign(
        {}, state.options.transaction, { contacts }
      )
    },
  },
  actions: {
    initGlobalState: ({ state, dispatch, commit, rootGetters }, payload) => {
      if (rootGetters.getOrgCode) {
        let conf = localStorage.getItem(`${rootGetters.getOrgCode}-globalConf`);
        conf = conf ? JSON.parse(conf) : state.defConf;
        commit('setGlobalConfig', { conf, lang: payload.lang });
        return dispatch('initGlobalConfigOptions').then(() => {
          return dispatch('initDefaults');
        });
      }
      return new Promise((resolve) => {
        resolve();
      });
    },
    initDefaults({ state, dispatch }) {
      const dispatches = [
        dispatch('initDefaultContacts'),
        dispatch('initDefaultGodown'),
      ];

      return Promise.all(dispatches).then(([respContacts, respGodown]) => {
        let conf = state.customConf;
        let callUpdate = false;
        if (respContacts) {
          const contacts = conf.transaction.default.contacts;
          if (contacts) {
            if (
              contacts.customers !== respContacts.customers ||
              contacts.suppliers !== respContacts.suppliers
            ) {
              callUpdate = true;
            }
            conf.transaction.default.contacts = respContacts;
          } else {
            callUpdate = true;
            conf.transaction.default.contacts = respContacts;
          }
        }

        if (respGodown) {
          if (conf.transaction.default.godown !== respGodown) {
            callUpdate = true;
          }
          conf.transaction.default.godown = respGodown;
        }

        if (callUpdate) {
          return dispatch('updateGlobalConfig', conf);
        }

        return new Promise((resolve) => {
          resolve();
        });
      });
    },
    initDefaultContacts: ({ state, commit }) => {
      function createContact(name, orgState, csflag) {
        let payload = {
          custname: name,
          custaddr: '',
          state: orgState,
          pincode: '',
          csflag: csflag,
          custtan: null, // have to check
          custphone: null,
          custemail: null,
          custfax: null,
          custpan: null,
          gst_reg_type: GST_REG_TYPE['unregistered'],
        };

        return axios
          .post('/customer', payload)
          .then((resp) => {
            let result = {
              text: name,
            };
            if (resp.data.gkstatus === 0) {
              result.value = resp.data.gkresult.custid;
            } else {
              result.value = -1;
            }
            return result;
          })
          .catch(() => {
            return { text: name, value: -1 };
          });
      }

      return axios.get('organisation').then((orgResp) => {
        if (orgResp.data.gkstatus === 0) {
          const orgDetails = orgResp.data.gkdata;
          commit('setOrgDetails', orgDetails);
          const orgState = orgDetails['orgstate'];
          let requests = [];

          let custList = state.options.transaction.contacts.customers || [];
          let custName = 'Retail Customer (Default)';
          const defaults = state.customConf.transaction?.default;
          let rCust = custList.find((cust) => cust.text === custName);
          if (
            (!defaults.contacts ||
              !defaults.contacts.customer ||
              defaults.contacts.customer < 0) &&
            !rCust
          ) {
            requests.push(createContact(custName, orgState, 3));
          } else {
            requests.push(
              new Promise((resolve) => {
                resolve(rCust);
              })
            );
          }

          let supList = state.options.transaction.contacts.suppliers || [];
          let supName = 'Retail Supplier (Default)';
          let rSup = supList.find((cust) => cust.text === supName);
          if (
            (!defaults.contacts ||
              !defaults.contacts.supplier ||
              defaults.contacts.supplier < 0) &&
            !rSup
          ) {
            requests.push(createContact(supName, orgState, 19));
          } else {
            requests.push(
              new Promise((resolve) => {
                resolve(rSup);
              })
            );
          }

          return Promise.all(requests).then(([resp1, resp2]) => {
            return {
              customer: resp1,
              supplier: resp2,
            };
          });
        }
      });
    },
    initDefaultGodown: ({ state, rootGetters }) => {
      let goList = state.options.transaction.godowns || [];
      let goName = 'Primary Godown';
      let pGodown = goList.find((go) => go.text === goName);

      if (
        !state.customConf.transaction?.default.godown ||
        state.customConf.transaction?.default.godown === -1
      ) {
        if (!pGodown) {
          let orgAddress = rootGetters.getOrgAddress;
          let orgState = orgAddress?.orgstate || '';
          let payload = {
            goname: goName,
            goaddr: `${goName}'s address`,
            state: orgState,
            gocontact: '',
            contactname: '',
          };
          return axios.post('/godown', payload).then((resp) => {
            if (resp.data.gkstatus === 0 && resp.data.gkresult) {
              return resp.data.gkresult;
            }
          });
        } else {
          return new Promise((resolve) => {
            resolve(pGodown.value);
          });
        }
      }
      return new Promise((resolve) => {
        resolve(state.customConf.transaction?.default.godown);
      });
    },
    // must be invoked after successful login
    initGlobalConfig({ state, commit, rootGetters }, payload) {
      if (!axios.defaults.baseURL) return;
      let url = `/config?conftype=org&pageid=${PAGES['global']}&confid=${CONFIGS['global']}`;
      return axios.get(url).then((resp) => {
        let orgCode = rootGetters.getOrgCode;
        if (resp.data.gkstatus === 0) {
          let conf = resp.data.gkresult ? resp.data.gkresult : state.defConf;
          commit('setGlobalConfig', {
            conf,
            orgCode,
            lang: payload ? payload.lang : null,
          });
        } else {
          commit('setGlobalConfig', { conf: state.defConf, orgCode });
        }
      });
    },
    initGlobalConfigOptions({ commit }) {
      const requests = [
        axios.get('/godown'),
        axios.get('/customer?qty=custall'),
        axios.get('/customer?qty=supall'),
      ];

      return Promise.all(requests).then(([respGodown, respCust, respSup]) => {
        if (respGodown.data.gkstatus === 0) {
          const godowns = respGodown.data.gkresult.map((godown) => {
            return {
              text: godown.goname,
              value: godown.goid,
            };
          });
          commit('setGodownList', godowns);
        }

        let customers, suppliers;
        if (respCust.data.gkstatus === 0) {
          customers = respCust.data.gkresult.map((cust) => {
            return { text: cust.custname, value: cust.custid };
          });
        }

        if (respSup.data.gkstatus === 0) {
          suppliers = respSup.data.gkresult.map((sup) => {
            return { text: sup.custname, value: sup.custid };
          });
        }

        commit('setContactList', { customers, suppliers });
      });
    },
    updateGlobalConfig({ commit, rootGetters }, conf) {
      const confPayload = {
        config: conf,
        path: [PAGES['global'], CONFIGS['global']],
      };
      return axios
        .put(
          '/config?conftype=org&update=path&confcategory=global',
          confPayload
        )
        .then((resp) => {
          if (resp.data.gkresult === 0) {
            commit('setGlobalConfig', {
              conf,
              orgCode: rootGetters.getOrgCode,
            });
          }
          return resp.data;
        });
    },
  },
  namespaced: true,
};
