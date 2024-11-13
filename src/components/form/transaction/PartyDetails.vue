<template>
  <b-card
    v-if="config"
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
  >
    <b-overlay
      :show="isPreloading || form.loading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="p-2 p-md-3">
      <div>
        <b
          key="pd-1"
          v-if="saleFlag"
          v-translate
        > Buyer Details</b>
        <b
          key="pd-2"
          v-else
          v-translate
        > Seller Details</b>
        <b-button
          variant="secondary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'dash' : 'arrows-fullscreen'"
            class="float-right"
          />
        </b-button>
      </div>
      <div
        class="mt-3 px-2"
        :class="{'d-md-block': true, 'd-none': !isCollapsed}"
      >
        <b-form-group v-if="config.type">
          <b-form-radio-group
            button-variant="outline-secondary"
            size="sm"
            buttons
            v-model="form.type"
            @change="resetPartyDetails"
          >
            <b-form-radio value="customer">
              <translate> Customer </translate>
            </b-form-radio>
            <b-form-radio value="supplier">
              <translate> Supplier </translate>
            </b-form-radio>
          </b-form-radio-group>
          <!-- add contact button -->
          <!-- NOTE: disabled this modal, because it freezes the page after closing 
					Adding link to create contact as workarond
					-->

          <b-button
            class="py-0 ml-3"
            variant="success"
            size="sm"
            :title="$gettext('Add Contact')"
            @click="$router.push('/contact-details/create/customer')"
          >
            +
          </b-button>
          <!-- edit contact button. only shown when a contact is selected -->
          <b-button
            v-if="form.name?.name != ''"
            class="py-0 ml-2"
            variant="warning"
            size="sm"
            @click.prevent="initPartyEdit"
            :disabled="editFlag"
            title="Edit Contact"
          >
            <b-icon
              font-scale="0.95"
              icon="pencil"
            />
          </b-button>
        </b-form-group>

        <b-form-group
          v-if="config.name"
          label="Name"
          label-for="ptd-input-10"
          label-cols="3"
          label-cols-md="4"
          label-cols-lg="3"
          label-size="sm"
          :label-class="{required: !(editFlag || isNameDisabled)}"
        >
          <template #label>
            <translate> Name </translate>
          </template>

          <b-form-select
            v-if="isCustomer && options.customers"
            id="ptd-input-10"
            v-model="form.name"
            @change="onPartyNameSelect(form.name)"
            :required="icflag !== 3"
            :disabled="icflag === 3 || ((editFlag || isNameDisabled || editInvoice) && !!form.name?.name)"
            :clearable="true"
          >
            <b-form-select-option
              v-for="option in options.customers"
              :key="option?.id"
              :value="option"
            >
              {{ option.name }}
            </b-form-select-option>
          </b-form-select>
          <b-form-select
            v-else-if="options.suppliers"
            id="ptd-input-11"
            v-model="form.name"
            @change="onPartyNameSelect(form.name)"
            :required="true"
            :disabled="(editFlag || isNameDisabled || editInvoice) && !!form.name?.name"
            :clearable="false"
            :rules="[v => !!form.name || 'Please select an option']"
          >
            <b-form-select-option
              v-for="option in options.suppliers"
              :key="option?.id"
              :value="option"
            >
              {{ option.name }}
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
        <b-form-group
          v-if="config.addr"
          label-cols="3"
          label-cols-md="4"
          label-cols-lg="3"
          label="Address"
          label-for="ptd-input-20"
          label-size="sm"
        >
          <template #label>
            <translate> Address </translate>
          </template>
          <b-form-textarea
            size="sm"
            id="ptd-input-20"
            v-model="form.addr"
            rows="2"
            trim
            :readonly="!editFlag"
            tabindex="-1"
          />
        </b-form-group>
        <b-form-group
          v-if="config.pin"
          label-cols="3"
          label-cols-md="4"
          label-cols-lg="3"
          label="Postal Code"
          label-for="ptd-input-30"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="ptd-input-30"
            v-model="form.pin"
            trim
            :readonly="!editFlag"
            tabindex="-1"
          />
        </b-form-group>
        <b-form-group
          v-if="config.state && isIndia && isIndianParty"
          label="State"
          label-for="ptd-input-50"
          label-size="sm"
          label-cols="3"
          label-cols-md="4"
          label-cols-lg="3"
        >
          <template #label>
            <translate> State </translate>
          </template>
          <b-form-select
            size="sm"
            id="ptd-input-50"
            v-model="form.state"
            :options="!editFlag ? form.options.states : options.states"
            @input="setPartyGst"
            trim
            :disabled="!editFlag"
          />
        </b-form-group>

        <b-form-group
          v-if="config.gstin && gstFlag"
          label-cols="3"
          label-cols-md="4"
          label-cols-lg="3"
          label="GSTIN"
          label-for="ptd-input-60"
          label-size="sm"
        >
          <b-form-input
            v-if="!editFlag"
            size="sm"
            id="ptd-input-60"
            v-model="form.gstin"
            trim
            :readonly="!editFlag"
            tabindex="-1"
          />
          <gk-gstin
            v-else
            v-model="form.gstin"
            @gstin_data="onGstinDataFetched"
            @validity="checkGstinValidity"
          />
        </b-form-group>
        <b-form-group
          v-else-if="config.tin && vatFlag"
          label-cols="3"
          label-cols-md="4"
          label-cols-lg="3"
          label="TIN"
          label-for="ptd-input-70"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="ptd-input-70"
            v-model="form.tin"
            trim
            :readonly="!editFlag"
            tabindex="-1"
            pattern="[A-Z0-9]+"
            minlength="10"
            maxlength="11"
          />
        </b-form-group>
        <div v-if="editFlag">
          <b-button
            @click.prevent="onPartyEdit(false)"
            variant="danger"
            size="sm"
            class="mr-1"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="x-circle"
            /><span
              v-translate
              class="align-middle"
            >Cancel</span>
          </b-button>
          <b-button
            @click.prevent="onPartyEdit(true)"
            variant="success"
            size="sm"
            :disabled="!!form.gstin && !isValidGstin"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="cloud-arrow-up"
            />
            <span
              v-translate
              class="align-middle"
            >Save Changes</span>
          </b-button>
        </div>
      </div>
    </div>

    <!-- Create Contact Item modal -->
    <!-- <b-modal
      size="lg"
      v-if="config"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      header-bg-variant="dark"
      title="Create Contact"
      header-text-variant="light"
      header-class="p-2"
    >
      <contact-item
        :hideBackButton="true"
        :onSave="onContactSave"
        mode="create"
        :type="form.type"
        :inOverlay="true"
        :showHeader="false"
      >
      </contact-item>
    </b-modal> -->
  </b-card>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import GkGstin from '../../GkGstin.vue';
// import ContactItem from '../ContactItem.vue';
export default {
  name: 'PartyDetails',
  components: {
    // ContactItem,
    GkGstin,
  },
  props: {
    mode: {
      type: String,
      validator: function(value) {
        return ['sale', 'purchase'].indexOf(value) !== -1;
      },
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    config: {
      type: Object,
      required: false,
    },
    gstFlag: {
      type: Boolean,
      required: true,
    },
    vatFlag: {
      type: Boolean,
      required: true,
    },
    saleFlag: {
      type: Boolean,
      required: true,
    },
    invoiceParty: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
    parentData: {
      type: Object,
      required: false,
      default: function() {
        return {
          loading: false,
          options: {
            states: [],
            gstin: [],
          },
          type: 'customer', // supplier
          custid: null,
          name: { name: '' },
          addr: null,
          state: {
            id: null,
            name: '',
          },
          gstin: null,
          tin: null,
          pin: null,
          pan: '',
          checksum: '',
        };
      },
    },
    editInvoice: Boolean,
    icflag: {
      type: Number,
      required: false,
      default: 9, // 3 - cash memo, 9 - invoice
    },
  },
  data() {
    return {
      isValidGstin: false,
      form: {
        loading: false,
        options: {
          states: [],
          gstin: [],
        },
        type: 'customer', // supplier
        custid: null,
        name: { name: '' },
        addr: null,
        state: {
          id: null,
          name: '',
        },
        gstin: null,
        tin: null,
        pin: null,
        pan: '',
        checksum: '',
      },
      options: {
        customers: [],
        suppliers: [],
        csData: {},
        states: [],
      },
      bankDetails: {},
      editFlag: false,
      loading: false,
      editMode: {
        addr: null,
        state: {
          id: null,
          name: '',
        },
        gstin: null,
        pin: null,
      },
      isCollapsed: true,
      isPreloading: false,
    };
  },
  computed: {
    isCustomer: (self) => self.form.type === 'customer',
    isNameDisabled: (self) => {
      if (typeof self.config['name'] === 'object') {
        return !!self.config['name'].disabled;
      }
      return false;
    },
    isPartySelected: (self) => (self.form.name ? !!self.form.name?.name : false),
    isIndianParty: (self) => !self.form.country || self.form.country === 'India',
    ...mapGetters('global', ['isIndia']),
  },
  watch: {
    isPartySelected() {
      this.onUpdateDetails();
    },
    saleFlag(isSale) {
      this.form.type = isSale ? 'customer' : 'supplier';
    },
    isCustomer() {
      this.onUpdateDetails();
    },
    updateCounter() {
      const partyName = this.parentData.name;
      if (!partyName) {
        this.resetPartyDetails();
        return;
      }
      let party;
      if (this.parentData.type === 'customer') {
        party = this.options.customers.find((cust) => cust.name === partyName);
      } else {
        party = this.options.suppliers.find((sup) => sup.name === partyName);
      }
      if (party) {
        // this.isPreloading = true;
        this.form.name = party;
        this.onPartyNameSelect(this.form.name);
      }
    },
    icflag(flag) {
      // Reset party details for cash memos (flag 3) since they aren't valid
      if (flag === 3) {
        this.resetPartyDetails();
      }
    },
  },
  methods: {
    checkGstinValidity(r) {
      this.isValidGstin = r.validity.format;
    },
    onGstinDataFetched({ name, addr, pincode, pan, statecode }) {
      this.form.name.name = name;
      this.form.addr = addr;
      //       this.form.state= {};
      this.form.pin = pincode;
      this.form.pan = pan;
      if (statecode) {
        let stateData = this.options.states.find(
          (state) => state.value.id === parseInt(statecode, 10).toString()
        );
        this.form.state = typeof stateData === 'object' ? stateData.value : this.form.state;
      }
    },
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'party-details',
          bankDetails: this.bankDetails,
        })
      );
    },
    resetPartyDetails() {
      this.form = Object.assign({}, this.form, {
        name: { name: '' },
        addr: null,
        options: {
          states: [],
          gstin: null,
        },
        state: {
          id: null,
          name: '',
        },
        pin: '',
        gstin: '',
        tin: '',
        checksum: '',
        editFlag: false,
      });
      // this.setShippingDetails();
    },
    /**
     * setPartyGst()
     *
     * Description: Sets the party GSTIN field, based on the state chosen
     */
    setPartyGst() {
      /**
       * form.party.options = {'stateid': 'gstin', 'stateid2': 'gstin2}
       */
      if (this.form.options.gstin && this.form.state) {
        if (this.form.gstin) {
          this.form.checksum = this.form.gstin.substr(12, 3);
        }
      }
    },
    /**
     * fetchCustomerData(id)
     *
     * Description: Fetch customer/supplier data, for 'Billed To/By' section
     */
    fetchCustomerData(id) {
      if (id !== null) {
        let data = this.options.csData[id];
        if (data) {
          this.setCustomerData(data);
          this.isPreloading = false;
          return;
        }
        this.isPreloading = true;
        let self = this;
        axios
          .get(`/customer/${id}`)
          .then((resp) => {
            switch (resp.data.gkstatus) {
            case 0:
              self.setCustomerData(resp.data.gkresult);
              break;
            case 2:
              self.resetPartyDetails(); // if there no data, then reset the fields
              this.displayToast(
                this.$gettext('Fetch Customer/Supplier Data Error!'),
                this.$gettext('Unauthorized Access, Please contact Admin'),
                'warning'
              );
              break;
            case 3:
            default:
              self.resetPartyDetails(); // if there no data, then reset the fields
              this.displayToast(
                this.$gettext('Fetch Customer/Supplier Data Error!'),
                this.$gettext(
                  'Unable to Fetch Customer/Supplier Data, Please try again'
                ),
                'danger'
              );
            }
            self.isPreloading = false;
            // debugger;
            // self.setShippingDetails(); // updates shipping details as well if flag is set
          })
          .catch((error) => {
            this.displayToast(
              this.$gettext('Fetch Customer/Supplier Data Error!'),
              error.message,
              'warning'
            );
            self.isPreloading = false;
          });
      }
    },
    /**
     * setCustomerData
     *
     * Sets the customer/supplier data and adds the data to csData = {custid :data} for future use
     */
    setCustomerData(data) {
      // convert [{id: name}, {id2: name}] to {id: name, id2: name}, to remove duplicates
      var stateList =
        data.statelist.reduce((acc, item) => {
          acc[Object.keys(item)[0]] = Object.values(item)[0];
          return acc;
        }, {}) || {};
      // convert it back to array format for <b-form-select> options
      var states = Object.keys(stateList).map((key) => {
        return {
          text: stateList[key],
          value: { id: key, name: stateList[key] },
        };
      });
      this.form = Object.assign({}, this.form, {
        addr: data.custaddr,
        options: {
          states,
          gstin: data.gstin,
        },
        state: states?.[0]?.value ?? { id: null, name: ''},
        country: data.country,
        pan: data.custpan,
        checksum: '',
        pin: data.pincode,
        gstin:  data.gstin ? Object.values(data.gstin)[0] : '',
        tin: data.tin,
      });

      this.bankDetails = data.bankdetails
        ? data.bankdetails
        : {
          accountno: '',
          bankname: '',
          branchname: '',
          ifsc: '',
        };

      setTimeout(() => {
        this.setPartyGst(); // set gstin based on state
      });
      this.options.csData[data.custid] = data;
      this.onUpdateDetails();
    },
    /**
     * onPartyNameSelect(name)
     *
     * Description -> Updates the BilledTo and Shipping Details based on the Customer/Supplier chosen.
     * Here party is the Customer/Supplier
     *
     * argument -> name: {id , name}
     */
    onPartyNameSelect(name) {
      if (name) {
        if (name.id) {
          this.fetchCustomerData(name.id);
          return;
        }
      }

      // if the name is invalid, empty the BilledTo & Shipping Details if it exists
      if (this.form.addr || this.form.options.states.length) {
        this.form = Object.assign({}, this.form, {
          options: {
            states: [],
            gstin: [],
          },
          addr: null,
          state: {
            id: null,
            name: '',
          },
          gstin: null,
          tin: null,
          pin: null,
        });
        // this.setShippingDetails();
        this.onUpdateDetails();
      }
    },
    resetForm() {
      this.form = {
        name: { name: '' },
        address: null,
        state: {
          id: null,
          name: '',
        },
        contactNumber: null,
        contactPerson: null,
      };
      this.bankDetails = {
        accountno: '',
        bankname: '',
        branchname: '',
        ifsc: '',
      };
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
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get('/state').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch State Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        this.fetchContactList(),
      ];

      const self = this;
      return Promise.all(requests)
        .then(([resp1]) => {
          self.isPreloading = false;
          if (resp1.data.gkstatus === 0) {
            self.options.states = resp1.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: {
                  id: Object.keys(item)[0],
                  name: Object.values(item)[0],
                },
              };
            });
          }
        })
        .catch(() => {
          self.isPreloading = false;
        });
    },
    fetchContactList() {
      const requests = [
        axios.get('/customer?qty=custall').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Customer Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get('/customer?qty=supall').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Supplier Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      let self = this;
      return Promise.all(requests)
        .then(([resp1, resp2]) => {
          // debugger;
          // === Customer List ===
          if (resp1.status === 200) {
            if (resp1.data.gkstatus === 0) {
              resp1.data.gkresult.sort((a, b) => a.custid - b.custid); // sorting items based on custid, to display in the order of creation
              self.options.customers = resp1.data.gkresult.map((item) => {
                return {
                  id: item.custid,
                  name: item.custname,
                };
              });
            } else {
              // Customer List not loaded
            }
          }

          // === Supplier List ===
          if (resp2.status === 200) {
            if (resp2.data.gkstatus === 0) {
              resp2.data.gkresult.sort((a, b) => a.custid - b.custid); // sorting items based on custid, to display in the order of creation
              self.options.suppliers = resp2.data.gkresult.map((item) => {
                return {
                  id: item.custid,
                  name: item.custname,
                };
              });
            } else {
              // Supplier list not loaded
            }
          }

          // If coming from Contact's page, autofill invoice party details from store
          if (self.invoiceParty.id !== null) {
            // self.form.inv.type =
            //   self.invoiceParty.type === 'customer' ? 'sale' : 'purchase';
            self.form = Object.assign({}, self.form, {
              type: self.invoiceParty.type,
              name: {
                id: self.invoiceParty.id,
                name: self.invoiceParty.name,
              },
            });
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Customer/Supplier Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
    onContactSave() {
      const self = this;
      this.fetchContactList().then(() => {
        if (self.options.customers.length) {
          self.form.name =
            self.form.type === 'customer'
              ? self.options.customers[self.options.customers.length - 1].value
              : self.options.suppliers[self.options.suppliers.length - 1].value;
        }
      });
    },
    initPartyEdit() {
      // debugger;
      this.editFlag = true;
      this.editMode = {
        addr: this.form.addr,
        state: this.form.state,
        gstin: this.form.gstin,
        tin: this.form.tin,
        pin: this.form.pin,
        pan: this.form.pan,
      };
    },
    onPartyEdit(edited) {
      if (edited) {
        this.form.loading = true;
        let payload = {
          csflag: this.form.type === 'customer' ? 3 : 19,
          custaddr: this.form.addr,
          custid: this.form.name?.id,
          custname: this.form.name?.name,
          pincode: this.form.pin,
          state: this.form.state.name,
          custpan: this.form.pan,
          tin: this.form.tin,
        };
        if (this.form.gstin) {
          payload.gstin = {};
          payload.gstin[this.form.state.id] = this.form.gstin;
        }
        axios
          .put(`customer/${payload.custid}`, payload)
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              delete this.options.csData[this.form.name?.id];
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.form.loading = false;
            this.onPartyNameSelect(this.form?.name);
          });
      } else {
        this.form.addr = this.editMode.addr;
        this.form.state = this.editMode.state;
        this.form.gstin = this.editMode.gstin;
        this.form.tin = this.editMode.tin;
        this.form.pin = this.editMode.pin;
        this.form.pan = this.editMode.pan;
      }
      this.editFlag = false;
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>
