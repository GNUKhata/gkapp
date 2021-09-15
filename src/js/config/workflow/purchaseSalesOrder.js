import axios from 'axios';
const config = {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'orderid',
  createNewPath: {
    name: 'Purchase_Sales_Order',
    params: {},
  },
  printPath: {
    name: 'Ps_Order_List',
  },
  filterBy: {
    value: [
      {
        text: 'All',
        props: {},
      },
      {
        text: 'Sale',
        props: { key: 'csflag', value: 3 },
        icon: { name: 'cash-stack' },
      },
      {
        text: 'Purchase',
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
      label: 'Customer',
      key: 'custname',
      sortable: true,
    },
    {
      label: 'No',
      key: 'orderno',
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
        value: 'ordertotal',
      },
      {
        label: 'No',
        value: 'orderno',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      custname: { label: 'Customer', key: 'custname', sortable: true },
      ordertotal: { label: 'Amount', key: 'ordertotal', sortable: true },
      orderno: { label: 'No', key: 'orderno', sortable: true },
    },
  },
  loadList: function() {
    return axios
      .get('/purchaseorder')
      .then((resp) => {
        let list = [];
        // Purchase Sales Order
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.orderid,
                no: item.orderno,
                noteName: `Order`,
                text1: item.customer,
                text2: item.orderno,
                // csflag: custSupMap[item.customer] ? 3 : 19,
                // icon: custSupMap[item.customer]
                //   ? 'cash-stack'
                //   : 'basket3',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.orderdate,
                dateObj: Date.parse(
                  item.orderdate
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

function initColumns(orgCode) {
  // debugger;
  let columns =
    JSON.parse(localStorage.getItem(`${orgCode}-workflow-psorder-columns`)) ||
    [];
  if (!columns.length) {
    columns = [
      {
        label: 'Date',
        key: 'dateObj',
        sortable: true,
      },
      {
        label: 'Customer',
        key: 'customer',
        sortable: true,
      },
      {
        label: 'No.',
        key: 'orderno',
        sortable: true,
      },
    ];
  }
  config.fields = columns;
}

function setColumns(orgCode, columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    localStorage.setItem(
      `${orgCode}-workflow-psorder-columns`,
      JSON.stringify(columns)
    );
    config.fields = columns;
  }
}

export default config;