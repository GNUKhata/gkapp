import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
const config = {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'dcid',
  createNewPath: {
    name: 'Delivery_Note',
    params: {
      mode: 'create',
      invid: 0,
    },
  },
  printPath: {
    name: 'Delivery_Note_List',
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
      {
        text: 'Cancelled',
        props: { key: 'cancelledFlag', value: true },
        icon: { name: 'x-circle', variant: 'danger' },
      },
      {
        text: 'Unbilled',
        props: { key: 'unbilledFlag', value: true },
        icon: { name: 'dash', variant: 'danger' },
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
      label: 'No.',
      key: 'dcno',
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
        label: 'Name',
        value: 'custname',
      },
      {
        label: 'No',
        value: 'dcno',
      },
      {
        label: 'Godown',
        value: 'goname',
      },
      {
        label: 'Delivery Type',
        value: 'dcflag',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      custname: { label: 'Name', key: 'custname', sortable: true },
      dcno: { label: 'No', key: 'dcno', sortable: true },
      goname: { label: 'Godown', key: 'goname', sortable: true },
      dcflag: { label: 'Delivery Type', key: 'dcflag', sortable: true },
    },
  },
  loadList: function(fromDate, toDate) {
    let toTime = new Date(toDate).getTime();
    let nowTime = new Date().getTime();
    let date =
      nowTime <= toTime ? new Date().toISOString().substr(0, 10) : toDate;
    const requests = [
      axios.get('/delchal').catch((error) => {
        return error;
      }),
      axios
        .get(
          `/reports/del-unbilled?inout=i&inputdate=${date}&del_unbilled_type=0`
        )
        .catch((error) => {
          return error;
        }),
      axios
        .get(`/delchal/cancel?inout=i&inputdate=${date}&del_cancelled_type=0`)
        .catch((error) => {
          return error;
        }),
      axios
        .get(`/delchal/cancel?inout=o&inputdate=${date}&del_cancelled_type=0`)
        .catch((error) => {
          return error;
        }),
      //TODO: inspect why this API fails
      //
      // axios
      //   .get(
      //     `/report?type=del_unbilled&inout=o&inputdate=${date}&del_unbilled_type=0`
      //   )
      //   .catch((error) => {
      //     return error;
      //   }),
    ];
    return Promise.all(requests)
      .then((resp) => {
        // Invoice List
        let dnoteMap = {};
        let dnotes = [];

        resp.forEach((_resp, i) => {
          if (_resp.data.gkstatus === 0) {
            const unbilled = i > 0 && i < 3;
            const cancelled = i > 2;
            _resp.data.gkresult.forEach((note) => {
              let index = dnoteMap[note.dcid];
              if (index >= 0) {
                Object.assign(dnotes[note.dcid], {
                  invLinkedFlag: !note.canceldelchal,
                  unbilledFlag: unbilled,
                  cancelledFlag: cancelled,
                  goname: note.goname,
                  dcflag: note.dcflag,
                });
              } else {
                dnoteMap[note.dcid] = i;
                dnotes.push(
                  Object.assign(
                    {
                      id: note.dcid,
                      no: note.dcno,
                      noteName: `Delivery Note`,
                      text1: note.custname,
                      text2: note.dcno,
                      icon: note.csflag === 3 ? 'cash-stack' : 'basket3',
                      // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                      date: note.dcdate,
                      dateObj: Date.parse(
                        note.dcdate
                          .split('-')
                          .reverse()
                          .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                      ),
                      invLinkedFlag: !note.canceldelchal, // invLinked delchals must not be deleted. canceldelchal = 0, if invlinked and 1 if not linked
                      unbilledFlag: unbilled,
                      cancelledFlag: cancelled,
                      goname: note.goname || '',
                      dcflag: note.dcflag || '',
                    },
                    note
                  )
                );
              }
            });
          }
        });
        return dnotes;
      })
      .catch((e) => {
        console.error(e);
      });
  },
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns() {
  let columns = [];
  axios.get('/config?conftype=user').then((resp) => {
    if (resp.data.gkstatus === 0) {
      let userConf = resp.data.gkresult[PAGES['workflow-delivery-note']];

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
          label: 'No.',
          key: 'dcno',
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
      path: [
        PAGES['workflow-delivery-note'],
        CONFIGS['workflow-left-pane-columns'],
      ],
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
