<template>
  <div
    ref="autocomplete"
    class="gk-autocomplete"
    v-if="options"
  >
    <!-- Autocomplete Input -->
    <b-form-input
      :size="size"
      class="gk-autocomplete-input"
      v-model="searchFilter"
      ref="inputField"
      @focus="showOptions"
      @blur="exit"
      @keydown="keyMonitor"
      @update="onInput"
      debounce="500"
      autocomplete="off"
      :readonly="readonly"
      :tabindex="readonly ? -1 : 0"
      :required="required"
      :placeholder="placeholder"
    />

    <!-- Autocomplete Menu -->
    <!-- <b-list-group> is conflicting with the CSS class "text-truncate", 
      thus using <div> as the container -->
    <div
      class="gk-autocomplete-content"
      v-if="optionsShown && !readonly"
      :style="{minWidth: dropDownWidth}"
    >
      <!--  -->
      <b-list-group-item
        button
        class="gk-autocomplete-item"
        :class="{'gk-autocomplete-item-hover': index === hovered}"
        v-for="(option, index) in filteredOptions"
        :key="index"
        @mousedown="onMouseDown(option)"
        @mouseenter="setHovered(index)"
      >
        <div class="text-truncate">
          {{ option.text }}
        </div>
        <small
          class="text-danger"
          v-if="!option.active && checkActive"
        >
          ({{ inactiveText }})
        </small>
      </b-list-group-item>
      <b-list-group-item
        button
        class="gk-autocomplete-item text-truncate bg-danger text-light text-center font-weight-bold"
        :class="{
          'gk-autocomplete-item-hover': filteredOptions.length === hovered,
        }"
        @mousedown="clearSelection"
      >
        <b-icon icon="x-circle-fill" /> Clear Selection
      </b-list-group-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Autocomplete',
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    value: {
      type: [String, Object, Number],
      required: false,
      default: null,
      note: 'used for exposing v-model',
    },
    valueUid: {
      type: String,
      required: false,
      default: '',
      note: 'used when value is object, to quickly compare values',
    },
    options: {
      type: Array,
      required: true,
      default: () => [],
      note: `Options of autocomplete. An array of options with id and name. 
      This can be a shared array between several autocomplete instaces (since arrays are shared by reference)`,
    },
    textField: {
      type: String,
      required: false,
      default: 'text',
      note: 'Alternate key for the display text',
    },
    valueField: {
      type: String,
      required: false,
      default: 'value',
      note: 'Alternate key for the value',
    },
    isOptionsShared: {
      type: Boolean,
      required: false,
      default: false,
      note: `If the same options is shared between several of this component in the same page,
      then hide the options selected in other components`,
    },
    emptyValue: {
      type: [Number, String, Object],
      required: false,
      default: null,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
      note:
        'If readonly is true, then only update of data through code is possible',
    },
    dropDownWidth: {
      type: [Number, String],
      required: false,
      default: '100%',
    },
    required: {
      type: [Boolean, String],
      default: true,
    },
    placeholder: {
      type: String,
      default: 'value',
    },
    inactiveText: {
      type: String,
      required: false,
      default: '',
    },
    blockInactive: {
      type: Boolean,
      required: false,
      default: true,
      note: 'Flag to block/unblock selection of inactive items',
    },
    size: {
      type: String,
      required: false,
      default: 'sm',
      note: 'Bootstrap vue size prop for b-input component'
    },
    godownData: {
      type: [Number, String],
    }
  },
  data() {
    return {
      selected: {
        text: '',
        value: this.emptyValue,
      },
      optionsShown: false,
      searchFilter: '',
      hovered: null,
      isSelected: false,
      filteredOptions: [],
      optionsB: [], // Since the options given can be shared,
      //a separate options object (optionsB) is created to store local changes
    };
  },
  computed: {
    checkActive: (self) => !!self.inactiveText, // used for applying (active/not active) related settings
  },
  methods: {
    /** Creates a local copy of Options prop in a desired format, {text: , value:} */
    initOptions() {
      let options = [];
      if (this.options.length) {
        let val;
        this.options.forEach((option) => {
          val = null;
          if (typeof option === 'object') {
            val = option;
            val.text = option[this.textField];
            val.value = option[this.valueField];
            ``;
            val.disabled = !!val.disabled;
          } else {
            val = {
              text: option,
              value: option,
            };
          }
          options.push(val);
        });
        this.options.forEach((option) => {
          if (parseInt(this.godownData) === option.value) {
            this.searchFilter = option.text;
          }
        });
      }

      this.optionsB = options;
    },
    onInput() {
      if (this.isSelected || this.searchFilter) {
        if (this.filteredOptions.length > 0) {
          this.selected = this.filteredOptions[0];
        }
        this.setHovered(0);
      } else {
        // this.selectOption(null);
      }
      this.isSelected = false;
      this.filterOptions();
      // this.$emit("filter", this.searchFilter);
    },
    /** Filter the given options based on the query string */
    filterOptions() {
      if (typeof this.searchFilter === 'string') {
        const filtered = [];
        let searchText = this.searchFilter.toLowerCase();
        let optionText = '';
        for (const option of this.optionsB) {
          if (!option.disabled || !this.isOptionsShared) {
            optionText = option.text.toLowerCase();
            if (
              this.searchFilter.length < 1 ||
              optionText.indexOf(searchText) >= 0
            ) {
              filtered.push(option);
            }
          }
        }
        this.filteredOptions = filtered;
      }
    },
    /** store the index of the currently hovered dropdown item */
    setHovered(index) {
      this.hovered = index;
    },
    /** Select an option from the dropdown down menu */
    selectOption(option) {
      if (
        !this.compareOptions(option, this.selected) &&
        typeof this.selected.text === 'string'
      ) {
        if (this.isOptionsShared) {
          this.updateDisabledStatus(option);
        }

        this.selected = option;
        // this.optionsShown = false;
        if ((this.searchFilter !== this.selected.text) && !this.searchFilter) {
          this.searchFilter = this.selected.text;
        }
        this.$emit('input', this.selected.value);
      }
    },
    /** Disable the dropdown item currently active and free the previously disabled dropdown item*/
    updateDisabledStatus(option) {
      if (this.selected && this.selected.value) {
        this.selected.disabled = false;
      }
      if (option) {
        option.disabled = true;
      }
    },
    /** Perform required inits and Display the dropdown menu */
    showOptions() {
      if (!this.searchFilter) {
        this.searchFilter = '';
      }
      if (this.optionsB.length < this.options.length) {
        this.initOptions(); // run the first time the component is used
      }
      this.filterOptions();
      this.optionsShown = true;
      this.setHovered(0);
    },
    /**Compares two option values. Options can be Objects or elementary values like string or number.
     * If the option is an object then valueUid is required for comparing the two objects quickly.
     */
    compareOptions(a, b) {
      if (typeof a.value === typeof b.value) {
        if (typeof a.value === 'object') {
          if (a.value && b.value) {
            return a.value[this.valueUid] === b.value[this.valueUid];
          }
        } else {
          return a.value === b.value;
        }
      }
      return false;
    },
    /** When the component loses focus, update the component and hide the drop down menu */
    exit() {
      if (this.selected.value) {
        this.searchFilter = this.selected.text;
      } else {
        this.selected = {
          text: '',
          value: this.emptyValue,
        };
        this.searchFilter = '';
      }
      this.optionsShown = false;
      this.hovered = false;
    },
    onMouseEnter(isActive, index) {
      this.setHovered(index);
    },
    onMouseDown(option) {
      if (option.active || !this.checkActive || !this.blockInactive) {
        this.selectOption(option);
      }
    },
    /** Keyboard press event handlers for arrow keys, enter and escape key */
    keyMonitor: function(event) {
      switch (event.which) {
      case 38: // ArrowUp
        this.setHovered(Math.max(0, --this.hovered));
        break;
      case 40: // ArrowDown
        this.setHovered(
          Math.min(this.filteredOptions.length, ++this.hovered)
        );
        break;
      case 13:
        // Enter Key
        if (this.hovered === this.filteredOptions.length) {
          // to choose clear selection on enter key press
          event.preventDefault();
          this.clearSelection();
        } else if (this.filteredOptions[this.hovered]) {
          // if options have active data, only select options that are active = true
          // else select the option that is being hovered
          if (this.checkActive) {
            if (
              !this.filteredOptions[this.hovered].active &&
              !this.blockInactive
            ) {
              break;
            }
          }
          event.preventDefault();
          this.selectOption(this.filteredOptions[this.hovered]);
          this.isSelected = true;
        }
        break;
      case 27:
        // Esc key
        this.$refs.inputField.blur();
        break;
      }

      // on arrow key press, move the hover from one element to another and scroll when necessary
      if (this.optionsShown) {
        const list = this.$refs.autocomplete.querySelector(
          '.gk-autocomplete-content'
        );
        const element = list.querySelectorAll('.gk-autocomplete-item')[
          this.hovered
        ];

        if (!element) return;

        const visMin = list.scrollTop;
        const visMax = list.scrollTop + 200 - element.clientHeight;

        if (element.offsetTop < visMin) {
          list.scrollTop = element.offsetTop;
        } else if (element.offsetTop >= visMax) {
          list.scrollTop =
            element.offsetTop - list.clientHeight + element.clientHeight;
        }
      }
    },
    clearSelection() {
      this.selectOption({ text: '', value: this.emptyValue });
    },
  },
  watch: {
    /**When the options sent as prop are changed, then the options have to be initialized again.
     * If the search filter is not in the current options array, then clear the searchquery and
     * call filteroptions again
     */
    options() {
      this.initOptions();
      if (
        !this.optionsB.find((option) => {
          option.text === this.searchFilter;
        })
      ) {
        this.clearSelection();
      }
      this.filterOptions();
    },
    /** On value update handler.
     * This handler is called in two instaces.
     * 1. When the user updates the searchQuery
     * 2. When the program assigns a value via v-model to the component
     */
    value(newVal) {
      // debugger;
      const self = this;
      if (!this.optionsB) {
        return;
      }
      if (this.optionsB.length !== this.options.length) {
        this.initOptions();
      }

      // if the query string entered doesn't have any matching options, its value will become null.
      // Then this method will again be called with null as newVal. At that time the text entered must not vanish.
      if (newVal === null || newVal === undefined) {
        this.clearSelection();
        return;
      }
      if (this.optionsB && Array.isArray(this.optionsB)) {
        if (this.optionsB.length) {
          let optionsType = typeof this.optionsB[0].value;
          let newType = typeof newVal;
          if (newType === optionsType) {
            let selected = null;
            if (newType === 'object') {
              selected = this.optionsB.find((option) =>
                option
                  ? option.value[this.valueUid] === newVal[this.valueUid]
                  : !!option
              ) || { text: '', val: this.emptyValue };
            } else {
              selected = this.optionsB.find((option) =>
                option ? option.value === newVal : !!option
              ) || { text: '', value: this.emptyValue };
            }
            setTimeout(() => {
              self.selectOption(selected);
            }, 100); // using time outs here to overcome the race condition caused
            // when this component is rendered based on data stored in array
          } else {
            setTimeout(() => {
              self.selectOption({ text: newVal, value: this.emptyValue });
            }, 100);
          }
        }
      }
      // this.filterOptions();
    },
    searchFilter() {
      if (!this.optionsB) {
        return;
      }
      if (this.optionsB.length !== this.options.length) {
        this.initOptions();
      }
      this.filterOptions();
    },
  },
  /** Before being destroyed, remove the disabled state on the active option of this component.
   * This is usefull in cases like the bill item list in Invoice page, where the options are shared
   * between the autocomplete components. When one bill Item is deleted, the product /service chosen
   * in that bill item should be released in the shared data store.
   */
  beforeDestroy() {
    this.updateDisabledStatus({
      text: this.searchFilter,
      value: this.emptyValue,
    });
  },
  created() {
    if (this.value && this.value.name) {
      this.selectOption({ text: this.value.name, value: this.value });
    }
  },
};
</script>

<style lang="scss" scoped>
.gk-autocomplete {
  position: relative;
  display: block;
  margin: auto;
  .gk-autocomplete-input {
    // background: #fff;
    // border: 1px solid #ced4da;
    // border: 1px solid #e7ecf5;
    // border-radius: 0.25rem;
    // color: #333;
    display: block;
    // font-size: 0.8em;
    padding: 6px;
    // min-width: 250px;
    // max-width: 250px;
  }
  .gk-autocomplete-content {
    position: absolute;
    background-color: #fff;
    // min-width: 248px;
    width: 100%;
    // max-width: 248px;
    max-height: 200px;
    border: 1px solid #e7ecf5;
    box-shadow: 0px -8px 34px 0px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 99999;
    .gk-autocomplete-item {
      cursor: pointer;
      color: black;
      font-size: 0.7em;
      line-height: 1em;
      padding: 8px;
      text-decoration: none;
      display: block;
      &:hover {
        background-color: #e7ecf5;
      }
    }
  }
  .gk-autocomplete:hover .dropdowncontent {
    display: block;
  }

  .gk-autocomplete-item-hover {
    background-color: #e7ecf5;
  }
}
</style>
