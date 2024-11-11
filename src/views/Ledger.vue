<template>
  <section class="m-2">
    <b-form @submit.prevent="check">
      <b-card
        header-bg-variant="dark"
        class="gkcard mx-auto"
        header-text-variant="light"
      >
        <template #header>
          <gk-cardheader
            :name="$gettext('View Ledger')"
            :help-body="
              $gettext(`Single
Select name of the account to be viewed. The default option is Monthly Ledger.
Press Space Bar to view it or press Enter or Tab key to escape it and view report for any period.
The report could be viewed with or without narration. This report gives Date, V. No., Status, Type of Voucher, Name of the corresponding account, Narration, Amount and running balance of account. The locked records are marked by a sign of *** in the Status column. Drill Down facility is available where you can double click or press enter key on any transaction to view it and/or modify it. After any modification the ledger report immediately reflects the chnages. It can be viewed in entirety or for a Project or Cost Center. You can view only Debit transactions or Credit Transactions of a Ledger account. Dual Ledgers
When a Ledger Account appears on the screen, press Shift + Alt + l to view another Ledger Account simultaneously. Select another Ledger account, choose period and press Enter. You can view the same account side by side but for a different period. Drill Down facility is available for both the accounts. Each Ledger Account of the dual ledgers has a separate Quick Search facility. All users can view this report. This report is unique to GNUKhata.`)
            "
          />
        </template>
        <!-- Account name -->
        <b-form-group
          :label="$gettext('Account name')"
          label-size="sm"
          label-cols="auto"
        >
          <autocomplete
            required
            placeholder="select account"
            v-model="accountCode"
            :options="accountsList"
            text-field="accountname"
            value-field="accountcode"
          />
          <!-- monthly ledger checkbox -->
          <b-form-checkbox
            switch
            size="sm"
            class="mt-2"
            v-model="showMonthlyLedger"
          >
            <translate>Monthly Ledger</translate>
          </b-form-checkbox>
        </b-form-group>
        <!-- Date fields -->
        <fieldset :disabled="showMonthlyLedger">
          <div class="d-flex">
            <b-form-group
              :label="$gettext('From')"
              label-size="sm"
            >
              <gk-date
                id="from"
                v-model="fromDate"
              />
            </b-form-group>
            <b-form-group
              :label="$gettext('To')"
              class="ml-3"
              label-size="sm"
            >
              <gk-date
                id="to"
                v-model="toDate"
              />
            </b-form-group>
          </div>
          <b-form-group
            class="mt-2"
            :label="$gettext('Cost Center')"
            label-size="sm"
            label-cols="auto"
          >
            <autocomplete
              :required="false"
              :placeholder="$gettext('select Cost Center')"
              v-model="projectCode"
              :options="costCenterList"
              text-field="projectname"
              value-field="projectcode"
            />
            <router-link
              to="/costcenter"
              class="float-right mt-2"
            >
              + <translate>add cost center</translate>
            </router-link>
          </b-form-group>
        </fieldset>
        <b-button
          type="submit"
          variant="success"
          size="sm"
          class="float-right"
        >
          <b-icon
            class="mr-1"
            icon="eye-fill"
          />
          <translate>Show</translate>
        </b-button>
      </b-card>
    </b-form>
  </section>
</template>

<script>
import axios from 'axios';
import GkCardheader from '../components/GkCardheader.vue';
import Autocomplete from '../components/Autocomplete.vue';
import { mapState } from 'vuex';
import GkDate from '../components/GkDate.vue';
export default {
  components: { GkCardheader, Autocomplete, GkDate },
  name: 'Ledger',
  data() {
    return {
      loading: false,
      accountsList: [],
      costCenterList: [],
      showMonthlyLedger: false,
      //       ledgerOptions: [],
      // checkboxes: [
      //   { text: 'Narration', value: 'narration' },
      //   { text: 'Billwise Details', value: 'billwise' },
      // ],
      accountCode: null,
      projectCode: null,
      fromDate: null,
      toDate: null,
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  mounted() {
    this.getAccounts();
    this.getCostCenterList();
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
  },
  methods: {
    check() {
      if (this.showMonthlyLedger) {
        this.$router.push(`/ledger/monthly/${this.accountCode}`);
      } else {
        this.$router.push(
          `/ledger/${this.accountCode}&${this.projectCode}&${this.fromDate}&${this.toDate}`
        );
      }
    },
    async getCostCenterList() {
      this.loading = true;
      axios
        .get(`/projects`)
        .then((r) => {
          if (r.status == 200) {
            this.costCenterList = r.data.gkresult;
          } else {
            this.$bvToast.toast(
              this.$gettext('Failed to fetch cost center items'),
              {
                variant: 'danger',
                solid: true,
              }
            );
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: this.$gettext('failed'),
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    async getAccounts() {
      axios.get('/accounts').then((r) => {
        if (r.status == 200) {
          switch (r.data.gkstatus) {
          case 0:
            this.accountsList = r.data.gkresult;
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
      });
    },
  },
};
</script>
