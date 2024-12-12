<template>
  <div class="card mx-0">
    <div
      v-if="showHeader"
      class="card-header text-left py-2 bg-dark text-light"
    >
      <b v-translate>Contact Person Details</b>
      <slot name="close-button" />
    </div>
    <div class="card-body pb-2">
      <b-form
        class="text-left"
        @submit.prevent="confirmOnSubmit"
      >
        <b-row>
          <b-col cols="12">
            <b-form-group
              label-size="sm"
              label-cols="3"
              label="Type"
            >
              <template #label>
                <translate> Type </translate>
              </template>
              <b-form-radio-group
                button-variant="outline-primary"
                v-model="contactType"
                buttons
                size="sm"
              >
                <b-form-radio value="customer">
                  <translate> Customer </translate>
                </b-form-radio>
                <b-form-radio value="supplier">
                  <translate> Supplier </translate>
                </b-form-radio>
              </b-form-radio-group>
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Country"
              label-for="ci-input-20"
              label-cols="3"
            >
              <template #label>
                <translate>Country</translate>
              </template>
              <v-select
                id="ci-input-20"
                :options="options.countries"
                v-model="contactCountry"
                label="name"
                placeholder="Select a Country"
              />
            </b-form-group>
            <template v-if="isIndianContact && isGstEnabled">
              <b-form-group
                label-size="sm"
                label="GSTIN"
                label-cols="3"
                inline
              >
                <gk-gstin
                  @validity="onGstinUpdate"
                  @gstin_data="onGstinDataFetched"
                  @verified="onGstinVerified"
                  v-model="form.gstin.gstin"
                  :show-validation="2"
                  val-button-text="Validate & Autofill"
                />
              </b-form-group>
              <b-form-group
                v-if="isGstValid"
                label-size="sm"
                label="GST Registration Type"
                label-for="ci-input-11"
                :state="validatePan"
                label-cols="3"
              >
                <template #label>
                  <translate> GST Registration Type </translate>
                </template>
                <b-form-select
                  label-cols="3"
                  id="ci-input-11"
                  size="sm"
                  v-model="form.gstin.regType"
                  :options="options.regTypes"
                  :disabled="!isGstValid"
                />
              </b-form-group>
              <b-form-group
                v-if="isGstValid && isGstReg"
                label-size="sm"
                label="GST Party Type"
                label-for="ci-input-12"
                :state="validatePan"
                label-cols="3"
              >
                <template #label>
                  <translate> GST Party Type </translate>
                </template>
                <b-form-select
                  label-cols="3"
                  id="ci-input-12"
                  size="sm"
                  v-model="form.gstin.partyType"
                  :options="options.partyTypes"
                />
              </b-form-group>
              <div class="text-center text-small text-secondary mb-2">
                (or)
              </div>
            </template>
            <b-form-group
              label-size="sm"
              label="Name"
              label-for="ci-input-10"
              label-cols="3"
              label-class="required"
            >
              <template #label>
                <translate> Name </translate>
              </template>
              <b-form-input
                size="sm"
                id="ci-input-10"
                :placeholder="formType + ' Name'"
                v-model="form.name"
                trim
                required
              />
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Address"
              label-for="ci-input-40"
              label-cols="3"
            >
              <template #label>
                <translate> Address </translate>
              </template>
              <b-form-textarea
                id="ci-input-40"
                v-model="form.address"
                size="sm"
                rows="2"
                max-rows="3"
              />
            </b-form-group>
            <b-form-group
              v-if="isIndianContact"
              label-size="sm"
              label="State"
              label-for="ci-input-20"
              label-cols="3"
            >
              <template #label>
                <translate> State </translate>
              </template>
              <v-select
                id="ci-input-20"
                :options="options.states"
                v-model="state"
                label="name"
                placeholder="Select a State"
              />
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Postal Code"
              label-for="ci-input-30"
              label-cols="3"
            >
              <template #label>
                <translate> Postal Code </translate>
              </template>
              <b-form-input
                size="sm"
                id="ci-input-30"
                v-model="form.pin"
                no-wheel
                debounce="500"
              />
            </b-form-group>
            <b-form-group
              v-if="isIndianContact"
              label-size="sm"
              label="PAN"
              label-for="ci-input-80"
              :state="validatePan"
              invalid-feedback="Format: 5 capital alphabets 4 numbers 1 capital alphabet"
              label-cols="3"
            >
              <b-form-input
                size="sm"
                id="ci-input-80"
                :state="validatePan"
                v-model="form.pan"
                trim
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Format: A B C D E 1 2 3 4 A"
                debounce="500"
              />
            </b-form-group>
            <b-form-group
              v-if="isIndianContact && isVatEnabled"
              label-size="sm"
              label="TIN"
              label-for="ci-input-13"
              label-cols="3"
            >
              <template #label>
                <translate>TIN</translate>
              </template>
              <b-form-input
                size="sm"
                id="ci-input-13"
                v-model="form.tin"
                trim
                pattern="[A-Z0-9]+"
                minlength="11"
                maxlength="11"
              />
            </b-form-group>
          </b-col>
          <b-col cols="12">
            <b-form-checkbox
              size="sm"
              v-model="showOptional"
              class="mb-3"
              switch
            >
              <translate> Contact Details </translate>
            </b-form-checkbox>
            <b-collapse v-model="showOptional">
              <b-form-group
                label-size="sm"
                label="Email"
                label-for="ci-input-50"
                label-cols="3"
              >
                <template #label>
                  <translate> Email </translate>
                </template>
                <b-form-input
                  size="sm"
                  id="ci-input-50"
                  v-model="form.email"
                  type="email"
                  trim
                />
              </b-form-group>
              <b-form-group
                label-size="sm"
                label="Phone"
                label-for="ci-input-60"
                label-cols="3"
              >
                <template #label>
                  <translate> Phone </translate>
                </template>
                <b-form-input
                  size="sm"
                  id="ci-input-60"
                  type="tel"
                  pattern="^\+?\d{0,13}"
                  no-wheel
                  v-model="form.contact"
                  trim
                />
              </b-form-group>
              <b-form-group
                label-size="sm"
                label="Fax"
                label-for="ci-input-70"
                label-cols="3"
              >
                <template #label>
                  <translate> Fax </translate>
                </template>
                <b-form-input
                  size="sm"
                  id="ci-input-70"
                  v-model="form.fax"
                  trim
                />
              </b-form-group>
            </b-collapse>
          </b-col>
          <!-- Bank details -->
          <b-col>
            <b-form-checkbox
              size="sm"
              v-model="showBankDetails"
              class="mb-3"
              switch
            >
              <translate> Bank Details </translate>
            </b-form-checkbox>
            <b-collapse v-model="showBankDetails">
              <!-- IFSC -->
              <b-form-group
                v-if="isIndianContact"
                label-size="sm"
                label="IFSC"
                label-for="ci-input-150"
                label-cols="3"
              >
                <gk-ifsc
                  :required="showBankDetails"
                  size="sm"
                  v-model="form.bank.ifsc"
                  @fill="ifscFill"
                />
              </b-form-group>
              <!-- bank name -->
              <b-form-group
                label-size="sm"
                label="Name"
                label-for="ci-input-120"
                label-cols="3"
              >
                <template #label>
                  <translate> Bank Name </translate>
                </template>
                <b-form-input
                  size="sm"
                  id="ci-input-120"
                  v-model="form.bank.name"
                  trim
                  :required="showBankDetails"
                />
              </b-form-group>
              <!-- branch -->
              <b-form-group
                label-size="sm"
                label="Branch"
                label-for="ci-input-130"
                label-cols="3"
              >
                <template #label>
                  <translate> Branch </translate>
                </template>
                <b-form-input
                  size="sm"
                  id="ci-input-130"
                  v-model="form.bank.branch"
                  trim
                  :required="showBankDetails"
                />
              </b-form-group>
              <!-- account name -->
              <b-form-group
                label-size="sm"
                label="Account Number"
                label-for="ci-input-140"
                label-cols="3"
              >
                <template #label>
                  <translate> Account Number </translate>
                </template>
                <b-form-input
                  size="sm"
                  id="ci-input-140"
                  v-model="form.bank.accNo"
                  trim
                  :required="showBankDetails"
                  pattern="[A-Z0-9]+"
                />
              </b-form-group>
            </b-collapse>
          </b-col>
        </b-row>
        <hr class="my-2">
        <div class="float-right">
          <b-button
            v-if="!hideBackButton"
            size="sm"
            class="m-1"
            variant="danger"
            @click.prevent="$router.go(-1)"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="arrow-left"
            />
            <span
              class="align-middle"
              v-translate
            >Back</span>
          </b-button>
          <b-button
            size="sm"
            class="m-1"
            variant="warning"
            @click.prevent="resetForm"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="arrow-repeat"
            />
            <span
              class="align-middle"
              v-translate
            >Reset</span>
          </b-button>
          <b-button
            type="submit"
            size="sm"
            class="m-1"
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
            <span
              class="align-middle"
              v-translate
            >Save</span>
          </b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import GkGstin from '../GkGstin';
import GkIfsc from '../GkIfsc.vue';
import countries from '@/js/countries';
import { GST_REG_TYPE, GST_PARTY_TYPE } from '../../js/enum.js';
export default {
  name: 'ContactItem',
  components: { GkGstin, GkIfsc },
  props: {
    mode: {
      type: String,
      validator: function(value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      validator: function(value) {
        return ['customer', 'supplier'].indexOf(value) !== -1;
      },
      required: false,
      default: 'customer',
    },
    onSave: {
      type: Function,
      required: false,
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      temp: true,
      blankURL: 'http://localhost:1111',
      isLoading: false,
      isPreloading: false,
      showOptional: false,
      showBankDetails: false,
      options: {
        orgDetails: {
          country: '',
          gstin: '',
        },
        states: [],
        countries,
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
      regex: {
        pan: new RegExp('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
      },
      contactType: 'customer',
      form: {
        name: null,
        state: null,
        pin: null,
        address: null,
        email: null,
        contact: null,
        fax: null,
        pan: null,
        gstin: {
          gstin: '',
          stateCode: null,
          pan: null,
          checkSum: null,
          regType: GST_REG_TYPE['unregistered'],
          partyType: null,
          valid: false,
        },
        bank: {
          name: null,
          branch: null,
          accNo: null,
          ifsc: null,
        },
      },
      state: null,
      contactCountry: null,
    };
  },
  computed: {
    isIndianContact: (self) => self.contactCountry === 'India',
    defaultState: (self) => {
      const { country, state, gstin } = self.options.orgDetails;
      const orgCountry = country.trim().toLowerCase();
      // Use organisation state as default state if organisation country is
      // India and has a valid GSTIN. If organisation has no country set, it is
      // assumed as India by default.
      if ((!orgCountry || orgCountry === 'india') && gstin) {
        return state;
      }
    },
    isGstValid: (self) => self.form.gstin.valid,
    isGstReg: (self) =>
      self.form.gstin.regType === GST_REG_TYPE['regular'] ||
      self.form.gstin.regType === GST_REG_TYPE['composition'],
    columnOneWidth: (self) =>
      self.showOptional ? (self.showBankDetails ? 4 : 6) : 12,
    columnTwoWidth: (self) => (self.showOptional ? 4 : 12),
    isSupplier: (self) => self.contactType === 'supplier',
    formType: (self) =>
      self.contactType === 'customer' ? 'Customer' : 'Supplier',
    formMode: (self) => (self.mode === 'create' ? 'Create' : 'Edit'),
    validatePan: (self) =>
      self.form.pan ? self.regex.pan.test(self.form.pan) : null,
    ...mapState(['gkCoreUrl', 'gkCoreTestUrl', 'authToken']),
    ...mapGetters('global', ['isGstEnabled', 'isVatEnabled']),
  },
  watch: {
    type(type) {
      if (type !== this.contactType) {
        this.contactType = type;
      }
    },
    state(newValue) {
      if (newValue) {
        this.form.state = newValue.name;
        this.form.gstin.stateCode = newValue.code;
      }
    },
    defaultState(state) {
      this.state = state;
    },
  },
  methods: {
    ifscFill(data) {
      this.form.bank.name = data.BANK;
      this.form.bank.branch = data.BRANCH;
    },
    onGstinDataFetched({ addr, name, pincode }) {
      this.form.address = addr;
      this.form.name = name;
      this.form.pin = pincode;
    },
    onGstinUpdate({ validity, stateCode, pan, checksum }) {
      if (validity.format) {
        Object.assign(this.form.gstin, {
          stateCode: stateCode,
          pan: pan,
          checkSum: checksum,
          valid: true,
        });
        if (!this.form.pan) {
          this.form.pan = pan;
        }
        if (!this.state || stateCode) {
          let state = this.options.states.find(
            (state) => state.code == stateCode
          );
          if (state) {
            this.state = state;
          }
        }
      } else {
        if (!this.form.gstin.gstin) {
          this.form.state = '';
          this.form.pan = null;
          this.form.gstin = {
            gstin: null,
            stateCode: null,
            pan: null,
            checkSum: null,
            regType: GST_REG_TYPE['unregistered'],
            partyType: null,
            valid: false,
          };
          this.state = null;
        }
      }
    },
    onGstinVerified(verifiedStatus) {
      this.form.gstin.regType = verifiedStatus
        ? GST_REG_TYPE['regular']
        : GST_REG_TYPE['unregistered'];
    },
    confirmOnSubmit() {
      const self = this;
      let party = this.isSupplier ? 'Supplier' : 'Customer';
      let text = `Create ${party} <b>${this.form.name}</b>?`;
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            self.onSubmit();
          }
        });
    },
    onSubmit() {
      this.isLoading = true;
      if (this.contactCountry !== 'India') {
        this.state = '';
        this.form.pan = null;
        this.form.bank.ifsc = null;
      }
      const payload = this.initPayload();
      axios
        .post('/customer', payload)
        .then((response) => {
          this.isLoading = false;

          switch (response.data.gkstatus) {
          case 7:
            response.data?.error.forEach((field_err) => {
              let location = field_err.loc.join(" at ");
              let message = (location ? location+": " : "") + field_err.msg;
              this.displayToast("Validation Error", message, "warning");
            });
            break;
          case 0:
            {
              this.$bvToast.toast(
                this.$gettextInterpolate(
                  this.$gettext(`%{formType} created successfully`),
                  {
                    formType: this.formType,
                  }
                ),
                {
                  title: this.$gettext('Create Customer Success!'),
                  autoHideDelay: 3000,
                  variant: 'success',
                  appendToast: true,
                  solid: true,
                }
              );

              // === Server Log ===
              let logdata = { activity: '' };
              if (payload.csflag === 3) {
                logdata.activity = payload.custname + ' customer created';
              } else {
                logdata.activity = payload.custname + ' supplier created';
              }
              axios.post('/log', logdata);

              // only reset form on success, otherwise leave it as is so that user may edit their input and try again
              this.resetForm();
            }
            break;
          case 2:
            this.$bvToast.toast(
              this.$gettext(`Unauthorized access, Please contact admin`),
              {
                title: this.$gettext('Create Customer Error!'),
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
            break;
          default:
            this.$bvToast.toast(
              `Unable to create ${this.formType}, Please try again`,
              {
                title: this.$gettext('Create Customer Error!'),
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
          } // end switch
          if (this.onSave) {
            this.onSave(response.data);
          }
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: this.$gettext('Create Customer Error!'),
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
      const bankDetails = Object.values(this.form.bank).filter(
        (detail) => detail !== null
      );
      let gstin = null;
      if (this.form.gstin.gstin) {
        gstin = {};
        let stateCode = this.form.gstin.gstin.substr(0, 2);
        gstin[stateCode] = this.form.gstin.gstin;
      }
      const payload = {
        custname: this.form.name,
        custaddr: this.form.address,
        state: this.form.state,
        country: this.contactCountry,
        pincode: this.form.pin,
        csflag: this.contactType === 'customer' ? 3 : 19,
        custpan: this.form.pan,
        gstin,
        gst_reg_type: this.form.gstin.regType,
        tin: this.form.tin,
      };

      if (this.isGstReg) {
        payload.gst_party_type = this.form.gstin.partyType;
      }

      if (this.showOptional) {
        payload.custphone = this.form.contact;
        payload.custemail = this.form.email;
        payload.custfax = this.form.fax;
      }

      if (this.showBankDetails && bankDetails.length === 4) {
        payload.bankdetails = {
          accountno: this.form.bank.accNo,
          bankname: this.form.bank.name,
          ifsc: this.form.bank.ifsc,
          branchname: this.form.bank.branch,
        };
      }
      return payload;
    },
    resetForm() {
      this.form = {
        name: null,
        state: '',
        pin: null,
        address: null,
        email: null,
        contact: null,
        fax: null,
        pan: null,
        tin: null,
        gstin: {
          gstin: null,
          stateCode: null,
          pan: null,
          checkSum: null,
          regType: GST_REG_TYPE['unregistered'],
          partyType: null,
        },
        bank: {
          accNo: null,
          name: null,
          branch: null,
          ifsc: null,
        },
      };
      if (this.isIndia) {
        this.contactCountry = 'India';
      }
    },
    preloadData() {
      this.isPreloading = true;
      axios
        .get(`/organisation`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            const data = resp.data.gkdata;
            this.contactCountry = data.orgcountry;
            Object.assign(this.options.orgDetails, {
              country: data.orgcountry,
              state: data.orgstate,
              gstin: Object.values(data.gstin ?? {})?.[0] ?? '',
            });
          } else {
            this.displayToast(
              this.$gettext('Preload Data Failed!'),
              this.$gettext(
                'Error fetching State List, please try again after sometime.'
              ),
              'warning'
            );
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Organisation Profile Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),

      axios
        .get('/state')
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            this.options.states = resp.data.gkresult.map((item) => {
              const name = Object.values(item)[0];
              let code = Object.keys(item)[0] + '';
              if (code.length < 2) {
                code = '0' + code;
              }

              return {
                name: name,
                code: code,
              };
            });
          } else {
            this.displayToast(
              this.$gettext('Preload Data Failed!'),
              this.$gettext(
                'Error fetching State List, please try again after sometime.'
              ),
              'warning'
            );
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Preload Data Failed!'),
            error.message,
            'warning'
          );
          return error;
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
  mounted() {
    this.preloadData();
  },
};
</script>
