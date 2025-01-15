import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'person-lines-fill',
  color: 'primary',
  data: [],
  key: 'custname',
  uidKey: 'custid',
  createNewPath: {
    name: 'Contact_Details',
    params: { mode: 'create', type: 'customer' },
  },
  printPath: {
    name: 'Contact List',
  },
  filterBy: {
    value: [
      {
        text: 'Customers',
        props: { key: 'csflag', value: true },
        icon: { name: 'person-fill' },
      },
      {
        text: 'Suppliers',
        props: { key: 'csflag', value: false },
        icon: { name: 'briefcase-fill' },
      },
    ],
    range: [],
  },
  fields: [
    {
      label: 'Name',
      key: 'custname',
      sortable: true,
    },
  ],
  options: {
    columns: [
      {
        label: 'Name',
        value: 'custname',
      },
    ],
    columnMap: {
      custname: { label: 'Name', key: 'custname', sortable: true },
    },
  },
  loadList: function(wfType) {
    const requests = [];
    const customers = axios.get('/customer?qty=custall').catch((error) => {
      return error;
    });
    const suppliers = axios.get('/customer?qty=supall').catch((error) => {
      return error;
    });
    if (wfType === 'customer') {
      requests.push(customers);
    } else if (wfType === 'supplier') {
      requests.push(suppliers);
    } else {
      requests.push(customers, suppliers);
    }
    return Promise.all(requests).then((resp) => {
      let contacts = [];

      // Customer List
      if (resp?.[0]?.data.gkstatus === 0) {
        contacts = resp[0].data.gkresult.map((item) => {
          return Object.assign({ csflag: true, icon: 'person-fill' }, item);
        });
      }

      // Supplier List
      if (resp?.[1]?.data.gkstatus === 0) {
        contacts.push(
          ...resp[1].data.gkresult.map((item) => {
            return Object.assign(
              { csflag: false, icon: 'briefcase-fill' },
              item
            );
          })
        );
      }
      return contacts;
    });
  },
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns() {
  let columns = [];
  axios.get('/config?conftype=user').then((resp) => {
    if (resp.data.gkstatus === 0) {
      let userConf = resp.data.gkresult[PAGES['workflow-contacts']];

      if (userConf) {
        columns = userConf[CONFIGS['workflow-left-pane-columns']];
      }
    }
    if (!columns || !columns.length) {
      columns = [
        {
          label: 'Name',
          key: 'custname',
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
      path: [PAGES['workflow-contacts'], CONFIGS['workflow-left-pane-columns']],
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
