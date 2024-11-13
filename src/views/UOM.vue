<template>
  <section class="mt-2 mr-3 ml-3">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <!-- <b-input-group-text>Username</b-input-group-text> -->
        <b-button
          variant="outline-primary"
          @click="$router.push('/uom/add')"
        >
          <b-icon icon="thermometer" />
          <translate>Add Unit</translate>
        </b-button>
      </template>
      <b-form-input
        type="text"
        :placeholder="$gettext('Search Units')"
        v-model="searchText"
      />
    </b-input-group>
    <b-alert
      dismissible
      variant="dark"
      class="container text-dark d-print-none"
      :show="true"
    >
      Valid GST Units are marked
      <b-badge variant="success">
        green
      </b-badge> Custom Units will be marked in
      <b-badge variant="warning">
        Yellow
      </b-badge>
    </b-alert>
    <b-table
      :filter="searchText"
      :fields="fields"
      :items="uomList"
      class="mx-auto"
      head-variant="dark"
      hover
      fixed
      outlined
      small
      striped
      :busy="isLoading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong> <translate>Fetching All Units ...</translate> </strong>
        </div>
      </template>
      <template #cell(unit_name)="data">
        <b-icon
          icon="circle-fill"
          class="d-print-none"
          :variant="subUnitStatus(data.item)"
        />
        <b-link
          v-if="data.item.sysunit === 0"
          @click="$router.push('/uom/' + data.item.uom_id)"
          title="click to edit UOM"
          :variant="subUnitStatus(data.item)"
          size="sm"
        >
          {{ data.item.unit_name }}
        </b-link>
        <span v-else>
          {{ data.item.unit_name }}
        </span>
      </template>
      <template #cell(uqc)="data">
        <div
          v-if="!data.value"
          class="text-danger"
        >
          <div class="text-small">
            * Invalid UQC
          </div>
        </div>
        <span v-else>
          {{ data.value }}
        </span>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'UOM',
  data() {
    return {
      uomType: {}, // uom name to systemunit flag map
      uomList: [],
      fields: [
        {
          key: 'unit_name',
          sortable: true,
        },
        {
          key: 'description',
        },
        {
          key: 'uqc',
          label: 'UQC',
        },
      ],
      selectedUomId: '',
      searchText: '',
      isLoading: false,
      selectedUserId: '',
    };
  },
  computed: {
    ...mapState(['authToken', 'gkCoreUrl']),
  },
  methods: {
    getUOM() {
      this.isLoading = true;
      axios
        .get('/unitofmeasurement')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            const uomData = r.data.gkresult;
            let uomMap = {};
            uomData.forEach((uom) => {
              uomMap[uom.uomid] = uom.unitname;
              this.uomType[uom.unitname] = uom.sysunit;
            });
            this.uomList = uomData.map((data) => {
              return {
                unit_name: data.unitname,
                description: data.description,
                uom_id: data.uomid,
                subunitof: data.sysunit
                  ? data.unitname
                  : uomMap[data.subunitof],
                uqc: data.sysunit ? data.unitname : uomMap[data.uqc],
                sysunit: data.sysunit,
              };
            });
            this.isLoading = false;
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    /* As per Indian GST laws, A custom unit should be mapped to a officially valid unit */
    subUnitStatus(item) {
      if (item.sysunit === 1) {
        return 'success';
      }
      return 'warning';
    },
    showEditUOM(id) {
      this.selectedUomId = id;
      this.$bvModal.show('edit-uom');
    },
  },
  mounted() {
    this.getUOM();
  },
};
</script>

<style scoped>
table {
  width: 70%;
}
@media all and (max-width: 600px) {
  table {
    width: 100%;
  }
}
</style>
