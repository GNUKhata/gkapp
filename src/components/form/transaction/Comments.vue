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
        <b v-translate> {{ name }} Comments </b>
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
        <b-form-group>
          <b-form-textarea
            size="sm"
            id="n-input-1"
            v-model="form.narration"
            rows="4"
            max-rows="5"
            trim
            :placeholder="placeHolder"
          />
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'Comments',
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
    parentData: {
      type: String,
      required: false,
    },
    placeHolder: {
      type: String,
      required: false,
      default: '',
    },
    name: {
      type: String,
      required: false,
      default: 'Invoice',
    }
  },
  watch: {
    updateCounter() {
      if (this.parentData) {
        this.form.narration = this.parentData;
      } else {
        this.form.narration = '';
      }
    },
  },
  data() {
    return {
      isCollapsed: false,
      form: {
        narration: '',
      },
    };
  },
};
</script>
