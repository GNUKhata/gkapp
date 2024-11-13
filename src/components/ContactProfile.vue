<template>
  <b-form
    id="contactinfo"
    @submit.prevent="updateContact"
    class="align-form-label-right"
  >
    <!-- Action Buttons -->
    <div class="pt-2 pb-3 d-flex flex-row-reverse">
      <b-button
        @click.prevent="deleteContact"
        size="sm"
        class="ml-2"
        variant="danger"
      >
        <b-icon
          class="mr-1"
          icon="person-dash"
        />
        <translate>Delete Contact</translate>
      </b-button>
      <b-button
        type="submit"
        size="sm"
        class="ml-2"
        variant="success"
      >
        <b-icon
          class="mr-1"
          icon="cloud-arrow-up"
        />
        <translate>Save Changes</translate>
      </b-button>
      <b-button
        to="/invoice"
        size="sm"
        class="ml-2"
        variant="dark"
      >
        <b-icon
          class="mr-1"
          icon="receipt"
        />
        <translate>Add Transaction</translate>
      </b-button>
      <b-button
        :to="{
          name: 'Create_Voucher',
          params: {
            type: customer.csflag ? 'receipt' : 'payment',
            customer: customer.custname || '',
          },
        }"
        size="sm"
        class="ml-2"
        variant="warning"
      >
        <b-icon
          class="mr-1"
          icon="file-earmark-plus"
        />
        <translate>Create Voucher</translate>
      </b-button>
      <b-button
        :to="`/ledger/${custid}`"
        size="sm"
        class="ml-2"
        variant="success"
      >
        <b-icon
          class="mr-1"
          icon="journals"
        />
        <translate>View Ledger</translate>
      </b-button>
    </div>
    <b-overlay
      no-wrap
      blur
      :show="isLoading"
    />
    <b-card
      class="mt-2"
      header-text-variant="light"
      header-bg-variant="dark"
      no-body
    >
      <template #header>
        <div
          class="d-flex"
          v-b-toggle.collapse-info
        >
          <div
            class="mr-auto"
            v-translate
          >
            Info
          </div>
          <div>
            <b-icon icon="dash" />
          </div>
        </div>
      </template>
      <b-collapse
        class="m-3"
        id="collapse-info"
      >
        <b-form-group
          label="Name"
          label-for="Name"
          label-cols="3"
        >
          <template #label>
            <translate> Name </translate>
          </template>
          <b-form-input
            id="nested-name"
            v-model.trim="details.custname"
          />
        </b-form-group>

        <b-form-group
          label="Phone"
          label-for="Phone Number"
          label-cols="3"
        >
          <template #label>
            <translate> Phone </translate>
          </template>
          <b-form-input
            v-model="details.custphone"
            id="nested-city"
            type="tel"
            pattern="^\+?\d{0,13}"
          />
        </b-form-group>

        <b-form-group
          label="Email"
          label-for="nested-state"
          label-cols="3"
        >
          <template #label>
            <translate>Email</translate>
          </template>
          <b-form-input
            v-model="details.custemail"
            type="email"
          />
        </b-form-group>

        <b-form-group
          label="Fax"
          label-for="nested-country"
          label-cols="3"
        >
          <template #label>
            <translate> Fax </translate>
          </template>
          <b-form-input v-model="details.custfax" />
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- Contact Address -->
    <b-card
      header-text-variant="light"
      header-bg-variant="dark"
      class="mt-2"
      no-body
    >
      <template #header>
        <div
          v-b-toggle.address
          class="d-flex"
        >
          <div
            class="mr-auto"
            v-translate
          >
            Address
          </div>
          <div>
            <b-icon icon="dash" />
          </div>
        </div>
      </template>
      <b-collapse
        class="m-3"
        id="address"
      >
        <b-form-group
          label="Street"
          label-for="nested-street"
          label-cols="3"
        >
          <template #label>
            <translate> Street </translate>
          </template>
          <b-form-input
            id="nested-street"
            v-model="details.custaddr"
          />
        </b-form-group>

        <b-form-group
          label="Country"
          label-for="country"
          label-cols="3"
        >
          <template #label>
            <translate>Country</translate>
          </template>
          <b-form-select
            :options="options.countries"
            v-model="contactCountry"
          />
        </b-form-group>
        <b-form-group
          v-if="isIndianContact"
          label="State"
          label-for="state"
          label-cols="3"
        >
          <template #label>
            <translate> State </translate>
          </template>
          <b-form-select
            :options="options.states"
            v-model="details.state"
            @change="gstin.stateCode = options.stateMap[details.state]"
          />
        </b-form-group>

        <b-form-group
          label="Postal Code"
          label-for="nested-country"
          label-cols="3"
        >
          <template #label>
            <translate> Postal Code </translate>
          </template>
          <b-form-input
            no-wheel
            v-model="details.pincode"
            id="nested-country"
          />
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- Contact Financial details -->
    <b-card
      v-if="isIndianContact"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mt-2"
      no-body
    >
      <template #header>
        <div
          v-b-toggle.financial
          class="d-flex"
        >
          <div
            class="mr-auto"
            v-translate
          >
            Financial Details
          </div>
          <div>
            <b-icon
              variant="light"
              icon="dash"
            />
          </div>
        </div>
      </template>

      <b-collapse
        class="m-3"
        id="financial"
      >
        <template v-if="isGstEnabled">
          <b-form-group
            label="GSTIN"
            label-for="nested-state"
            label-cols="3"
          >
            <template #label>
              <translate> GSTIN </translate>
            </template>
            <gk-gstin
              @validity="onGstinUpdate"
              @gstin_data="onGstinDataFetched"
              v-model="gstin.gstin"
            />
          </b-form-group>
          <b-form-group
            v-if="isGstValid"
            label="GST Registration Type"
            label-for="nested-gst-reg"
            label-cols="3"
          >
            <template #label>
              <translate> GST Registration Type </translate>
            </template>
            <b-form-select
              label-cols="3"
              id="nested-gst-reg"
              v-model="details.gst_reg_type"
              :options="options.regTypes"
              :disabled="!isGstValid"
            />
          </b-form-group>
          <b-form-group
            v-if="isGstValid && isGstReg"
            label="GST Party Type"
            label-for="nested-gst-party"
            label-cols="3"
          >
            <template #label>
              <translate> Party Type </translate>
            </template>
            <b-form-select
              label-cols="3"
              id="nested-gst-party"
              v-model="details.gst_party_type"
              :options="options.partyTypes"
            />
          </b-form-group>
        </template>
        <b-form-group
          v-if="isVatEnabled"
          label="TIN"
          label-for="TIN"
          label-cols="3"
        >
          <template #label>
            <translate>TIN</translate>
          </template>
          <b-form-input
            id="tin"
            v-model.trim="details.tin"
            pattern="[A-Z0-9]+"
            minlength="11"
            maxlength="11"
          />
        </b-form-group>
        <b-form-group
          label="PAN"
          label-for="nested-pan"
          label-cols="3"
          :state="isPanValid"
          invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
        >
          <template #label>
            <translate> PAN </translate>
          </template>
          <b-form-input
            :value="details.custpan"
            v-model="details.custpan"
            id="nested-pan"
            :state="isPanValid"
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            @change="gstin.pan = details.custpan"
            :required="!!details.custpan"
          />
        </b-form-group>
        <b-form-group
          label="TAN"
          label-for="nested-tan"
          label-cols="3"
        >
          <template #label>
            <translate>TAN</translate>
          </template>
          <b-form-input
            v-model="details.custtan"
            :value="details.custtan"
            id="nested-tan"
            pattern="[A-Z]{4}[0-9]{5}[A-Z]{1}"
          />
        </b-form-group>
      </b-collapse>
    </b-card>
    <!-- Contact Bank details -->
    <b-card
      header-bg-variant="dark"
      header-text-variant="light"
      class="mt-2"
      no-body
    >
      <template #header>
        <div
          v-b-toggle.bank
          class="d-flex"
        >
          <div
            class="mr-auto"
            v-translate
          >
            Bank Details
          </div>
          <div>
            <b-icon
              variant="light"
              icon="dash"
            />
          </div>
        </div>
      </template>

      <b-collapse
        class="m-3"
        id="bank"
      >
        <b-form-group
          v-if="isIndianContact"
          label="IFSC"
          label-for="cp-bank-ifsc"
          label-cols="3"
        >
          <!-- <b-form-input
                 id="cp-bank-ifsc"
                 v-model="bankDetails.ifsc"
                 ></b-form-input> -->
          <gk-ifsc
            v-model="bankDetails.ifsc"
            @fill="autofillIfsc"
          />
        </b-form-group>
        <b-form-group
          label="Account Number"
          label-for="cp-bank-ano"
          label-cols="3"
        >
          <template #label>
            <translate> Account Number </translate>
          </template>
          <b-form-input
            id="cp-bank-ano"
            v-model="bankDetails.accountno"
            pattern="[A-Z0-9]+"
          />
        </b-form-group>
        <b-form-group
          label="Bank Name"
          label-for="cp-bank-name"
          label-cols="3"
        >
          <template #label>
            <translate> Bank Name </translate>
          </template>
          <b-form-input
            id="cp-bank-name"
            v-model="bankDetails.bankname"
          />
        </b-form-group>

        <b-form-group
          label="Branch"
          label-for="cp-bank-branch"
          label-cols="3"
        >
          <template #label>
            <translate> Branch </translate>
          </template>
          <b-form-input
            id="cp-bank-branch"
            v-model="bankDetails.branchname"
          />
        </b-form-group>
      </b-collapse>
    </b-card>
  </b-form>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import GkGstin from '../components/GkGstin';
import GkIfsc from './GkIfsc.vue';
import countries from '@/js/countries';
import { GST_REG_TYPE, GST_PARTY_TYPE } from '@/js/enum.js';

export default {
  name: 'ContactProfile',
  components: { GkGstin, GkIfsc },
  props: {
    customer: Object,
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of Contact Item, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  data() {
    return {
      details: Array,
      bankDetails: {},
      oldContactName: '',
      isLoading: true,
      options: {
        states: [],
        countries,
        selectedState: {},
        stateMap: {},
        regTypes: [
          {
            text: this.$gettext('Registered Regular'),
            value: GST_REG_TYPE['regular'],
          },
          {
            text: this.$gettext('Registered Composition'),
            value: GST_REG_TYPE['composition'],
          },
          {
            text: this.$gettext('Unregistered'),
            value: GST_REG_TYPE['unregistered'],
          },
          { text: this.$gettext('Consumer'), value: GST_REG_TYPE['consumer'] },
        ],
        partyTypes: [
          {
            text: this.$gettext('Regular'),
            value: null,
          },
          {
            text: this.$gettext('Deemed Export'),
            value: GST_PARTY_TYPE['deemed_export'],
          },
          { text: this.$gettext('SEZ'), value: GST_PARTY_TYPE['sez'] },
          {
            text: this.$gettext('Overseas'),
            value: GST_PARTY_TYPE['overseas'],
          },
          {
            text: this.$gettext('UIN Holders'),
            value: GST_PARTY_TYPE['uin_holders'],
          },
        ],
      },
      contactCountry: null,
      gstin: {
        gstin: '',
        stateCode: '',
        pan: '',
        checksum: '',
        validity: false,
      },
      regex: {
        checksum: new RegExp('[0-9]{1}[A-Z]{1}[0-9A-Z]{1}'),
        pan: new RegExp('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
      },
    };
  },
  computed: {
    isIndianContact: (self) => self.contactCountry === 'India',
    isGstValid: (self) => self.gstin.validity,
    isGstReg: (self) =>
      self.details.gst_reg_type === GST_REG_TYPE['regular'] ||
      self.details.gst_reg_type === GST_REG_TYPE['composition'],
    isChecksumValid: (self) =>
      self.gstin.checksum
        ? self.regex.checksum.test(self.gstin.checksum)
        : null,
    isPanValid: (self) =>
      self.details.custpan ? self.regex.pan.test(self.details.custpan) : null,
    ...mapState(['gkCoreUrl', 'authToken']),
    ...mapGetters('global', ['isGstEnabled', 'isVatEnabled']),
  },
  methods: {
    autofillIfsc(data) {
      this.bankDetails.bankname = data.BANK;
      this.bankDetails.branchname = data.BRANCH;
    },
    /**GSTIN methods start*/
    onGstinDataFetched({ addr, name, pincode, pan }) {
      this.details.custaddr = addr;
      this.details.custname = name;
      this.details.pincode = pincode;
      this.details.custpan = pan;
    },
    onGstinUpdate({ validity, stateCode, pan, checksum }) {
      if (validity.format) {
        this.gstin = Object.assign({}, this.gstin, {
          stateCode: stateCode,
          pan: pan,
          checksum: checksum,
          validity: validity,
        });
        if (!this.details.custpan) {
          this.details.custpan = pan;
        }
        if (!this.details.state) {
          this.details.state = this.options.states[stateCode];
        }
      } else {
        this.gstin.validity = false;
      }
    },
    getDetails() {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      axios.get(`/accounts?type=getAccCode&accountname=${this.customer.custname}`)
        .then(response => {
          this.custid = response.data.accountcode;
        })
        .catch(error => {
          this.error = 'Failed to load data: ' + error.message;
        });
      axios
        .get(`/customer/${this.customer.custid}`, config)
        .then((res) => {
          switch (res.data.gkstatus) {
          case 0:
            {
              this.details = res.data.gkresult;

              if (!this.details.gst_reg_type) {
                this.details.gst_reg_type = GST_REG_TYPE['unregistered'];
                this.details.gst_party_type = null;
              }
              // update bank details
              let bdetails = this.details.bankdetails || {};
              this.bankDetails = {
                accountno: bdetails.accountno,
                bankname: bdetails.bankname,
                branchname: bdetails.branchname,
                ifsc: bdetails.ifsc,
              };

              this.oldContactName = this.details.custname;
              this.contactCountry = this.details.country;
              this.isLoading = false;
              this.states().then(() => {
                this.gstin.gstin = this.details.gstin
                  ? Object.values(this.details.gstin)[0]
                  : '';
              });
            }
            break;
          case 2:
            this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
              variant: 'danger',
              title: 'Alert',
              solid: true,
            });
            this.isLoading = false;
            break;
          case 3:
            this.$bvToast.toast(this.$gettext('Contact not found'), {
              variant: 'danger',
              title: 'Alert',
              solid: true,
            });
            this.isLoading = false;
            break;
          }
        })
        .catch((err) => {
          console.error(err.message);
        });
    },
    /**
     * Update customer/supplier details
     */
    updateContact() {
      this.$bvModal
        .msgBoxConfirm(`Update ${this.details.custname} details ?`, {
          centered: true,
          size: 'lg',
        })
        .then((val) => {
          if (val) {
            delete this.details.statelist;
            this.isLoading = true;
            if (!this.isIndianContact) {
              this.details.state = '';
              this.details.gst_reg_type = 0;
              this.details.gst_party_type = null;
              this.details.custpan = null;
              this.details.custtan = null;
              this.details.tin = null;
              this.gstin = {};
              this.bankDetails.ifsc = '';
            }
            if (this.gstin.validity) {
              this.details.gstin = {};
              this.details.gstin[this.gstin.stateCode] = this.gstin.gstin;
            }
            this.details.bankdetails = this.bankDetails;
            axios
              .put(`/customer/${this.details.custid}`, this.details)
              .then((res) => {
                switch (res.data.gkstatus) {
                case 7:
                  this.isLoading = false;
                  res.data?.error.forEach((field_err) => {
                    let location = field_err.loc.join(" at ");
                    let message = (location ? location+": " : "") + field_err.msg;
                    this.displayToast("Validation Error", message, "warning");
                  });
                  break;

                case 0:
                  {
                    this.isLoading = false;
                    this.updateAccountDetails(this.oldContactName);
                    this.$bvToast.toast(
                      `${this.details.custname} Profile Details Updated`,
                      {
                        title: 'Success',
                        variant: 'success',
                        solid: true,
                      }
                    );

                    let log = {
                      activity: `${
                        this.customer.csflag ? 'customer' : 'supplier'
                      } updated: ${this.details.custname}`,
                    };
                    axios.post('/log', log);
                    this.onUpdate({
                      type: 'update',
                      data: {
                        custname: this.details.custname,
                      },
                    });
                  }
                  break;
                case 2:
                  this.isLoading = false;
                  this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                    variant: 'danger',
                    solid: true,
                  });
                  break;
                case 4:
                  this.isLoading = false;
                  this.$bvToast.toast(
                    this.$gettext(
                      'You have no permissions to delete details'
                    ),
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
              });
          }
        });
    },
    /**Delete contact details based on custid */
    deleteContact() {
      this.$bvModal
        .msgBoxConfirm(`Delete ${this.details.custname} ?`, {
          centered: true,
          size: 'lg',
        })
        .then((val) => {
          if (val) {
            this.isLoading = true;
            axios
              .delete(`/customer/${this.details.custid}`)
              .then((res) => {
                this.isLoading = true;
                switch (res.data.gkstatus) {
                case 0:
                  // Delete Contact's Account
                  this.delAccount(this.details.custname);
                  this.isLoading = false;
                  document.querySelector('#contactinfo').innerHTML = '';
                  this.$bvToast.toast(
                    `${this.details.custname} Profile Deleted`,
                    {
                      title: 'Success',
                      variant: 'success',
                      solid: true,
                    }
                  );
                  this.onUpdate({ type: 'delete' });
                  break;
                case 2:
                  this.isLoading = false;
                  this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                    title: this.$gettext('Action Denied'),
                    variant: 'danger',
                    solid: true,
                  });
                  break;
                case 4:
                  this.isLoading = false;
                  this.$bvToast.toast(
                    this.$gettext(
                      'You have no permissions to modify details'
                    ),
                    {
                      title: this.$gettext('Access Denied'),
                      variant: 'danger',
                      solid: true,
                    }
                  );
                  break;
                case 5:
                  this.isLoading = false;
                  this.$bvToast.toast(
                    this.textInterpolated(`Cannot delete ${this.details.custname} as there are some existing entries in the software.`),
                    {
                      title: this.$gettext('Cannot Delete Contact'),
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
              });
          }
        });
    },
    /** Delete account corresponding to Contact name */
    delAccount(name) {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      let accList;
      // Grab the list of accounts
      axios
        .get(`${this.gkCoreUrl}/accounts`, config)
        .then((res) => {
          accList = res.data.gkresult;
          for (var i in accList) {
            /**
             * Match with the supplied account name in the list
             * and delete it
             */
            if (accList[i].accountname == name) {
              axios
                .delete(`${this.gkCoreUrl}/accounts`, {
                  headers: {
                    gktoken: this.authToken,
                  },
                  data: {
                    accountcode: accList[i].accountcode, // Get account code
                  },
                })
                .then(() => {
                  // Add a log about the delete status
                  this.addLog();
                })
                .catch((e) => {
                  console.error(e);
                });
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    /**Update the account associated with this contact when the contact name is changed*/
    updateAccountDetails(oldContactName) {
      axios.get('/accounts').then((res) => {
        if (res.data.gkstatus === 0) {
          let acc = res.data.gkresult.find(
            (account) => account.accountname === oldContactName
          );
          if (acc) {
            let payload = {
              custsupflag: 1,
              oldcustname: oldContactName,
              gkdata: {
                accountname: this.details['custname'],
                openingbal: acc['openingbal'],
                accountcode: acc['accountcode'],
              },
            };
            axios.put('accounts', payload);
          }
        }
        this.oldContactName = this.details.custname;
      });
    },
    /**Add a record of contact delete action */
    addLog() {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
      };
      const payload = {
        activity: `${this.details.custname} ${
          this.details.csflag == 3 ? 'customer' : 'supplier'
        } deleted`,
      };
      axios
        .post(`${this.gkCoreUrl}/log`, payload, config)
        .catch((e) => {
          console.error('log ', e);
        });
    },
    /** Splits the GSTIN into state code, pan and checksum */
    splitGstin(gstin) {
      let gstinUpdated = false;
      if (gstin) {
        if (gstin.length === 15) {
          gstinUpdated = true;
          this.gstin = Object.assign({}, this.gstin, {
            stateCode: gstin.substring(0, 2),
            pan: gstin.substring(2, 12),
            checksum: gstin.substring(12, 15),
          });
        }
      }
      if (!gstinUpdated) {
        this.gstin.stateCode = this.options.stateMap[this.details.state] || '';
        this.gstin.pan = this.details.custpan || '';
      }
    },
    /** Fetches statelist from gkcore and prepares it for b-select.
     *  Also creates stateName to stateCode map, for quick lookup of state codes
     */
    states() {
      return axios
        .get(`${this.gkCoreUrl}/state`)
        .then((res) => {
          if (res.data.gkstatus === 0) {
            this.options.states = [];
            let name, code;
            res.data.gkresult.forEach((item) => {
              name = Object.values(item)[0];
              code = Object.keys(item)[0];
              if (parseInt(code) < 10) {
                code = '0' + code;
              }
              this.options.states.push(name);
              this.options.stateMap[name] = code;
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e, {
            variant: 'danger',
          });
        });
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
  },
  created() {
    if (window.screen.width > 600) {
      this.isCollapsed1 = true;
      this.isCollapsed2 = true;
      this.isCollapsed3 = true;
      this.isCollapsed4 = true;
    }
    window.addEventListener('resize', () => {
      if (window.screen.width > 600) {
        this.isCollapsed1 = true;
        this.isCollapsed2 = true;
        this.isCollapsed3 = true;
        this.isCollapsed4 = true;
      } else {
        this.isCollapsed1 = false;
        this.isCollapsed2 = false;
        this.isCollapsed3 = false;
        this.isCollapsed4 = false;
      }
    });
  },
  mounted() {
    this.getDetails();

    // This is used by the invoice form, to autofill party details
    this.$store.commit('setInvoiceParty', {
      id: this.customer.custid,
      name: this.customer.custname,
      type: this.customer.csflag ? 'customer' : 'supplier', // 3 -> customer, 19-> supplier
    });
  },
};
</script>
