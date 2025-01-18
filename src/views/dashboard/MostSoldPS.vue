<template>
  <b-row class="text-wrap mb-4">
    <b-col
      cols
      lg="6"
      sm="12"
    >
      <!-- Most Sold Product / Service-->
      <b-card
        header="Most Sold Items"
        header-class="font-weight-bold"
        no-body
        class="mb-4"
      >
        <b-table
          :fields="supFields"
          :items="info.stockonhanddata"
          thead-class="d-none"
          borderless
          hover
          responsive
          show-empty
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
    </b-col>
    <b-col
      cols
      lg="6"
      sm="12"
    >
      <!-- Most purchased product/service -->
      <b-card
        header="Most Purchased Items"
        header-class="font-weight-bold"
        no-body
      >
        <b-table
          :fields="cusFields"
          :items="info.mostboughtprodsev"
          thead-class="d-none"
          borderless
          hover
          responsive
          show-empty
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
    </b-col>
  </b-row>
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
