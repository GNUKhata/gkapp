<template>
  <section class="m-2">
    <b-overlay :show="isLoading">
      <b-card
        class="gkcard mx-auto mb-2"
        header-bg-variant="dark"
        header-text-variant="light"
      >
        <template #header>
          <gk-cardheader
            :name="$gettext('Cash Flow Statement')"
            :help-body="
              $gettext(`Receipt & Payment Account or Cash Flow
This report can be viewed for any period.
Drill Down facility is available. You can double click or press enter key on any row to see the ledger for that account.
All users can view this report`)
            "
          />
        </template>
        <b-form @submit.prevent="getProfitLossData">
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
            @click="updateRoute"
            type="submit"
          >
            <b-icon
              class="mr-1"
              icon="cloud-arrow-down"
            />
            <translate>Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
      <report-header>
        <div class="text-center">
          <b>Cash Flow Account</b>
          for the period {{ dateReverse(this.yearStart) }} to
          {{ dateReverse(this.yearEnd) }}
        </div>
      </report-header>
      <gk-toolbar class="mt-5">
        <gk-file-download
          v-if="result1 !== null"
          :url="
            `/spreadsheet?cash-flow&from=${this.fromDate}&to=${this.toDate}&orgtype=${orgType}&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`
          "
          :common-params="false"
          :message-from-parent="parentMessage"
        />
      </gk-toolbar>
      <div
        class="row"
        v-if="result1 !== null"
      >
        <div class="col">
          <b-table
            :fields="fields1"
            :items="result1"
            primary-key="particulars"
            small
            bordered
            striped
            responsive
            head-variant="dark"
          >
            <template #cell(particulars)="data">
              <router-link
                v-if="!['Total', 'Opening balance', 'Closing balance'].includes(data.item.particulars)"
                :to="
                  `/ledger/${data.item.accountcode}&null&${fromDate}&${toDate}`
                "
              >
                {{ data.item.particulars }}
              </router-link>
              <b v-else>{{ data.item.particulars }}</b>
            </template>

            <template #cell(amount)="data">
              {{ data.item.amount }}
            </template>
          </b-table>
        </div>
        <div class="col">
          <b-table
            :fields="fields2"
            :items="result2"
            primary-key="particulars"
            small
            bordered
            striped
            responsive
            head-variant="dark"
          >
            <template #cell(particulars)="data">
              <router-link
                v-if="!['Total', 'Opening balance', 'Closing balance'].includes(data.item.particulars)"
                :to="
                  `/ledger/${data.item.accountcode}&null&${fromDate}&${toDate}`
                "
              >
                {{ data.item.particulars }}
              </router-link>
              <b v-else>{{ data.item.particulars }}</b>
            </template>

            <template #cell(amount)="data">
              {{ data.item.amount }}
            </template>
          </b-table>
        </div>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkCardheader from '../components/GkCardheader.vue';
import GkDate from '../components/GkDate.vue';
import ReportHeader from '../components/ReportHeader.vue';
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
export default {
  components: { GkCardheader, GkDate, ReportHeader, GkToolbar, GkFileDownload },
  name: 'ProfitLoss',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      fromDate: null,
      toDate: null,
      result1: null,
      result2: null,
      fields1: [
        {
          key: 'toby',
          label: '',
        },
        {
          key: 'particulars',
          label: this.$gettext('Particulars'),
        },
        {
          key: 'amount',
          label: this.$gettext('Amount'),
          class: 'gk-currency',
        },
      ],
      fields2: [
        {
          key: 'toby',
          label: '',
        },
        {
          key: 'particulars',
          label: this.$gettext('Particulars'),
        },
        {
          key: 'amount',
          label: this.$gettext('Amount'),
          class: 'gk-currency',
        },
      ],
    };
  },
  methods: {
    getProfitLossData() {
      this.isLoading = true;
      axios
        .get(
          `/reports/cash-flow?calculatefrom=${this.fromDate}&calculateto=${this.toDate}&financialstart=${this.yearStart}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.result1 = r.data.rcgkresult;
              this.result2 = r.data.pygkresult;
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
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.fromDate = params.from;
        this.toDate = params.to;
      } else {
        this.fromDate = this.yearStart;
        this.toDate = this.yearEnd;
      }
      this.getProfitLossData();
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
  },
  mounted() {
    this.parseParams();
  },
};
</script>
