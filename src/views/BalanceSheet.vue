<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <!-- TODO: rm this alert when fixed -->
      <b-alert
        show
        variant="warning"
        class="container mt-2"
      >
        <b>NOTE:</b> Some data presented in this report is incorrect. We are
        working on fixing the issue.
      </b-alert>
      <b-card
        class="gkcard mx-auto"
        header-bg-variant="dark"
        header-text-variant="light"
      >
        <template #header>
          <gk-card-header
            v-if="orgType == 'Profit Making'"
            :name="$gettext('Balance Sheet Statement')"
            help-body="Statement of Affairs / Balance Sheet
This report can be seen in two formats, namely, Conventional and Vertical.
The Vertical format is also called Sources and Application of Funds. The period for this report must begin with the first date of the Financial Year and can end on any date.
In the Conventional format assets are shown on right side and capital and liabilities on the left side. In the Vertical format capital & liabilities are shown in the upper part and assets are shown in the lower part. Operators cannot view this report. Besides this report you can also see a Consolidated Balance Sheet of holding and subsidiary organizations. For this select Consolidated Final Accounts from the drop down of the report menu.
Final Accounts means the Balance Sheet and Profit & Loss Account.
Where in a business house has a number of different organizations, it may want to view a combined view of its profitability and State of Affairs.
GNUKhata provides an easy and quick way of doing this.
The user will be asked to select a Holding Company and its subsidiary company(s).
All these organizations must be of the same Type and must have the same Financial Year.
Note that this is a consolidated report generated from organizations which are separately created in GNUKhata and no changes in the accounts of these organizations will take place. Operators cannot view this report."
          />

          <gk-card-header
            v-else
            name="Statement Of Affairs"
            help-body="Statement of Affairs / Balance Sheet
This report can be seen in two formats, namely, Conventional and Vertical.
The Vertical format is also called Sources and Application of Funds. The period for this report must begin with the first date of the Financial Year and can end on any date.
In the Conventional format assets are shown on right side and capital and liabilities on the left side. In the Vertical format capital & liabilities are shown in the upper part and assets are shown in the lower part. Operators cannot view this report. Besides this report you can also see a Consolidated Balance Sheet of holding and subsidiary organizations. For this select Consolidated Final Accounts from the drop down of the report menu.
Final Accounts means the Balance Sheet and Profit & Loss Account.
Where in a business house has a number of different organizations, it may want to view a combined view of its profitability and State of Affairs.
GNUKhata provides an easy and quick way of doing this.
The user will be asked to select a Holding Company and its subsidiary company(s).
All these organizations must be of the same Type and must have the same Financial Year.
Note that this is a consolidated report generated from organizations which are separately created in GNUKhata and no changes in the accounts of these organizations will take place. Operators cannot view this report."
          />
        </template>
        <b-form @submit.prevent="getReport">
          <b-form-group
            label="From"
            label-align="right"
            content-cols="8"
          >
            <gk-date
              id="fromdate"
              v-model="fromDate"
            />
          </b-form-group>
          <b-form-group
            label="To"
            label-align="right"
            content-cols="8"
          >
            <gk-date
              id="todate"
              v-model="toDate"
            />
          </b-form-group>
          <b-button
            variant="success"
            class="float-right"
            type="submit"
          >
            <b-icon
              class="mr-1"
              icon="cloud-arrow-up"
            />
            <translate>Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
      <!--     {{ result }} -->
      <report-header>
        <div class="text-center">
          <b
            v-if="orgType == 'Profit Making'"
            v-translate
          >Balance Sheet</b>
          <b
            v-else
            v-translate
          >Statement Of Affairs</b>for the period
          {{ fromDate }} to
          {{ toDate }}
          <br>
          <small
            v-if="hideZeroFilter"
            v-translate
          >
            "Hide Zero Value Rows" Filter has been applied
          </small>
        </div>
      </report-header>
      <div
        v-if="bsheet.left.length && bsheet.right.length"
        class="d-print-none d-flex align-items-center justify-content-end my-2"
      >
        <b-form-checkbox
          id="checkbox-1"
          v-model="hideZero"
          name="checkbox-1"
          class="d-inline-block mx-2"
          size="sm"
          switch
        >
          <translate> Hide ₹0 rows </translate>
        </b-form-checkbox>
        <b-button
          class="px-1 d-none d-lg-inline-block"
          variant="link"
          @click="printPage"
        >
          <b-icon
            class="align-middle"
            icon="printer"
          />
        </b-button>
        <gk-file-download
          :url="downloadUrl"
          :file-name="downloadFileName"
          file-extn=".xlsx"
          :message-from-parent="parentMessage"
        />
      </div>
      <b-row class="row text-small">
        <b-col
          cols="12"
          md="6"
        >
          <b-table
            striped
            small
            bordered
            :items="bsheet.left"
            :fields="tableFields"
            head-variant="dark"
            v-if="bsheet.left.length"
            class="text-small table-border-dark"
            tbody-tr-class="bs-row"
            responsive=""
            :sticky-header="`${minTableHeight}px`"
            filter="a"
            :filter-function="filterLeftTable"
          >
            <template #head(groupAccname)="">
              <translate> Capital and Liabilities </translate>
            </template>
            <template #cell(groupAccname)="data">
              <div
                :class="{
                  'ml-1': data.item.isSubGroup,
                  'ml-5': data.item.isAccount,
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                <b-button
                  @click="data.item.isOpen = !data.item.isOpen"
                  class="p-0 text-dark"
                  :class="{
                    'font-weight-bold': data.item.isGroup,
                  }"
                  v-if="data.item.hasChildren"
                  variant="link"
                >
                  <b-icon
                    class="d-print-none"
                    font-scale="0.7"
                    :icon="data.item.isOpen ? 'dash' : 'arrows-fullscreen'"
                    v-if="!data.item.isAccount && data.item.hasChildren"
                  />
                  {{ data.value }}
                </b-button>
                <b-button
                  size="sm"
                  variant="link"
                  class="p-0"
                  :to="{path: `/ledger/${data.item.groupAcccode}`}"
                  v-else-if="data.item.isAccount"
                >
                  {{ data.value }}
                </b-button>
                <b-button
                  size="sm"
                  variant="link"
                  class="p-0"
                  :to="{path: `/profit-loss`}"
                  v-else-if="data.item?.type === 'pnl'"
                >
                  {{ data.value }}
                </b-button>
                <span
                  :class="{
                    'font-weight-bold': data.item.isGroup,
                  }"
                  v-else
                >
                  {{ data.value }}
                </span>
              </div>
            </template>
            <template #cell(isGroup)="data">
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                {{ data.value ? data.item.amount : '' }}
              </span>
            </template>
            <template #cell(isSubGroup)="data">
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                {{ data.value ? data.item.amount : '' }}
              </span>
            </template>
            <template #cell(isAccount)="data">
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                {{ data.value ? data.item.amount : '' }}
              </span>
            </template>
          </b-table>
        </b-col>
        <b-col
          cols="12"
          md="6"
        >
          <b-table
            :items="bsheet.right"
            :fields="tableFields"
            striped
            small
            bordered
            head-variant="dark"
            v-if="bsheet.right.length"
            class="text-small table-border-dark"
            tbody-tr-class="bs-row"
            responsive=""
            :sticky-header="`${minTableHeight}px`"
            filter="a"
            :filter-function="filterRightTable"
          >
            <template #head(groupAccname)="">
              <translate> Property and Assets </translate>
            </template>
            <template #cell(groupAccname)="data">
              <div
                :class="{
                  'ml-1': data.item.isSubGroup,
                  'ml-5': data.item.isAccount,
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                <b-button
                  @click="data.item.isOpen = !data.item.isOpen"
                  class="p-0 text-dark"
                  :class="{
                    'font-weight-bold': data.item.isGroup,
                  }"
                  v-if="data.item.hasChildren"
                  variant="link"
                >
                  <b-icon
                    class="d-print-none"
                    font-scale="0.7"
                    :icon="data.item.isOpen ? 'dash' : 'arrows-fullscreen'"
                    v-if="!data.item.isAccount && data.item.hasChildren"
                  />
                  {{ data.value }}
                </b-button>
                <span
                  v-else-if="data.item.isAccount && !data.item.groupAcccode"
                >
                  {{ data.value }}
                </span>
                <b-button
                  size="sm"
                  variant="link"
                  class="p-0"
                  :to="{path: `/ledger/${data.item.groupAcccode}`}"
                  v-else-if="data.item.isAccount"
                >
                  {{ data.value }}
                </b-button>
                <span
                  :class="{
                    'font-weight-bold': data.item.isGroup,
                  }"
                  v-else
                >
                  {{ data.value }}
                </span>
              </div>
            </template>
            <template #cell(isGroup)="data">
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                {{ data.value ? data.item.amount : '' }}
              </span>
            </template>
            <template #cell(isSubGroup)="data">
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                {{ data.value ? data.item.amount : '' }}
              </span>
            </template>
            <template #cell(isAccount)="data">
              <span
                :class="{
                  'font-weight-bold': data.item.isGroup,
                  'font-italic': data.item.isAccount,
                }"
              >
                {{ data.value ? data.item.amount : '' }}
              </span>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkCardHeader from '../components/GkCardHeader.vue';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '../components/ReportHeader.vue';
import GkFileDownload from '@/components/GkFileDownload.vue';
export default {
  components: { GkCardHeader, GkDate, ReportHeader, GkFileDownload },
  name: 'BalanceSheet',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      fromDate: null,
      toDate: null,
      hideZero: false,
      tableFields: [
        {
          key: 'groupAccname',
          label: 'Accounts',
          class: 'text-break',
          thStyle: { width: '46%' },
        },
        {
          key: 'isAccount',
          label: '',
          class: 'text-break text-right',
          thStyle: { width: '18%' },
        },
        {
          key: 'isSubGroup',
          label: '',
          class: 'text-break text-right',
          thStyle: { width: '18%' },
        },
        {
          key: 'isGroup',
          label: '',
          class: 'text-break text-right',
          thStyle: { width: '18%' },
        },
      ],
      bsheet: {
        left: [],
        right: [],
      },
      options: {
        groupIndex: {
          left: {},
          right: {},
        },
      },
    };
  },
  computed: {
    minTableHeight: (self) => {
      let height = 300;
      let bsheet = self.bsheet;
      if (bsheet.left.length && bsheet.right.length) {
        height =
          bsheet.left.length < bsheet.right.length
            ? bsheet.left.length
            : bsheet.right.length;
        height *= 26;
      }
      return height;
    },
    downloadUrl: (self) => {
      let orgChoice = (localStorage.getItem('orgChoice') || '').split(' (');
      let orgType = '';
      if (orgChoice.length) {
        orgType = orgChoice[orgChoice.length - 1].split(')')[0];
      } else {
        orgType = 'Organisation';
      }
      return `/spreadsheet/balance-sheet?calculateto=${self.toDate}&calculatefrom=${self.fromDate}&fystart=${self.yearStart}&orgname=${self.orgName}&fyend=${self.yearEnd}&orgtype=${orgType}&baltype=1`;
    },
    downloadFileName: (self) =>
      `Balance_Sheet_${self.fromDate}_to_${self.toDate}`,
    hideZeroFilter: (self) => (self.hideZero ? 'a' : null),
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
  methods: {
    filterTable(list, item) {
      let show = true;
      if (this.hideZeroFilter) {
        show = !(item.amount === '0.00' || item.amount === '0');
      }
      if (item.parent >= 0) {
        let parent = list[item.parent];
        if (parent.parent >= 0) {
          let grandparent = list[parent.parent];
          if (!grandparent.isOpen) {
            show = show && grandparent.isOpen;
          } else {
            show = show && parent.isOpen;
          }
        } else {
          show = show && parent.isOpen;
        }
      }
      return show;
    },
    filterLeftTable(item) {
      return this.filterTable(this.bsheet.left, item);
    },
    filterRightTable(item) {
      return this.filterTable(this.bsheet.right, item);
    },
    printPage() {
      window.print();
    },
    formatReport(report) {
      let result = [];
      let map = {};
      report.forEach((item, index) => {
        let isGroup = !(!!item.subgroupof || !!item.accountof),
            isSubGroup = !!item.subgroupof && !item.accountof,
            isAccount = !!item.accountof;

        // ignore empty buffer rows
        if (item.amount === '') return;

        let parent = item.accountof || item.subgroupof;
        let parentIndex = map[parent] >= 0 ? map[parent] : -1;
        if (!isAccount) {
          map[item.groupAcccode] = index;
          if (isGroup) parentIndex = -1;
        }
        if (parentIndex >= 0) {
          result[parentIndex].hasChildren = true;
        }
        result.push(
          Object.assign(
            {
              isOpen: !isSubGroup,
              parent: parentIndex,
              isGroup,
              isSubGroup,
              isAccount,
              hasChildren: false,
            },
            report[index]
          )
        );
      });
      return result;
    },
    getReport() {
      const self = this;
      this.isLoading = true;
      axios
        .get(
          `/reports/balance-sheet?calculateto=${this.toDate}&baltype=1&calculatefrom=${this.fromDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              {
                let report = r.data.gkresult;
                report.leftlist.shift();
                report.rightlist.shift();
                self.bsheet = {
                  left: self.formatReport(report.leftlist),
                  right: self.formatReport(report.rightlist),
                };
              }
              break;
            case 1:
              this.$bvToast.toast(this.$gettext('Duplicate Entry'), {
                variant: 'warning',
                solid: true,
              });
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
              this.$bvToast.toast(this.$gettext('Data error'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast(this.$gettext('No Privilege'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 5:
              this.$bvToast.toast(this.$gettext('Integrity error'), {
                variant: 'danger',
                solid: true,
              });
              break;
            }
          }
          this.isLoading = false;
        })
        .catch((e) => {
          console.error(e);
          this.isLoading = false;
        });
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    this.getReport();
  },
};
</script>

<style scoped>
.text-small {
  font-size: 0.9rem;
}
.bs-row {
  height: 21px;
}
.bs-col-name {
  width: 190px;
}
.bs-col-amount {
  width: 50px;
  color: blue;
}
</style>
