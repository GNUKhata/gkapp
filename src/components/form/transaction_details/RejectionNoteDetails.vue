<template>
  <b-card
    class="mb-2 mb-md-0"
    border-variant="secondary"
    no-body
    :class="config.class"
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="p-2 p-md-3">
      <div>
        <b v-translate>Rejection Note Details</b>
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
          label="No."
          label-for="rnd-input-10"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <template #label>
            <translate> No. </translate>
          </template>
          <b-form-input
            size="sm"
            id="rnd-input-10"
            v-model="form.no"
            trim
            required
          />
        </b-form-group>
        <b-form-group
          label="Date"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
          id="rnd-input-group-1"
        >
          <template #label>
            <translate> Date </translate>
          </template>
          <gk-date
            id="rnd-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="maxDate"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <b-form-group
          label="Issuer"
          label-for="rnd-input-40"
          label-cols="3"
          label-size="sm"
          label-cols-md="4"
        >
          <template #label>
            <translate> Issuer </translate>
          </template>
          <b-form-input
            size="sm"
            id="rnd-input-40"
            v-model="form.issuer"
            trim
            required
            readonly
            tabindex="-1"
          />
        </b-form-group>
        <b-form-group
          label="Role"
          label-for="rnd-input-50"
          label-cols="3"
          label-cols-md="4"
          label-size="sm"
        >
          <template #label>
            <translate> Role </translate>
          </template>
          <b-form-input
            size="sm"
            id="rnd-input-50"
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
  name: 'RejectionNoteDetails',
  components: { GkDate },
  mixins: [trnDetailsMixin],
  props: {
    invDate: {
      type: String,
      required: true,
      note: 'The date from Invoice Details. Its used as the min date here',
    },
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
  },
  data() {
    return {
      isPreloading: false,
      isCollapsed: false,
      date: {
        valid: null,
        format: 'dd-mm-yyyy',
      },
      noteNo: {
        purchase: '',
        sale: '',
      },
      form: {
        no: '',
        date: null,
        issuer: null,
        role: null,
      },
      options: {
        delNotes: [],
        invoices: {
          sale: [],
          purchase: [],
        },
      },
    };
  },
  watch: {
    saleFlag() {
      this.setNoteNo();
    },
    invDate() {
      this.onUpdateDetails();
    },
    updateCounter() {
      this.resetForm();
    },
  },
  computed: {
    minimumDate: (self) =>
      self.invDate
        ? self.toDMYDate(self.invDate)
        : self.toDMYDate(self.yearStart),
  },
  methods: {
    setNoteNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag
          ? this.noteNo['sale']
          : this.noteNo['purchase'];
        if (this.form.no) {
          return;
        }
      } else {
        this.noteNo = {
          purchase: '',
          sale: '',
        };
      }
      axios
        .get('/rejectionnote?type=all')
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let counter = this.saleFlag
              ? resp.data.rejincount
              : resp.data.rejoutcount;
            let codes = this.config.no.format
              ? this.config.no.format.code
              : { sale: 'RIN', purchase: 'ROUT' };
            let code = this.saleFlag ? codes.sale : codes.purchase;
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              counter + 1,
              code,
              this.form.date,
              this.yearEnd
            );
            this.noteNo[this.saleFlag ? 'sale' : 'purchase'] = this.form.no;
          }
        })
        .catch((error) => {
          return error;
        });
    },
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    preloadData() {
      const requests = [this.fetchUserData()];
      return Promise.all(requests).then(() => {});
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
    resetForm() {
      this.setNoteNo(true);
      this.form.date = this.getNoteDate();
      this.onUpdateDetails();
    },
    onUpdateDetails() {
      const self = this;
      setTimeout(
        () =>
          self.$emit('details-updated', {
            data: self.form,
            name: 'rejection-note-details',
            options: {
              isDateValid: self.date.valid,
            },
          }),
        1000
      );
    },
  },
  mounted() {
    this.preloadData();
    this.resetForm();
  },
};
</script>
