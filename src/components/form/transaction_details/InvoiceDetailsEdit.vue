<template>
  <b-card
    v-if="config"
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="p-2 p-md-3">
      <div>
        <b v-translate>Invoice Details</b>
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
        class="mt-3"
        :class="{'d-md-block': true, 'd-none': !isCollapsed}"
      >
        <b-form-group
          v-if="config.no"
          label="Inv. #"
          label-for="ivd-input-10"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <template #label>
            <translate> Inv. # </translate>
          </template>
          <b-form-input
            size="sm"
            id="ivd-input-10"
            v-model="form.no"
            trim
            required
            readonly
            :tabindex="disabled.no ? -1 : 0"
          />
        </b-form-group>
        <b-form-group
          v-if="config.date"
          label="Date"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
          id="ivd-input-group-1"
        >
          <template #label>
            <translate> Date </translate>
          </template>
          <gk-date
            id="ivd-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="maxDate"
            @validity="setDateValidity"
            :required="true"
            :readonly="disabled.date"
          />
        </b-form-group>
        <b-form-group
          v-if="!saleFlag && config.supInvNo"
          label="Supplier Inv. #"
          label-for="ivd-input-11"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <template #label>
            <translate> Supplier Inv. # </translate>
          </template>
          <b-form-input
            size="sm"
            id="ivd-input-11"
            v-model="form.supno"
            trim
            :readonly="disabled.supNo"
          />
        </b-form-group>
        <b-form-group
          v-if="!saleFlag && config.supInvDate"
          label="Supplier Inv. Date"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
          id="ivd-input-group-11"
        >
          <template #label>
            <translate> Supplier Inv. Date </translate>
          </template>
          <gk-date
            id="ivd-date-11"
            :format="dateFormat"
            v-model="form.supdate"
            :readonly="disabled.supDate"
          />
        </b-form-group>
        <b-form-group
          v-if="isIndia"
          label="Place of Supply"
          label-for="ivd-input-11"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
          :label-class="{required: !disabled.supplySt && parentData.gstin}"
        >
          <template #label>
            <translate> Place of Supply </translate>
          </template>
          <v-select
            id="ivd-input-11"
            v-model="form.taxState"
            :options="options.states"
            :required="true"
            @input="onUpdateDetails"
            :disabled="disabled.supplySt && (selectedPurpose !== 12)"
            label="name"
          />
        </b-form-group>
        <b-form-group
          :label="saleFlag ? 'From Godown' : 'To Godown'"
          label-for="ivd-input-21"
          label-size="sm"
          label-cols="3"
          label-cols-md="4"
          :label-class="{required: !disabled.godown}"
        >
          <template #label>
            <span
              v-translate
              v-if="saleFlag"
            > From Godown </span>
            <span
              v-translate
              v-else
            > To Godown </span>
          </template>
          <v-select
            id="ivd-input-21"
            v-model="form.godown"
            :options="options.godowns"
            @input="onUpdateDetails"
            :required="true"
            :disabled="disabled.godown"
            :reduce="(godown) => godown.value"
            label="text"
          />
        </b-form-group>
        <b-form-group
          v-if="saleFlag && config.ebn"
          label="Eway Bill #"
          label-for="ivd-input-30"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <template #label>
            <translate> Eway Bill # </translate>
          </template>
          <b-form-input
            size="sm"
            id="ivd-input-30"
            v-model="form.ebn"
            trim
          />
        </b-form-group>
        <b-form-group
          v-if="config.gstin && isGstEnabled"
          label="GSTIN"
          label-for="ivd-input-40"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="ivd-input-40"
            v-model="form.gstin"
            trim
            required
            readonly
            tabindex="-1"
          />
        </b-form-group>
        <b-form-group
          v-if="saleFlag && config.addr"
          label-cols="3"
          label-cols-md="4"
          label="Address"
          label-for="ivd-input-50"
          label-size="sm"
        >
          <template #label>
            <translate> Address </translate>
          </template>
          <b-form-textarea
            size="sm"
            id="ivd-input-50"
            v-model="form.addr"
            rows="2"
            max-rows="2"
            trim
            required
            readonly
            tabindex="-1"
          />
        </b-form-group>
        <b-row>
          <b-col
            class="pr-lg-2"
            cols="12"
            v-if="saleFlag && config.pin"
          >
            <b-form-group
              label-cols-md="4"
              label-cols="3"
              label="Postal Code"
              label-for="ivd-input-60"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="ivd-input-60"
                v-model="form.pin"
                trim
                readonly
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
          <b-col v-if="config.state && isIndia">
            <b-form-group
              label="State"
              label-for="ivd-input-70"
              label-size="sm"
              label-cols-md="4"
              label-cols="3"
            >
              <template #label>
                <translate> State </translate>
              </template>
              <v-select
                id="ivd-input-70"
                v-model="form.state"
                :options="options.states"
                required
                :disabled="true"
                :tabindex="-1"
                :reduce="(state) => state.name"
                label="name"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row v-if="saleFlag">
          <b-col v-if="config.issuer">
            <b-form-group
              label="Issuer"
              label-for="ivd-input-80"
              label-cols-md="4"
              label-cols="3"
              label-size="sm"
            >
              <template #label>
                <translate> Issuer </translate>
              </template>
              <b-form-input
                size="sm"
                id="ivd-input-80"
                v-model="form.issuer"
                trim
                required
                readonly
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
          <b-col
            v-if="config.role"
            cols="12"
          >
            <b-form-group
              label="Role"
              label-for="ivd-input-90"
              label-cols-md="4"
              label-cols="3"
              label-size="sm"
            >
              <template #label>
                <translate> Role </translate>
              </template>
              <b-form-input
                size="sm"
                id="ivd-input-90"
                v-model="form.role"
                trim
                required
                readonly
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
        </b-row>
      </div>
    </div>
  </b-card>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import GkDate from '../../GkDate.vue';
import trnDetailsMixin from '@/mixins/transactionProfile.js';
import { EventBus } from '@/js/eventBus';

export default {
  name: 'InvoiceDetailsEdit',
  components: { GkDate },
  mixins: [trnDetailsMixin],
  props: {
    // editFlag: {
    //   type: Boolean,
    //   required: true,
    // },
    saleFlag: {
      type: Boolean,
      required: true,
    },
    config: {
      type: Object,
      required: true,
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
        return {};
      },
    },
  },
  data() {
    return {
      selectedPurpose: '',
      isCollapsed: true,
      isPreloading: false,
      invNo: {
        sale: '',
        purchase: '',
      },
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      form: {
        no: null,
        date: new Date().toISOString().slice(0, 10),
        supno: null,
        supdate: null,
        delNote: null,
        dnNo: '',
        godown: null,
        ebn: null,
        addr: null,
        pin: null,
        gstin: null,
        state: { name: '' },
        issuer: null,
        role: null,
        taxState: { name: '' },
      },
      dnNo: null, // delivery note number
      options: {
        delNoteNo: {},
        godowns: [],
        states: [],
        orgDetails: {},
        delNotes: {
          sale: [],
          purchase: [],
        },
      },
    };
  },
  computed: {
    delNoteOptions: (self) =>
      self.saleFlag
        ? self.options.delNotes.sale
        : self.options.delNotes.purchase,
    disabled: (self) => {
      let disabled = {
        no: false,
        date: false,
        state: false,
        supplySt: false,
        godown: false,
        supNo: false,
        supDate: false,
      };

      if (typeof self.config.no === 'object') {
        disabled.no = !!self.config.no.disabled;
      }

      if (typeof self.config.date === 'object') {
        disabled.date = !!self.config.date.disabled;
      }

      if (typeof self.config.state === 'object') {
        disabled.state = !!self.config.state.disabled;
      }

      if (typeof self.config.supplySt === 'object') {
        disabled.supplySt = !!self.config.supplySt.disabled;
      }

      if (typeof self.config.godown === 'object') {
        disabled.godown = !!self.config.godown.disabled;
      }

      if (typeof self.config.supInvNo === 'object') {
        disabled.supNo = !!self.config.supInvNo.disabled;
      }

      if (typeof self.config.supInvDate === 'object') {
        disabled.supDate = !!self.config.supInvDate.disabled;
      }

      return disabled;
    },
    ...mapGetters('global', ['isIndia', 'isGstEnabled']),
  },
  watch: {
    updateCounter() {
      const self = this;
      this.isPreloading = true;
      this.resetForm(false)
        .then(() => {
          if (self.parentData.no) {
            self.form.no = self.parentData.no;
          }
          
          if (self.parentData.date) {
            self.form.date = self.parentData.date;
          }

          if (self.parentData.supinvno) {
            self.form.supinvno = self.parentData.supinvno;
          }

          if (self.parentData.supinvdate) {
            self.form.supinvdate = self.parentData.supinvdate;
          }

          if (self.parentData.state) {
            if (self.parentData.state.id) {
              self.form.state = self.parentData.state;
            }
          }

          if (self.parentData.taxState) {
            if (self.parentData.taxState.id) {
              self.form.taxState = self.parentData.taxState;
            }
          }

          if (self.parentData.godown) {
            self.form.godown = self.parentData.godown;
          }

          if (self.parentData.supdate) {
            self.form.supdate = self.parentData.supdate;
          }

          if (self.parentData.supno) {
            self.form.supno = self.parentData.supno;
          }

          self.onUpdateDetails();
          self.isPreloading = false;
        })
        .catch(() => {
          self.isPreloading = false;
        });
    },
    // saleFlag() {
    //   this.setInvoiceNo();
    //   this.updateDelNoteNo();
    //   this.form.godown = '';
    //   this.$nextTick().then(() => {
    //     this.form.godown = this.$store.getters['global/getDefaultGodown'];
    //   });
    // },
  },
  created() {
    EventBus.$on('dropdown-change', this.handleDropdownChange);
  },
  methods: {
    handleDropdownChange(value) {
      this.selectedPurpose = value;
    },
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'invoice-details',
          options: {
            dateValid: this.date.valid,
          },
        })
      );
    },

    /**
     * setInvoiceNo()
     *
     * Description: Auto invoice numbering, based on invoice type
     * Using the /invoice?getinvid API
     */
    setInvoiceNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag ? this.invNo.sale : this.invNo.purchase;
        if (this.form.no) {
          return Promise.resolve(1);
        }
      } else {
        this.invNo = {
          sale: '',
          purchase: '',
        };
      }
      if (this.config && this.config.no && this.config.no.counter) {
        let codes = this.config.no.format
          ? this.config.no.format.code
          : { sale: 'SL', purchase: 'PU' };
        let code = this.saleFlag ? codes.sale : codes.purchase;
        let counter = this.saleFlag
          ? this.config.no.counter.sale
          : this.config.no.counter.purchase;
        this.form.no = this.formatNoteNo(
          this.numberFormat,
          parseInt(counter),
          code,
          this.form.date,
          this.yearEnd
        );
        this.invNo[this.saleFlag ? 'sale' : 'purchase'] = this.form.no;
        return Promise.resolve(1);
      } else {
        // inoutflag = 9-purchase, 15-sale
        let self = this;
        let inoutflag = this.saleFlag ? 15 : 9;
        return axios
          .get(`/invoice/next_id?type=${inoutflag}`)
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              let codes = self.config.no.format
                ? self.config.no.format.code
                : { sale: 'SL', purchase: 'PU' };
              let code = self.saleFlag ? codes.sale : codes.purchase;
              self.form.no = self.formatNoteNo(
                self.numberFormat,
                parseInt(resp.data.invoiceid),
                code,
                self.form.date,
                self.yearEnd
              );
              self.invNo[self.saleFlag ? 'sale' : 'purchase'] = self.form.no;
            }
          })
          .catch((error) => {
            return error;
          });
      }
    },
    fetchUserData() {
      let self = this;
      return axios
        .get(`/gkuser`)
        .then((resp) => {
          // === User name and role ===
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              self.form.issuer = resp.data.gkresult.username;
              self.form.role = resp.data.gkresult.userroleName;
              self.form.userid = resp.data.gkresult.userid;
            } else {
              // User data not available, check again
            }
          } else {
            // User data not available, check again
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch User Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
    setOrgDetails() {
      if (this.options.orgDetails !== null) {
        if (this.options.orgDetails.orgname) {
          let orgstate = (this.options.orgDetails.orgstate || '').toLowerCase();
          let state = orgstate
            ? this.options.states.find(
              (state) => state.name.toLowerCase() === orgstate
            )
            : null;
          let stateCode = state ? state.id : '';
          if (stateCode && stateCode < 9) {
            stateCode = `0${stateCode}`;
          }
          let gstin = this.options.orgDetails.gstin;
          Object.assign(this.form, {
            addr: this.options.orgDetails.orgaddr,
            pin: this.options.orgDetails.orgpincode,
            state: state ? state.name : { name: '' },
            options: {
              gstin: gstin,
            },
            gstin: gstin && state ? gstin[stateCode] : '',
            taxState: { name: '' },
          });
        }
      }
      this.$forceUpdate();
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
        axios.get(`/organisation`).catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Organisation Profile Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/godown`).catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Godowns Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        this.fetchUserData(),
        // this.fetchDelNotes(),
      ];
      const self = this;
      return Promise.all(requests)
        .then(([resp1, resp2, resp3]) => {
          this.isPreloading = false;
          if (resp1.data.gkstatus === 0) {
            self.options.states = resp1.data.gkresult.map((item) => {
              return {
                id: Object.keys(item)[0],
                name: Object.values(item)[0],
              };
            });
            if (resp2.data.gkstatus === 0) {
              self.options.orgDetails = resp2.data.gkdata;
              setTimeout(() => {
                self.setOrgDetails();
              }, 1);
            }
            if (resp3.data.gkstatus === 0) {
              self.options.godowns = resp3.data.gkresult.map((godown) => {
                return {
                  text: `${godown.goname} (${godown.goaddr})`,
                  value: godown.goid,
                };
              });
            }
          }
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    resetForm(raiseUpdateEvent) {
      let requests = [];
      const self = this;
      this.setOrgDetails();
      if (this.disabled.state) {
        this.form.state = '';
      }
      this.form.date = !this.disabled.date ? this.getNoteDate() : '';
      if (!this.disabled.no) {
        // requests.push(this.setInvoiceNo(true));
      }
      this.form.godown = '';
      this.$nextTick().then(() => {
        if (self.form.godown === '') {
          self.$store.dispatch('global/initDefaultGodown').then((defGodown) => {
            self.form.godown = defGodown;
          });
        }
      });

      if (raiseUpdateEvent) {
        this.onUpdateDetails();
      }
      //   requests.push(this.updateDelNoteNo(true));
      return Promise.all(requests);
    },
  },
  mounted() {
    const self = this;
    this.preloadData().then(() => {
      self.resetForm(true);
    });
  },
  beforeDestroy() {
    EventBus.$off('dropdown-change', this.handleDropdownChange);
  }
};
</script>
