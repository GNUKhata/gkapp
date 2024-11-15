import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'receipt',
  color: 'success',
  data: [],
  uidKey: 'vouchercode',
  createNewPath: {
    name: 'Create_Voucher',
    params: {
      type: 'receipt',
      customer: '-1',
    },
  },
  printPath: {
    name: 'Voucher_List',
  },
  filterBy: {
    value: [
      {
        text: 'Receipt',
        props: { key: 'vouchertype', value: 'receipt' },
      },
      {
        text: 'Payment',
        props: { key: 'vouchertype', value: 'payment' },
      },
      {
        text: 'Supplier',
        props: { key: 'vouchertype', value: 'purchase' },
      },
      {
        text: 'Customer',
        props: { key: 'vouchertype', value: 'sales' },
      },
      {
        text: 'Journal',
        props: { key: 'vouchertype', value: 'journal' },
      },
      {
        text: 'Contra',
        props: { key: 'vouchertype', value: 'contra' },
      },
      {
        text: 'Credit Note',
        props: { key: 'vouchertype', value: 'creditnote' },
      },
      {
        text: 'Debit Note',
        props: { key: 'vouchertype', value: 'debitnote' },
      },
      {
        text: 'Sales Return',
        props: { key: 'vouchertype', value: 'salesreturn' },
      },
      {
        text: 'Purchase Return',
        props: { key: 'vouchertype', value: 'purchasereturn' },
      },
      {
        text: 'Cancelled',
        props: { key: 'deletedFlag', value: true },
        icon: { name: 'x-circle', variant: 'danger' },
      },
    ],
    range: [
      {
        from: {
          text: 'From Date',
        },
        to: {
          text: 'To Date',
        },
        props: {
          key: 'dateObj',
        },
      },
    ],
  },
  fields: [
    {
      label: 'Date',
      key: 'dateObj',
      sortable: true,
    },
    {
      label: 'Dr',
      key: 'drAmount',
      sortable: true,
    },
    {
      label: 'Cr',
      key: 'crAmount',
      sortable: true,
    },
  ],
  options: {
    columns: [
      {
        label: 'Date',
        value: 'dateObj',
      },
      {
        label: 'Dr',
        value: 'drAmount',
      },
      {
        label: 'Cr',
        value: 'crAmount',
      },
      {
        label: 'Type',
        value: 'vouchertype',
      },
      {
        label: 'No',
        value: 'vouchernumber',
      },
      {
        label: 'Narration',
        value: 'narration',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      drAmount: { label: 'Dr', key: 'drAmount', sortable: true, tdClass: 'gk-currency' },
      crAmount: { label: 'Cr', key: 'crAmount', sortable: true, tdClass: 'gk-currency' },
      vouchertype: { label: 'Type', key: 'vouchertype', sortable: true },
      vouchernumber: {
        label: 'No',
        key: 'vouchernumber',
        sortable: true,
      },
      narration: {
        label: 'Narration',
        key: 'narration',
        sortable: true,
      },
    },
  },
  loadList: function(yearStart, yearEnd) {
    const requests = [
      axios
        .get(`/transaction?searchby=date&from=${yearStart}&to=${yearEnd}`)
        .catch((error) => {
          return error;
        }),
      axios.get('/reports/deleted-voucher').catch((error) => {
        return error;
      }),
    ];
    return Promise.all(requests).then((resp) => {
      let list = [];
      // Vouchers
      if (resp[0].data.gkstatus === 0) {
        list = resp[0].data.gkresult.map((item) => {
          let drAccount = Object.keys(item.drs)[0];
          let drAmount = parseFloat(item.drs[drAccount]).toFixed(2);
          let crAccount = Object.keys(item.crs)[0];
          let crAmount = parseFloat(item.crs[crAccount]).toFixed(2);
          return Object.assign(
            {
              id: item.vouchercode,
              no: item.vouchernumber,
              noteName: `${item.vouchertype[0].toUpperCase()}${item.vouchertype.slice(
                1
              )} Voucher`,
              text1: `${drAmount} (${drAccount})`,
              text2: `${crAmount} (${crAccount})`,
              drAmount: drAmount,
              crAmount: crAmount,
              icon: 'cash-stack',
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.voucherdate,
              dateObj: Date.parse(
                item.voucherdate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
      }

      // Vouchers
      if (resp[1].data.gkstatus === 0) {
        let deletedVouchers = resp[1].data.gkresult.map((item) => {
          let drAccount = Object.keys(item.drs)[0];
          let drAmount = parseFloat(item.drs[drAccount]).toFixed(2);
          let crAccount = Object.keys(item.crs)[0];
          let crAmount = parseFloat(item.crs[crAccount]).toFixed(2);
          return Object.assign(
            {
              id: item.vouchercode,
              no: item.vouchernumber,
              noteName: `${item.vouchertype[0].toUpperCase()}${item.vouchertype.slice(
                1
              )} Voucher`,
              text1: `${drAmount} (${drAccount})`,
              text2: `${crAmount} (${crAccount})`,
              drAmount: drAmount,
              crAmount: crAmount,
              icon: 'cash-stack',
              deletedFlag: true,
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.voucherdate,
              dateObj: Date.parse(
                item.voucherdate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
        list.push(...deletedVouchers);
      }
      return list;
    });
  },
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns() {
  let columns = [];
  axios.get('/config?conftype=user').then((resp) => {
    if (resp.data.gkstatus === 0) {
      let userConf = resp.data.gkresult[PAGES['workflow-voucher']];

      if (userConf) {
        columns = userConf[CONFIGS['workflow-left-pane-columns']];
      }
    }
    if (!columns || !columns.length) {
      columns = [
        {
          label: 'Date',
          key: 'dateObj',
          sortable: true,
        },
        {
          label: 'Dr',
          key: 'drAmount',
          sortable: true,
          tdClass: 'gk-currency'
        },
        {
          label: 'Cr',
          key: 'crAmount',
          sortable: true,
          tdClass: 'gk-currency'
        },
      ];
    }
    config.fields = columns;
  });
}

function setColumns(columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    const payload = {
      config: columns,
      path: [PAGES['workflow-voucher'], CONFIGS['workflow-left-pane-columns']],
    };
    return axios
      .put('/config?conftype=user&update=path&confcategory=workflow', payload)
      .then((resp) => {
        if (resp.data.gkstatus === 0) {
          config.fields = columns;
        }
        return resp.data;
      });
  }
}

export default config;
