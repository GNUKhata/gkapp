<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <b-card
        header="Cost Center Statement"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <template #header>
          <div class="d-flex">
            <div class="mr-auto">
              Cost Center Statement
            </div>
            <div>
              <b-icon
                icon="question-circle"
                v-b-popover.click.blur="{
                  variant: 'dark',
                  title: 'Cost Center Statement',
                  html: 'true',
                  content:
                    'The period of this report must begin with the first date of the Financial Year and can end on any date. Select name of the Project/Cost Center for which the statement is to be seen. This statement gives account wise expenses relating to it. ',
                }"
              />
            </div>
          </div>
        </template>
        <b-form @submit.prevent="projectReport">
          <b-form-group
            label="Cost Center"
            label-align="right"
            label-cols="auto"
          >
            <autocomplete
              v-model="projectId"
              :options="projectList"
              placeholder="Search Cost Center"
            />
          </b-form-group>
          <div class="row">
            <div class="col">
              <b-form-group
                label="From"
                label-align="Left"
              >
                <gk-date
                  v-model="fromDate"
                  id="from"
                  class="mr-4"
                  :readonly="true"
                />
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group
                label="To"
                label-align="left"
              >
                <gk-date
                  :required="true"
                  v-model="toDate"
                  id="to"
                />
              </b-form-group>
            </div>
          </div>
          <b-button
            type="submit"
            variant="success"
            class="float-right"
          >
            <b-icon icon="cloud-download" /> Get Details
          </b-button>
        </b-form>
      </b-card>
    </b-overlay>
    <!--  Table -->
    <report-header v-if="report.length > 0">
      <div class="text-center">
        Cost Center Statement for {{ projectName(projectId)[0]['text'] }} |
        From: {{ fromDate }} to {{ toDate }}
      </div>
    </report-header>
    <gk-toolbar>
      <gk-file-download
        v-if="report.length > 0"
        :url="
          `/spreadsheet?cost-center-statement&projectname=${
            projectName(projectId)[0]['text']
          }&projectcode=${this.projectId}&finstart=${
            this.yearStart
          }&calculateto=${this.toDate}`
        "
        :message-from-parent="parentMessage"
      />
    </gk-toolbar>
    <b-table-simple
      v-if="report.length > 0"
      class="mt-3"
      small
      responsive="sm"
      bordered
      striped
      hover
      caption-top
    >
      <b-thead head-variant="dark">
        <b-tr>
          <b-th>Account</b-th>
          <b-th>Group Name</b-th>
          <b-th>Sub Group Name</b-th>
          <b-th>Outgoing</b-th>
          <b-th>Incoming</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr
          v-for="(row, index) in report"
          :key="index"
        >
          <b-th>{{ row.accountname }}</b-th>
          <b-th>{{ row.groupname }}</b-th>
          <b-th>{{ row.subgroupname }}</b-th>
          <b-th>{{ row.totalout }}</b-th>
          <b-th>{{ row.totalin }}</b-th>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from './Autocomplete.vue';
import GkDate from './GkDate.vue';
import { mapState } from 'vuex';
import ReportHeader from './ReportHeader.vue';
import GkFileDownload from './GkFileDownload.vue';
import GkToolbar from '@/components/GkToolbar.vue';

export default {
  components: { Autocomplete, GkDate, ReportHeader, GkFileDownload, GkToolbar },
  name: 'CostCenterStatement',
  data() {
    return {
      parentMessage: '',
      projectList: [],
      loading: false,
      projectId: null,
      fromDate: '',
      toDate: '',
      report: [],
    };
  },
  methods: {
    projectName(code) {
      let n = this.projectList.filter((d) => {
        return d.value === code;
      });
      return n;
    },
    projectReport() {
      this.loading = true;
      axios
        .get(
          `/reports/project-statement?&calculateto=${this.toDate}&financialstart=${this.fromDate}&projectcode=${this.projectId}`
        )
        .then((r) => {
          const data = r.data;
          if (r.status == 200) {
            switch (data.gkstatus) {
            case 0:
              this.report = data.gkresult;
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
          } else {
            this.$bvToast.toast('Failed to get stock report ', {
              variant: 'danger',
              title: r.status,
              solid: true,
            });
          }
          this.loading = false;
        });
    },
    getProjectList() {
      this.loading = true;
      axios
        .get('/projects')
        .then((r) => {
          if (r.status == 200) {
            this.projectList = r.data.gkresult.map((data) => {
              return {
                text: data.projectname,
                value: data.projectcode,
              };
            });
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
      this.loading = true;
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  mounted() {
    this.getProjectList();
    this.fromDate = this.yearStart;
    this.toDate = this.currentDate();
  },
};
</script>
