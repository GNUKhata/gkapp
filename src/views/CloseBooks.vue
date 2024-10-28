<template>
  <section class="m-2 mx-auto">
    <!-- alerts which show the status of closebooks and rollover -->
    <b-alert
      class="mt-5 container"
      show
      v-if="details.booksclosedflag == 1"
      variant="success"
    >
      <translate
        >Close Books is Done for this financial year</translate
      ></b-alert
    >
    <b-alert
      class="mt-5 container"
      show
      v-if="details.roflag == 1"
      variant="success"
    >
      <translate>Rollover is Done for this financial year</translate></b-alert
    >
    <!-- Close Books -->
    <b-card
      v-if="details.booksclosedflag == 0"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mt-4"
      style="max-width: 40em; margin: auto"
    >
      <b-overlay :show="isLoading" no-wrap></b-overlay>
      <template #header>
        <div class="d-flex">
          <div class="mr-auto"><translate>Close Books</translate></div>
          <div>
            <b-icon
              icon="question-circle"
              v-b-popover.click.blur="{
                variant: 'dark',
                title: 'Close Books',
                content:
                  'On activating this option, balances in all expense and income accounts will be transferred to Profit & Loss or Income & Expenditure Account and these accounts will be closed. No transactions can be recorded in these accounts but Ledger accounts can be viewed, printed. To <b>ROLL OVER</b> the company to new financial year, You have to close books first',
              }"
            ></b-icon>
          </div>
        </div>
      </template>
      <b-form-group
        id="input-group-2"
        label-class="font-weight-bold"
        :label="$gettext('Current Financial Year:')"
      >
        <div class="row">
          <div class="col-md-6">
            <b-form-group
              id="input-group-3"
              :label="$gettext('From')"
              label-for="cb-from"
            >
              <gk-date
                :readonly="true"
                id="cb-from"
                v-model="details.yearstart"
              ></gk-date>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group
              id="input-group-4"
              :label="$gettext('To')"
              label-for="cb-to"
            >
              <gk-date id="cb-to" v-model="details.yearend"></gk-date>
            </b-form-group>
          </div>
        </div>
      </b-form-group>
      <b-button
        :disabled="details.booksclosedflag == 1"
        class="float-right"
        @click="
          confirm(
            'close',
            'You are about to close your books. This action can not be undone, are you sure?'
          )
        "
        variant="dark"
        size="sm"
      >
        <b-icon class="mr-1" icon="journal"></b-icon
        ><translate>Close Books</translate>
      </b-button>
    </b-card>
    <!-- Roll Over -->
    <b-card
      header-bg-variant="dark"
      header-text-variant="light"
      class="mt-4 gkcard mx-auto"
      v-if="details.roflag == 0"
    >
      <b-overlay :show="isLoading" no-wrap></b-overlay>

      <template #header>
        <div class="d-flex">
          <div class="mr-auto"><translate>Roll Over</translate></div>
          <div>
            <b-icon
              icon="question-circle"
              v-b-popover.click.blur="{
                variant: 'info',
                title: 'Roll Over',
                content:
                  '<ul><li>A new organization with the same name and type is created forthe next accounting year,</li><li>Every existing asset and liability account is automatically opened under its respective Group and Sub-Group and correct opening balance is brought down, in case of expense and income accounts these are also opened under their respective Groups and Sub-Groups, of course, without opening balances, </li><li>The Closing Stock of the earlier year gets transferred to thenext year as Opening Stock. This module can only be activated after CLOSE BOOKS is done.</li></ul>',
                html: true,
              }"
            ></b-icon>
          </div>
        </div>
      </template>
      <!-- Set New Financial Year -->
      <b-form
        @submit.prevent="
          confirm(
            'rollover',
            'You are about to rollover to a new financial year. Are you sure?'
          )
        "
      >
        <b-form-group
          id="input-group-2"
          label-class="font-weight-bold"
          :label="$gettext('New Financial Year:')"
        >
          <div class="row">
            <div class="col-md-6">
              <b-form-group
                id="input-group-4"
                :label="$gettext('To')"
                label-for="ro-to"
              >
                <gk-date id="ro-to" v-model="newYearEnd"></gk-date>
              </b-form-group>
            </div>
          </div>
        </b-form-group>
        <b-button
          :disabled="details.booksclosedflag == 0"
          type="submit"
          class="float-right"
          variant="dark"
          size="sm"
        >
          <b-icon class="mr-1" icon="calendar-check"></b-icon>
          <translate>Roll Over</translate>
        </b-button>
      </b-form>
    </b-card>
  </section>
</template>
<script>
/**
 * This module implements close books & roll over functionality. Only admin can perform this
 * action.
 */
import axios from 'axios';
import GkDate from '../components/GkDate.vue';
import { mapState } from 'vuex';
export default {
  components: { GkDate },
  name: 'CloseBooks',
  data() {
    return {
      details: {},
      isLoading: true,
      newYearStart: '',
      newYearEnd: '',
    };
  },
  computed: {
    ...mapState(['finYears']),
  },
  methods: {
    confirm(type, message) {
      this.$bvModal
        .msgBoxConfirm(message, {
          centered: true,
          size: 'sm',
          okVariant: 'danger',
        })
        .then((val) => {
          if (val === true) {
            if (type === 'close') {
              this.closeBooks();
            } else {
              this.rollOver();
            }
          }
        });
    },
    /**
     * Fetch the company details from api & assign it to 'details' variable
     */
    getDetails() {
      axios
        .get('/organisation')
        .then((res) => {
          if (res.status == 200)
            switch (res.data.gkstatus) {
              case 0: {
                this.details = res.data.gkdata;

                // autofill rollover dates
                const ONE_DAY = 86400000;
                let oldEnd = new Date(
                  this.details.yearend.split('-').join('/')
                );
                let newStart = new Date(oldEnd.getTime() + ONE_DAY * 2);
                let endYear = newStart.getFullYear() + 1;
                let newEnd = '';
                if (endYear % 4 === 0) {
                  newEnd = new Date(newStart.getTime() + ONE_DAY * 365);
                } else {
                  newEnd = new Date(newStart.getTime() + ONE_DAY * 364);
                }
                this.newYearStart = newStart.toISOString().substr(0, 10);
                this.newYearEnd = newEnd.toISOString().substr(0, 10);
                this.isLoading = false;
              }
            }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    /**
     * Automatically set year end when year start date is selected by the user
     */
    setYearEnd() {
      if (this.yearStart !== null && this.year !== '') {
        const from = this.newYearStart.split('-'); // yyyy/mm/dd
        const to = new Date(`${parseInt(from[0]) + 1}/${from[1]}/${from[2]}`);
        let end = null;
        to.setDate(to.getDate() - 1);
        end = `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`;
        if (end.includes('NaN')) {
          this.newYearEnd = null;
        } else {
          this.newYearEnd = end;
        }
      } else {
        this.newYearEnd = null;
      }
    },
    /**
     * Close Company books for the current financial year. This function takes the user selected dates
     * and makes api request to perform close books
     */
    closeBooks() {
      this.isLoading = true;
      axios
        .get(`/closebooks?financialend=${this.details.yearend}`)
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast(
                  'Books have been closed successfully for this financial year.',
                  {
                    title: 'Success',
                    variant: 'success',
                    solid: true,
                  }
                );
                this.getDetails();
                this.isLoading = false;
                break;
              case 1:
                break;
            }
          }
        })
        .catch((e) => {
          this.isLoading = false;
          this.$bvToast.toast(
            e.message +
              '. An error was encountered while closing books. Please Retry',
            {
              title: 'Close Books Error',
              variant: 'danger',
              solid: true,
            }
          );
        });
    },
    /**
     * Roll Over The company to new financial year. This function takes user selected date range &
     * makes api request to roll over the company to new financial year
     */
    rollOver() {
      this.isLoading = true;
      axios
        .get(
          `/rollover?financialend=${this.newYearEnd}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                {
                  this.$bvToast.toast(
                    this.$gettext(
                      'Roll Over to new financial year has been successful'
                    ),
                    {
                      title: this.$gettext('Success'),
                      variant: 'success',
                      solid: true,
                    }
                  );
                  let data = r.data.gkresult;
                  this.orgLogin({
                    code: data.neworgcode,
                    ystart: data.yearstart,
                    yend: data.yearend,
                  });
                }
                break;
              case 1:
                this.$bvToast.toast(this.$gettext('Duplicate Financial Year'), {
                  title: this.$gettext('Data Error'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 2:
                this.$bvToast.toast(this.$gettext('Please login to access'), {
                  title: this.$gettext('Unauthorised Access'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 3:
                this.$bvToast.toast(this.$gettext('Invalid Data'), {
                  title: this.$gettext('Data Error'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast(
                  this.$gettext(
                    'You do not have the access to perform this task. Please contact the admin '
                  ),
                  {
                    title: this.$gettext('Privilige Error'),
                    variant: 'danger',
                    solid: true,
                  }
                );
                break;
              case 5:
                this.$bvToast.toast(
                  this.$gettext('You are not allowed to perform this action'),
                  {
                    title: this.$gettext('Action Disallowed'),
                    variant: 'danger',
                    solid: true,
                  }
                );
                break;
            }
          }
          this.isLoading = false;
        })
        .catch((e) => {
          this.isLoading = false;
          this.$bvToast.toast(e.message + ' Please Retry', {
            title: 'Role Over Error',
            variant: 'danger',
            solid: true,
          });
        });
    },
    orgLogin(yearData) {
      if (!yearData) {
        this.logOut();
      }
      console.log(yearData);
      // const userAuthToken = localStorage.getItem('userAuthToken');
      let selectedYear = yearData;
      let payload = {
        orgcode: selectedYear.code,
      };
      // TODO: here instead of sending the username and password, send the new user auth token
      axios
        .post(`/login/org`, payload)
        .then((resp) => {
          switch (resp.data.gkstatus) {
            case 0:
              {
                // debugger;
                axios.defaults.baseURL = this.gkCoreUrl;
                axios.defaults.headers = { gktoken: resp.data.token };
                let finYears = this.finYears;
                let ystart = selectedYear.ystart
                    .split('-')
                    .reverse()
                    .join('-'),
                  yend = selectedYear.yend
                    .split('-')
                    .reverse()
                    .join('-');
                finYears.unshift({
                  code: selectedYear.code,
                  index: finYears.length,
                  label: `${ystart} - ${yend}`,
                  yend, // dd-mm-yyyy
                  ystart, // dd-mm-yyyy
                });

                // localStorage.setItem('orgCodeChoice', selectedYear.code);

                // Initiate vuex store
                this.$store.dispatch('setSessionStates', {
                  auth: true,
                  orgCode: selectedYear.code,
                  authToken: resp.data.token,
                  orgYears: {
                    yearStart: selectedYear.ystart, // yyyy-mm-dd
                    yearEnd: selectedYear.yend, // yyyy-mm-dd
                  },
                  finYears,
                });

                Promise.all([
                  this.$store.dispatch('initLocalStates'), // initialises vuex, org image and org address
                  this.$store.dispatch('global/initGlobalConfig'), // initialises global config
                  this.$store.dispatch('initGstin'), // initialises org GSTIN
                ]).then(() => {
                  this.$store
                    .dispatch('global/initGlobalState', {
                      lang: this.$language,
                    })
                    .then(() => {
                      // debugger;
                      // redirect to workflow on login
                      this.$router
                        .push('/workflow/Transactions-Invoice/-1')
                        .then(() => {
                          window.location.reload();
                        });
                    });
                });
              }
              break;
            default:
              this.logOut();
          }
        })
        .catch(() => {
          this.logOut();
        });
    },
  },
  mounted() {
    this.getDetails();
  },
};
</script>
