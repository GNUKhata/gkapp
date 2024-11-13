// default config for invoice page
export default {
  state: {
    default: {
      type: true,
      memo: {
        no: { format: { code: { sale: 'CMS', purchase: 'CMP' } } },
        delNote: {
          no: {
            format: {
              code: {
                in: 'DIN',
                out: 'DOUT',
              },
            },
          },
        },
        date: true,
        state: true,
        gstin: true,
        class: {
          'mr-md-1': true,
        },
      },
      taxType: true,
      bill: {
        index: true,
        product: { mobileMode: { disabled: true }, addBtn: true },
        hsn: true,
        qty: { mobileMode: { disabled: true }, checkStock: true },
        fqty: true,
        rate: true,
        discount: true,
        taxable: true,
        igst: true,
        cgst: true,
        sgst: true,
        cess: true,
        vat: true,
        total: { mobileMode: true },
        addBtn: { mobileMode: true },
        editBtn: { mobileMode: true },
        footer: {
          discount: true,
          taxable: true,
          igst: true,
          cess: true,
          vat: true,
          total: true,
        },
      },
      payment: {
        mode: true,
        bank: {
          no: true,
          name: true,
          branch: true,
          ifsc: true,
        },
        class: {
          'ml-md-1': true,
        },
      },
      total: {
        taxable: true,
        discount: true,
        vat: true,
        igst: true,
        cess: true,
        roundOff: true,
        value: true,
        valueText: true,
      },
    },
    custom: {},
  },
  getters: {
    getDefaultCashMemoConfig: (state) => {
      return state.default;
    },
    getCustomCashMemoConfig: (state) => {
      return state.custom;
    },
  },
  mutations: {
    // note that this mutation, directly stores whatever data is being sent, so
    // config must be validated before commit
    setCashMemoConfig(state, payload) {
      state.custom = payload;
    },
  },
  actions: {
    initCashMemoConfig({ state, commit }, payload) {
      let conf;
      try {
        // if the CashMemoConfig isn't a valid JSON, catch the error and  use null to get the default config
        conf = JSON.parse(
          localStorage.getItem(`${payload.orgCode}-cashMemoConfig`)
        );
      } catch (error) {
        conf = null;
      }
      if (conf !== null) {
        commit('setCashMemoConfig', conf);
      } else {
        commit('setCashMemoConfig', state.default);
      }
    },
    updateCashMemoConfig({ commit }, payload) {
      commit('setCashMemoConfig', payload.data);
      localStorage.setItem(
        `${payload.orgCode}-cashMemoConfig`,
        JSON.stringify(payload.data)
      );
    },
  },
  namespaced: true,
};
