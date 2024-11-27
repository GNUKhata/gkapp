<template>
  <section class="container-fluid mt-2">
    <b-form @submit.prevent="confirm('update')">
      <!-- {{ details }} -->
      <b-overlay
        :show="loading"
        blur
        no-wrap
      />

      <b-container fluid="xl">
        <b-card-group deck>
          <!-- general Card -->
          <b-card
            header="General"
            header-bg-variant="dark"
            header-text-variant="light"
          >
            <b-img
              rounded
              center
              height="150"
              width="150"
              class="mx-auto m-2 border border-dark"
              :src="orgImg"
            />
            <b-form-group
              :label="$gettext('Image')"
              label-size="sm"
              label-align="right"
              lable-cols="4"
              content-cols="8"
              description="Image size should be less than 1 MB. jpeg & png images are only supported"
            >
              <b-form-file
                @input="prepareImg"
                v-model="details.logo"
                size="sm"
                accept="image/jpeg, image/png"
                placeholder="Choose a file / Drag & drop it here"
                drop-placeholder="Drop file here..."
              />
            </b-form-group>
            <b-form-group
              :label="$gettext('Name')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-input
                v-model="details.orgname"
                size="sm"
                type="text"
                required
              />
            </b-form-group>
            <b-form-group
              :label="$gettext('Website')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-input
                v-model="details.orgwebsite"
                size="sm"
                type="text"
              />
            </b-form-group>
            <b-form-group
              :label="$gettext('Email')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-input
                v-model="details.orgemail"
                size="sm"
                type="email"
              />
            </b-form-group>
          </b-card>
          <!-- Contact Card -->
          <b-card
            :header="$gettext('Contact Details')"
            header-bg-variant="dark"
            header-text-variant="light"
          >
            <b-form-group
              label="Address"
              label-cols="4"
              label-align="right"
            >
              <b-form-input
                v-model="details.orgaddr"
                size="sm"
                type="text"
                required
              />
            </b-form-group>
            <b-form-group
              :label="$gettext('City')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-input
                v-model="details.orgcity"
                size="sm"
                type="text"
              />
            </b-form-group>
            <b-form-group
              :label="$gettext('Country')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <v-select
                v-model="details.orgcountry"
                :options="options.countries"
                id="select-1"
                :required="true"
              />
            </b-form-group>
            <b-form-group
              v-if="isIndia"
              :label="$gettext('State')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-select
                v-model="stateCode"
                size="sm"
                :options="states"
              />
            </b-form-group>
            <b-form-group
              v-if="isIndia"
              :label="$gettext('Postal code')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-input
                v-model="details.orgpincode"
                size="sm"
                type="text"
              />
            </b-form-group>
            <b-form-group
              :label="$gettext('Phone')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-input-group>
                <b-form-input
                  v-model="details.orgtelno"
                  size="sm"
                  type="tel"
                  pattern="^\+?\d{0,13}"
                />
              </b-input-group>
            </b-form-group>
            <b-form-group
              :label="$gettext('Fax')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-input
                v-model="details.orgfax"
                size="sm"
                type="text"
              />
            </b-form-group>
          </b-card>
        </b-card-group>
        <!-- Bank card --->
        <b-card-group
          deck
          class="mt-4"
        >
          <b-card
            :header="$gettext('Bank Details')"
            header-bg-variant="dark"
            header-text-variant="light"
          >
            <b-form-group
              v-if="isIndia"
              :label="$gettext('IFSC Code')"
              label-cols="4"
              label-size="sm"
              label-align="right"
            >
              <gk-ifsc
                size="sm"
                @fill="autoFillIfsc"
                :ifsc-code="bankDetails.ifsc"
              />
            </b-form-group>
            <!-- bank name -->
            <b-form-group
              :label="$gettext('Bank Name')"
              label-cols="4"
              label-size="sm"
              label-align="right"
            >
              <b-form-input
                v-model="bankDetails.bankname"
                size="sm"
                type="text"
              />
            </b-form-group>
            <!-- Branch -->
            <b-form-group
              :label="$gettext('Branch')"
              label-cols="4"
              label-size="sm"
              label-align="right"
            >
              <b-form-input
                v-model="bankDetails.branchname"
                size="sm"
                type="text"
              />
            </b-form-group>
            <!-- account number -->
            <b-form-group
              :label="$gettext('Account Number')"
              label-cols="4"
              label-size="sm"
              label-align="right"
            >
              <b-form-input
                v-model="bankDetails.accountno"
                size="sm"
                type="text"
              />
            </b-form-group>
          </b-card>
          <!-- Tax card-->
          <b-card
            v-if="isIndia"
            :header="$gettext('Tax Details')"
            class="gkcard"
            header-bg-variant="dark"
            header-text-variant="light"
          >
            <b-form-group
              label="Tax Mode"
              label-size="sm"
              label-cols="4"
              label-align="right"
            >
              <b-form-select
                size="sm"
                id="gs-t2-select-20"
                v-model="taxMode"
                :options="globalConfOptions.transaction.taxMode"
              />
            </b-form-group>
            <b-form-group
              v-if="['GST', 'GST & VAT'].includes(taxMode)"
              :label="$gettext('GSTIN')"
              label-size="sm"
              label-cols="4"
              label-align="right"
              label-class="required"
            >
              <gk-gstin
                @validity="onGstinUpdate"
                @gstin_data="onGstinDataFetched"
                :details="details"
                v-model="gstin"
                :show-validation="2"
                val-button-text="Validate & Autofill"
                required
              />
            </b-form-group>
            <b-form-group
              v-if="['VAT', 'GST & VAT'].includes(taxMode)"
              :label="$gettext('TIN')"
              label-size="sm"
              label-cols="4"
              label-align="right"
              label-class="required"
            >
              <b-form-input
                size="sm"
                id="ci-input-13"
                v-model="details.tin"
                required
              />
            </b-form-group>
            <b-form-group
              v-if="taxMode && taxMode !== 'None'"
              :label="$gettext('PAN')"
              label-align="right"
              label-cols="4"
              label-size="sm"
              :state="isPanValid"
              invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
            >
              <b-input-group size="sm">
                <b-form-input
                  v-model="details.orgpan"
                  type="text"
                  :state="isPanValid"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  @change="gstin.pan = details.orgpan"
                  :required="!!details.orgpan"
                />
              </b-input-group>
            </b-form-group>
            <b-form-group
              v-if="['VAT', 'GST & VAT'].includes(taxMode)"
              :label="$gettext('ServiceTax Number')"
              label-size="sm"
              label-align="right"
              label-cols="4"
            >
              <b-form-input
                v-model="details.orgstax"
                size="sm"
                type="text"
              />
            </b-form-group>

            <b-form-group
              v-if="taxMode && taxMode !== 'None'"
              :label="$gettext('CESS')"
              label-size="sm"
              label-cols="4"
              label-align="right"
            >
              <div
                v-for="(value, cessAmount, index) in cess"
                :key="index"
                class="mb-2 d-flex align-items-center justify-content-end justify-content-sm-start"
              >
                <b :style="{width: '25px'}">{{ cessAmount }}</b>
                <b-button
                  class
                  size="sm"
                  variant="danger"
                  @click="deleteCess(cessAmount)"
                >
                  <b-icon
                    font-scale="0.95"
                    icon="trash"
                  />
                </b-button>
              </div>
              <b-button
                v-b-modal.cess
                variant="dark"
                class="p-0 px-1 float-right float-sm-left"
                @click="onCessAdd"
                size="sm"
              >
                <b-icon
                  class="align-middle"
                  icon="plus"
                /><translate>CESS</translate>
              </b-button>
            </b-form-group>
            <!-- {{ details }} -->
          </b-card>
        </b-card-group>
        <!-- Submit & cancel buttons -->
        <div class="mt-2 mb-3 d-flex flex-row-reverse">
          <b-button
            type="submit"
            size="sm"
            class="ml-2"
            variant="success"
          >
            <b-icon
              class="mr-1"
              icon="arrow-up-circle"
            /><translate>Save Changes</translate>
          </b-button>
          <b-button
            variant="danger"
            size="sm"
            @click="confirm('delete')"
          >
            <b-icon
              class="mr-1"
              icon="building"
            /><translate>Delete Organisation</translate>
          </b-button>
        </div>
      </b-container>
    </b-form>
    <!--
      Tax Creation Window
    -->
    <!-- Add GSTIN -->
    <b-modal
      id="gstin"
      centered
      :ok-title="$gettext('Add')"
      header-bg-variant="dark"
      header-text-variant="light"
      ok-variant="success"
      title="Add GSTIN"
      @ok="onGstinModalOk"
    >
      <b-form>
        <b-form-group
          :label="$gettext('State')"
          label-cols="auto"
        >
          <b-form-select
            required
            v-model="gstinModal.stateCode"
            :options="states"
          />
        </b-form-group>
        <b-form-group
          :label="$gettext('GSTIN')"
          label-cols="auto"
        >
          <div class="d-flex">
            <b-form-input
              v-model="gstinModal.stateCode"
              type="text"
              disabled
              style="max-width: 3em"
            />
            <b-form-input
              v-model="details.orgpan"
              type="text"
              class="ml-1 mr-1"
              disabled
            />
            <b-form-input
              type="text"
              title="Format: [Number] [Alphabet] [Number / Alphabet]"
              v-model="gstinModal.checksum"
            />
          </div>
        </b-form-group>
      </b-form>

      <template #modal-footer="{ok, cancel}">
        <b-button
          size="sm"
          variant="danger"
          @click="cancel"
        >
          <translate>Cancel</translate>
        </b-button>
        <b-button
          size="sm"
          variant="success"
          @click="ok"
          :disabled="!isGstinValid"
        >
          {{ gstinModal.mode === 'create' ? 'Add' : 'Update' }}
        </b-button>
      </template>
    </b-modal>
    <!-- Add CESS -->
    <b-modal
      id="cess"
      centered
      header-bg-variant="dark"
      header-text-variant="light"
      :ok-title="$gettext('Add')"
      ok-variant="success"
      :title="$gettext('Add CESS')"
      @ok="onCessModalOk"
    >
      <b-form>
        <b-form-group
          :label="$gettext('CESS')"
          label-cols="4"
          label-align="right"
        >
          <b-input-group append="%">
            <b-form-input
              v-model="cessModal.rate"
              style="max-width: 5em"
              type="number"
              step="0.01"
              min="0"
            />
          </b-input-group>
        </b-form-group>
      </b-form>

      <template #modal-footer="{ok, cancel}">
        <b-button
          size="sm"
          variant="danger"
          @click="cancel"
        >
          <translate>Cancel</translate>
        </b-button>
        <b-button
          size="sm"
          variant="success"
          @click="ok"
          :disabled="!(cessModal.rate > 0)"
        >
          {{ cessModal.mode === 'create' ? 'Add' : 'Update' }}
        </b-button>
      </template>
    </b-modal>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import axios from 'axios';
import countries from '@/js/countries';
import GkIfsc from '../components/GkIfsc.vue';
import GkGstin from '@/components/GkGstin.vue';

export default {
  components: { GkIfsc, GkGstin },
  name: 'OrgProfile',
  data() {
    return {
      loading: true,
      details: Array,
      states: [],
      gstin: '',
      cess: {},
      bankDetails: {
        bankname: '',
        accountno: '',
        branchname: '',
        ifsc: '',
      },
      newGstin: {
        stateCode: null,
        checksum: '',
      },
      stateCode: '',
      regex: {
        checksum: new RegExp('[0-9]{1}[A-Z]{1}[0-9A-Z]{1}'),
        pan: new RegExp('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
      },
      cessModal: {
        rate: 0,
        mode: 'create',
        inEdit: null,
        toBeEdited: {},
        toBeDeleted: {},
      },
      gstinValid: false,
      gstinModal: {
        stateCode: null,
        checksum: '',
        mode: 'create',
        inEdit: {
          stateCode: null,
          checksum: '',
        },
        edited: {}, // edited: {edit: source}
      },
      options: {
        countries,
        gstAccounts: [],
      },
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'orgImg', 'orgGstin']),
    ...mapGetters('global', {
      globalConf: 'getGlobalConfig',
      globalConfOptions: 'getGlobalConfigOptions',
    }),
    taxMode: {
      get() {
        return this.globalConf?.transaction?.default?.tax;
      },
      set(newTaxMode) {
        const conf = { ...this.globalConf };
        conf.transaction.default.tax = newTaxMode;
        this.$store.commit('global/setGlobalConfig', { conf });
      },
    },
    isIndia: function() {
      const { orgcountry } = this.details;
      // Return true even if country field is empty, for backwards compatibility
      return (!orgcountry || orgcountry === 'India');
    },
    isGstinValid: function() {
      if (
        this.gstinModal.stateCode !== null &&
        this.regex.pan.test(this.details.orgpan) &&
        this.regex.checksum.test(this.gstinModal.checksum)
      ) {
        return true;
      }
      return false;
    },
    isPanValid: (self) =>
      self.details.orgpan ? self.regex.pan.test(self.details.orgpan) : null,
  },
  methods: {
    autoFillIfsc(i) {
      this.bankDetails.bankname = i.BANK;
      this.bankDetails.branchname = i.BRANCH;
      this.bankDetails.ifsc = i.IFSC;
    },
    /**GSTIN methods start*/
    onGstinDataFetched({ addr, name, pincode, pan }) {
      this.details.orgaddr = addr;
      this.details.orgname = name;
      this.details.orgpincode = pincode;
      this.details.orgpan = pan;
    },
    onGstinUpdate({ validity, stateCode, pan }) {
      if (validity.format) {
        this.gstinValid = true;
        this.stateCode = stateCode;
        this.details.orgpan = pan;
      } else {
        this.gstinValid = false;
        if (!this.gstin) {
          this.stateCode = '';
          this.details.orgpan = '';
          this.gstin = '';
        }
      }
    },
    /**GSTIN methods end */

    /**
     * Confirmation for actions
     */
    confirm(type) {
      this.$bvModal
        .msgBoxConfirm(
          `Confirm ${type} company ? ${
            type == 'delete'
              ? 'This action is Irreversable. We recommend to backup company data before deleting'
              : ''
          }`,
          {
            centered: true,
            size: 'md',
            okVariant: 'danger',
            headerBgVariant: 'danger',
            headerTextVariant: 'light',
          }
        )
        .then((val) => {
          if (val === true) {
            if (type === 'update') {
              this.updateOrg();
            } else {
              this.deleteOrg();
            }
          }
        });
    },
    /**
     * Fetch org details from api
     */
    getDetails() {
      const self = this;
      this.loading = true;
      return axios
        .get(`/organisation`)
        .then((res) => {
          this.loading = false;
          switch (res.data.gkstatus) {
          case 0:
            {
              self.details = res.data.gkdata;
              if (self.details.gstin) {
                let stateName = self.details.orgstate;
                if (stateName) {
                  let state = self.states.find(
                    (item) => item.text === stateName
                  );
                  if (state) {
                    let stateCode = parseInt(state.value);
                    self.gstin = self.details.gstin[stateCode];
                    // sometimes statecodes less that 10 have a 0 prefixed and sometimes not. This is caused because of an inconsistency between modules
                    if (!self.gstin && stateCode < 10) {
                      self.gstin = self.details.gstin[`0${stateCode}`];
                    }
                  }
                } else {
                  // if state doesn't exist, but gstin is there
                  let stateCodes = Object.keys(self.details.gstin);
                  self.stateCode = stateCodes[0];
                  self.gstin = self.details.gstin[self.stateCode];
                }
              }
              if (self.details.bankdetails) {
                Object.assign(self.bankDetails, self.details.bankdetails);
              }
            }
            break;
          case 2:
            alert('Access Denied');
          }
        })
        .catch((e) => {
          alert(e);
          this.loading = false;
        });
    },
    /** Get GST accounts and update the CESS fields */
    getCessDetails() {
      axios
        .get('/organisation/gst_accounts')
        .then((res) => {
          if (res.data.gkstatus === 0) {
            let cess = {};
            let rate;
            this.options.gstAccounts = res.data.accounts;
            res.data.accounts.forEach((account) => {
              if (account.includes('CESSIN_') || account.includes('CESSOUT_')) {
                rate = account.split('@')[1].split('%')[0]; // CESS rate
                cess[rate] = true;
              }
            });
            Object.assign(this.cess, cess);
            this.$forceUpdate();
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        });
    },
    /** Gets all the meta data required from the server for creating CESS accounts */
    getCreateCessData() {
      return axios.get('/organisation/gst_accounts/codes').then((resp) => {
        if (resp.data.gkstatus === 0) {
          let groupCode = resp.data.groupcode,
              subGroupCode = resp.data.subgroupcode;
          let stateCodes = Object.keys(this.gstin);

          return this.getStateAbbreviations(stateCodes)
            .then((taxStates) => {
              if (subGroupCode === 'New') {
                return axios
                  .post('/groupsubgroups', {
                    groupname: 'Duties & Taxes',
                    subgroupof: groupCode,
                  })
                  .then((res2) => {
                    let data = JSON.parse(res2.data);
                    if (data.gkstatus === 0) {
                      return {
                        taxStates,
                        groupcode: data.gkresult,
                      };
                    } else {
                      return false;
                    }
                  })
                  .catch(() => false);
              }
              return {
                taxStates,
                groupcode: subGroupCode === 'None' ? groupCode : subGroupCode,
              };
            })
            .catch(() => false);
        }
      });
    },
    /**Create / Update the CESS accounts, based on the CESS rates and the states in GSTIN list */
    updateCessAccounts() {
      let cess = Object.keys(this.cess);
      let saveAccount = function(payload) {
        return axios.post('/accounts', payload);
      };

      let self = this;
      return this.getCreateCessData().then((meta) => {
        if (!meta) {
          return;
        }
        let acc = {
          accountname: '',
          groupcode: meta.groupcode,
          openingbal: '0.00',
          sysaccount: 1,
        };
        let createCalls = [];
        let createdAccs = [];
        cess.forEach((rate) => {
          meta.taxStates.forEach((taxState) => {
            acc.accountname = `CESSIN_${taxState}@${rate}%`;
            if (self.options.gstAccounts.indexOf(acc.accountname) < 0) {
              createCalls.push(saveAccount(acc));
              createdAccs.push(acc.accountname);
            } else {
              // call edit
            }
            acc.accountname = `CESSOUT_${taxState}@${rate}%`;
            if (self.options.gstAccounts.indexOf(acc.accountname) < 0) {
              createCalls.push(saveAccount(acc));
              createdAccs.push(acc.accountname);
            } else {
              // call edit
            }
          });
        });
        Promise.all(createCalls).then((results) => {
          let accs = '';
          results.forEach((res, i) => {
            if (res.data.gkstatus === 0) {
              accs += `${createdAccs[i]} `;
            }
          });
          if (accs) {
            this.$bvToast.toast(`${accs} accounts were successfully created`, {
              title: 'CESS accounts created successfully',
              variant: 'success',
              solid: true,
            });
          }
        });
        return this.deleteCessAccounts();
      });
    },
    /** Get the state abbraviations of the given statecodes.
     *
     * params: stateCodes -> array of state codes */
    getStateAbbreviations(stateCodes) {
      let requests = [];
      stateCodes.forEach((code) => {
        requests.push(axios.get(`/state?abbreviation&statecode=${code}`));
      });
      return Promise.all(requests).then((res) => {
        return res
          .filter((r1) => r1.data.gkstatus === 0)
          .map((r2) => r2.data.abbreviation);
      });
    },
    /** returns the account codes for CESS accounts that are no longer required.
     *
     * The CESS accounts with states other than the GSTIN states, CESS accounts with edited or deleted rates
     * are no longer required.
     */
    getDeleteCessData() {
      let cess = Object.keys(this.cessModal.toBeDeleted);
      let states = this.options.gstAccounts
        .filter((acc) => {
          let rate =
            acc.indexOf('@') >= 0 ? acc.split('@')[1].split('%')[0] : ''; // CESS rate
          return cess.indexOf(rate) >= 0;
        })
        .map(
          (acc) =>
            acc.indexOf('CESSIN') >= 0
              ? acc.split('@')[0].split('CESSIN_')[1]
              : acc.split('@')[0].split('CESSOUT_')[1]
        );

      // if gstin state is edited, delete that state associated with all the cess values
      let gstinEditedStates = Object.values(this.gstinModal.edited);
      return this.getStateAbbreviations(gstinEditedStates).then(
        (editedStates) => {
          if (editedStates.length) states.push(...editedStates);
          if (gstinEditedStates.length) cess = Object.keys(this.cess);

          let temp = {};
          states.forEach((state) => {
            temp[state] = true;
          });
          states = Object.keys(temp);
          let toDelete = [];
          let accounts = [];
          cess.forEach((rate) => {
            states.forEach((taxState) => {
              if (
                this.options.gstAccounts.indexOf(`CESSIN_${taxState}@${rate}%`)
              ) {
                toDelete.push(
                  axios.get(
                    `/accounts?type=getAccCode&accountname=CESSIN_${taxState}@${rate}%`
                  )
                );
                accounts.push(`CESSIN_${taxState}@${rate}%`);
              }
              if (
                this.options.gstAccounts.indexOf(`CESSOUT_${taxState}@${rate}%`)
              ) {
                toDelete.push(
                  axios.get(
                    `/accounts?type=getAccCode&accountname=CESSOUT_${taxState}@${rate}%`
                  )
                );
                accounts.push(`CESSOUT_${taxState}@${rate}%`);
              }
            });
          });

          return Promise.all(toDelete).then((accCodes) => {
            let codes = accCodes.map((accCode) => accCode.data.accountcode);
            return { codes, accounts };
          });
        }
      );
    },
    /** Deletes the CESS accounts that have become absolete because of the updates made recently in orgprofile */
    deleteCessAccounts() {
      this.getDeleteCessData().then((data) => {
        let accCodes = data.codes,
            accounts = data.accounts;
        let deletedCess = '',
            failedCess = '',
            error = '';
        let deleteCalls = accCodes.map((accCode) => {
          return axios.delete(`/accounts`, {
            data: { accountcode: accCode },
          });
        });
        return Promise.all(deleteCalls).then((delAccounts) => {
          delAccounts.forEach((delAccount, i) => {
            switch (delAccount.data.gkstatus) {
            case 0:
              deletedCess += `${accounts[i]} `;
              break;
            case 2:
              error = 'Unauthorized Access, Please contact Admin.';
              break;
            case 3:
              error = 'Internal Server Error, Please contact Admin.';
              break;
            case 4:
              error = 'Bad Privilege, Only Admin can delete CESS accounts.';
              break;
            case 5:
              failedCess += `${accounts[i]}`;
              break;
            }
          });
          if (deletedCess) {
            this.$bvToast.toast(
              `${deletedCess} accounts were successfully deleted`,
              {
                title: 'CESS accounts deleted successfully',
                variant: 'success',
                solid: true,
              }
            );
          }
          if (failedCess) {
            this.$bvToast.toast(
              `${failedCess} accounts were not deleted to avoid integrity issues.`,
              {
                title: 'CESS accounts delete failure',
                variant: 'warning',
                solid: true,
              }
            );
          }
          if (!(deletedCess || failedCess) && error) {
            this.$bvToast.toast(error, {
              title: 'CESS accounts delete failure',
              variant: 'danger',
              solid: true,
            });
          }
        });
      });
    },
    /** Deletes all the CESS accounts that have states other than those in the GSTIN.
     *
     * Currently used only for dev purpose and data cleanup during dev.
     */
    deleteNonGstCess() {
      let gstStates = Object.keys(this.gstin);
      this.getStateAbbreviations(gstStates).then((states) => {
        let toDelete = this.options.gstAccounts.filter((acc) => {
          if (acc.indexOf('CESSIN_') >= 0 || acc.indexOf('CESSOUT_') >= 0) {
            let state =
              acc.indexOf('CESSIN') >= 0
                ? acc.split('@')[0].split('CESSIN_')[1]
                : acc.split('@')[0].split('CESSOUT_')[1];
            if (states.indexOf(state) < 0) {
              return true;
            }
          }
          return false;
        });
        let codeRequests = toDelete.map((acc) =>
          axios.get(`/accounts?type=getAccCode&accountname=${acc}`)
        );
        Promise.all(codeRequests).then((accCodes) => {
          let codes = accCodes.map((accCode) => accCode.data.accountcode);
          codes.map((accCode) => {
            return axios.delete(`/accounts`, {
              data: { accountcode: accCode },
            });
          });
        });
      });
    },

    prepareImg() {
      const imageSize = (this.details.logo.size / 1000000).toFixed(2);
      // if img size is less than 1 MB just convert it to base64 string. Else compress it
      if (imageSize <= 1) {
        this.get_base64(this.details.logo).then((r) => {
          this.details.logo = r.split(',')[1];
          this.$store.commit(
            'updateOrgImg',
            'data:image/jpg;base64,' + this.details.logo
          );
        });
      } else {
        this.$bvModal.msgBoxOk('Please use a image with size less than 1MB', {
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          headerClass: 'p-2 border-bottom-0',
          footerClass: 'p-2 border-top-0',
          centered: true,
        });
        delete this.details.logo;
      }
    },
    /**
     * Update organisation details
     */
    updateOrg() {
      this.loading = true;
      delete this.details.statelist;

      // update tax mode
      this.$store
        .dispatch('global/updateGlobalConfig', this.globalConf)
        .then((resp) => {
          if (resp.gkstatus === 0) {
            this.$store.dispatch('global/initGlobalConfig', {
              lang: this.$language,
            });
          } else {
            this.displayToast(
              this.$gettext(`Error`),
              this.$gettext('Failed to update tax mode'),
              'failure'
            );
          }
        });

      // update state
      let state = this.states.find((state) => state.value === this.stateCode);
      state = state ? state.text : null;


      // Clear tax related fields when country is not India or tax mode is none
      if (!this.isIndia || this.taxMode === 'None' || !this.taxMode) {
        this.gstin = null;
        this.details.tin = null;
        this.details.orgpan = null;
        this.details.orgstax = null;
        this.cess = {};
      }

      if (this.isIndia) {
        if (this.taxMode === 'VAT') {
          this.gstin = null;
        }
        if (this.taxMode === 'GST') {
          this.details.tin = null;
        }
      } else {
        this.stateCode = '';
        this.details.orgpincode = null;
        this.bankDetails.ifsc = null;
      }

      let gstin = {};
      if (this.stateCode && this.gstin) {
        if (this.gstinValid) {
          gstin[this.stateCode] = this.gstin;
        }
      }

      Object.assign(this.details, {
        orgstate: state ?? '',
        gstin: gstin,
        tin: this.details.tin,
        bankdetails: this.bankDetails,
      });

      axios
        .put(`/organisation`, this.details)
        .then((res) => {
          switch (res.data.gkstatus) {
          case 0:
            this.loading = false;
            this.updateCessAccounts().then(() => {
              this.init();
            });
            this.$bvToast.toast(
              `${this.details.orgname} Profile Details Updated`,
              {
                title: 'Success',
                variant: 'success',
                solid: true,
              }
            );
            this.$store.dispatch('initOrgAddress');
            this.$store.dispatch('initOrgImg');
            if (!this.orgGstin) {
              this.$store.dispatch('initGstin');
            }
            this.$store.commit('global/setOrgDetails', this.details);
            break;
          case 1:
            this.loading = false;
            this.$bvToast.toast(
              `Organisation ${this.details.orgname} already exists`,
              {
                title: 'Duplicate Entry',
                variant: 'danger',
                solid: true,
              }
            );
            break;
          case 2:
            this.loading = false;
            this.$bvToast.toast('Unauthorised Access', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 4:
            this.loading = false;
            this.$bvToast.toast(
              'You are not authorised to delete the Organisation Details. Please contact the admin',
              {
                variant: 'danger',
                solid: true,
              }
            );
            break;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    /**
     * Delete organisation
     */
    deleteOrg() {
      this.loading = true;

      axios
        .delete(`/organisation`)
        .then((r) => {
          if (r.status == '200' && r.data.gkstatus == 0) {
            this.$bvToast.toast(`${this.details.orgname} Deleted`, {
              title: 'Success',
              variant: 'success',
              solid: true,
            });
            this.loading = false;
            this.logOut();
          } else {
            this.$bvToast.toast(r.status, {
              title: 'Error',
              variant: 'danger',
              solid: true,
            });
            this.loading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    /** Add an extra GSTIN to the list */
    addGstin() {
      if (
        this.gstinModal.stateCode !== null &&
        this.gstinModal.checksum !== ''
      ) {
        this.gstin[
          this.gstinModal.stateCode
        ] = `${this.gstinModal.stateCode}${this.details.orgpan}${this.gstinModal.checksum}`;
        this.$forceUpdate();
      }
    },
    /** Add an extra CESS to the list */
    addCess() {
      if (this.cessModal.rate > 0) {
        let rate = parseFloat(parseFloat(this.cessModal.rate).toFixed(2));
        this.cess[rate] = true;
        this.$forceUpdate();
      }
    },
    /** Delete a GSTIN from the list */
    deleteGstin(stateCode) {
      if (this.gstin[stateCode]) {
        delete this.gstin[stateCode];
        this.$forceUpdate();
      }
    },
    /** Delete a CESS from the list */
    deleteCess(rate) {
      if (this.cess[rate]) {
        this.cessModal.toBeDeleted[rate] = true;
        delete this.cess[rate];
        this.$forceUpdate();
      }
    },
    getStates() {
      return axios
        .get(`/state`)
        .then((res) => {
          this.states = res.data.gkresult.map((val) => {
            let obj = {};
            obj.value = Object.keys(val)[0];
            obj.text = Object.values(val)[0];
            if (parseInt(obj.value) < 10) {
              obj.value = '0' + obj.value;
            }
            return obj;
          });
        })
        .catch((e) => {
          console.error('Failed to get states', e.message);
        });
    },
    /** The ADD/Update BUtton callback for the GSTIN modal */
    onGstinModalOk() {
      if (this.gstinModal.mode === 'create') {
        this.addGstin();
      } else {
        // edit gstin
        let state = this.gstinModal.inEdit.stateCode,
            state_new = this.gstinModal.stateCode,
            checksum = this.gstinModal.inEdit.checksum,
            checksum_new = this.gstinModal.checksum;
        if (state != state_new || checksum != checksum_new) {
          // if gstin was already edited, then the state code will be present as a key in the gstinModal.edited object
          if (this.gstinModal.edited[state]) {
            this.gstinModal.edited[state_new] = this.gstinModal.edited[state];
            delete this.gstinModal.edited[state];
          } else {
            this.gstinModal.edited[state_new] = state;
          }
          delete this.gstin[state];
          this.addGstin();
        }
      }
    },
    /** Initialize the GSTIN modal after clicking the Add GSTIN button */
    onGstinAdd() {
      this.gstinModal.mode = 'create';
      this.gstinModal.stateCode = null;
      this.gstinModal.checksum = '';
      this.gstinModal.inEdit = {
        stateCode: null,
        checksum: '',
      };
    },
    /** Initialize the GSTIN modal after clicking the Edit GSTIN button */
    onGstinEdit(gstin) {
      let stateCode = gstin.substr(0, 2);
      let checksum = gstin.substr(12, 3);
      this.gstinModal.mode = 'edit';
      this.gstinModal.stateCode = stateCode;
      this.gstinModal.checksum = checksum;
      this.gstinModal.inEdit = {
        stateCode: stateCode,
        checksum: checksum,
      };
    },
    /** Callback for the Add/Update button in the CESS modal*/
    onCessModalOk() {
      // CESS rate accounts can't be edited, they can only be deleted if not used in any transactions
      if (this.cessModal.mode === 'create') {
        this.addCess();
      }
    },
    /** Initialize the CESS modal after clicking the Add CESS button */
    onCessAdd() {
      this.cessModal.mode = 'create';
      this.cessModal.rate = 0;
      this.cessModal.inEdit = null;
    },
    init() {
      this.cessModal = {
        rate: 0,
        mode: 'create',
        inEdit: null,
        toBeEdited: {},
        toBeDeleted: {},
      };
      this.gstinModal = {
        stateCode: null,
        checksum: '',
        mode: 'create',
        inEdit: {
          stateCode: null,
          checksum: '',
        },
        edited: {}, // edited: {edit: source}
      };
      return this.getStates().then(() => {
        return Promise.all([this.getDetails(), this.getCessDetails()]);
      });
    },
  },
  mounted() {
    this.init().then(() => {
      if (this.details.orgstate && this.states.length) {
        let state = this.states.find(
          (state) => state.text === this.details.orgstate
        );
        if (state) {
          this.stateCode = state.value;
        }
      }
    });
  },
};
</script>
