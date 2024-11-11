<template>
  <b-card-group
    deck
    class="mt-4"
  >
    <!-- Most Sold Product / Service-->
    <b-card class="shadow">
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Most Sold Product / Service</translate>
      </b-card-header>
      <b-table
        :fields="supFields"
        :items="info.stockonhanddata"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
      >
        <template #cell(proddesc)="d">
          <router-link
            :to="`/workflow/Business/${d.item.prodcode}`"
          >
            {{ d.item.proddesc }}
          </router-link>
        </template>
      </b-table>
      <template #footer>
        <router-link to="business-details/create">
          <b-button
            size="sm"
            variant="dark float-right"
          >
            <BIcon
              icon="box"
              class="mr-1"
            /><translate>
              Add Product / Service
            </translate>
          </b-button>
        </router-link>
      </template>
    </b-card>
    <!-- Most purchased product/service -->
    <b-card class="shadow">
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Most Purchased Product / Service</translate>
      </b-card-header>
      <b-table
        :items="info.mostboughtprodsev"
        :fields="cusFields"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
      >
        <template #cell(proddesc)="d">
          <router-link
            :to="`/workflow/Business/${d.item.prodcode}`"
          >
            {{ d.item.proddesc }}
          </router-link>
        </template>
      </b-table>
      <template #footer>
        <router-link to="business-details/create">
          <b-button
            size="sm"
            variant="dark float-right"
          >
            <BIcon
              icon="box"
              class="mr-1"
            /><translate>
              Add Product / Service
            </translate>
          </b-button>
        </router-link>
      </template>
    </b-card>
  </b-card-group>
</template>

<script>
export default {
  name: 'MostSoldPS',
  props: {
    info: {
      type: [Array, Object],
    },
  },
  data() {
    return {
      cusFields: [
        {
          key: 'proddesc',
          label: 'Name',
        },
        {
          key: 'purchase',
          label: 'Purchase Value',
        },
      ],
      supFields: [
        {
          key: 'proddesc',
          label: 'Name',
        },
        {
          key: 'sale',
          label: 'Sale Value',
        },
      ],
      toDate: '',
    };
  },
  methods: {
    /*Let's Rename the columns with one's specified via prop `columns`*/
    renameColumns() {
      const newNames = this.info.map((obj) => {
        let newObj = {};
        newObj[this.columns[0]] = Object.values(obj)[0];
        newObj[this.columns[1]] = Object.values(obj)[1];
        return newObj;
      });
      return newNames;
    },
  },
  mounted() {
    this.toDate = this.currentDate();
  },
};
</script>
