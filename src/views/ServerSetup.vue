<template>
  <!-- Server Selection-->
  <section class="m-2">
    <b-card
      header-bg-variant="dark"
      header-text-variant="light"
      class="shadow mx-auto gkcard"
    >
      <b-overlay
        :show="isLoading"
        variant="secondary"
        no-wrap
        blur
      />
      <template #header>
        <gk-card-header
          :name="$gettext('GNUKhata Server Setup')"
          help-body="This menu helps you to select gkcore server to use with this webapp. The default server is <code>localhost:6543</code><br>You can also set your custom gkcore server address."
        />
      </template>
      <b-card-body>
        <b-form
          @submit.prevent="setCustomServerUrl"
          class="text-center"
        >
          <b-button
            size="sm"
            variant="dark"
            @click.prevent="setDefaultServer"
          >
            <b-icon
              class="mr-1"
              icon="arrow-right-circle"
            />
            <translate>Continue with Default Server</translate>
          </b-button>
          <div class="mt-2 mb-2">
            <b>OR</b>
          </div>
          <h5 class="text-muted text-center">
            <translate>Enter Custom Server URL</translate>
          </h5>
          <b-form-group label-cols="auto">
            <b-form-input
              size="sm"
              :state="urlIsValid"
              v-model="serverUrl"
              type="url"
              placeholder="https://example.com"
            />
            <b-form-invalid-feedback id="input-live-feedback">
              <translate>URL should not contain " / " in the end</translate>
            </b-form-invalid-feedback>
          </b-form-group>
          <b-button
            type="submit"
            size="sm"
            variant="success"
            :disabled="serverUrl === '' ? true : false"
          >
            <b-icon
              class="mr-1"
              icon="arrow-right-circle"
            />
            <translate> Save & Continue</translate>
          </b-button>
        </b-form>
      </b-card-body>
    </b-card>
  </section>
</template>

<script>
import axios from 'axios';
import GkCardHeader from '../components/GkCardHeader.vue';
export default {
  components: { GkCardHeader },
  name: 'ServerSetup',
  data() {
    return {
      serverUrl: '',
      isLoading: false,
    };
  },
  computed: {
    urlIsValid() {
      if (this.serverUrl !== '') {
        return this.serverUrl
          .split('')
          .reverse()
          .join('')[0] == '/'
          ? false
          : true;
      } else {
        return null;
      }
    },
  },
  methods: {
    saveUrlAndProceedToLoginPage(url) {
      this.$store.commit('setGkCoreUrl', {
        gkCoreUrl: url,
      });
      // update the VersionInfo component
      this.$root.$emit('updateVersionInfo');
      this.$router.push('/user-login');
    },
    /*
     * this method is called when user clicks on the "Continue with default server" button
     */
    setDefaultServer() {
      this.isLoading = true;
      const defaultGkCoreUrl = this.gkConfig.gkcore_url;
      axios
        .get(`${defaultGkCoreUrl}`)
        .then((res) => {
          if (res.status == 200) {
            this.saveUrlAndProceedToLoginPage(defaultGkCoreUrl);
            // trigger the VersionInfo component to refetch the API
            this.$root.$emit('updateVersionInfo');
          } else {
            this.$bvToast.toast(
              this.$gettext('Please check your server setup'),
              {
                title: this.$gettext('Unable to Connect To The Server'),
                variant: 'danger',
                solid: true,
              }
            );
          }
          this.isLoading = false;
        })
        .catch((e) => {
          this.isLoading = false;
          this.$bvToast.toast(
            this.$gettext('Please check if gkcore is properly setup'),
            {
              title: e.message,
              solid: true,
              variant: 'danger',
            }
          );
        });
    },
    /**
     * Validate given server URL
     */
    setCustomServerUrl() {
      this.isLoading = true;
      axios
        .get(`${this.serverUrl}`)
        .then((res) => {
          if (res.status == 200 && res.data.gkstatus == 0) {
            this.saveUrlAndProceedToLoginPage(this.serverUrl);
          } else {
            this.$bvToast.toast(
              this.$gettext('Please check your server setup'),
              {
                title: this.$gettext('Unable to Connect To The Server'),
                variant: 'danger',
                solid: true,
              }
            );
          }
          this.isLoading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: this.$gettext('Invalid URL'),
            variant: 'danger',
            solid: true,
          });
          this.isLoading = false;
        });
    },
  },
  mounted() {
    if (!this.$route.query.auto_setup) {
      this.setDefaultServer();
    }
  },
};
</script>
