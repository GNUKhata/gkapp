<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <!-- Card -->
      <b-form @submit.prevent="getAllTrialBalances">
        <b-card
          class="gkcard mx-auto"
          header-bg-variant="dark"
          header-text-variant="light"
        >
          <template #header>
            <gk-card-header
              :name="$gettext('View Trial Balance')"
              :help-body="showHelpBody"
            />
          </template>
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
            @click="updateRoute"
            class="float-right"
            type="submit"
          >
            <b-icon
              class="mr-1"
              icon="cloud-arrow-down"
            />
            <translate>Get Details</translate>
          </b-button>
        </b-card>
      </b-form>
      <!-- Report header -->
      <report-header>
        <div class="text-center">
          <b>{{ trialBalanceType }} Trial Balance</b>
          for the period {{ dateReverse(this.yearStart) }} to
          {{ dateReverse(this.yearEnd) }}
        </div>
      </report-header>
      <div
        class="mt-3"
        v-if="result !== null"
      >
        <!-- Toolbar -->
        <gk-toolbar>
          <template #left>
            <!-- search bar -->
            <b-form-input
              size="sm"
              v-model.lazy="search"
              type="text"
              :placeholder="$gettext('Search trial balance')"
              style="align-self: center"
            />
          </template>
          <!-- Select balance type buttons -->
          <gk-hovermenu>
            <div class="bg-dark text-light p-1 mb-1">
              <b v-translate>Balance Type</b>
            </div>
            <b-form-radio-group
              class="d-flex flex-column"
              v-model="trialBalanceType"
              name="radio-options"
            >
              <b-form-radio
                value="Net"
              >
                <translate> Net</translate>

                <gk-tooltip
                  class="ml-1"
                  icon="info-circle"
                  :help-title="$gettext('Net Trial Balance')"
                  :help-body="
                    $gettext(
                      'The Net Trial Balance will provide the closing balances (or current balance as on selected end date)',
                    )
                  "
                />
              </b-form-radio>
              <b-form-radio
                value="Gross"
              >
                <translate>Gross</translate>

                <gk-tooltip
                  class="ml-1"
                  icon="info-circle"
                  :help-title="$gettext('Gross Trial Balance')"
                  :help-body="
                    $gettext(
                      'The Gross Trial Balance shows for each account the total Drs and Crs along with Closing Balances',
                    )
                  "
                />
              </b-form-radio>
              <b-form-radio
                value="Extended"
              >
                <translate>Extended</translate>

                <gk-tooltip
                  class="ml-1"
                  icon="info-circle"
                  :help-title="$gettext('Extended Trial Balance')"
                  :help-body="
                    $gettext(
                      'The extended version shows all gross & net trial balances with Opening Balances',
                    )
                  "
                />
              </b-form-radio>
            </b-form-radio-group>
          </gk-hovermenu>
          <!-- spreadsheet download button -->
          <gk-file-download
            v-if="trialBalanceType == 'Net'"
            :url="
              `/spreadsheet/trial-balance?calculateto=${this.toDate}&trialbalancetype=1&fystart=${this.yearStart}&fyend=${this.yearEnd}&&orgname=${this.orgName}`
            "
            :common-params="false"
            file-suffix="NetTrialBalance"
            title="Download Net Trial Balance Spreadsheet"
            :message-from-parent="parentMessage"
          />
          <gk-file-download
            v-if="trialBalanceType == 'Gross'"
            :url="
              `/spreadsheet/trial-balance?calculateto=${this.toDate}&trialbalancetype=2&fystart=${this.yearStart}&fyend=${this.yearEnd}&&orgname=${this.orgName}`
            "
            :common-params="false"
            file-suffix="NetTrialBalance"
            title="Download Net Trial Balance Spreadsheet"
            :message-from-parent="parentMessage"
          />
          <gk-file-download
            v-if="trialBalanceType == 'Extended'"
            :url="
              `/spreadsheet/trial-balance?calculateto=${this.toDate}&trialbalancetype=3&&fystart=${this.yearStart}&fyend=${this.yearEnd}&&orgname=${this.orgName}`
            "
            :common-params="false"
            file-suffix="ExtendedTrialBalance"
            title="Download Extended Trial Balance Spreadsheet"
            :message-from-parent="parentMessage"
          />
        </gk-toolbar>
        <!-- Tables -->
        <!-- Net trial balance -->
        <b-table
          v-if="trialBalanceType === 'Net'"
          :items="balance.gross"
          :fields="netfields"
          :filter="search"
          class="table-border-dark"
          small
          primary-key="accountname"
          bordered
          hover
          striped
          head-variant="dark"
          responsive
        >
          <template #cell(accountname)="data">
            <router-link
              v-if="!['Total', 'Difference in Trial balance'].includes(data.item.accountname)"
              :to="`/ledger/${data.item.accountcode}`"
            >
              {{ data.item.accountname }}
            </router-link>
            <div v-else>
              {{ data.item.accountname }}
            </div>
          </template>
        </b-table>
        <!-- Gross Trial Balance -->
        <b-table
          v-else-if="trialBalanceType === 'Gross'"
          class="table-border-dark"
          :items="balance.net"
          :fields="grossfields"
          :filter="search"
          primary-key="accountname"
          small
          bordered
          striped
          head-variant="dark"
          responsive
        >
          <template #cell(accountname)="data">
            <router-link
              v-if="!['Total', 'Difference in Trial balance'].includes(data.item.accountname)"
              :to="`/ledger/${data.item.accountcode}`"
            >
              {{ data.item.accountname }}
            </router-link>
            <div v-else>
              {{ data.item.accountname }}
            </div>
          </template>
        </b-table>
        <!-- Extended Trial Balance -->
        <b-table
          v-else
          class="table-border-dark"
          :items="balance.extended"
          :fields="extendedfields"
          :filter="search"
          primary-key="accountname"
          small
          bordered
          striped
          head-variant="dark"
          responsive
        >
          <template #cell(accountname)="data">
            <router-link
              v-if="!['Total', 'Difference in Trial Balance'].includes(data.item.accountname)"
              :to="`/ledger/${data.item.accountcode}`"
            >
              {{ data.item.accountname }}
            </router-link>
            <div v-else>
              {{ data.item.accountname }}
            </div>
          </template>
        </b-table>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkCardHeader from '../components/GkCardHeader.vue';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '../components/ReportHeader.vue';
import GkTooltip from '../components/GkTooltip.vue';
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
import GkHovermenu from '@/components/GkHovermenu.vue';
export default {
  components: {
    GkCardHeader,
    GkDate,
    ReportHeader,
    GkTooltip,
    GkToolbar,
    GkFileDownload,
    GkHovermenu,
  },
  name: 'TrialBalance',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      search: '',
      fromDate: null,
      toDate: null,
      trialBalanceType: 'Net',
      balance: Object,
      result: null,
      // options: [
      //   { text: 'Net Trial Balance', value: 'Net' },
      //   { text: 'Gross Trial Balance', value: 'Gross' },
      //   { text: 'Extended Trial Balance', value: 'Extended' },
      // ],
      netfields: [
        {
          key: 'srno',
          label: this.$gettext('Sr. No.'),
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
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
          key: 'groupname',
          label: this.$gettext('Group'),
          class: 'text-center',
        },
      ],
      grossfields: [
        {
          key: 'srno',
          label: 'Sr. No.',
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
        },

        // {
        //   key: 'ttlRunDr',
        //   label: this.$gettext('Debit'),
        //   class: 'text-right',
        // },
        // {
        //   key: 'ttlRunCr',
        //   label: this.$gettext('Credit'),
        //   class: 'text-right',
        // },

        {
          key: 'Dr balance',
          label: this.$gettext('Dr Balance'),
          class: 'text-right',
        },
        {
          key: 'Cr balance',
          label: this.$gettext('Cr Balance'),
          class: 'text-right',
        },

        {
          key: 'groupname',
          label: this.$gettext('Group'),
          class: 'text-center',
        },
      ],
      extendedfields: [
        {
          key: 'srno',
          label: this.$gettext('Sr. No.'),
        },
        {
          key: 'accountname',
          label: this.$gettext('Account Name'),
        },
        {
          key: 'openingbalance',
          label: this.$gettext('Opening Balance'),
          class: 'text-right',
        },
        {
          key: 'totaldr',
          label: this.$gettext('Total Drs'),
          class: 'text-right',
        },
        {
          key: 'totalcr',
          label: this.$gettext('Total Crs'),
          class: 'text-right',
        },
        {
          key: 'curbaldr',
          label: this.$gettext('Dr Balance'),
          class: 'text-right',
        },
        {
          key: 'curbalcr',
          label: this.$gettext('Cr Balance'),
          class: 'text-right',
        },
      ],
    };
  },
  methods: {
    /**
     * Return appropriate trial balance code for generating spreadsheet
     */
    trialBalanceCode() {
      console.log(this.trialBalanceType);
      if (this.trialBalanceType == 'Net') {
        return 1;
      } else if (this.trialBalanceType == 'Gross') {
        return 2;
      } else {
        return 3;
      }
    },
    getAllTrialBalances() {
      this.isLoading = true;
      Promise.all([
        axios.get(
          `/reports/trial-balance/gross?financialstart=${this.fromDate}&calculateto=${this.toDate}`
        ),
        axios.get(
          `/reports/trial-balance/net?financialstart=${this.fromDate}&calculateto=${this.toDate}`
        ),
        axios.get(
          `/reports/trial-balance/extended?financialstart=${this.fromDate}&calculateto=${this.toDate}`
        ),
      ])
        .then((r) => {
          if (r[0].status === 200) {
            switch (r[0].data.gkstatus) {
            case 0:
              this.balance.net = r[0].data.gkresult;
              this.balance.gross = r[1].data.gkresult;
              this.balance.extended = r[2].data.gkresult;
              this.result = this.balance.net;
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
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          from: this.fromDate,
          to: this.toDate,
          balType: this.trialBalanceType,
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.fromDate = params.from;
        this.toDate = params.to;
        this.trialBalanceType = params.balType;
      } else {
        this.fromDate = this.yearStart;
        this.toDate = this.yearEnd;
      }
      this.getAllTrialBalances();
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
    showHelpBody() {
      return this.$gettext(`Trial Balance can be seen in three formats.
                  The Net Trial Balance will provide the closing balances or current balance as on selected end date. The Gross Trial Balance shows for each account the total Drs and Crs along with Closing Balances, while the Extended version shows all this with Opening Balances.
                  Apart from the regular account names and balances, these reports include Group name of each account.
                  The period for this report must begin with the first date of the Financial Year and can end on any date. If an account has an adverse balance it is shown in red colour.
                  The difference in Trial Balance, if any, is shown in the last row.
                  Drill Down facility is available for all types of Trial Balances. You can click or press enter key on any row to see the ledger for that account.
                  All users can view all types of Trial Balances.`);
    },
  },
  watch: {
    trialBalanceType() {
      this.updateRoute();
    },
  },
  mounted() {
    this.parseParams();
  },
};
</script>

<style>
tr[data-pk='Total'] {
  font-weight: bold;
}
</style>
