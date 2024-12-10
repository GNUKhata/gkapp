<template>
  <b-table
    small
    borderless
    :items="items"
    :fields="fields"
    head-variant="dark"
    class="mb-0"
    :thead-class="tHeadClass"
    tbody-tr-class="bs-row"
    responsive=""
    filter="a"
    :filter-function="filterTable"
  >
    <template #cell(name)="data">
      <div
        :class="{
          'font-italic': data.item.isAccount,
          'font-weight-bold': data.item.isStock,
        }"
      >
        <b-button
          @click="data.toggleDetails"
          class="p-0 text-dark"
          variant="link"
          v-if="data.item.children.length"
        >
          <b-icon
            class="d-print-none"
            font-scale="0.7"
            :icon="data.detailsShowing ? 'dash' : 'arrows-fullscreen'"
          />
          {{ data.value }}
        </b-button>
        <b-button
          size="sm"
          variant="link"
          class="p-0"
          :to="{path: `/ledger/${data.item.id}`}"
          v-else-if="data.item.isAccount"
        >
          {{ data.value }}
        </b-button>
        <span
          v-else
        >
          {{ data.value }}
        </span>
      </div>
    </template>
    <template #row-details="data">
      <b-table
        small
        :items="data.item.children"
        :fields="fields"
        class="mb-0"
        thead-class="d-none"
        tbody-tr-class="bs-row"
        responsive=""
        filter="a"
        :filter-function="filterTable"
      >
        <template #cell(name)="data">
          <div
            :class="{
              'ml-1': data.item.isSubGroup,
              'ml-5': data.item.isAccount,
              'font-italic': data.item.isAccount,
              'font-weight-bold': data.item.isStock,
            }"
          >
            <b-button
              size="sm"
              variant="link"
              class="p-0"
              :to="{path: `/ledger/${data.item.id}`}"
              v-if="data.item.isAccount"
            >
              {{ data.value }}
            </b-button>
            <span
              v-else
            >
              {{ data.value }}
            </span>
          </div>
        </template>
        <template #cell(colOne)="data">
          <span
            :class="{
              'font-weight-bold': data.item.isGroup,
              'font-italic': data.item.isAccount,
              'd-none': !data.item.colOne,
            }"
          >
            {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
          </span>
        </template>
        <template #cell(colTwo)="data">
          <span
            :class="{
              'font-weight-bold': data.item.isMain,
              'font-italic': data.item.isAccount,
              'd-none': !data.item.colTwo,
            }"
          >
            {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
          </span>
        </template>
      </b-table>
    </template>
    <template #cell(colOne)="data">
      <span
        :class="{
          'font-weight-bold': data.item.isGroup,
          'font-italic': data.item.isAccount,
          'd-none': !data.item.colOne,
        }"
      >
        {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
      </span>
    </template>
    <template #cell(colTwo)="data">
      <span
        :class="{
          'font-weight-bold': data.item.isMain,
          'font-italic': data.item.isAccount,
          'd-none': !data.item.colTwo,
        }"
      >
        {{ parseFloat(data.item.amount / (divideThousand ? 1000 : 1)).toFixed(2) }}
      </span>
    </template>
  </b-table>
</template>

<script>
export default {
  name: 'ReportTableThreeCol',
  props: {
    items: {type: Array}, // Vue bootstrap table items
    fields: {type: Array}, // Vue bootstrap table fields
    tableName: String, // Table name (used to show/hide table head)
    divideThousand: Boolean,
    filterTable: { // Vue bootstrap filter-function
      type: Function,
      default: function () {
        return {}
      },
    },
  },
  data() {
    return {
      tHeadClass: '',
    }
  },
  methods: {
    printPage() {
      window.print();
    },
  },
  mounted() {
    this.tHeadClass = (this?.tableName === "pnl") ? 'd-none' : '';
  },
};
</script>
