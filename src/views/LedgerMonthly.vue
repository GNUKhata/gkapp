<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <div class="bg-dark mb-4">
        <h6 class="text-center card-header text-light d-print-none">
          <i v-translate>Ledger Account:</i> <b>{{ accountName }}</b>
        </h6>
      </div>
      <report-header>
        <div class="text-center">
          Monthly ledger of account: <b>{{ accountName }}</b> from
          {{ dateReverse(yearStart) }} to {{ dateReverse(yearEnd) }}
        </div>
      </report-header>
      <gk-toolbar>
        <gk-file-download
          :common-params="false"
          :url="
            `/spreadsheet/ledger/monthly?accountcode=${this.accountCode}&accname=${this.accountName}&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`
          "
        />
      </gk-toolbar>
      <b-table
        :items="result"
        small
        striped
        bordered
        stacked="sm"
        hover
        head-variant="dark"
        responsive="sm"
        primary-key="particulars"
        :busy="loading"
        :fields="fields"
      />
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import ReportHeader from '../components/ReportHeader.vue';
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
export default {
  components: { ReportHeader, GkToolbar, GkFileDownload },
  name: 'LedgerMonthly',
  data() {
    return {
      loading: false,
      accountCode: null,
      result: Array,
      accountName: null,
      fields: [
        {
          key: 'month',
          label: this.$gettext('Month'),
        },
        {
          key: 'Dr',
          label: this.$gettext('Debit Balance'),
          class: 'text-right',
        },
        {
          key: 'vcountDr',
          label: this.$gettext('No. Of Debit Records'),
        },
        {
          key: 'Cr',
          label: this.$gettext('Credit Balance'),
          class: 'text-right',
        },
        {
          key: 'vcountCr',
          label: this.$gettext('No. Of Credit Records'),
        },
        {
          key: 'vcountLock',
          label: this.$gettext('No. of Unlocked Transactions'),
        },
      ],
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  mounted() {
    this.accountCode = this.$route.params.id;
    this.getAccounts();
  },
  methods: {
    getAccounts() {
      this.loading = true;
      axios
        .get(`/reports/ledger/monthly?accountcode=${this.accountCode}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.result = r.data.gkresult;
              this.accountName = r.data.accountname;
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
