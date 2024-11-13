<template>
  <b-card
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
        <b v-translate>Transfer Note Details</b>
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
          label="Transfer Note No."
          label-for="tnd-input-10"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
          label-class="required"
        >
          <template #label>
            <translate> Transfer Note No. </translate>
          </template>
          <b-form-input
            size="sm"
            id="tnd-input-10"
            v-model="form.no"
            trim
            required
          />
        </b-form-group>
        <b-form-group
          id="tnd-input-group-1"
          label="Date"
          label-cols-md="4"
          label-cols="3"
          label-for="tnd-date-1"
          label-size="sm"
          label-class="required"
        >
          <template #label>
            <translate> Date </translate>
          </template>
          <gk-date
            id="tnd-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="maxDate"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <b-form-group
          label="Dispatch From"
          label-for="tnd-input-20"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
          label-class="required"
        >
          <template #label>
            <translate> Dispatch From </translate>
          </template>
          <b-form-select
            id="tnd-input-20"
            v-model="form.godownFrom"
            :options="options.godowns"
            @input="onUpdateDetails"
            required
            label="text"
            :reduce="(gdata) => gdata.value"
            @change="validateSelections"
          />
        </b-form-group>
        <b-form-group
          label="Dispatch To"
          label-for="tnd-input-30"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
          label-class="required"
        >
          <template #label>
            <translate> Dispatch To </translate>
          </template>
          <b-form-select
            id="tnd-input-30"
            v-model="form.godownTo"
            :options="options.godowns"
            @input="onUpdateDetails"
            required
            label="text"
            :reduce="(gdata) => gdata.value"
            @change="validateSelections"
          />
          <span style="color: #ff0000;">{{ validationError }}</span>
        </b-form-group>
        <b-form-group
          label="Issuer"
          label-for="tnd-input-40"
          label-cols="3"
          label-size="sm"
          label-cols-md="4"
        >
          <template #label>
            <translate> Issuer </translate>
          </template>
          <b-form-input
            size="sm"
            id="tnd-input-40"
            v-model="form.issuer"
            trim
            required
            readonly
            tabindex="-1"
          />
        </b-form-group>
        <b-form-group
          label="Role"
          label-for="tnd-input-50"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <template #label>
            <translate> Role </translate>
          </template>
          <b-form-input
            size="sm"
            id="tnd-input-50"
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
  name: 'TransferNoteDetails',
  components: {
    GkDate,
  },
  mixins: [trnDetailsMixin],
  props: {
    config: {
      type: Object,
      required: true,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      validationError: '',
      isCollapsed: false,
      isPreloading: false,
      noteNo: '',
      options: {
        orgDetails: null,
        transactionTypes: [
          { text: 'Approval', value: 0 },
          { text: 'Consignment', value: 1 },
          { text: 'Free Replacement', value: 2 },
          { text: 'Purchase', value: 3 },
          { text: 'Sample', value: 4 },
        ],
        godowns: [],
        godownIdToName: [],
        states: [],
        lastDelChal: {
          sale: null,
          purchase: null,
        },
      },
      date: {
        valid: null,
      },
      form: {
        no: null,
        date: null,
        state: {},
        godownFrom: null,
        godownTo: null,
        type: null,
        gstin: null,
        issuer: null,
        role: null,
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
      this.resetForm();
    },
  },
  methods: {
    validateSelections() {
      if (this.form.godownFrom === this.form.godownTo) {
        this.validationError = 'Dispatch from and Dispatch to locations cannot be the same';
      } else {
        this.validationError = '';
      }
    },
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    setNoteNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.noteNo;
        if (this.form.no) {
          return;
        }
      } else {
        this.noteNo = '';
      }
      axios
        .get('/transfernote?type=all')
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let counter = resp.data.gkresult.length;
            let code = this.config.no.format
              ? this.config.no.format.code
              : 'TN';
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              counter + 1,
              code,
              this.form.date,
              this.yearEnd
            );
            this.noteNo = this.form.no;
          }
        })
        .catch((error) => {
          return error;
        });
    },
    onUpdateDetails() {
      const self = this;
      setTimeout(() =>
        this.$emit('details-updated', {
          data: self.form,
          name: 'transfer-note-details',
          options: {
            isDateValid: self.date.valid,
            godownFrom: self.options.godownIdToName[self.form.godownFrom],
            godownTo: self.options.godownIdToName[self.form.godownTo],
            isLocationValid: self.validationError,
          },
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
              (state) => state.text.toLowerCase() === orgstate
            )
            : null;
          let gstin = this.options.orgDetails.gstin;
          Object.assign(this.form, {
            addr: this.options.orgDetails.orgaddr,
            pin: this.options.orgDetails.orgpincode,
            state: state ? state.value : {},
            options: {
              gstin: gstin || {},
            },
            gstin: gstin && state ? gstin[state.value.id] : '',
          });
        }
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
        axios.get('/delchal/last?status=9').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Delivery Challan No. Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        // last sale delivery chalan
        axios.get('/delchal/last?status=15').catch((error) => {
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
          self.options.lastDelChal.purchase = resp1.data.gkresult.dcno;
        }
        if (resp2.data.gkstatus === 0) {
          self.options.lastDelChal.sale = resp2.data.gkresult.dcno;
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
            let idToName = {};
            let godowns = [];
            resp2.data.gkresult.forEach((godown) => {
              godowns.push({
                text: `${godown.goname} (${godown.goaddr})`,
                value: godown.goid,
              });
              idToName[godown.goid] = godown.goname;
            });
            self.options.godowns = godowns;
            self.options.godownIdToName = idToName;
          }

          if (resp3.data.gkstatus === 0) {
            self.options.states = resp3.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: {
                  id: Object.keys(item)[0],
                  name: Object.values(item)[0],
                },
              };
            });
          }

          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    resetForm() {
      this.setOrgDetails();
      this.form.date = this.getNoteDate();
      this.form.godownFrom = null;
      this.form.godownTo = null;
      this.setNoteNo(true);
      this.onUpdateDetails();
    },
  },
  mounted() {
    // translating strings from options
    this.options.transactionTypes = [
      { text: this.$gettext('Approval'), value: 0 },
      { text: this.$gettext('Consignment'), value: 1 },
      { text: this.$gettext('Free Replacement'), value: 2 },
      { text: this.$gettext('Purchase'), value: 3 },
      { text: this.$gettext('Sample'), value: 4 },
    ];

    const self = this;
    this.preloadData().then(() => {
      self.resetForm();
    });
  },
};
</script>
