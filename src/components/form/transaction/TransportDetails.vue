<template>
  <b-card
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
    v-if="config"
  >
    <div class="p-2 p-md-3">
      <div>
        <b v-translate>Transport Details</b>
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
          label="No. of packages"
          label-for="tpd-input-10"
          label-size="sm"
          label-cols="4"
          v-if="config.packageCount"
        >
          <template #label>
            <translate> No. of packages </translate>
          </template>
          <b-form-input
            size="sm"
            id="tpd-input-10"
            v-model="form.packageCount"
            type="number"
            min="0"
            no-wheel
          />
        </b-form-group>
        <b-form-group
          label="Transport By"
          label-for="tpd-input-20"
          label-size="sm"
          label-cols="4"
          v-if="config.mode"
          label-class="required"
        >
          <template #label>
            <translate> Transport By </translate>
          </template>
          <b-form-select
            size="sm"
            id="tpd-input-20"
            v-model="form.mode"
            :options="options.transportModes"
            required
          />
        </b-form-group>
        <b-form-group
          label="Vehicle No."
          label-for="tpd-input-30"
          label-cols="4"
          label-size="sm"
          v-if="form.mode === 'Road' && config.vno"
        >
          <template #label>
            <translate> Vehicle No. </translate>
          </template>
          <b-form-input
            size="sm"
            id="tpd-input-30"
            v-model="form.vno"
            trim
          />
        </b-form-group>
        <b-form-group
          label="Date of Supply"
          label-cols="4"
          label-size="sm"
          id="tpd-input-group-1"
          label-class="required"
        >
          <template #label>
            <translate> Date of Supply </translate>
          </template>
          <gk-date
            id="tpd-date-1"
            :format="date.format"
            v-model="form.date"
            :min="minDate"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <b-form-group
          id="tpd-input-group-2"
          label="Receipt Date"
          label-cols="4"
          label-for="tpd-date-2"
          label-size="sm"
          v-if="config.receiptDate"
          label-class="required"
        >
          <template #label>
            <translate> Receipt Date </translate>
          </template>
          <gk-date
            id="tpd-date-2"
            :format="date.format"
            v-model="form.receiptDate"
            :min="form.date ? dateReverse(form.date) : ''"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <b-form-group
          label="Grace Period"
          label-for="tpd-input-40"
          label-size="sm"
          label-cols="4"
          v-if="config.gracePeriod"
        >
          <template #label>
            <translate> Grace Period </translate>
          </template>
          <b-input-group
            append="days"
            size="sm"
          >
            <b-form-input
              size="sm"
              id="tpd-input-40"
              v-model="form.gracePeriod"
              type="number"
              min="0"
              no-wheel
              required
            />
          </b-input-group>
        </b-form-group>
        <!-- Reverse charge is a mechanism where the recipient of the goods or services is liable to pay Goods and Services Tax (GST) instead of the supplier. -->
        <b-form-checkbox
          v-model="form.reverseCharge"
          size="sm"
          name="check-button"
          switch
          v-if="config.reverseCharge"
        >
          <translate> Reverse Charge </translate>
        </b-form-checkbox>
      </div>
    </div>
  </b-card>
</template>

<script>
import { mapState } from 'vuex';
import GkDate from '../../GkDate.vue';
export default {
  name: 'TransportDetails',
  components: {
    GkDate,
  },
  props: {
    config: {
      type: Object,
      required: false,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
    invDate: {
      type: String,
      required: false,
      default: '',
    },
    parentData: {
      type: Object,
      required: false,
      default: function() {
        return {
          mode: 'Road',
          vno: null,
          date: null,
          reverseCharge: false,
          packageCount: 0,
          deliveryDate: null,
        };
      },
    },
  },
  data() {
    return {
      isCollapsed: false,
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      form: {
        mode: 'Road',
        vno: null,
        date: null,
        reverseCharge: false,
        packageCount: 0,
        receiptDate: null,
        gracePeriod: 0,
      },
      options: {
        transportModes: [
          { text: '-- Transport Mode --', value: null },
          'Road',
          'Rail',
          'Air',
          'Ship',
          'Other',
        ],
      },
    };
  },
  watch: {
    updateCounter() {
      Object.assign(this.form, this.parentData);
    },
  },
  computed: {
    minDate: (self) =>
      self.invDate
        ? self.dateReverse(self.invDate)
        : self.dateReverse(self.yearStart),
    ...mapState(['yearStart']),
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'transport-details',
          options: {
            dateValid: this.date.valid,
          },
        })
      );
    },
  },
  mounted() {
    // translating strings from options
    this.options.transportModes = [
      { text: this.$gettext('-- Transport Mode --'), value: null },
      { text: this.$gettext('Road'), value: 'Road' },
      { text: this.$gettext('Rail'), value: 'Rail' },
      { text: this.$gettext('Air'), value: 'Air' },
      { text: this.$gettext('Ship'), value: 'Ship' },
      { text: this.$gettext('Other'), value: 'Other' },
    ];
  },
};
</script>
