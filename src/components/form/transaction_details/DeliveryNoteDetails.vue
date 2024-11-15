<template>
  <b-card
    class="mb-2 mb-md-0 mr-md-1 ml-md-1"
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
        <b v-translate>Delivery Note Details</b>
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
          label="Del. Note No."
          label-for="dnd-input-10"
          label-cols="4"
          label-size="sm"
          label-class="required"
        >
          <template #label>
            <translate> Del. Note No. </translate>
          </template>
          <b-form-input
            size="sm"
            id="dnd-input-10"
            v-model="form.no"
            trim
            required
          />
        </b-form-group>
        <b-form-group
          label="Date"
          label-cols="4"
          label-size="sm"
          id="dnd-input-group-1"
          label-class="required"
        >
          <template #label>
            <translate> Date </translate>
          </template>
          <gk-date
            id="dnd-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="maxDate"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <b-form-group
          label="Transaction Type"
          label-for="dnd-input-20"
          label-cols="4"
          label-size="sm"
          label-class="required"
        >
          <template #label>
            <translate> Transaction Type </translate>
          </template>
          <b-form-select
            id="dnd-input-20"
            v-model="form.type"
            size="sm"
            :options="options.transactionTypes"
          />
        </b-form-group>
        <b-form-group
          :label="saleFlag ? 'Origin State' : 'Destination State'"
          label-for="dnd-input-30"
          label-size="sm"
          label-cols="4"
          label-class="required"
        >
          <template #label>
            <span
              v-if="saleFlag"
              v-translate
            > Origin State </span>
            <span
              v-else
              v-translate
            > Destination State </span>
          </template>
          <v-select
            id="dnd-input-30"
            v-model="form.state"
            :options="options.states"
            @input="onSelectState(form.state)"
            required
            label="name"
          />
        </b-form-group>
        <b-form-group
          :label="saleFlag ? 'From Godown' : 'To Godown'"
          label-for="dnd-input-40"
          label-size="sm"
          label-cols="4"
          label-class="required"
        >
          <template #label>
            <span
              v-if="saleFlag"
              v-translate
            > From Godown </span>
            <span
              v-else
              v-translate
            > To Godown </span>
          </template>
          <v-select
            id="dnd-input-40"
            v-model="form.godown"
            :options="options.godowns"
            @input="onUpdateDetails"
            required
            label="text"
            :reduce="(gdata) => gdata.value"
          />
        </b-form-group>
        <b-form-group
          label="Place of Supply"
          label-for="dnd-input-41"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
          label-class="required"
        >
          <template #label>
            <translate> Place of Supply </translate>
          </template>
          <v-select
            id="dnd-input-41"
            v-model="form.taxState"
            :options="options.states"
            :required="true"
            @input="onUpdateDetails"
            label="name"
          />
        </b-form-group>
        <b-form-group
          label="GSTIN"
          label-for="dnd-input-50"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dnd-input-50"
            v-model="form.gstin"
            trim
            required
            readonly
          />
        </b-form-group>
        <b-form-group
          label="Issuer"
          label-for="dnd-input-60"
          label-size="sm"
          label-cols="4"
        >
          <template #label>
            <translate> Issuer </translate>
          </template>
          <b-form-input
            size="sm"
            id="dnd-input-60"
            v-model="form.issuer"
            trim
            required
            readonly
            tabindex="-1"
          />
        </b-form-group>
        <b-form-group
          label="Role"
          label-for="dnd-input-70"
          label-cols="4"
          label-size="sm"
        >
          <template #label>
            <translate> Role </translate>
          </template>
          <b-form-input
            size="sm"
            id="dnd-input-70"
            v-model="form.role"
            trim
            required
            readonly
            tabindex="-1"
          />
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>

<script>
import axios from 'axios';
import GkDate from '../../GkDate.vue';

import trnDetailsMixin from '@/mixins/transactionProfile.js';

export default {
  name: 'DeliveryNoteDetails',
  components: {
    GkDate,
  },
  mixins: [trnDetailsMixin],
  props: {
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
      isCollapsed: false,
      isPreloading: false,
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      delchalNo: {
        sale: '',
        purchase: '',
      },
      options: {
        orgDetails: null,
        transactionTypes: [
          { text: 'Approval', value: 1 },
          { text: 'Consignment', value: 3 },
          { text: 'Free Replacement', value: 6 },
          { text: 'Sale', value: 4 },
          { text: 'Purchase', value: 16 },
          { text: 'Sample', value: 19 },
        ],
        godowns: [],
        states: [],
        lastDelChal: {
          sale: null,
          purchase: null,
        },
      },
      form: {
        no: null,
        date: new Date().toISOString().slice(0, 10),
        state: { name: '' },
        godown: null,
        type: null,
        gstin: null,
        issuer: null,
        role: null,
        taxState: { name: '' },
        options: {
          gstin: {},
        },
      },
    };
  },
  computed: {},
  watch: {
    saleFlag() {
      this.setDelChalNo();
    },
    updateCounter() {
      const self = this;
      this.isPreloading = true;
      this.resetForm(false)
        .then(() => {
          if (self.parentData.taxState) {
            if (self.parentData.taxState.id) {
              self.form.taxState = self.parentData.taxState;
            }
          }
          self.isPreloading = false;
          self.onUpdateDetails();
        })
        .catch(() => {
          self.isPreloading = false;
          self.onUpdateDetails();
        });
    },
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    setDelChalNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag
          ? this.delchalNo['sale']
          : this.delchalNo['purchase'];
        if (this.form.no) {
          return Promise.resolve(1);
        }
      } else {
        this.delchalNo = {
          sale: '',
          purchase: '',
        };
      }
      if (this.config.no) {
        return this.getLastDelChalNo().then((no) => {
          let codes = this.config.no.format
            ? this.config.no.format.code
            : { in: 'DIN', out: 'DOUT' };
          let code = this.saleFlag ? codes.out : codes.in;
          if (isNaN(no)) {
            this.form.no = no;
          } else {
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              no,
              code,
              this.form.date
            );
            this.delchalNo[this.saleFlag ? 'sale' : 'purchase'] = this.form.no;
          }
        });
      }
      return Promise.resolve(1);
    },
    getLastDelChalNo() {
      const self = this;
      return this.fetchLastDelChalNo().then(() => {
        return self.saleFlag
          ? self.options.lastDelChal.sale
          : self.options.lastDelChal.purchase;
      });
    },
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'delivery-note-details',
        })
      );
    },
    onSelectState(state) {
      // set DelNote Gstin based on state
      if (state) {
        this.form.gstin = this.form.options.gstin[state.id];
      }
      this.onUpdateDetails();
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
          let gstin = this.options.orgDetails.gstin;
          Object.assign(this.form, {
            addr: this.options.orgDetails.orgaddr,
            pin: this.options.orgDetails.orgpincode,
            state: state ? state : { name: '' },
            options: {
              gstin: gstin || {},
            },
            gstin: gstin && state ? gstin[state.id] : '',
            taxState: { name: '' },
          });
        }
      }
      this.$forceUpdate();
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
    fetchLastDelChalNo() {
      const requests = [
        // last purchase delivery chalan
        axios.get('/delchal/next_id?status=9').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Delivery Challan No. Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        // last sale delivery chalan
        axios.get('/delchal/next_id?status=15').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Delivery Challan No. Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      const self = this;
      return Promise.all(requests).then(([resp1, resp2]) => {
        if (resp1.data.gkstatus === 0) {
          self.options.lastDelChal.purchase = parseInt(resp1.data.dcid);
        }
        if (resp2.data.gkstatus === 0) {
          self.options.lastDelChal.sale = parseInt(resp2.data.dcid);
        }
      });
    },
    preloadData() {
      this.isPreloading = true;
      const requests = [
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
        axios.get('/state').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch State Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        this.fetchUserData(),
        this.fetchLastDelChalNo(),
      ];
      const self = this;
      return Promise.all(requests)
        .then(([resp1, resp2, resp3]) => {
          if (resp1.data.gkstatus === 0) {
            self.options.orgDetails = resp1.data.gkdata;
            setTimeout(() => {
              self.setOrgDetails();
            }, 1);
          }

          if (resp2.data.gkstatus === 0) {
            self.options.godowns = resp2.data.gkresult.map((godown) => {
              return {
                text: `${godown.goname} (${godown.goaddr})`,
                value: godown.goid,
              };
            });
          }

          if (resp3.data.gkstatus === 0) {
            self.options.states = resp3.data.gkresult.map((item) => {
              return {
                id: Object.keys(item)[0],
                name: Object.values(item)[0],
              };
            });
          }

          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    resetForm(raiseUpdateEvent) {
      this.setOrgDetails();
      this.form.date = this.getNoteDate();
      this.form.type = 1;
      let setNoPromise = this.setDelChalNo(true);
      if (raiseUpdateEvent) {
        this.onUpdateDetails();
      }
      return setNoPromise;
    },
  },
  mounted() {
    // translating strings from options
    this.options.transactionTypes = [
      { text: this.$gettext('Approval'), value: 1 },
      { text: this.$gettext('Consignment'), value: 3 },
      { text: this.$gettext('Free Replacement'), value: 6 },
      { text: this.$gettext('Sale'), value: 4 },
      { text: this.$gettext('Purchase'), value: 16 },
      { text: this.$gettext('Sample'), value: 19 },
    ];

    const self = this;
    this.preloadData().then(() => {
      self.resetForm(true).then(() => {
        self.form.godown = self.$store.getters['global/getDefaultGodown'];
      });
    });
  },
};
</script>
