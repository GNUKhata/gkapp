import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'box-seam',
  color: 'warning',
  data: [],
  key: 'productdesc',
  uidKey: 'productcode',
  createNewPath: {
    name: 'Business_Details',
    params: { mode: 'create' },
  },
  printPath: {
    name: 'Product List',
  },
  filterBy: {
    value: [
      {
        text: 'Product',
        props: { key: 'gsflag', value: 7 },
        icon: { name: 'box' },
      },
      {
        text: 'Service',
        props: { key: 'gsflag', value: 19 },
        icon: { name: 'headset' },
      },
    ],
    range: [],
  },
  fields: [
    {
      label: 'Name',
      key: 'productdesc',
      sortable: true,
    },
  ],
  options: {
    columns: [
      {
        label: 'Name',
        value: 'productdesc',
      },
    ],
    columnMap: {
      productdesc: { label: 'Name', key: 'productdesc', sortable: true },
    },
  },
  loadList: function() {
    return axios
      .get('/product')
      .then((resp) => {
        let list = [];
        // Products & Services List
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) =>
            Object.assign({ icon: item.gsflag === 7 ? 'box' : 'headset' }, item)
          );
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
      let userConf = resp.data.gkresult[PAGES['workflow-business']];

      if (userConf) {
        columns = userConf[CONFIGS['workflow-left-pane-columns']];
      }
    }
    if (!columns || !columns.length) {
      columns = [
        {
          label: 'Name',
          key: 'productdesc',
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
      path: [PAGES['workflow-business'], CONFIGS['workflow-left-pane-columns']],
    };
    return axios.put('/config?conftype=user&update=path&confcategory=workflow', payload).then((resp) => {
      if (resp.data.gkstatus === 0) {
        config.fields = columns;
      }
      return resp.data;
    });
  }
}

export default config;
