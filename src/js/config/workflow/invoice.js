import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'invid',
  createNewPath: {
    name: 'Invoice',
    params: {},
  },
  printPath: {
    name: 'Invoice_List',
  },
  filterBy: {
    value: [
      {
        text: 'Customer',
        value: 1,
        props: { key: 'csflag', value: 3 },
        icon: { name: 'cash-stack' },
      },
      {
        text: 'Supplier',
        value: 2,
        props: { key: 'csflag', value: 19 },
        icon: { name: 'basket3' },
      },
      {
        text: 'Cancelled',
        value: 3,
        props: { key: 'deletedFlag', value: true },
        icon: { name: 'x-circle', variant: 'danger' },
      },
      {
        text: 'On Credit',
        value: 4,
        props: { key: 'onCreditFlag', value: true },
        icon: { name: 'dash', variant: 'danger' },
      },
      {
        text: 'Editable',
        value: 5,
        props: { key: 'rectifyFlag', value: true },
        icon: { name: '' },
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
      key: 'netamt',
      sortable: true,
      tdClass: 'text-right',
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
        value: 'netamt',
      },
      {
        label: 'Inv No',
        value: 'invoiceno',
      },
      {
        label: 'Tax',
        value: 'taxamt',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      custname: { label: 'Customer', key: 'custname', sortable: true },
      netamt: {
        label: 'Amount',
        key: 'netamt',
        sortable: true,
        tdClass: 'gk-currency',
      },
      invoiceno: { label: 'Inv No', key: 'invoiceno', sortable: true },
      taxamt: { label: 'Tax', key: 'taxamt', sortable: true },
    },
  },
  loadList: function(yearStart, yearEnd) {
    const requests = [
      axios
        .get(
          `/invoice/list?type=list&flag=0&fromdate=${yearStart}&todate=${yearEnd}`
        )
        .catch((error) => {
          return error;
        }),
      axios.get('/billwise?type=all').catch((error) => {
        return error;
      }),
      axios
        .get(
          `/invoice/list?type=listdeleted&flag=0&fromdate=${yearStart}&todate=${yearEnd}`
        )
        .catch((error) => {
          return error;
        }),
    ];
    return Promise.all(requests)
      .then((resp) => {
        let list = [];
        let invoiceMap = {};
        // Invoices
        if (resp[0].data.gkstatus === 0) {
          list = resp[0].data.gkresult.map((item, index) => {
            invoiceMap[item.invid] = index;
            return Object.assign(
              {
                id: item.invid,
                no: item.invoiceno,
                noteName: `${
                  item.inoutflag === 15 ? 'Sale' : 'Purchase'
                } Invoice`,
                date: item.invoicedate,
                text1: item.custname,
                text2: `₹ ${item.netamt}`,
                icon: item.inoutflag === 15 ? 'cash-stack' : 'basket3',
                onCreditFlag: false,
                rectifyFlag: false, // can be rectified or not
                deletedFlag: false,
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
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

        // Invoice in credit
        if (resp[1].data.gkstatus === 0) {
          // let data = transactionTab['Invoice'].data;
          if (resp[1].data.gkstatus === 0 && list.length) {
            let index = '';
            resp[1].data.invoices.forEach((inv) => {
              index = invoiceMap[inv.invid];
              if (index >= 0) {
                list[index].onCreditFlag = true;
                list[index].rectifyFlag =
                  inv.balanceamount === inv.invoicetotal; // can be rectified or not
              }
            });
          }
        }

        // Deleted Invoices
        if (resp[2].data.gkstatus === 0) {
          const deletedInv = resp[2].data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.invid,
                no: item.invoiceno,
                noteName: `${
                  item.inoutflag === 15 ? 'Sale' : 'Purchase'
                } Invoice`,
                date: item.invoicedate,
                text1: item.custname,
                text2: `₹ ${item.netamt}`,
                icon: item.inoutflag === 15 ? 'cash-stack' : 'basket3',
                onCreditFlag: false,
                rectifyFlag: false, // can be rectified or not
                deletedFlag: true,
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
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
          list.push(...deletedInv);
        }

        return list;
      })
      .catch((e) => {
        console.error(e.message);
      });
  },
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns() {
  let columns = [];
  axios.get('/config?conftype=user').then((resp) => {
    if (resp.data.gkstatus === 0) {
      let userConf = resp.data.gkresult[PAGES['workflow-invoice']];

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
          key: 'netamt',
          sortable: true,
          tdClass: 'gk-currency',
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
      path: [PAGES['workflow-invoice'], CONFIGS['workflow-left-pane-columns']],
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
