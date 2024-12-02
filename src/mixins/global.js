import { mapState } from 'vuex';
import axios from 'axios';
import sha512 from 'crypto-js/sha512';
export default {
  data() {
    return {
      sidebarToggle: false,
      user_role: Number,
    };
  },
  computed: {
    ...mapState(['userAuthenticated']),
  },
  // Naming convention for mixin methods is `snake_casing`
  // to distinguish b/w component methods & mixin methods
  methods: {
    //wrapper around the bootstrap-vue toast
    gk_toast(title, message, variant = 'danger') {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 5000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
    // adds a log entry for an org, payload is a string
    gk_log(payload) {
      axios
        .post('/log', { activity: payload })
        .catch((e) => {
          console.error('Failed to log: ', e);
        });
    },
    is_mobile() {
      return window.innerWidth <= 768 ? true : false;
    },
    /**
     * check for latest news from the gst portal
     */
    check_gst_news() {
      if (!axios.defaults.baseURL) return;
      axios.get('/gst-news').then((r) => {
        if (localStorage.getItem('gstNewsCount') && this.userAuthenticated) {
          if (
            r.data.gkresult.length >
            parseInt(localStorage.getItem('gstNewsCount'))
          ) {
            const link = this.$createElement;
            const $url = link(
              'router-link',
              {
                props: {
                  to: '/gst/news',
                },
              },
              'Check out!'
            );
            this.$bvToast.toast(['You have unread news, ', $url], {
              title: 'GST News',
              variant: 'info',
              solid: true,
              toaster: 'b-toaster-top-center',
            });
            this.$store.commit('gstNews', true);
          }
        }
      });
    },
    /**
     * Return language specific number representation of given `value`
     * @param {} value
     * @param {} format
     * @returns {}
     * TODO handle multiple currencies
     */
    gk_currency(value, format = 'en-IN', symbol = '₹ ') {
      let formattedValue = null;
      const decimalExists = value.toString().includes('.');
      // handle decimal places
      if (decimalExists) {
        const num = value.toString().split('.');
        // if only one decimal place exist, append 0 after decimal place
        if (num[1].length == 1) {
          // formattedValue = parseFloat(`${num[0]}.${num[1]}`).toFixed(2);
          formattedValue = parseFloat(value).toFixed(2);
          // handle more than two decimal places
        } else if (num[1].length > 2) {
          formattedValue = parseFloat(`${num[0]}.${num[1].slice(0, 2)}`);
        } // keep the same value if it has two decimal places
        else {
          formattedValue = value;
        }
      } else {
        // append two decimal palces at the end of the value, if no decimal place exist
        formattedValue = parseFloat(value).toFixed(2);
      }
      return symbol + formattedValue.toLocaleString(format);
    },
    /**
     * @param {} file
     * @returns {Promise} Promise object represents base64 string
     */
    get_base64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },
    get_org_address() {
      axios.get('/organisation').then((r) => {
        if (r.status === 200 && r.data.gkstatus == 0) {
          this.$store.commit('setOrgAddress', r.data.gkdata);
        }
      });
    },
    hashedPassword(text) {
      let hash = sha512(text).toString();
      return hash;
    },
    currentDate() {
      const dt = new Date();
      const dd = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
      const actualMonth = dt.getMonth() + 1;
      const mm = actualMonth < 10 ? `0${actualMonth}` : actualMonth;
      const yy = dt.getFullYear();
      return `${yy}-${mm}-${dd}`;
    },
    dateReverse(date) {
      const d = date.split('-').reverse();
      return `${d[0]}-${d[1]}-${d[2]}`;
    },
    /**
     * Get the company's users role
     * to decide which items to show in user menu
     */
    get_user_role() {
      axios
        .get(`/gkuser/role`)
        .then((res) => {
          this.user_role = res.data.gkresult?.userrole || null;
        })
        .catch((e) => {
          console.error(e.message);
        });
    },
    /* Get org image from server */
    getOrgImage() {
      axios
        .get('/organisation/attachment')
        .then((r) => {
          if (r.status === 200 && r.data.logo && r.data.logo !== null) {
            const payload = `data:image/jpg;base64,${r.data.logo}`;
            this.$store.commit('updateOrgImg', payload);
          }
        })
        .catch((e) => {
          console.error(e.message);
        });
    },

    /*
     * Logout the user, But preserve the gkcore url
     */
    logOut() {
      const gkcoreUrl = this.$store.getters['getGkCoreUrl'];
      const orgcode = sessionStorage.getItem('orgCode');

      // reset orgname
      this.$store.commit('resetOrg');

      // change auth status
      this.$store.commit('setUserOrgAuthStatus');

      // remove custom states in localhost
      sessionStorage.removeItem('orgArray');
      // sessionStorage.removeItem("orgCodeChoice");

      // delete items from localStorage
      const deleteList = [
        'authToken',
        'orgCode',
        'orgName',
        'orgYears',
        'orgGstin',
        `${orgcode}-globalConf`,
        'finYears',
      ];
      for (const i in deleteList) {
        localStorage.removeItem(deleteList[i]);
      }

      // set gkCore url
      this.$store.commit('setGkCoreUrl', { gkCoreUrl: gkcoreUrl });

      // redirect to login page
      this.$router.push('/user-login');
      // reset the org image to default
      this.$store.commit('updateOrgImg', 'img/gk.png');
      // alert the user on logout
      /* this.$bvToast.toast(this.$gettext(`Logged out succesfully`), {
						title: 'Logout',
						solid: true,
						variant: 'success',
					}); */
    },
    //This method runs when switch server button is clicked
    switchServer() {
      this.$store.commit('setGkCoreUrl', {
        gkCoreUrl: null,
      });
      this.$router.push({
        path: '/server-setup',
        query: { auto_setup: false },
      });
    },

    //This method runs when strings need to be translated
    textInterpolated(text) {
      let translated = this.$ngettext('%{ text }', '%{ text }', text);
      let interpolated = this.$gettextInterpolate(translated, { text: text });
      return interpolated;
    },
  },
};
