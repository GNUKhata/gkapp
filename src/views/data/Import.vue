<template>
  <div class="m-2">
    <b-card
      class="gkcard mx-auto"
      :header="this.$gettext('Import Company Data')"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <b-card-body>
        <b-form @submit.prevent="check">
          <div v-translate>
            This menu will help you to import your data into GNUKhata:

            <h4 class="mt-4">
              Supported Imports
            </h4>
            <ul>
              <li>Tally (.xlsx)</li>
              <li>GNUKhata Legacy (.xlsx)</li>
              <li>GNUKhata New (.json)</li>
            </ul>
            <h4 class="mt-4">
              Import Instructions
            </h4>
            <ul>
              <li>
                <router-link to="/data/import/help/tally">
                  Tally & GNUKhata
                </router-link>
              </li>
              <li>
                <router-link to="/data/import/help/json">
                  JSON
                </router-link>
              </li>
            </ul>
          </div>
          <br>
          <!-- Export buttons -->
          <b-form-file
            required
            v-model="file"
            accept=".json, .xlsx"
            size="sm"
          />
          <div class="text-center">
            <b-button
              type="submit"
              variant="dark"
              class="mt-3 text-center"
              size="sm"
            >
              <b-icon icon="file" />
              <translate> Import Data</translate>
            </b-button>
          </div>
          <!-- show duplicate entries -->
          <b-modal
            id="response-modal"
            title="Import Stats"
            hide-footer
            scrollable
            header-bg-variant="dark"
            header-text-variant="light"
            header-class="p-2"
            size="md"
          >
            <div v-if="json_info != null">
              <h5>
                <translate>Imported Entries</translate>: {{ json_info.success }}
              </h5>
              <h5
                v-translate
                class="text-primary"
              >
                Duplicate Entries
              </h5>

              <div
                v-for="(section, index) in json_info.duplicate"
                :key="section"
              >
                <h6 class="text-capitalize">
                  {{ index }} ({{ section.length }})
                </h6>
                <ol>
                  <li
                    class="text-sm text-monospace text-muted"
                    v-for="item in section"
                    :key="item"
                    v-text="item"
                  />
                </ol>
              </div>
            </div>
          </b-modal>
        </b-form>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'Import',
  data() {
    return {
      file: [],
      file_str: null,
      json_info: null,
    };
  },
  methods: {
    check() {
      const f = this.file;
      if (f.type === 'application/json') {
        this.upload('json');
      } else if (
        f.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        this.upload('xlsx');
      }
    },

    upload() {
      // create a form object as api demands it
      let fd = new FormData();
      fd.append('gkfile', this.file);

      axios
        .post(`/import/overwrite-organisation`, fd, { headers: { gktoken: this.authToken } })
        .then((r) => {
          switch (r.data.gkstatus) {
          case 0:
            this.$bvToast.toast(this.$gettext('Import Successful'), {
              variant: 'success',
              solid: true,
            });
            if (this.file.type == 'application/json') {
              this.json_info = r.data.gkresult;
              this.$bvModal.show('response-modal');
            }
            this.$emit('refresh');
            break;
          case 1:
            this.$bvToast.toast('Duplicate Entry', {
              variant: 'warning',
              solid: true,
            });
            break;
          case 2:
            this.$bvToast.toast('Unauthorised Access', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 3:
            this.$bvToast.toast('Data error', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 4:
            this.$bvToast.toast('No Privilege', {
              variant: 'danger',
              solid: true,
            });
            break;
          case 5:
            this.$bvToast.toast('Integrity error', {
              variant: 'danger',
              solid: true,
            });
            break;
          }
        });
    },
  },
  computed: {
    ...mapState(['orgName', 'yearStart', 'yearEnd', 'authToken']),
  },
};
</script>
