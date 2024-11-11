<template>
  <div>
    <b-overlay :show="loading">
      <!-- HSN Input -->
      <b-form-group
        :description="hsn.desc"
        class="mb-0"
      >
        <b-input-group>
          <b-form-input
            type="text"
            :size="size"
            v-model.trim="hsn.code"
            :placeholder="this.$gettext('Enter HSN/SAC code or description')"
            :state="hsn.isValid"
            :required="required"
            debounce="600"
            @update="checkHsn"
          />
          <!-- Search button -->
          <b-input-group-append v-if="hsn.isValid == null">
            <b-button
              aria-label="hsn search"
              variant="dark"
              :size="size"
              @click="searchHsn(hsn.code)"
              :disabled="hsn.code.length < 1"
            >
              <b-icon-search />
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </b-overlay>
    <!-- HSN Suggestions Table -->
    <div
      v-if="hsn.suggestions.length > 0"
      style="height: 20em; width: inherit; overflow-y:scroll"
      class="border mb-1"
    >
      <b-table
        table-variant="warning"
        hover
        small
        thead-class="d-none"
        :items="hsn.suggestions"
      >
        <template #cell(hsn_code)="data">
          <div
            @click="selectHsnSuggestion(data.item)"
            role="button"
          >
            <small>{{ data.item.hsn_code }}</small>
          </div>
        </template>
        <template #cell(hsn_desc)="data">
          <div
            @click="selectHsnSuggestion(data.item)"
            role="button"
          >
            <small>{{ data.item.hsn_desc }}</small>
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// import { mapGetters } from 'vuex';
export default {
  name: 'GkHsn',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    size: {
      type: String,
      default: 'sm',
      description:
        'Default value is "md". Possible values are "sm", "md", "xl"',
    },
    required: {
      type: [String, Boolean],
      default: false,
    },
    value: {
      type: [Object, String],
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      hsn: {
        code: '',
        desc: '',
        suggestions: [],
        isValid: null,
      },
    };
  },
  watch: {
    value(v) {
      // handle invalid hsn also
      try {
        this.string2json(v);
      } catch {
        this.hsn.code = v;
        this.hsn.desc = 'Invalid HSN/SAC Code';
      }
    },
  },
  methods: {
    /**
     * Convert string to JSON & validate
     */
    string2json(s) {
      this.hsn.code = JSON.parse(s)['hsn_code'];
      this.checkHsn(this.hsn.code);
    },
    /**
     * Check if entered hsn is valid, else emit
     * `null` & show a list of hsn suggestions
     */
    checkHsn(hsn) {
      if (hsn.length == 0) {
        this.hsn.isValid = null;
        this.hsn.desc = '';
        this.hsn.suggestions = [];
        return;
      }
      axios.get(`/hsn?validate=${hsn}`).then((r) => {
        if (r.data.gkstatus != 0) {
          this.hsn.isValid = null;
          // this.searchHsn(hsn);
          this.$emit('change', this.hsn.code);
        } else {
          this.hsn.isValid = true;
          this.hsn.desc = r.data.gkresult['hsn_desc'];
          this.hsn.suggestions = [];
          this.$emit('change', JSON.stringify(r.data.gkresult));
        }
      });
    },
    /**
     * Select HSN Code in table
     */
    selectHsnSuggestion(o) {
      this.hsn.code = o.hsn_code;
      this.checkHsn(this.hsn.code);
      // clear the suggestions
      this.hsn.suggestions = [];
    },

    /**
     * Return matching hsn info as array of objects
     */
    searchHsn(hsn) {
      this.loading = true;
      this.hsn.desc = '';
      if (hsn !== '' && hsn.length >= 3) {
        axios
          .get(`/hsn?search=${hsn}`)
          .then((r) => {
            switch (r.data.gkstatus) {
            case 0:
              this.hsn.suggestions = r.data.gkresult;
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 6:
              this.$bvToast.toast(this.$gettext('Proxy Server Error'), {
                variant: 'danger',
                solid: true,
              });
              break;
            }
            this.loading = false;
          })
          .catch((e) => {
            this.$bvToast.toast(e.message, {
              variant: 'danger',
              solid: true,
            });
            this.loading = false;
          });
      } else {
        this.loading = false;
      }
    },
  },
};
</script>
