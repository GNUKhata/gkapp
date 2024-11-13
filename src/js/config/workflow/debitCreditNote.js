import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'drcrid',
  createNewPath: {
    name: 'Debit_Credit_Note',
  },
  printPath: {
    name: 'Dc_Note_List',
  },
  filterBy: {
    value: [
      {
        text: 'Customer',
        props: { key: 'csflag', value: 3 },
        icon: { name: 'cash-stack' },
      },
      {
        text: 'Supplier',
        props: { key: 'csflag', value: 19 },
        icon: { name: 'basket3' },
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
      label: 'Name',
      key: 'custname',
      sortable: true,
    },
    {
      label: 'Amount',
      key: 'totreduct',
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
        label: 'Customer',
        value: 'custname',
      },
      {
        label: 'Amount',
        value: 'totreduct',
      },
      {
        label: 'No',
        value: 'drcrno',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      custname: { label: 'Customer', key: 'custname', sortable: true },
      totreduct: { label: 'Amount', key: 'totreduct', sortable: true, tdClass: 'gk-currency' },
      drcrno: { label: 'No', key: 'drcrno', sortable: true },
    },
  },
  loadList: function() {
    return axios
      .get('/drcrnote?drcr=all')
      .then((resp) => {
        let list = [];

        // Debit Credit Note
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.drcrid,
                no: item.drcrno,
                noteName: `${item.dctypeflag === 3 ? 'Credit' : 'Debit'} Note`,
                text1: item.custname,
                text2: `₹ ${item.totreduct}`,
                icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.drcrdate,
                dateObj: Date.parse(
                  item.drcrdate
                    .split('-')
                    .reverse()
                    .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                ),
              },
              item
            );
          });
        }

        return list;
      })
      .catch((error) => {
        return error;
      });
  },
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns() {
  let columns = [];
  axios.get('/config?conftype=user').then((resp) => {
    if (resp.data.gkstatus === 0) {
      let userConf = resp.data.gkresult[PAGES['workflow-dc-note']];

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
          label: 'Name',
          key: 'custname',
          sortable: true,
        },
        {
          label: 'Amount',
          key: 'totreduct',
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
      path: [PAGES['workflow-dc-note'], CONFIGS['workflow-left-pane-columns']],
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
