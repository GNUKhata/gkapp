<template>
  <b-modal
    hide-footer
    hide-header
    header-bg-variant="dark"
    header-text-variant="light"
    v-model="searchMenu"
    @hide="$store.commit('toggleSearchMenu', false)"
  >
    <b-row cols="2">
      <div class="col-10">
        <v-select
          @input="navigate"
          :options="finalRoutes"
          v-model="selectedUrl"
          :placeholder="this.$gettext('Search Menu')"
          label="name"
        />
      </div>
      <div
        class="col-1 mt-1"
        role="button"
      >
        <BIcon
          scale="1.3x"
          variant="danger"
          icon="x-circle-fill"
          @click="$store.commit('toggleSearchMenu', false)"
          title="close"
        />
      </div>
    </b-row>
  </b-modal>
</template>

<script>
import routes from '../router/index';
import { mapState } from 'vuex';

export default {
  name: 'GoTo',
  data() {
    return {
      selectedUrl: '',
      finalRoutes: [],
      keysPressed: {},
    };
  },
  computed: {
    ...mapState(['searchMenu', 'userRole']),
  },
  methods: {
    navigate() {
      if (this.selectedUrl !== null) {
        this.$router.push(this.selectedUrl.path);
        this.selectedUrl = null;
        this.$store.commit('toggleSearchMenu', false);
      }
    },
    // create menu list from vue router config list
    filterRoutes() {
      const re = new RegExp(':');
      // do not include dynamic routes
      this.finalRoutes = routes.options.routes.filter((route) => {
        if (!re.test(route.path)) {
          // sanitize route names
          route['name'] = route.name.replaceAll('_', ' ');
          return route;
        }
      });
    },
  },
  created() {
    // keyboard shortcut is enabled only for admin role
    if (this.userRole == -1) {
      window.addEventListener('keydown', (event) => {
        this.keysPressed[event.key] = true;
        // Ctrl+k should bring up menu search
        if (this.keysPressed.Control && this.keysPressed['k']) {
          event.preventDefault();
          this.$store.commit('toggleSearchMenu', !this.searchMenu);
          this.keysPressed = {}; // reset key map
        }
      });

      window.addEventListener('keyup', (event) => {
        this.keysPressed[event.key] = false;
        this.keysPressed = {};
      });
    }
  },
  mounted() {
    this.filterRoutes();
  },
};
</script>
