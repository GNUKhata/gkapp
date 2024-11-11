<template>
  <section class="m-2">
    <b-input-group class="mb-3 w-75 mx-auto">
      <template #prepend>
        <b-button
          v-b-modal.add-cc
          variant="warning"
        >
          <b-icon
            class="mr-1"
            icon="cash"
          />
          <translate>Add Cost Center</translate>
        </b-button>
      </template>
      <b-form-input
        type="text"
        :placeholder="$gettext('Search Cost Centers')"
        v-model="searchText"
      />
    </b-input-group>

    <b-table
      :filter="searchText"
      :items="costCenters"
      :fields="fields"
      striped
      sort-direction="asc"
      head-variant="dark"
      class="mx-auto rtable table-border-dark"
      hover
      fixed
      outlined
      small
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong> <translate>Fetching List...</translate> </strong>
        </div>
      </template>
      <template #cell(manage)="data">
        <!-- edit cost center button -->
        <b-button
          variant="dark"
          size="sm"
          class="mr-1"
          @click="showEditCostCenter(data.item.id)"
        >
          <b-icon
            icon="pencil-square"
            role="button"
            size="sm"
            variant="light"
          />
        </b-button>
        <!-- delete cost center button -->
        <b-button
          size="sm"
          variant="danger"
          @click="confirm(data.item)"
        >
          <b-icon
            role="button"
            icon="trash"
            variant="light"
          />
        </b-button>
      </template>
    </b-table>
    <b-modal
      id="add-cc"
      :title="$gettext('Add Cost Center')"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <cost-center-create @created="getCostCenterList" />
    </b-modal>
    <b-modal
      id="edit-cc"
      :title="$gettext('Edit Cost Center')"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <cost-center-edit
        :id="ccId"
        @modified="getCostCenterList"
      />
    </b-modal>
  </section>
</template>

<script>
import axios from 'axios';
import CostCenterCreate from './CostCenterCreate.vue';
import CostCenterEdit from './CostCenterEdit.vue';
export default {
  components: { CostCenterCreate, CostCenterEdit },
  name: 'Godowns',
  data() {
    return {
      loading: false,
      searchText: '',
      fields: [
        { key: 'name', sortable: true },
        { key: 'sanctioned_amount', class: 'text-right', sortable: true },
        { key: 'manage', class: 'text-center' },
      ],
      costCenters: [],
      ccId: '',
    };
  },
  computed: {},
  methods: {
    confirm(info) {
      this.$bvModal
        .msgBoxConfirm(`Confirm deletion of cost center ${info.name} ?`, {
          centered: true,
          okVariant: 'danger',
        })
        .then((r) => {
          if (r) {
            this.deleteCostCenter(info);
          }
        });
    },
    getCostCenterList() {
      this.loading = true;
      axios
        .get(`/projects`)
        .then((r) => {
          if (r.status == 200) {
            let u = r.data.gkresult.map((data) => {
              let obj = {};
              obj.id = data.projectcode;
              obj.name = data.projectname;
              obj.sanctioned_amount = data.sanctionedamount;
              obj.manage = null;
              return obj;
            });
            this.costCenters = u;
          } else {
            this.$bvToast.toast(
              this.$gettext('Failed to fetch cost center items'),
              {
                variant: 'danger',
                solid: true,
              }
            );
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'failed',
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
    deleteCostCenter(info) {
      axios
        .delete('/projects', {
          data: {
            projectcode: info.id,
          },
        })
        .then((r) => {
          if (r.status == 200)
            switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast(`${info.name} Deleted`, {
                variant: 'success',
                title: 'Success',
                solid: true,
              });
              axios.post('/log', {
                activity: `cost center delete: ${info.name}`,
              });
              this.getCostCenterList();
              break;
            case 1:
              this.$bvToast.toast(this.$gettext('Duplicate Entry'), {
                variant: 'warning',
                solid: true,
              });
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
              this.$bvToast.toast(this.$gettext('Data error'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast(this.$gettext('No Privilege'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 5:
              this.$bvToast.toast(this.$gettext('Integrity error'), {
                variant: 'danger',
                solid: true,
              });
              break;
            }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
    showEditCostCenter(id) {
      this.ccId = id;
      this.$bvModal.show('edit-cc');
    },
  },
  mounted() {
    this.getCostCenterList();
  },
};
</script>
