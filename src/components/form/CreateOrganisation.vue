<!--
  ToDo:
  * Add validation for the fields (Password, Date)
  * Check accessibility
-->
<template>
  <div class="align-form-label-right">
    <div
      v-if="showMenu"
      class="card shadow"
      :style="{'min-width': '350px'}"
    >
      <div class="card-header bg-dark text-light">
        <translate> Create Organisation </translate>
      </div>
      <div class="card-body px-2 px-sm-4">
        <b-form @submit.prevent="onSubmit">
          <b-form-group
            label-size="md"
            id="input-group-1"
            label="Name"
            label-for="input-1"
            label-cols="3"
            label-class="required"
            :state="orgNameValidity"
            :invalid-feedback="orgNameFeedback"
          >
            <template #label>
              <translate> Name </translate>
            </template>
            <b-form-input
              size="md"
              id="input-1"
              type="text"
              placeholder="Organisation Name"
              v-model.trim="orgName"
              required
              debounce="500"
              @update="checkOrgName"
              :state="orgNameValidity"
            />
          </b-form-group>
          <b-form-group
            label-size="md"
            id="input-group-12"
            label="Country"
            label-for="select-1"
            label-cols="3"
            label-class="required"
          >
            <template #label>
              <translate>Country</translate>
            </template>
            <v-select
              :options="options.countries"
              v-model="orgCountry"
              id="select-1"
              :required="true"
            />
          </b-form-group>
          <!-- state -->
          <b-form-group
            v-if="orgCountry === 'India'"
            label-size="md"
            id="input-group-12"
            label="State"
            label-for="select-1"
            label-cols="3"
          >
            <template #label>
              <translate> State </translate>
            </template>
            <v-select
              :options="states"
              v-model="orgState"
              id="select-1"
            />
          </b-form-group>
          <!-- address -->
          <!-- <b-form-group
            label-size="md"
            id="input-group-11"
            label="Address"
            label-for="input-11"
            label-cols="3"
          >
            <template #label>
              <translate> Address </translate>
            </template>
            <b-form-input
              size="md"
              id="input-11"
              type="text"
              placeholder="Address"
              v-model.trim="orgAddr"
            >
            </b-form-input>
          </b-form-group> -->
          <b-form-group
            label-size="md"
            label="Type"
            label-cols="3"
            label-class="required"
          >
            <template #label>
              <translate> Type </translate>
            </template>
            <b-form-radio-group
              size="md"
              id="btn-radios-1"
              v-model="orgType"
              :options="options.orgType"
              button-variant="outline-dark"
              name="radios-btn-outline"
              buttons
            />
          </b-form-group>
          <b-form-group
            id="input-group-2"
            label="Financial Year"
            label-size="md"
            label-class="mb-2 required"
            class="mb-0 mt-4"
            label-cols="3"
          >
            <template #label>
              <translate> Financial Year </translate>
            </template>
            <div class="row">
              <div class="col-sm-6 pr-sm-1">
                <b-form-group
                  label-size="md"
                  id="input-group-3"
                  label="From"
                  label-for="date-1"
                  label-class="label-on-input"
                >
                  <template #label>
                    <translate> From </translate>
                  </template>
                  <b-input-group class="mb-3">
                    <gk-date
                      @input="setYearEnd"
                      v-model="yearStart"
                      id="yst"
                    />
                  </b-input-group>
                </b-form-group>
              </div>
              <div class="col-sm-6 pl-sm-1">
                <b-form-group
                  label-size="md"
                  id="input-group-4"
                  label="To"
                  label-for="date-2"
                  label-class="label-on-input"
                >
                  <template #label>
                    <translate> To </translate>
                  </template>
                  <b-input-group class="mb-3">
                    <gk-date
                      v-model="yearEnd"
                      id="ynd"
                    />
                  </b-input-group>
                </b-form-group>
              </div>
            </div>
          </b-form-group>
          <!-- <hr /> -->
          <div class="float-right">
            <!-- <b-button
              size="sm"
              class="mr-2"
              variant="danger"
              @click="$router.go(-1)"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle mr-1"
                icon="arrow-left"
              ></b-icon>
              <span class="align-middle"> <translate>Back</translate></span>
            </b-button> -->
            <b-button
              size="sm"
              type="submit"
              class="mr-2"
              variant="success"
            >
              <b-spinner
                v-if="isLoading"
                small
              />
              <b-icon
                v-else
                aria-hidden="true"
                class="align-middle mr-1"
                icon="plus-square"
              />
              <span class="align-middle">
                <translate>Create &amp; Login</translate>
              </span>
            </b-button>
          </div>
          <div class="clearfix" />
        </b-form>
      </div>
    </div>
    <b-alert
      class="mt-5"
      :show="!showMenu"
      variant="danger"
    >
      <b-icon icon="exclamation-triangle" />
      <translate> Registrations are disabled on this server </translate>
    </b-alert>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { passwordStrength } from 'check-password-strength';
import countries from '@/js/countries';
import GkDate from '@/components/GkDate.vue';
import { STATUS_CODES } from '@/js/enum.js';

export default {
  name: 'CreateOrganisation',
  components: { GkDate },
  props: {
    onSave: {
      type: Function,
      required: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      // gkCoreUrl: 'https://satheerthan.site:6543', // 'http://localhost:6543',
      isLoading: false,
      options: {
        countries,
        orgType: [
          { text: 'Profit Making', value: 0 },
          { text: 'Not For Profit', value: 1 },
        ],
        pwdFieldTypes: ['lowercase', 'uppercase', 'symbol', 'number'],
      },
      orgName: '',
      orgType: 0,
      orgCountry: '',
      orgState: '',
      orgAddr: '',
      yearStart: null,
      yearEnd: null,
      userName: '',
      userPassword: '',
      confirmPassword: '',
      securityAnswer: '',
      securityQuestion: '',
      showMenu: true,
      valid: {
        nameFormat: null,
        nameUnique: null,
      },
      orgNameRegEx: null,
      states: [],
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl']),
    pwdStrength: (self) =>
      self.userPassword !== '' && self.userPassword !== null
        ? passwordStrength(self.userPassword)
        : { value: 'Empty' },
    isPasswordValid: (self) =>
      self.pwdStrength.value === 'Empty'
        ? null
        : self.pwdStrength.value === 'Strong',
    arePasswordsSame() {
      if (this.confirmPassword !== '') {
        return this.userPassword === this.hashedPassword(this.confirmPassword)
          ? true
          : false;
      }
      return null;
    },
    orgNameValidity: (self) => {
      if (self.valid.nameFormat === null && self.valid.nameUnique === null) {
        return null;
      }

      return self.valid.nameFormat && self.valid.nameUnique;
    },
    orgNameFeedback: (self) => {
      let feedback = '';
      if (!self.valid.nameFormat && self.valid.nameFormat !== null) {
        if (self.orgName.length < 6 || self.orgName.length > 20) {
          feedback =
            'Orgname must be minimum 6 characters and maximum 20 characters long';
        } else {
          feedback =
            'Orgname can only be alphanumeric with spaces, _ and . symbols.';
        }
      }
      if (!self.valid.nameUnique && self.valid.nameUnique !== null) {
        feedback += 'Orgname provided has been taken, please try another name';
      }
      return feedback;
    },
  },
  watch: {
    orgCountry(country) {
      if (country !== 'India') {
        this.orgState = '';
      }
    },
  },
  methods: {
    checkOrgName(query) {
      if (!query) {
        this.valid.nameFormat = null;
        this.valid.nameUnique = null;
        return;
      }
      if (!this.orgNameRegEx.test(query)) {
        this.valid.nameFormat = false;
        return;
      }
      this.valid.nameFormat = true;
      const self = this;
      axios.get(`/organisation/check/${query}`).then((resp) => {
        if (query === self.orgName) {
          if (resp.data.gkstatus === STATUS_CODES['Success']) {
            self.valid.nameUnique = true;
          } else {
            self.valid.nameUnique = false;
          }
        }
      });
    },
    checkRegistrationStatus() {
      axios.get('/organisation/check_registration').then((r) => {
        if (r.status === 200 && r.data.gkstatus == 5) {
          this.showMenu = false;
        }
      });
    },
    setYearEnd() {
      // console.log('On date change')
      if (this.yearStart !== null && this.yearStart) {
        const ONE_DAY = 86400000;
        let startDate = new Date(this.yearStart.split('-').join('/'));
        let endYear = startDate.getFullYear() + 1;
        let endDate = '';
        if (endYear % 4 === 0) {
          endDate = new Date(startDate.getTime() + ONE_DAY * 366);
        } else {
          endDate = new Date(startDate.getTime() + ONE_DAY * 365);
        }
        this.yearEnd = endDate.toISOString().substr(0, 10);
      } else {
        this.yearEnd = null;
      }
    },
    onSubmit() {
      this.isLoading = true;
      const payload = this.initPayload();
      const userAuthToken = sessionStorage.getItem('userAuthToken');
      // Country is mandatory to create org
      if (!this.orgCountry) {
        this.$bvToast.toast(this.$gettext(`Country is required`), {
          title: this.$gettext('Error in creating organisation!'),
          autoHideDelay: 3000,
          variant: 'danger',
          appendToast: true,
          solid: true,
        });
        this.isLoading = false;
        return;
      }
      // Create Organisation
      axios
        .post('/organisation', payload, {
          headers: {
            gktoken: userAuthToken,
            gkusertoken: userAuthToken,
          },
        })
        .then((response) => {
          // console.log(response)
          this.isLoading = false;
          switch (response.data.gkstatus) {
          case 0:
            {
              this.$store
                .dispatch('setSessionStates', {
                  orgCode: response.data.orgcode,
                  authToken: response.data.token,
                })
                .then(() => {
                  let log = {
                    activity: `Organisation created: ${payload.orgdetails.orgname}`,
                  };
                  axios.post('/log', log);
                });
            }
            break;
          case 1:
            this.$bvToast.toast(
              this.$gettext(
                `Duplicate Entry! Please Check the Organisation Name`
              ),
              {
                title: this.$gettext('Create Account Error!'),
                autoHideDelay: 3000,
                variant: 'danger',
                appendToast: true,
                solid: true,
              }
            );
            break;
          default:
            this.$bvToast.toast(
              this.$gettext(`Unable to create account, Please try again`),
              {
                title: this.$gettext('Create Account Error!'),
                autoHideDelay: 3000,
                variant: 'danger',
                appendToast: true,
                solid: true,
              }
            );
          } // end switch
          this.onSave(response.data.gkstatus === 0);
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: this.$gettext('Create Account Error!'),
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        })
        .then(() => {
          this.isLoading = false;
        });
    },
    initPayload() {
      return {
        orgdetails: {
          orgname: this.orgName,
          orgtype: this.options.orgType[this.orgType].text,
          yearstart: this.yearStart.split('-').join('/'),
          yearend: this.yearEnd.split('-').join('/'),
          orgstate: this.orgState,
          orgcity: null,
          orgaddr: this.orgAddr,
          orgpincode: null,
          orgcountry: this.orgCountry,
          orgtelno: null,
          orgfax: null,
          orgwebsite: null,
          orgemail: null,
          orgpan: null,
          orgmvat: null,
          orgstax: null,
          orgregno: null,
          orgregdate: null,
          orgfcrano: null,
          orgfcradate: null,
          invflag: 1,
          invsflag: 1,
          billflag: 1,
          avflag: 1,
          maflag: 0,
          avnoflag: 1,
          ainvnoflag: 1,
          modeflag: null,
        },
      };
    },
    preloadData() {
      this.isPreloading = true;
      axios
        .get('/state')
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            this.states = resp.data.gkresult.map(
              (state) => Object.values(state)[0]
            );
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  mounted() {
    this.preloadData();
    this.checkRegistrationStatus();
    this.yearStart = `${new Date().getFullYear()}-04-01`; // 1st of April, current year. YYYY-MM-DD
    this.orgNameRegEx = new RegExp(
      '^(?=.{6,20}$)(?![_. ])(?!.*[_.]{2})[a-zA-Z0-9._ ]+(?<![_. ])$'
    );
  },
};
</script>
