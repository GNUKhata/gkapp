<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <div class="bg-dark mb-4">
        <!-- header -->
        <h6 class="text-center card-header text-light d-print-none">
          <i class="mr-1" v-translate>Ledger Account:</i>
          <b>{{ ledgerHead.accountname }}</b> |
          <i v-translate>Period: </i>
          <b> {{ ledgerHead.calculatefrom }} </b> to
          <b>{{ ledgerHead.calculateto }} </b>
        </h6>
      </div>
      <!-- print header -->
      <report-header>
        <div class="text-center">
          Monthly ledger of account:
          <b>{{ ledgerHead.accountname }}</b> from
          {{ ledgerHead.calculatefrom }} to
          {{ ledgerHead.calculateto }}
        </div>
      </report-header>
      <!-- Toolbar -->
      <gk-toolbar>
        <template #left>
          <!-- search bar -->
          <b-form-input
            :placeholder="$gettext('Search Ledger')"
            size="sm"
            v-model="search"
            type="text"
            style="align-self:center"
          ></b-form-input>
        </template>
        <gk-hover class="col">
          <!-- Filters / Checkboxes -->
          <b-form-checkbox
            class="mr-2"
            @change="getLedger"
            v-model="ledgerChoice"
            value="all"
            unchecked-value="all"
          >
            <translate>All</translate></b-form-checkbox
          >
          <b-form-checkbox
            @change="getCrDrLedger"
            class="mr-2"
            v-model="ledgerChoice"
            value="cr"
            unchecked-value="all"
          >
            <translate>Credit Only</translate></b-form-checkbox
          >
          <b-form-checkbox
            @change="getCrDrLedger"
            class="mr-2"
            v-model="ledgerChoice"
            unchecked-value="all"
            value="dr"
          >
            <translate>Debit Only</translate></b-form-checkbox
          >
        </gk-hover>
        <gk-file-download
          v-if="ledgerChoice == 'all'"
          :common-params="false"
          :url="
            `/spreadsheet/ledger?accountcode=${this.accountCode}&accountname=${this.ledgerHead.accountname}&from=${this.fromDate}&to=${this.toDate}&orgtype=${this.orgType}&projectcode=${this.projectCode}&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`
          "
          :messageFromParent="parentMessage"
        ></gk-file-download>
      </gk-toolbar>
      <!-- result -->
      <b-table
        :items="result"
        :filter="search"
        small
        striped
        bordered
        hover
        head-variant="dark"
        responsive="sm"
        :busy="loading"
        :fields="fields"
      >
        <template #cell(status)="data">
          <div v-if="data.item.status">
            {{ data.item.status }}
          </div>
        </template>
        <template #cell(vouchernumber)="data">
          <router-link
            :to="`/Workflow/Transactions-Voucher/${data.item.vouchercode}`"
          >
            {{ data.item.vouchernumber }}
          </router-link>
        </template>
        <template #cell(particulars)="data">
          <div v-for="item in data.item.particulars" :key="item.accountname">
            {{ item.accountname }}
          </div>
        </template>
      </b-table>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import ReportHeader from '../components/ReportHeader.vue';
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
import GkHover from '../components/GkHovermenu.vue';
export default {
  components: { ReportHeader, GkToolbar, GkFileDownload, GkHover },
  name: 'LedgerMonthly',
  data() {
    return {
      parentMessage: '',
      loading: false,
      search: '',
      accountCode: null,
      // projectCode null value is '', else it will result in data error
      projectCode: '',
      result: [],
      ledgerHead: '',
      ledgerChoice: 'all',
      accountName: null,
      fromDate: null,
      toDate: null,
      checkboxes: [
        { text: 'Only Cr', value: 'cr' },
        { text: 'Only Dr', value: 'dr' },
      ],
      fields: [
        {
          key: 'voucherdate',
          label: this.$gettext('Date'),
          sortable: true,
        },
        {
          key: 'vouchernumber',
          label: this.$gettext('Voucher No.'),
        },
        {
          key: 'vouchertype',
          label: this.$gettext('Type'),
        },
        {
          key: 'particulars',
          label: this.$gettext('Particulars'),
        },
        {
          key: 'Dr',
          label: this.$gettext('Debit'),
          class: 'text-right',
        },
        {
          key: 'Cr',
          label: this.$gettext('Credit'),
          class: 'text-right',
        },
        {
          key: 'balance',
          label: this.$gettext('Balance'),
          class: 'text-right',
        },
      ],
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
  mounted() {
    const params = this.$route.params;
    this.accountCode = params.id;
    if (params.pc !== 'null') {
      this.projectCode = params.pc || '';
    }
    this.accountCode = params.ac;
    this.fromDate = params.fd || this.yearStart;
    this.toDate = params.td || this.yearEnd;
    this.getLedger();
  },
  methods: {
    getCrDrLedger() {
      if (this.ledgerChoice == 'all') {
        this.getLedger();
        return;
      }
      this.loading = true;
      axios
        .get(
          `/reports/ledger/crdr?accountcode=${this.accountCode}&projectcode=${this.projectCode}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}&side=${this.ledgerChoice}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.result = r.data.gkresult;
                this.ledgerHead = r.data.ledgerheader;
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
          this.loading = false;
        });
    },
    getLedger() {
      this.loading = true;
      axios
        .get(
          `reports/ledger?accountcode=${this.accountCode}&projectcode=${this.projectCode}&calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.result = r.data.gkresult;
                this.ledgerHead = r.data.ledgerheader;
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
          this.loading = false;
        });
    },
  },
};
</script>
