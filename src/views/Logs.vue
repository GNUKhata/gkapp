<template>
  <section class="container-fluid">
    <!-- heading -->
    <b-alert
      show
      class="bg-dark text-center text-light mx-auto d-print-none mt-2"
    >
      <div v-if="dateRange.isActive">
        Audit Logs: From {{ dateReverse(dateRange.from) }} to
        {{ dateReverse(dateRange.to) }}
      </div>
      <div v-else>
        Audit Logs: From {{ dateReverse(yearStart) }} to
        {{ dateReverse(yearEnd) }}
      </div>
    </b-alert>
    <!-- toolbar -->
    <gk-toolbar class="d-print-none mt-5">
      <template #left>
        <!-- search bar -->
        <b-form-input
          class="m-1 border border-secondary container-sm gksearch"
          type="text"
          :placeholder="$gettext('Search Logs')"
          v-model="searchText"
          size="sm"
          style="align-self:center"
        />
      </template>
      <div>
        <b-button
          variant="link"
          id="date-select"
        >
          <b-icon icon="funnel" />
        </b-button>
        <!-- Filters -->
        <b-popover
          class="bg-secondary"
          target="date-select"
          triggers="click"
          placement="bottom"
        >
          <!-- Get logs by date range -->
          <b-form @submit.prevent="logsByDateRange">
            <h6
              class="bg-dark text-light p-1"
              v-text="'Date Range'"
            />
            <!-- date start -->
            <gk-date
              id="fd"
              format="dd-mm-yyyy"
              v-model="dateRange.from"
              :min="dateReverse(yearStart)"
              :max="dateReverse(yearEnd)"
              :required="true"
            />

            <!-- date end -->
            <gk-date
              id="td"
              format="dd-mm-yyyy"
              v-model="dateRange.to"
              :min="dateReverse(yearStart)"
              :max="dateReverse(yearEnd)"
              :required="true"
              class="mb-2 mt-2"
            />
            <b-button-group size="sm">
              <b-button
                variant="dark"
                type="submit"
              >
                <translate>Submit</translate>
              </b-button>

              <b-button
                @click="$router.go()"
                variant="danger"
                class="ml-1"
              >
                <translate>Clear</translate>
              </b-button>
            </b-button-group>
          </b-form>
        </b-popover>
      </div>
    </gk-toolbar>
    <report-header>
      <div class="mx-auto text-center">
        <div v-if="dateRange.isActive">
          Audit Logs: From {{ dateReverse(dateRange.from) }} to
          {{ dateReverse(dateRange.to) }}
        </div>
        <div
          v-else
          class="text-center"
        >
          Audit Logs: From {{ dateReverse(yearStart) }} to
          {{ dateReverse(yearEnd) }}
        </div>
        <div v-if="searchText.length > 0">
          Search Terms: <b>{{ searchText }}</b>
        </div>
      </div>
    </report-header>
    <b-alert
      class="text-center mt-5 mx-auto"
      style="width: 20em"
      v-if="log.length == 0 && !isLoading"
      show
      variant="warning"
    >
      <b-icon
        icon="exclamation-triangle-fill"
        class="mr-1"
      />
      <translate>No Logs Available</translate>
    </b-alert>
    <b-table
      v-else
      responsive="sm"
      small
      hover
      striped
      fixed
      head-variant="dark"
      bordered
      :items="log"
      :busy="isLoading"
      :filter="searchText"
      :fields="fields"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong>
            <translate>Fetching Logs ...</translate>
          </strong>
        </div>
      </template>
      <template #cell(username)="data">
        {{ data.item.username }}
      </template>
      <template #cell(time)="data">
        <b-icon
          icon="calendar-event"
          class="mr-1"
        />
        {{ data.item.time.split(' ')[0] }}
        <b-icon
          icon="clock"
          class="mr-1"
        />{{ data.item.time.split(' ')[1] }}
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkToolbar from '@/components/GkToolbar.vue';
import GkDate from '@/components/GkDate.vue';
import ReportHeader from '@/components/ReportHeader.vue';
export default {
  components: { GkToolbar, GkDate, ReportHeader },
  name: 'Logs',
  data() {
    return {
      log: [],
      isLoading: true,
      searchText: '',
      fields: [
        { key: 'activity', sortable: true },
        { key: 'time', label: this.$gettext('Date / Time'), sortable: true },
        { key: 'username', label: this.$gettext('User'), sortable: true },
      ],
      dateRange: Object,
    };
  },
  computed: {
    ...mapState(['orgName', 'yearStart', 'yearEnd']),
  },
  methods: {
    logsByDateRange() {
      this.loading = true;
      axios
        .get(
          `/log/dateRange?from=${this.dateRange.from}&to=${this.dateRange.to}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.dateRange.isActive = true;
              this.log = r.data.gkresult;
              this.$root.$emit('bv::hide::popover', 'date-select');
              this.isLoading = false;
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                title: this.$gettext('Error'),
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast(
                this.$gettext('You have no permission to access'),
                {
                  title: this.$gettext('Error'),
                  variant: 'danger',
                  solid: true,
                }
              );
              break;
            }
          }
        });
    },
    getLogs() {
      axios
        .get('/log')
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.log = r.data.gkresult.reverse();
              this.isLoading = false;
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                title: this.$gettext('Error'),
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast(
                this.$gettext('You have no permission to access'),
                {
                  title: this.$gettext('Error'),
                  variant: 'danger',
                  solid: true,
                }
              );
              break;
            }
          }
        })
        .catch((e) => {
          console.error(e);
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  mounted() {
    this.getLogs();
  },
};
</script>
