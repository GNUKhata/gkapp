import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'invid',
  createNewPath: {
    name: 'Cash_Memo',
    params: {},
  },
  printPath: {
    name: 'Cash_Memo_List',
  },
  filterBy: {
    value: [
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
      label: 'No.',
      key: 'invoiceno',
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
        label: 'Amount',
        value: 'invoicetotal',
      },
      {
        label: 'No',
        value: 'invoiceno',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      invoicetotal: {
        label: 'Amount',
        key: 'invoicetotal',
        sortable: true,
        tdClass: 'gk-currency'
      },
      invoiceno: { label: 'No', key: 'invoiceno', sortable: true },
    },
  },
  loadList: function() {
    const requests = [
      axios.get('/cashmemo?inoutflag=15').catch((error) => {
        return error;
      }),
      //purchase
      axios.get('/cashmemo?inoutflag=9').catch((error) => {
        return error;
      }),
    ];
    return Promise.all(requests).then((resp) => {
      let list = [];
      // Cash Memo Sale
      if (resp[0].data.gkstatus === 0) {
        list = resp[0].data.gkresult.map((item) => {
          return Object.assign(
            {
              id: item.invid,
              no: item.invoiceno,
              noteName: `Cash Memo`,
              text1: item.invoiceno,
              icon: 'cash-stack',
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.invoicedate,
              dateObj: Date.parse(
                item.invoicedate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
      }

      // Cash Memo Purchase
      if (resp[1].data.gkstatus === 0) {
        let cmPurchase = resp[1].data.gkresult.map((item) => {
          return Object.assign(
            {
              id: item.invid,
              no: item.invoiceno,
              noteName: `Cash Memo`,
              text1: item.invoiceno,
              icon: 'basket3',
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.invoicedate,
              dateObj: Date.parse(
                item.invoicedate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
        if (cmPurchase.length) {
          list.push(...cmPurchase);
        }
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
      let userConf = resp.data.gkresult[PAGES['workflow-cash-memo']];

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
          label: 'No.',
          key: 'invoiceno',
          sortable: true,
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
      path: [PAGES['workflow-cash-memo'], CONFIGS['workflow-left-pane-columns']],
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
