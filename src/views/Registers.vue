<template>
  <section class="m-1">
    <b-overlay :show="loading" blur>
      <b-card
        :header="$gettext('View Registers')"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="getRegisters">
          <!-- Select Register -->
          <b-form-group label="Type" label-cols="auto">
            <b-form-select ref="register-type" v-model="registerType" required>
              <template #first>
                <b-form-select-option disabled value=""
                  ><translate
                    >-- Select Type Of Register --</translate
                  ></b-form-select-option
                >
              </template>
              <b-form-select-option value="1"
                ><translate>Purchase</translate></b-form-select-option
              >
              <b-form-select-option value="0"
                ><translate>Sale</translate></b-form-select-option
              >
            </b-form-select>
          </b-form-group>
          <!-- Date -->
          <div class="row">
            <div class="col">
              <b-form-group :label="$gettext('From')">
                <gk-date
                  :formatOutput="true"
                  id="1"
                  required
                  v-model="fromDate"
                ></gk-date>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group :label="$gettext('To')">
                <gk-date
                  :formatOutput="true"
                  id="2"
                  required
                  v-model="toDate"
                ></gk-date>
              </b-form-group>
            </div>
          </div>
          <b-button
            @click="updateRoute()"
            variant="success"
            type="submit"
            class="float-right"
            ><b-icon class="mr-1" icon="cloud-download"></b-icon>
            <translate>Get Details</translate></b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <div v-if="report.length > 0">
      <report-header>
        <div class="text-center">
          <b
            >{{
              $refs['register-type'].value == 0 ? 'Sale' : 'Purchase'
            }}
            Register</b
          >
          | <translate>From</translate>
          <b class="ml-1 mr-1">{{ fromDate }}</b>
          <translate>to</translate>
          <b class="mr-1 ml-2">{{ toDate }}</b>
        </div>
      </report-header>
      <gk-toolbar class="mt-5">
        <template #left>
          <b-form-input
            type="text"
            class="d-print-none"
            :placeholder="$gettext('search Register')"
            v-model="search"
            size="sm"
            style="align-self:center"
          ></b-form-input>
        </template>
        <template>
          <div class="d-flex flex-row-reverse m-1">
            <b-checkbox switch v-model="expandedTable"></b-checkbox>
            <span class="mr-1" v-translate>Expanded Table</span>
          </div>
        </template>
        <gk-file-download
          :url="downloadUrl"
          :fileName="downloadFileName"
          fileExtn=".xlsx"
          :messageFromParent="parentMessage"
        ></gk-file-download>
      </gk-toolbar>
      <b-table
        caption-top
        :filter="search"
        class="mt-2"
        head-variant="dark"
        small
        bordered
        striped
        v-if="report.length > 0"
        :items="report"
        :fields="fields"
        sticky-header="500px"
      >
        <template #cell(document_no)="voucher">
          <b-link
            :to="{
              name: 'Workflow',
              params: {
                wfName: 'Transactions-Voucher',
                wfId: voucher.item.v_id,
              },
            }"
          >
            {{ voucher.item.v_no }} {{ voucher.item.document_no }}
          </b-link>
        </template>
      </b-table>
    </div>
  </section>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import axios from 'axios';
import ReportHeader from '../components/ReportHeader.vue';
import GkToolbar from '@/components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';

export default {
  name: 'Registers',
  components: { GkDate, ReportHeader, GkToolbar, GkFileDownload },
  data() {
    return {
      loading: false,
      registerType: '',
      fromDate: '',
      toDate: '',
      search: '',
      report: [],
      tmp_report: [],
      fields: [],
      expandedTable: false,
    };
  },
  watch: {
    expandedTable() {
      this.getRegisters();
    },
  },
  methods: {
    formatTable(data) {
      const newdata = data.vouchers.map((voucher) => {
        let obj = {
          v_no: voucher.vouchernumber,
          v_id: voucher.vouchercode,
          document_no: voucher.document_no,
          narration: voucher.narration,
          voucherdate: voucher.voucherdate,
          custname: voucher.custname,
          gstin: voucher.gstin,
          custtin: voucher.custtin,
          amount: parseFloat(voucher.amount).toFixed(2),
          taxed: parseFloat(voucher.taxed).toFixed(2),
        };
        voucher.tax_data.forEach((taxItem) => {
          if (taxItem) {
            obj[taxItem.tax_str] = parseFloat(taxItem.tax_amount).toFixed(2);
          } else {
            obj[taxItem.tax_str] = "0.00";
          }
        });
        return obj;
      });
      let totalRow = {
        custname: 'Total',
        amount: parseFloat(data.voucher_total).toFixed(2),
        taxed: parseFloat(data.taxed_total).toFixed(2),
      };
      data.tax_strings.forEach((taxCol) => {
        if (data.tax_totals[taxCol]) {
          totalRow[taxCol] = parseFloat(data.tax_totals[taxCol]).toFixed(2);
        } else {
          totalRow[taxCol] = "0.00";
        }
      });
      newdata.push(totalRow);

      this.tmp_report = newdata;
      if (this.expandedTable) {
        this.fields = [
          { key: 'document_no', label: 'Voucher No.', stickyColumn: true },
          { key: 'custname', label: 'Customer' },
          { key: 'narration', label: 'Narration', stickyColumn: true },
          { key: 'voucherdate', label: 'Voucher Date' },
        ];

        if (this.isGstEnabled) {
          this.fields.push({ key: 'gstin', label: 'GSTIN' });
        }
        if (this.isVatEnabled) {
          this.fields.push({ key: 'custtin', label: 'TIN' });
        }

        this.fields.push(
          { key: 'amount', label: 'Voucher Amount', tdClass: 'text-right' },
        );

        if (this.isIndia)  {
          this.fields.push(
            ...data.tax_strings.map((taxCol) => {
              return {
                key: taxCol,
                tdClass: 'text-right',
              };
            })
          );
        }

        this.fields.push({ key: 'taxed', label: 'Total', tdClass: 'text-right' });
      } else {
        this.conciseTableRows();
      }

      return newdata;
    },
    // this method get's triggered when the user toggles the table view switch
    conciseTableRows() {
      this.fields = [
        { key: 'document_no', label: 'Voucher No.', stickyColumn: true },
        { key: 'custname', label: 'Customer' },
        { key: 'voucherdate', label: 'Voucher Date' },
        { key: 'amount', label: 'Voucher Amount', tdClass: 'text-right' },
        { key: 'taxed', label: 'Total', tdClass: 'text-right' },
      ];
    },
    getRegisters() {
      this.report = [];
      this.loading = true;
      axios
        .get(
          `/reports/registers?flag=${this.registerType}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.report = this.formatTable(r.data);
                break;
              case 1:
                this.$bvToast.toast('Duplicate Entry', {
                  variant: 'warning',
                  solid: true,
                });
                break;
              case 2:
                this.$bvToast.toast('Unauthorised Access', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 3:
                this.$bvToast.toast('Data error', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast('No Privilege', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 5:
                this.$bvToast.toast('Integrity error', {
                  variant: 'danger',
                  solid: true,
                });
                break;
            }
            this.loading = false;
          } else {
            this.$bvToast.toast('failed to load register data ', {
              variant: 'danger',
              solid: true,
            });
            this.loading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          from: this.fromDate,
          to: this.toDate,
          type: this.registerType,
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.fromDate = params.from;
        this.toDate = params.to;
        this.registerType = params.type;
      } else {
        this.fromDate = this.dateReverse(this.yearStart);
        this.toDate = this.dateReverse(this.yearEnd);
        this.registerType = 0;
      }
      this.getRegisters();
    },
  },
  computed: {
    downloadUrl: (self) => {
      return `/spreadsheet/view-register?title=Register as&from=${self.fromDate}&to=${self.toDate}&fields=${JSON.stringify(self.fields)}`
    },
    downloadFileName: (self) =>
      `Profit_Loss_${self.fromDate}_to_${self.toDate}`,
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
  },
  mounted() {
    this.parseParams();
  },
};
</script>
