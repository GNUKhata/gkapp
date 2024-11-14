<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <b-card
        class="gkcard mx-auto"
        header-bg-variant="dark"
        header-text-variant="light"
      >
        <template #header>
          <gk-cardheader
            v-if="orgType == 'Profit Making'"
            :name="$gettext('Profit & Loss Statement')"
          ></gk-cardheader>
          <gk-cardheader
            v-else
            name="Income & Expenditure"
          ></gk-cardheader>
        </template>
        <b-form @submit.prevent="getReport">
          <b-form-group label="From" label-align="right" content-cols="8">
            <gk-date id="fromdate" v-model="fromDate"></gk-date>
          </b-form-group>
          <b-form-group label="To" label-align="right" content-cols="8">
            <gk-date id="todate" v-model="toDate"></gk-date>
          </b-form-group>
          <b-button variant="success" class="float-right" type="submit"
            ><b-icon class="mr-1" icon="cloud-arrow-up"></b-icon>
            <translate>Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
      <!--     {{ result }} -->
      <report-header>
        <div class="text-center">
          <b v-if="orgType == 'Profit Making'" v-translate>Profit & Loss</b>
          <b v-else v-translate>Income & Expenditure</b>for the period
          {{ fromDate }} to
          {{ toDate }}
          <br />
        </div>
      </report-header>
      <div
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
        <b-form-checkbox
          id="checkbox-2"
          v-model="divideThousand"
          name="checkbox-2"
          class="d-inline-block mx-2"
          size="sm"
          switch
        >
          <translate> Divide by 1000 </translate>
        </b-form-checkbox>
        <b-button
          class="px-1 d-none d-lg-inline-block"
          variant="link"
          @click="printPage"
        >
          <b-icon class="align-middle" icon="printer"></b-icon>
        </b-button>
        <gk-file-download
          :url="downloadUrl"
          :fileName="downloadFileName"
          fileExtn=".xlsx"
          :messageFromParent="parentMessage"
        ></gk-file-download>
      </div>
      <b-row class="row text-small">
        <b-col cols="6" class="pr-0">
          <ReportTableThreeCol
            :items="tradingLeft"
            :fields="reportFields"
            :filterTable="filterTable"
            :tableName="'trading'"
            :divideThousand=divideThousand
          >
          </ReportTableThreeCol>
        </b-col>
        <b-col cols="6" class="pl-0">
          <ReportTableThreeCol
            :items="tradingRight"
            :fields="reportFields"
            :filterTable="filterTable"
            :tableName="'trading'"
            :divideThousand=divideThousand
          >
          </ReportTableThreeCol>
        </b-col>
      </b-row>

      <b-row class="row text-small">
        <b-col cols="6" class="pr-0">
          <b-table
            borderless
            small
            :items="totals.trading_left"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="">
            </template>
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
            </template>
          </b-table>
        </b-col>
        <b-col cols="6" class="pl-0">
          <b-table
            borderless
            small
            :items="totals.trading_right"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="">
            </template>
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
            </template>
          </b-table>
        </b-col>
      </b-row>
      <b-row class="row text-small">
        <b-col cols="6" class="pr-0">
          <ReportTableThreeCol
            :items="pnlLeft"
            :fields="reportFields"
            :filterTable="filterTable"
            :tableName="'pnl'"
            :divideThousand=divideThousand
          >
          </ReportTableThreeCol>
        </b-col>
        <b-col cols="6" class="pl-0">
          <ReportTableThreeCol
            :items="pnlRight"
            :fields="reportFields"
            :filterTable="filterTable"
            :tableName="'pnl'"
            :divideThousand=divideThousand
          >
          </ReportTableThreeCol>
        </b-col>
      </b-row>

      <b-row class="row text-small">
        <b-col cols="6" class="pr-0">
          <b-table
            borderless
            small
            :items="totals.pnl_left"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="">
            </template>
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
            </template>
          </b-table>
        </b-col>
        <b-col cols="6" class="pl-0">
          <b-table
            borderless
            small
            :items="totals.pnl_right"
            :fields="reportFields"
            head-variant="dark"
            class="mb-0"
            thead-class="d-none"
            tbody-tr-class="bs-row"
            responsive=""
            filter="a"
          >
            <template #cell(name)="data">
              <div class="font-weight-bold">
                {{ data.value }}
              </div>
            </template>
            <template #cell(colOne)="">
            </template>
            <template #cell(colTwo)="data">
              <div class="border-dark border-2 border-top border-bottom font-weight-bold">
                {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
              </div>
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
import GkCardheader from '../components/GkCardheader.vue';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '../components/ReportHeader.vue';
import ReportTableThreeCol from '../components/reports/ReportTableThreeCol.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
export default {
   components: { GkCardheader, GkDate, ReportHeader, GkFileDownload, ReportTableThreeCol },
   name: 'BalanceSheet',
   data() {
     return {
       parentMessage: '',
       isLoading: false,
       fromDate: null,
       toDate: null,
       hideZero: false,
       divideThousand: false,
       orgType: '',

       // set level based fields
       reportFields: [
         {
           key: 'name',
           label: 'Particulars',
           class: 'text-break col-6',
         },
         {
          key: 'colOne',
          label: '',
          class: 'text-break text-right col-3',
        },
        {
          key: 'colTwo',
          label: 'Amount',
          class: 'text-break text-right col-3',
        },
      ],
      tradingLeft: [],
      tradingRight: [],
      pnlLeft: [],
      pnlRight: [],
      totals: {
        trading_left: [],
        trading_right: [],
        pnl_left: [],
        pnl_right: [],
      },
    };
  },
  computed: {
    downloadUrl: (self) => {
      return `/spreadsheet/profit-loss?from=${self.fromDate}&to=${self.toDate}`
    },
    downloadFileName: (self) =>
      `Profit_Loss_${self.fromDate}_to_${self.toDate}`,
    hideZeroFilter: (self) => (self.hideZero ? 'a' : null),
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
   methods: {
    printPage() {
      window.print();
    },
    filterTable(item) {
      if (this.hideZeroFilter && item.amount == 0.00) {
        return false
      }
      return item.isShown;
    },
    prepareReport(report, reportName) {
      report.forEach((item, index) => {
        let isStock, isGroup, isSubGroup, isAccount, isPNL, isTotal, isParentSubgroup;
        let amount = parseFloat(item?.amount || 0).toFixed(2);
        switch (item.type) {
          case "stock":
            isStock = true;
            break;
          case "group":
            isGroup = true;
            break;
          case "subgroup":
            isSubGroup = true;
            break;
          case "account":
            isAccount = true;
            break;
          case "pnl_str":
            isPNL = true;
            break;
          case "total":
            isTotal = true;
            this.totals[reportName] = [{...item, "colOne": false, "colTwo": true, amount}];
            break;
        }
        if (item?.subgroupcode) {
          isParentSubgroup = true;
        }
        report[index] = {
          ...item,
          ...{isStock, isGroup, isSubGroup, isAccount, isPNL, isTotal, isParentSubgroup},
          amount,
        };
      });
      return report;
    },
    formatTrading(tradingData) {
      tradingData.forEach((item, index) => {
        let isShown, colOne, colTwo ;
        let children = [];
        isShown = (item?.isParentSubgroup || item?.isGroup || item?.isTotal) ? false : true;
        colOne = false;
        colTwo = true;
        if (item?.isSubGroup) {
          tradingData.forEach((tradingItem) => {
            if (tradingItem?.isAccount && item.id === tradingItem?.parent_group) {
              tradingItem["isShown"] = true;
              tradingItem["colTwo"] = false;
              tradingItem["colOne"] = true;
              children.push(tradingItem);
            }
          });
        }
        tradingData[index] = {...item, isShown, children, colOne, colTwo};
      });
      return tradingData;
    },
    formatPNL(pnlData) {
      pnlData.forEach((item, index) => {
        let isShown, colOne, colTwo;
        let children = [];
        isShown = (item?.isGroup || item?.isPNL) ? true : false;
        colOne = false;
        colTwo = true;
        if (item?.isGroup) {
          pnlData.forEach((pnlItem) => {
            if (item.id === pnlItem?.groupcode) {
              if (pnlItem?.isAccount) {
                pnlItem["isShown"] = true;
                pnlItem["colTwo"] = false;
                pnlItem["colOne"] = true;
                children.push(pnlItem);
              }
            }
          });
        }
        pnlData[index] = {...item, isShown, children, colOne, colTwo};
      });
      return pnlData;
    },
    formatResponse(response) {
      for (let report_name of ["trading_left", "trading_right", "pnl_left", "pnl_right"]) {
        response[report_name] = this.prepareReport(response[report_name], report_name);
        if (["trading_left", "trading_right"].includes(report_name)) {
          response[report_name] = this.formatTrading(response[report_name]);
        }
        if (["pnl_left", "pnl_right"].includes(report_name)) {
          response[report_name] = this.formatPNL(response[report_name]);
        }
      }
      this.tradingLeft = response["trading_left"];
      this.pnlLeft = response["pnl_left"];
      this.tradingRight = response["trading_right"];
      this.pnlRight = response["pnl_right"];
      return response;
    },
    getReport() {
      const self = this;
      this.isLoading = true;
      axios
        .get(
          `/reports/profit-loss?calculateto=${this.toDate}&calculatefrom=${this.fromDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                {
                  self.orgType = r.data.gkresult.org_type;
                  self.formatResponse(r.data.gkresult);
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
          console.log(e);
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
