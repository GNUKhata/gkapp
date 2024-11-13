<template>
  <section class="m-1 align-form-label-right">
    <b-overlay
      :show="loading"
      blur
    >
      <b-card
        header="Budget"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mb-3 mx-auto gkcard d-print-none"
        header-class="py-2"
        body-class="p-2"
      >
        <template #header>
          <translate> Budget </translate>
          <b-button
            :to="{name: 'Create_Budget', params: {type: budgetType}}"
            class="float-right py-0"
            size="sm"
            variant="success"
          >
            <translate> + Add </translate>
          </b-button>
        </template>
        <b-form-group
          label-size="sm"
          label="Budget Type"
          label-cols="3"
        >
          <template #label>
            <translate> Budget Type </translate>
          </template>
          <b-form-radio-group
            size="sm"
            class="d-flex align-items-center"
            :style="{height: '100%'}"
            v-model="budgetType"
            @input="onBudgetFilterUpdate"
          >
            <b-form-radio value="cash">
              <translate> Cash </translate>
            </b-form-radio>
            <b-form-radio value="pl">
              <translate> Profit & Loss </translate>
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-form-group
          label="Budget List"
          label-for="input-10"
          label-cols="3"
          label-size="sm"
        >
          <template #label>
            <translate> Budget List </translate>
          </template>
          <v-select
            id="input-10"
            v-model="budId"
            :options="budgetList"
            @input="onBudgetFilterUpdate"
            :required="true"
            :placeholder="
              budgetList.length ? 'Select a Budget' : 'No Budgets Found!'
            "
            :readonly="!budgetList.length"
            label="text"
            :reduce="(bdata) => bdata.value"
            :reset-on-options-change="true"
          />
        </b-form-group>
        <div
          class="float-right"
          v-if="budId"
        >
          <b-button
            size="sm"
            class="mx-1"
            variant="primary"
            :to="{name: 'Edit_Budget', params: {id: budId}}"
          >
            <translate> Edit </translate>
          </b-button>
          <b-button
            size="sm"
            variant="danger"
            @click.prevent="confirmOnDelete"
          >
            <translate> Delete </translate>
          </b-button>
        </div>
      </b-card>
    </b-overlay>
    <div v-if="budId">
      <small>
        <translate> Budget: </translate>
        <span> {{ budName }} ({{ fromDate }} to {{ toDate }}) </span>
      </small>
    </div>
    <gk-toolbar
      class="mt-2"
      v-if="budId"
    >
      <b-button
        @click="openTableRow(-1, null, !expandAllRows)"
        class="mr-1"
        variant="dark"
        size="sm"
      >
        <b-icon
          font-scale="0.95"
          :icon="expandAllRows ? 'dash' : 'arrows-fullscreen'"
        />
      </b-button>
      <print-helper
        name="Budget Report"
        content-id="budget-table-container"
        :print-styles="printStyles"
        class="d-none d-lg-inline-block"
        file-name="Budget_Report"
      />
      <b-button
        @click="expandTable = !expandTable"
        class="p-2 m-1 d-sm-none"
        variant="dark"
        size="sm"
      >
        <b-icon
          class="float-right"
          font-scale="0.95"
          :icon="expandTable ? 'arrow-bar-left' : 'arrow-right'"
        />
      </b-button>
      <!-- Spreadsheet Download -->
      <gk-file-download
        v-if="budgetType === 'pl'"
        :file-suffix="`Budget-${budgetType}`"
        :url="
          `/spreadsheet?budget-pnl&budid=${this.budId}&budgetdetails=${this.budName}&financialstart=${this.yearStart}`
        "
        :title="`Download budget ${budgetType} spreadsheet`"
        variant="dark"
        class="ml-1"
        :aria-label="`Download budget ${budgetType} spreadsheet button`"
        :message-from-parent="parentMessage"
      />
      <gk-file-download
        v-else
        :file-suffix="`Budget-${budgetType}`"
        :url="
          `/spreadsheet?budget&budid=${this.budId}&budgetdetails=${this.budName}&financialstart=${this.yearStart}`
        "
        :title="`Download budget ${budgetType} spreadsheet`"
        :aria-label="`Download budget ${budgetType} spreadsheet button`"
        variant="dark"
        class="ml-1"
        :message-from-parent="parentMessage"
      />
    </gk-toolbar>
    <!-- Table -->
    <div
      id="budget-table-container"
      v-if="budId"
    >
      <report-header>
        <div class="text-center">
          <b>{{ isTypeCash ? 'Cash' : 'Profit & Sale' }} Budget</b>
          | From
          <b>{{ fromDate }}</b>
          to
          <b>{{ toDate }}</b>
        </div>
      </report-header>
      <b-table
        id="budget-table"
        caption-top
        class="mt-3"
        head-variant="dark"
        responsive
        small
        bordered
        striped
        :items="report"
        :fields="tableFields"
        :sticky-header="`${tableHeight}px`"
        thead-class="text-right"
      >
        <template #cell(name)="data">
          <div class="text-right position-relative">
            <div
              class="position-relative"
              @click="openTableRow(data.index, data.item.isOpen, false)"
              v-b-toggle="`bl-${data.item.name}`"
            >
              <!--  -->
              <b-icon
                font-scale="0.8"
                :style="{left: '0px', top: '0px'}"
                class="position-absolute d-print-none"
                :icon="data.item.isOpen ? 'dash' : 'arrows-fullscreen'"
              />
              <b> {{ data.value }} </b>
            </div>
            <b-collapse
              :id="`bl-${data.item.name}`"
              v-model="data.item.isOpen"
            >
              <div
                v-for="(accName, index) in data.item.acc"
                :key="index"
              >
                {{ accName }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(budget)="data">
          <div class="text-right">
            <b> {{ data.item.total.budget }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div
                v-for="(bud, index) in data.value"
                :key="index"
              >
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(actual)="data">
          <div class="text-right">
            <b> {{ data.item.total.actual }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div
                v-for="(bud, index) in data.value"
                :key="index"
              >
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(var)="data">
          <div class="text-right">
            <b> {{ data.item.total.var }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div
                v-for="(bud, index) in data.value"
                :key="index"
              >
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
        <template #cell(varPercent)="data">
          <div class="text-right">
            <b> {{ data.item.total.varPercent }} </b>
            <b-collapse v-model="data.item.isOpen">
              <div
                v-for="(bud, index) in data.value"
                :key="index"
              >
                {{ bud }}
              </div>
            </b-collapse>
          </div>
        </template>
      </b-table>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import { debounceEvent } from '../js/utils.js';
import axios from 'axios';
import ReportHeader from '../components/ReportHeader.vue';
import PrintHelper from '../components/PrintHelper.vue';
import GkToolbar from '@/components/GkToolbar.vue';
import GkFileDownload from '@/components/GkFileDownload.vue';

export default {
  name: 'Budget',
  components: {
    ReportHeader,
    PrintHelper,
    GkToolbar,
    GkFileDownload,
  },
  data() {
    return {
      parentMessage: '',
      printStyles: `.table .thead-dark th {
              color: #fff !important;
              background-color: #343a40 !important;
              border-color: #454d55 !important;
      }`,
      expandAllRows: false,
      tableHeight: window.innerHeight - 275,
      loading: false,
      budgetType: 'cash',
      expandTable: false,
      budId: null,
      report: [],
      options: {
        budget: {
          cash: [],
          pl: [],
        },
        budIdToData: {},
        budIdToNames: {},
        reports: {},
      },
    };
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
    type: {
      type: [String],
      validator: function(value) {
        return ['cash', 'pl'].indexOf(value) !== -1;
      },
      required: true,
    },
  },
  computed: {
    tableFields: (self) => {
      let res = [
        {
          key: 'name',
          label: self.$gettext('Particulars'),
          thStyle: { 'min-width': '125px' },
        },
        { key: 'budget', label: self.$gettext('Budgeted') },
        { key: 'actual', label: self.$gettext('Actuals') },
      ];
      if (self.expandTable) {
        res.push(
          { key: 'var', label: self.$gettext('Variance') },
          { key: 'varPercent', label: self.$gettext('Variance(%)') }
        );
      }
      return res;
    },
    budData: (self) =>
      self.budId && self.options.budIdToData[self.budId]
        ? self.options.budIdToData[self.budId]
        : {},
    budName: (self) => self.budData.name || '',
    fromDate: (self) => (self.budData.date ? self.budData.date.from : ''),
    toDate: (self) => (self.budData.date ? self.budData.date.to : ''),
    budgetList: (self) =>
      self.isTypeCash ? self.options.budget.cash : self.options.budget.pl,
    isTypeCash: (self) => self.budgetType === 'cash',
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    confirmOnDelete() {
      const self = this;
      let name = this.options.budIdToData[this.budId].name;
      let text = `Delete Budget <b>${name}</b> ?`;
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'danger',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            axios
              .delete('/budget', {
                data: {
                  budid: self.budId,
                },
              })
              .then((resp) => {
                if (resp.data.gkstatus === 0) {
                  let logdata = { activity: `budget deleted: ${name}` };
                  axios.post('/log', logdata);
                  self.$bvToast.toast(
                    this.$gettextInterpolate(
                      this.$gettext(`Delete Budget "%{budgetName}" success!`),
                      { budgetName: name }
                    ),
                    {
                      variant: 'success',
                      solid: true,
                    }
                  );
                  self.preloadData();
                } else {
                  self.$bvToast.toast(
                    this.$gettextInterpolate(
                      this.$gettext(`Delete Budget "%{budgetName}" failed!`),
                      {
                        budgetName: name,
                      }
                    ),
                    {
                      variant: 'danger',
                      solid: true,
                    }
                  );
                }
              })
              .catch((e) => {
                self.$bvToast.toast(e.message, {
                  title: this.$gettextInterpolate(
                    this.$gettext(`Delete Budget "%{budgetName}" failed!`),
                    {
                      budgetName: name,
                    }
                  ),
                  variant: 'danger',
                  solid: true,
                });
              });
          }
        });
    },
    formatTableData(data) {
      let formatRowData = function(rowData, name, isCash) {
        let total = {
          budget: 0,
          actual: 0,
          var: 0, // actual - budgeted
          varPercent: 0, // var / budgeted
          total: {},
        };
        let row = {
          name: name,
          acc: [],
          budget: [],
          actual: [],
          var: [],
          varPercent: [],
          isOpen: false,
          isCardOpen: false,
        };
        let nameKey = isCash ? 'accountname' : 'name';
        let noBudget = rowData[0].budget === undefined; // openingacc data doesn't have budget or actual, so balance data is used instead
        let noActual = rowData[0].actual === undefined; // closing data doesn't have actual, so balance is used instead
        rowData.forEach((item) => {
          row.acc.push(item[nameKey]);
          if (noBudget) {
            row.budget.push(item.balance);
            row.actual.push(item.balance);
            row.var.push('-');
            row.varPercent.push('-');
            Object.assign(total, {
              budget: total.budget + (parseFloat(item.balance) || 0),
              actual: total.actual + (parseFloat(item.balance) || 0),
              var: 0,
              varPercent: 0,
            });
          } else {
            row.budget.push(item.budget);
            row.actual.push(noActual ? item.balance : item.actual);
            row.var.push(item.var);
            row.varPercent.push(item.varinpercent);
            Object.assign(total, {
              budget: total.budget + (parseFloat(item.budget) || 0),
              actual:
                total.actual +
                (parseFloat(noActual ? item.balance : item.actual) || 0),
              var: total.var + (parseFloat(item.var) || 0),
              varPercent: total.varPercent + (parseFloat(item.varPercent) || 0),
            });
          }
        });
        total.var = total.actual - total.budget;
        total.varPercent = total.var / total.budget;
        row.total = {
          budget: total.budget.toFixed(2),
          actual: total.actual.toFixed(2),
          var: total.var.toFixed(2),
          varPercent: total.varPercent.toFixed(2),
        };
        return row;
      };
      let result = [];
      if (this.isTypeCash) {
        result.push(formatRowData(data.openingacc, 'Opening', this.isTypeCash));
        result.push(formatRowData(data.inflow, 'Inflow', this.isTypeCash));
        result.push(formatRowData(data.outflow, 'Outflow', this.isTypeCash));
        result.push(formatRowData(data.closing, 'Closing', this.isTypeCash));
      } else {
        result.push(formatRowData(data.incomeacc, 'Income', this.isTypeCash));
        result.push(formatRowData(data.expenseacc, 'Expense', this.isTypeCash));
        let budgetProfit = result[0].total.budget - result[1].total.budget, // income - expense
            actualProfit = result[0].total.actual - result[1].total.actual; // income - expense
        result.push({
          name: 'Net Profit',
          acc: [],
          budget: [],
          actual: [],
          var: [],
          varPercent: [],
          total: {
            budget: budgetProfit.toFixed(2),
            actual: actualProfit.toFixed(2),
            var: (actualProfit - budgetProfit).toFixed(2),
            varPercent: (
              ((actualProfit - budgetProfit) / budgetProfit) *
              100
            ).toFixed(2),
          },
          isOpen: true,
        });
      }
      return result;
    },
    onBudgetFilterUpdate() {
      if (this.budId) {
        this.updateUrl();
        this.getReport();
      }
    },
    getReport() {
      if (parseInt(this.budId) < 0) {
        return;
      }
      if (this.options.reports[this.budId]) {
        // use the existing report
        // return;
      }
      this.loading = true;
      let type = this.isTypeCash ? 'cashReport' : 'profitlossReport';
      let startDate = this.dateReverse(this.fromDate);
      const self = this;
      axios
        .get(
          `/budget?type=${type}&budid=${this.budId}&financialstart=${startDate}`
        )
        .then((r) => {
          switch (r.data.gkstatus) {
          case 0:
            {
              self.report = self.formatTableData(r.data.gkresult);
            }
            break;
          case 2:
            self.$bvToast.toast(this.$gettext('Unauthorised Access'), {
              variant: 'danger',
              solid: true,
            });
            break;
          case 3:
          default:
            self.$bvToast.toast(this.$gettext('Data error'), {
              variant: 'danger',
              solid: true,
            });
            break;
          }
          self.loading = false;
        })
        .catch((e) => {
          self.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          self.loading = false;
        });
    },
    preloadData() {
      this.loading = true;

      const requests = [
        axios.get('/budget?bud=all&btype=3'),
        axios.get('/budget?bud=all&btype=16'),
      ];
      return Promise.all(requests)
        .then(([resp1, resp2]) => {
          let idToData = {};
          let preloadFail = false;
          if (resp1.data.gkstatus === 0) {
            this.options.budget.cash = resp1.data.gkresult.map((budget) => {
              idToData[budget.budid] = {
                date: {
                  from: budget.startdate,
                  to: budget.enddate,
                },
                name: budget.budname,
              };
              return {
                text: `${budget.budname} (${budget.startdate} - ${budget.enddate})`,
                value: budget.budid,
              };
            });
          } else {
            preloadFail = true;
          }

          if (resp2.data.gkstatus === 0) {
            this.options.budget.pl = resp2.data.gkresult.map((budget) => {
              idToData[budget.budid] = {
                date: {
                  from: budget.startdate,
                  to: budget.enddate,
                },
                name: budget.budname,
              };
              return {
                text: `${budget.budname} (${budget.startdate} - ${budget.enddate})`,
                value: budget.budid,
              };
            });
          } else {
            preloadFail = true;
          }

          this.options.budIdToData = idToData;

          if (preloadFail) {
            this.$bvToast.toast(this.$gettext('Preload Budget List Failed!'), {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
          return true;
        })
        .catch((e) => {
          this.loading = false;
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
    updateUrl() {
      let url = window.location.href.split('#')[0];
      let currentId = window.location.href.split('/').pop();
      if (currentId == this.budId) {
        return;
      }
      url += `#/budgets/${this.budgetType}/${this.budId || -1}`;
      history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
      // instead of creating a new history instances for every entity selected
    },
    openTableRow(index, openFlag, openAll) {
      // close all rows
      this.expandAllRows = !!openAll;
      this.report.forEach((row) => {
        row.isOpen = this.expandAllRows;
      });
      if (index >= 0) {
        this.report[index].isOpen = !!openFlag;
      }
    },
  },
  mounted() {
    // this.fromDate = this.dateReverse(this.yearStart);
    // this.toDate = this.dateReverse(this.yearEnd);
    const self = this;
    this.preloadData().then(() => {
      self.budgetType = self.type;
      self.$nextTick().then(() => {
        if (self.id) {
          let id = parseInt(self.id)
          self.budId = !isNaN(id) && id > 0 ? id : null;
        }
        self.onBudgetFilterUpdate();
      });
    });

    self.expandTable = !this.is_mobile();
    debounceEvent(
      window,
      'resize',
      () => {
        self.expandTable = !self.is_mobile();
      },
      100
    );
  },
};
</script>

<style>
.acc-card-header {
  border-bottom: 1px solid #0000001a;
}
.acc-card-header:hover {
  border-bottom: 1px solid #000;
}
.bg-dark-grey {
  background-color: #d6d6d6;
}
.bg-light-grey {
  background-color: #ecebeb;
}
@media all and (max-width: 576px) {
  .options-col {
    width: 50px;
  }
}
</style>
