<template>
  <section class="m-1">
    <b-overlay
      :show="loading"
      blur
    >
      <b-card
        header="Bank Reconciliation"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form class="text-small">
          <!-- Select Register -->
          <b-form-group
            label="Account Name"
            label-cols="auto"
          >
            <template #label>
              <translate> Account Name </translate>
            </template>
            <b-form-select
              ref="bankAcc"
              v-model="accId"
              :options="bankAccs"
              value-field="accountcode"
              text-field="accountname"
              required
              size="sm"
            />
          </b-form-group>
          <!-- Date -->
          <div class="row">
            <div class="col">
              <b-form-group label="From">
                <gk-date
                  id="date-from"
                  required
                  v-model="fromDate"
                />
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group label="To">
                <gk-date
                  id="date-to"
                  required
                  v-model="toDate"
                />
              </b-form-group>
            </div>
          </div>
          <b-button
            size="sm"
            variant="success"
            class="float-right"
            @click.prevent="getVouchers"
          >
            <b-icon
              class="mr-1"
              icon="cloud-download"
            />
            <translate>Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <div
      class="mt-3"
      v-if="dataFetched"
    >
      <b-form-radio-group
        v-model="tableType"
        :options="tableTypeOptions"
        name="table-options"
        class="mx-auto text-center d-print-none mb-3"
      />
      <report-header>
        <div class="text-center">
          <b> Register</b>
          | From
          <b>{{ fromDate }}</b>
          to
          <b>{{ toDate }}</b>
        </div>
      </report-header>
      <b-table
        class="mt-3 text-small"
        head-variant="dark"
        small
        bordered
        striped
        stacked="sm"
        v-if="tableType < 2 && activeVouchers.length"
        :items="activeVouchers"
        :fields="reconTableFields"
      >
        <template #cell(particulars)="data">
          {{ data.value }}
        </template>
        <template #cell(clearancedate)="data">
          <gk-date
            :id="`clearance-date-${data.index}`"
            required
            v-model="activeVouchers[data.index].clearancedate"
            @validity="(isValid) => (data.item.valid = isValid)"
          />
        </template>
        <template #cell(memo)="data">
          <b-input
            :id="`memo-${data.index}`"
            v-model="activeVouchers[data.index].memo"
            size="sm"
          />
        </template>
        <template #cell(save)="data">
          <b-button
            :disabled="!data.item.valid"
            @click.prevent="updateVoucher(activeVouchers[data.index])"
            variant="success"
            size="sm"
          >
            <b-icon
              class="align-middle"
              font-scale="1"
              icon="cloud-upload"
            />
          </b-button>
        </template>
      </b-table>
      <b-table
        class="mt-3 text-small"
        head-variant="dark"
        small
        bordered
        striped
        v-if="tableType === 2"
        :items="statements"
        :fields="[
          {key: 'particulars', label: 'Reconciliation Statement'},
          'amount',
        ]"
      />
    </div>
  </section>
</template>

<!-- TODOS
     * Fix Table fields
     * API response has object with multiple key/values. Process them
     * Add Button for export as spreadsheet
-->
<script>
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
import axios from 'axios';
import ReportHeader from '../components/ReportHeader.vue';
import { reverseDate } from '../js/utils';
export default {
  name: 'BankRecon',
  components: { GkDate, ReportHeader },
  data() {
    return {
      loading: false,
      accId: null,
      dataFetched: false,
      fromDate: '',
      toDate: '',
      search: '',
      vouchers: {
        cleared: [],
        uncleared: [],
      },
      unclearedVouchers: [],
      clearedVouchers: [],
      statements: [],
      bankAccs: [],
      tableType: 0,
      tableTypeOptions: [
        {
          text: 'Uncleared Vouchers',
          value: 0,
        },
        {
          text: 'Cleared Vouchers',
          value: 1,
        },
        {
          text: 'Statement',
          value: 2,
        },
      ],
      reconTableFields: [
        'date',
        {
          key: 'vno',
          label: 'V.No.',
        },
        'particulars',
        {
          key: 'dr',
          label: 'Debit',
          class: 'text-md-right',
        },
        {
          key: 'cr',
          label: 'Credit',
          class: 'text-md-right',
        },
        {
          key: 'clearancedate',
          label: 'Clearance Date',
        },
        'memo',
        'save',
      ],
    };
  },
  computed: {
    activeVouchers: (self) =>
      self.tableType === 0 ? self.vouchers.uncleared : self.vouchers.cleared,
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    getBankAccounts() {
      axios.get(`/bankrecon`).then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.bankAccs = [
            { accountname: '--- Select Account ---', accountcode: null },
          ];
          this.bankAccs.push(...resp.data.gkresult);
        }
      });
    },
    updateVoucher(voucher) {
      let payload = {
        accountcode: this.accId,
        reconcode: voucher.reconcode,
        memo: voucher.memo,
        clearancedate: voucher.clearancedate,
        calculatefrom: this.fromDate,
        calculateto: this.toDate,
      };
      axios.put('/bankrecon', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.$bvToast.toast(`Voucher ${voucher.vno} Updated successfully!`, {
            variant: 'success',
            solid: true,
          });
          this.getVouchers();
        } else {
          this.$bvToast.toast(`Voucher ${voucher.vno} Update Failed!`, {
            variant: 'danger',
            solid: true,
          });
        }
      });
    },
    getVouchers() {
      this.dataFetched = false;
      this.vouchers = {
        cleared: [],
        uncleared: [],
      };
      this.statements = [];
      this.loading = true;
      Promise.all([
        axios
          .get(
            `/bankrecon?recon=uncleared&accountcode=${this.accId}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
          )
          .catch((e) => {
            this.$bvToast.toast(e.message, {
              variant: 'danger',
              solid: true,
            });
          }),
        axios
          .get(
            `/bankrecon?recon=cleared&accountcode=${this.accId}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}`
          )
          .catch((e) => {
            this.$bvToast.toast(e.message, {
              variant: 'danger',
              solid: true,
            });
          }),
      ])
        .then((resp) => {
          if (resp[0].data.gkstatus === 0) {
            this.vouchers.uncleared = resp[0].data.gkresult.recongrid.map(
              (voucher) => {
                voucher.valid = false;
                return voucher;
              }
            );
            this.statements = resp[0].data.gkresult.reconstatement;
            this.statements.shift();
            this.dataFetched = true;
          }
          if (resp[1].data.gkstatus === 0) {
            this.vouchers.cleared = resp[1].data.gkresult.recongrid.map(
              (voucher) => {
                voucher.date = reverseDate(voucher.date);
                voucher.valid = false;
                return voucher;
              }
            );
            this.dataFetched = true;
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    this.getBankAccounts();
  },
};
</script>
