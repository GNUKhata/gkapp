<template>
  <section class="m-2">
    <b-input-group class="mb-3 container-sm gksearch">
      <template #prepend>
        <b-button
          variant="outline-primary"
          to="/categories/add"
        >
          <b-icon icon="tag" /> <translate> Add Category </translate>
        </b-button>
      </template>

      <b-form-input
        type="text"
        placeholder="Search Categories"
        v-model="searchText"
      />
    </b-input-group>
    <gk-toolbar>
      <gk-file-download
        file-suffix="CategoryList"
        :url="
          `/spreadsheet?all-categories&fystart=${this.dateReverse(
            this.yearStart,
          )}&fyend=${this.dateReverse(this.yearEnd)}&orgname=${this.orgName}`
        "
        :message-from-parent="parentMessage"
      />
    </gk-toolbar>
    <b-table
      :filter="searchText"
      :fields="[
        {key: 'categoryname', label: 'Category'},
        {key: 'parentcategory', label: 'Parent Category'},
        {key: 'options', label: '', class: 'text-center'},
      ]"
      :items="allCategories"
      striped
      sort-direction="asc"
      head-variant="dark"
      class="mx-auto table-border-dark"
      hover
      bordered
      small
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong v-translate> Fetching Categories ... </strong>
        </div>
      </template>
      <template #cell(options)="data">
        <b-button-group class="mx-auto">
          <b-button
            title="Add"
            variant="dark"
            class="px-1"
            size="sm"
            :to="{
              name: 'Edit_Category',
              params: {id: data.item.categorycode},
            }"
          >
            <b-icon
              font-scale="0.85"
              class="align-middle"
              icon="pencil"
            />
          </b-button>
          <!-- delete spec -->
          <b-button
            v-if="data.item.categorystatus === 'Inactive'"
            title="delete"
            variant="danger"
            size="sm"
            class="px-1 ml-1"
          >
            <b-icon
              class="align-middle"
              font-scale="0.92"
              icon="trash"
              @click="
                deleteCategory(data.item.categoryname, data.item.categorycode)
              "
            />
          </b-button>
        </b-button-group>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkFileDownload from '../components/GkFileDownload.vue';
import GkToolbar from '../components/GkToolbar.vue';
export default {
  components: { GkFileDownload, GkToolbar },
  name: 'Categories',
  data() {
    return {
      parentMessage: '',
      searchText: '',
      loading: false,
      allCategories: [],
    };
  },
  computed: {
    ...mapState(['orgName', 'yearStart', 'yearEnd']),
  },
  methods: {
    deleteCategory(name, id) {
      this.$bvModal
        .msgBoxConfirm(`Delete Category "${name}" ?`, {
          centered: true,
          size: 'lg',
        })
        .then((confirmFlag) => {
          if (confirmFlag) {
            let delPayload = { data: { categorycode: parseInt(id) } };
            axios.delete('/categories', delPayload).then((resp) => {
              if (resp.data.gkstatus === 0) {
                this.$bvToast.toast(
                  `Category "${name}" was successfully deleted!`,
                  {
                    variant: 'success',
                    solid: true,
                  }
                );
                let logPayload = { activity: `Category Deleted: ${name}` };
                axios.post('/log', logPayload);
                this.getAllCategories();
              } else {
                if (resp.data.gkstatus === 5) {
                  this.$bvToast.toast(
                    `Failed to delete category ${name}. Integrity Issue.`,
                    {
                      variant: 'danger',
                      solid: true,
                    }
                  );
                } else {
                  this.$bvToast.toast(`Failed to delete category ${name}`, {
                    variant: 'danger',
                    solid: true,
                  });
                }
              }
            });
          }
        });
    },
    /* Fetch all categories from api and assign it to allCategories */
    getAllCategories() {
      this.loading = true;
      axios
        .get(`/categories`)
        .then((r) => {
          if (r.status == 200) {
            this.allCategories = r.data.gkresult;
          } else {
            this.$bvToast.toast(this.$gettext('Failed to fetch categories'), {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
      this.loading = false;
    },
  },
  mounted() {
    this.getAllCategories();
  },
};
</script>

<style scoped>
table {
  width: 70%;
}
@media all and (max-width: 600px) {
  table {
    width: 90%;
  }
}
</style>
