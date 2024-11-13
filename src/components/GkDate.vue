<template>
  <div
    ref="date"
    class="gk-date"
  >
    <b-input-group>
      <b-form-input
        size="sm"
        :id="id"
        v-model="input"
        type="text"
        :placeholder="formatText"
        autocomplete="off"
        :readonly="readonly"
        :tabindex="readonly ? -1 : 0"
        :state="isInputValid && isDateValid"
        :required="required"
        :style="inputStyle"
      />
      <b-input-group-append>
        <b-form-datepicker
          size="sm"
          v-model="date"
          button-only
          right
          :aria-controls="id"
          :disabled="readonly"
          :tabindex="readonly ? -1 : 1"
          :min="minDate"
          :max="maxDate"
        />
      </b-input-group-append>

      <b-form-invalid-feedback id="input-live-feedback">
        {{ notValidText }}
      </b-form-invalid-feedback>
    </b-input-group>
  </div>
</template>

<script>
export default {
  name: 'GkDate',
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
    format: {
      type: String,
      required: false,
      default: 'dd-mm-yyyy',
      validator: function(value) {
        return ['yyyy-mm-dd', 'dd-mm-yyyy'].indexOf(value) !== -1;
      },
      note: `The format, input will be provided in. 
      This can be different from the format supported by the date component`,
    },
    formatOutput: {
      type: Boolean,
      required: false,
      default: false,
      note: `If true v-model will use the same format as input format provided`,
    },
    min: {
      type: String,
      required: false,
      default: '',
      note: 'The date has to be in the same format as the "format" prop',
    },
    max: {
      type: String,
      required: false,
      default: '',
      note: 'The date has to be in the same format as the "format" prop',
    },
    id: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
      note:
        'If readonly is true, then only update of data through code is possible',
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    inputStyle: {
      type: Object,
      required: false,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      input: '',
      date: '',
      valid: null,
      notValidText: '',
    };
  },
  computed: {
    isDateValid: (self) => {
      const validity = self.validateDate(self.date);
      let result = false;
      if (validity === null || self.readonly) {
        result = null;
      } else if (validity === 0) {
        result = true;
      }
      return result;
    },
    isInputValid: (self) => {
      return self.input ? self.validateFormat(self.input, self.format) : null;
    },
    formatText: (self) => self.format.toUpperCase(),
    minDate: (self) =>
      (self.validateFormat(self.min), self.format)
        ? self.toInternalFormat(self.min)
        : '',
    maxDate: (self) =>
      (self.validateFormat(self.max), self.format)
        ? self.toInternalFormat(self.max)
        : '',
    minTime: (self) => new Date(self.minDate).getTime(),
    maxTime: (self) => new Date(self.maxDate).getTime(),
  },
  watch: {
    input(newInput) {
      if (this.validateFormat(newInput, this.format)) {
        const newDate = this.toInternalFormat(newInput);
        if (this.date !== newDate) {
          this.date = newDate;
          this.onDateUpdate(newDate); // emit internal format for v-model
          this.setDateValidity(this.validateDate(newDate));
        }
      } else {
        this.date = '';
        this.$emit('input', '');
        if (newInput === '') {
          this.setDateValidity(null);
        } else {
          this.setDateValidity(false);
        }
      }
    },
    date(newDate) {
      let loop = 1000;
      while (loop--) {
        if (this.validateFormat(newDate, 'yyyy-mm-dd')) {
          const newInput = this.toExternalFormat(newDate);
          if (this.input !== newInput) {
            this.input = newInput;
            this.onDateUpdate(newDate); // emit internal format for v-model
            this.setDateValidity(this.validateDate(newDate)); // must use internal format for validation
          }
          loop = false;
        } else if (!newDate) {
          // "input" is not updated here, as the user may want
          // to update the faulty date via input field
          this.$emit('input', '');
          this.setDateValidity(null);
          loop = false;
        } else {
          newDate = this.toInternalFormat(newDate);
        }
      }
    },
    // "date" and "input" are user's way of updating the component
    // with "value", the component can be updated via code,
    // e.g. after preloading, date can be updated via code with v-model
    value(date) {
      if (this.date !== date) {
        if (!date) {
          // used when the component has to be reset
          this.input = '';
        } else {
          this.date = this.formatOutput ? this.toInternalFormat(date) : date;
        }
      }
    },
    min(date) {
      if (this.validateFormat(date, this.format)) {
        this.setDateValidity(this.validateDate(this.input));
      }
    },
    max(date) {
      if (this.validateFormat(date, this.format)) {
        this.setDateValidity(this.validateDate(this.input));
      }
    },
  },
  methods: {
    setDateValidity(validity) {
      if (this.readonly) {
        this.valid = null;
      } else {
        if (validity === 0) {
          this.valid = true;
        } else if (validity === null) {
          this.valid = null;
        } else {
          if (validity === false) {
            this.notValidText = `Date Invalid. Use valid format: (${this.format})`;
          } else {
            if (this.min && this.max) {
              this.notValidText = `Date Invalid. Choose between (${this.min}) and (${this.max})`;
            } else {
              if (this.min) {
                this.notValidText = `Date Invalid. Choose on or after (${this.min})`;
              } else {
                this.notValidText = `Date Invalid. Choose on or before (${this.max})`;
              }
            }
          }
          if (this.toExternalFormat(this.input) > this.toExternalFormat(this.max)) {
            this.input = this.max;
          }
          this.valid = false;
        }
      }
      this.$emit('validity', this.valid);
    },
    /**
     * onDateUpdate
     *
     * emits the input event and thereby passes data to v-model,
     * in the desired output format
     */
    onDateUpdate(newDate) {
      if (this.formatOutput) {
        this.$emit('input', this.toExternalFormat(newDate));
      } else {
        this.$emit('input', newDate);
      }
    },
    /**
     * toInternalFormat
     *
     * Given a date, it will be converted from the input format
     * to the internally used format
     * 
     * length - 8, contains no '-' separator in input to be formatted
     */
    toInternalFormat(input) {
      let date = '';
      switch (this.format) {
      case 'dd-mm-yyyy': {
        if(input.length === 8) {
          date = `${input.substr(4,4)}-${input.substr(2,2)}-${input.substr(0,2)}`;
        } else {
          date = input
            .split('-')
            .reverse()
            .join('-');
        }
        break;
      }
      case 'yyyy-mm-dd':
      default: {
        if(input.length === 8) {
          date = `${input.substr(0,4)}-${input.substr(4,2)}-${input.substr(6,2)}`;
        } else {
          date = input;
        }
      }
      }
      return date;
    },

    /**
     * toExternalFormat
     *
     * Given a date, converts it from internal format (yyyy-mm-dd)
     * to external format (based on props).
     * Usually used for displaying.
     */
    toExternalFormat(date) {
      let input = '';
      switch (this.format) {
      case 'dd-mm-yyyy': {
        input = date
          .split('-')
          .reverse()
          .join('-');
        break;
      }
      case 'yyyy-mm-dd':
      default: {
        input = date;
      }
      }
      return input;
    },

    /**
     * validateFormat
     *
     * Given a date string, its format will be validated based on the
     * format
     * 
     * length = 8, contains no '-' separator in date to be validated
     */
    validateFormat(date, format) {
      if (date.length !== 10 && date.length !== 8) {
        return false;
      }

      let items = [];
      if(date.length === 10) {
        items = date.split('-');
      } else if(date.length === 8) {
        if(format === 'dd-mm-yyyy') {
          items = [date.substr(0,2), date.substr(2,2), date.substr(4,4)]
        } else if (format === 'yyyy-mm-dd') {
          items = [date.substr(0,4), date.substr(4,2), date.substr(6,2)]
        }
      }

      if (items.length !== 3) {
        return false;
      }

      let year, month, day;
      switch (format) {
      case 'dd-mm-yyyy': {
        year = parseInt(items[2]);
        month = parseInt(items[1]);
        day = parseInt(items[0]);
        break;
      }
      case 'yyyy-mm-dd':
      default: {
        year = parseInt(items[0]);
        month = parseInt(items[1]);
        day = parseInt(items[2]);
      }
      }
      return (
        year > 1899 &&
        year <= 9999 &&
        month > 0 &&
        month < 13 &&
        day > 0 &&
        day < 32
      );
    },

    /**
     * validateDate
     *
     * Given a date in INTERNAL FORMAT, it will be validated based on the min and max
     * props
     *
     * return : result
     * -1  -> Less than min
     *  0  -> Valid
     * +1  -> Greater than max
     * null-> Bad Date String, or Bad Min and Max dates
     */
    validateDate(date) {
      let result = null;
      let currTime = new Date(date).getTime();
      if (this.minDate && this.maxDate) {
        if (this.minTime > this.maxTime) {
          result = null;
        } else {
          if (!isNaN(currTime)) {
            if (currTime < this.minTime) {
              result = -1;
            } else if (currTime > this.maxTime) {
              result = 1;
            } else {
              result = 0;
            }
          }
        }
      } else {
        // if only min or max validation is required
        if (this.minDate) {
          result = currTime < this.minTime ? -1 : 0;
        } else {
          result = currTime > this.maxTime ? 1 : 0;
        }
      }
      return result;
    },
  },
  mounted() {
    if (this.value) {
      if (!this.date) {
        this.date = this.formatOutput
          ? this.toInternalFormat(this.value)
          : this.value;
      }
    }
  },
};
</script>
