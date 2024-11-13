import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'transfernoteid',
  createNewPath: {
    name: 'Transfer_Note',
    params: {},
  },
  printPath: {
    name: 'Transfer_Note_List',
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
      key: 'transfernoteno',
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
        label: 'No',
        value: 'transfernoteno',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      transfernoteno: {
        label: 'No',
        key: 'transfernoteno',
        sortable: true,
      },
    },
  },
  loadList: function() {
    return axios
      .get('/transfernote?type=all')
      .then((resp) => {
        let list = [];
        // Transfer Notes
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                icon: 'truck',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.transfernotedate,
                dateObj: Date.parse(
                  item.transfernotedate
                    .split('-')
                    .reverse()
                    .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                ),
                id: item.transfernoteid,
                no: item.transfernoteno,
                noteName: 'Transfer Note',
                text1: item.transfernoteno,
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
      let userConf = resp.data.gkresult[PAGES['workflow-transfer-note']];

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
          key: 'transfernoteno',
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
      path: [PAGES['workflow-transfer-note'], CONFIGS['workflow-left-pane-columns']],
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
