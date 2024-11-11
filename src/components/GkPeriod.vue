<template>
  <div
    class="align-form-label-right"
    ref="period"
  >
    <b-form-group
      label="Period Type"
      label-for="gkp-select-10"
      label-cols="3"
      label-cols-md="2"
      label-size="sm"
    >
      <template #label>
        <translate> Period Type </translate>
      </template>
      <b-form-select
        id="gkp-select-10"
        size="sm"
        :options="options.periodTypes"
        v-model="periodType"
      />
    </b-form-group>
    <b-form-group
      label="Period"
      label-for="gkp-select-20"
      label-cols="3"
      label-cols-md="2"
      label-size="sm"
    >
      <template #label>
        <translate> Period </translate>
      </template>
      <b-form-select
        v-if="isMonthly"
        id="gkp-select-20"
        size="sm"
        @change="onPeriodUpdate"
        v-model="period"
        :options="periods"
      />

      <div
        v-if="isCustom"
        id="gkp-select-20"
        class="row"
      >
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
                @validity="updateValidity($event, 'from')"
                @input="onPeriodUpdate"
                v-model="custom.from"
                id="yst"
                :min="minDate.from"
                :max="maxDate.from"
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
                @validity="updateValidity($event, 'to')"
                @input="onPeriodUpdate"
                v-model="custom.to"
                id="ynd"
                :min="minDate.to"
                :max="maxDate.to"
              />
            </b-input-group>
          </b-form-group>
        </div>
      </div>
    </b-form-group>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import GkDate from '@/components/GkDate.vue';
export default {
  name: 'GkPeriod',
  components: { GkDate },
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    value: {
      type: String,
      required: false,
      default: null,
      note: 'used for exposing v-model',
    },
  },
  data() {
    return {
      periodType: 'Monthly',
      period: { from: '', to: '' },
      custom: { from: '', to: '' },
      periods: {
        monthly: []
      },
      validity: {
        from: false,
        to: false,
      },
      options: {
        periodTypes: ['Monthly', 'Custom'],
        months: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
      },
    };
  },
  computed: {
    minDate: (self) => {
      return {
        from: self.dateReverse(self.yearStart),
        to: self.dateReverse(self.custom.from || self.yearStart),
      };
    },
    maxDate: (self) => {
      return {
        from: self.dateReverse(self.yearEnd),
        to: self.dateReverse(self.yearEnd),
      };
    },
    isCustom: (self) => self.periodType === 'Custom',
    isMonthly: (self) => self.periodType === 'Monthly',
    ...mapState(['yearStart', 'yearEnd']),
  },
  watch: {
    value() {},
  },
  methods: {
    updateCustomPeriod() {
      this.custom.from = this.period.from;
      this.custom.to = this.period.to;
      // this.$emit('update', true);
      this.validity = {
        from: true,
        to: true
      }
      this.$emit('validity', this.validity.from && this.validity.to);
    },
    updateValidity(validity, type) {
      this.validity[type] = validity || validity === null ? true : false;
      this.$emit('validity', this.validity.from && this.validity.to);
    },
    onPeriodUpdate() {
      let payload = this.isCustom ? this.custom : this.period;
      this.$emit('update', payload);
    },
    calculateTimePeriods() {
      let startDate = new Date(this.yearStart);
      let startTime = startDate.getTime(),
          endTime = new Date(this.yearEnd).getTime();

      let periods = [];

      while (startTime < endTime) {
        // debugger;
        let current = {
          day: startDate.getDate(),
          month: startDate.getMonth(),
          year: startDate.getFullYear(),
        };
        let day = current.day < 10 ? `0${current.day}` : current.day;
        let month =
          current.month < 9 ? `0${current.month + 1}` : current.month + 1;
        let from = `${current.year}-${month}-${day}`;
        let toDate = new Date(current.year, current.month + 1, 0).getDate();
        let to = `${current.year}-${month}-${toDate}`;

        periods.push({
          value: { from, to },
          text: `${this.options.months[current.month]} ${current.year}`,
        });

        if (++current.month >= 12) {
          current.month = 0;
          ++current.year;
        }
        startDate = new Date(current.year, current.month, 1);
        startTime = startDate.getTime();
      }

      this.periods = periods;
    },
  },
  mounted() {
    this.calculateTimePeriods();
    this.period = this.periods[0].value || { from: '', to: '' };
    this.onPeriodUpdate();
    this.updateCustomPeriod();
  },
};
</script>
