<template>
  <div class="d-flex justify-content-center mt-4 mx-2 align-form-label-right">
    <div
      class="d-inline-block"
      style="min-width: 300px"
    >
      <div class="card">
        <b-overlay
          :show="isPreloading"
          variant="secondary"
          no-wrap
          blur
        />
        <div class="card-header text-left py-2">
          <b
            class="text-capitalize"
            v-translate
          > Create Account </b>
          <slot name="close-button" />
        </div>
        <div class="card-body pb-2">
          <b-form
            class="text-left"
            @submit.prevent="confirmOnSubmit"
          >
            <b-form-group
              label="Group"
              label-for="acc-input-10"
              label-cols="3"
              label-size="sm"
              label-class="required"
            >
              <template #label>
                <translate> Group </translate>
              </template>
              <v-select
                id="acc-input-10"
                v-model="form.group"
                :options="options.groups"
                label="groupname"
                :reduce="(acc) => acc.groupcode"
                @input="fetchSubGroups"
                required
              />
            </b-form-group>
            <b-form-group
              label="Sub-Group"
              label-for="acc-input-20"
              label-cols="3"
              label-size="sm"
            >
              <template #label>
                <translate> Sub-Group </translate>
              </template>
              <v-select
                id="acc-input-20"
                v-model="form.subGroup"
                :options="subGroups"
                label="subgroupname"
                @input="onSubGroupSelect"
                :required="false"
                :disabled="!subGroups.length || flags.newSubGroup"
                :reduce="(acc) => acc.groupcode"
              />
            </b-form-group>
            <b-card
              body-class="p-2"
              class="mb-3"
              bg-variant="light"
            >
              <b-form-checkbox
                v-model="flags.newSubGroup"
                class="mb-2"
                switch
                size="sm"
                :disabled="!form.group"
              >
                <translate> Add New Sub-Group </translate>
              </b-form-checkbox>
              <b-collapse
                id="acc-collapse-10"
                v-model="showAddSubGroup"
              >
                <b-form-group
                  label="Sub-Group Name"
                  label-for="acc-input-30"
                  label-cols="4"
                  label-size="sm"
                >
                  <template #label>
                    <translate> Sub-Group Name </translate>
                  </template>
                  <b-form-input
                    type="text"
                    size="sm"
                    id="acc-input-30"
                    v-model="newSubGroup"
                  />
                </b-form-group>
              </b-collapse>
            </b-card>
            <b-form-checkbox
              v-if="flags.gst"
              size="sm"
              class="mb-2"
            >
              <translate> GST Account </translate>
            </b-form-checkbox>
            <b-form-checkbox
              v-model="form.defaultFlag"
              v-if="defaultGroupName"
              size="sm"
              class="mb-2"
            >
              Set default for {{ defaultGroupName }}
            </b-form-checkbox>
            <b-form-group
              label="Account Name"
              label-for="acc-input-40"
              label-cols="3"
              label-size="sm"
              label-class="required"
            >
              <template #label>
                <translate> Account Name </translate>
              </template>
              <b-form-input
                type="text"
                size="sm"
                required
                v-model="form.name"
              />
            </b-form-group>
            <b-form-group
              label="Opening Balance"
              label-for="acc-input-50"
              label-cols="3"
              label-size="sm"
            >
              <template #label>
                <translate> Opening Balance </translate>
              </template>
              <b-input-group>
                <b-form-input
                  type="number"
                  size="sm"
                  v-model="form.openingBalance"
                  step="0.01"
                  @update="onOBalanceUpdate"
                  debounce="600"
                />
                <template #append>
                  <b-form-select
                    v-model="form.crdr"
                    size="sm"
                  >
                    <b-form-select-option :value="1">
                      Dr
                    </b-form-select-option>
                    <b-form-select-option :value="-1">
                      Cr
                    </b-form-select-option>
                  </b-form-select>
                </template>
              </b-input-group>
            </b-form-group>
            <hr class="my-2">
            <div class="float-right">
              <b-button
                size="sm"
                class="m-1"
                variant="danger"
                @click.prevent="$router.go(-1)"
              >
                <b-icon
                  aria-hidden="true"
                  class="align-middle mr-1"
                  icon="arrow-left"
                />
                <span
                  class="align-middle"
                  v-translate
                >Back</span>
              </b-button>
              <b-button
                size="sm"
                class="m-1"
                variant="warning"
                @click.prevent="resetForm"
              >
                <b-icon
                  aria-hidden="true"
                  class="align-middle mr-1"
                  icon="arrow-repeat"
                />
                <span
                  class="align-middle"
                  v-translate
                >Reset</span>
              </b-button>
              <b-button
                size="sm"
                type="submit"
                class="m-1"
                variant="success"
              >
                <b-spinner
                  v-if="isLoading"
                  small
                />
                <b-icon
                  v-else
                  aria-hidden="true"
                  class="align-middle mr-1"
                  icon="plus-square"
                />
                <span
                  class="align-middle"
                  v-translate
                >Save</span>
              </b-button>
            </div>
          </b-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'AccountCreate',
  components: {},
  data() {
    return {
      form: {
        name: '',
        group: null,
        subGroup: null,
        openingBalance: '0.00',
        crdr: 1,
        defaultFlag: false,
      },
      newSubGroup: '',
      flags: {
        default: false, // Sub-Group specific Option to make the current account the default Account for this sub group
        newSubGroup: false, // Flag for adding a new sub group
        gst: false, // Sub-Group specific Option to add a GST account
        moreDetails: false, // Sub-Group specific Option to add customer details
        setSubGroup: false, // used for setting a subgroup with js after subgroup list is fetched
      },
      isPreloading: false,
      isLoading: false,
      subGroups: [],
      options: {
        groups: [],
        subGroups: {},
        groupNameToCode: {},
        gstGroup: 'Duties & Taxes',
        moreDetailGroups: {
          'Sundry Debtors': true,
          'Sundry Creditors for Purchase': true,
        },
        defaultGroups: {
          Bank: { name: 'Bank Transaction', code: 2 },
          Cash: { name: 'Cash Transaction', code: 3 },
          Purchase: { name: 'Purchase Transaction', code: 16 },
          Sales: { name: 'Sale Transaction', code: 19 },
          'Indirect Income': { name: 'Round Off Received', code: 181 },
          'Indirect Expense': { name: 'Round Off Paid', code: 180 },
        },
        accDetails: {},
      },
    };
  },
  props: {
    group: {
      type: [Number, String],
      required: true,
    },
    subGroup: {
      type: [Number, String],
      required: true,
    },
  },
  computed: {
    defaultGroupName: (self) => {
      let group = self.options.groupNameToCode[self.form.group];
      let subGroup = self.options.groupNameToCode[self.form.subGroup];
      if (self.options.defaultGroups[subGroup]) {
        return self.options.defaultGroups[subGroup].name;
      } else if (self.options.defaultGroups[group]) {
        return self.options.defaultGroups[group].name;
      }
      return '';
    },
    showAddSubGroup: {
      get: function() {
        return this.flags.newSubGroup && !!this.form.group;
      },
      set: function(show) {
        this.flags.newSubGroup = show;
      },
    },
  },
  watch: {
    group(newGroup) {
      this.form.group = parseInt(newGroup);
    },
    subGroup(newSub) {
      this.form.subGroup = parseInt(newSub);
    },
  },
  methods: {
    /**
     * onSubGroupSelect
     *
     * Description: On SubGroup select handler.
     * Sets the SubGroup related option flags, based on the subgroup selected
     */
    onSubGroupSelect() {
      if (!this.form.subGroup) {
        this.flags.gst = false;
        this.flags.moreDetails = false;
        return;
      }
      let subGroupName = this.options.groupNameToCode[this.form.subGroup];
      this.flags.gst = subGroupName === this.options.gstGroup;
      this.flags.moreDetails = this.options.moreDetailGroups[subGroupName];
    },
    createSubGroup(payload) {
      const self = this;
      return axios
        .post('/groupsubgroups', payload)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            self.displayToast(
              this.$gettext('Create Sub-Group Success'),
              `Sub-Group: ${self.newSubGroup} was created Successfully!`,
              'success'
            );
          } else {
            self.displayToast(
              this.$gettext('Create Sub-Group Failed'),
              `Could not Create Account: ${self.newSubGroup}!`,
              'warning'
            );
          }
          return resp.data;
        })
        .catch((e) => {
          this.displayToast(
            this.$gettext('Create Account Failed!'),
            e.message,
            'warning'
          );
          return e;
        });
    },
    createAccount(payload) {
      const self = this;
      return axios
        .post('/accounts', payload)
        .then((resp) => {
          switch (resp.data.gkstatus) {
          case 0:
            {
              self.displayToast(
                this.$gettext('Create Account Success'),
                `Account: ${self.form.name} was created Successfully!`,
                'success'
              );

              let log = { activity: `account created: ${self.form.name}` };
              axios.post('/log', log);

              self.resetForm();
              self.$emit('account-created');
            }
            break;
          case 1:
            self.displayToast(
              this.$gettext('Create Account Failed'),
              this.$gettext(
                `Duplicate Entry, change account name and try again!`
              ),
              'warning'
            );
            break;
          case 2:
            self.displayToast(
              this.$gettext('Create Account Failed'),
              this.$gettext(
                `Unauthorized access, please sign in and try again!`
              ),
              'warning'
            );
            break;
          default:
            self.displayToast(
              this.$gettext('Create Account Failed'),
              this.$gettext(
                'Unable to Create Acccount, please try again later!'
              ),
              'danger'
            );
          }
          return resp.data.gkstatus;
        })
        .catch((e) => {
          this.displayToast(
            this.$gettext('Create Account Failed!'),
            e.message,
            'warning'
          );
          return e;
        });
    },
    confirmOnSubmit() {
      const self = this;
      let group = this.options.groupNameToCode[this.form.group];
      let subGroup = this.options.groupNameToCode[this.form.subGroup];
      let text = `Create Account <b>${this.form.name}</b> in (${group}) Group`;
      if (subGroup) {
        text += ` and (${subGroup}) Sub-Group`;
      }
      text += '?';
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          // bodyClass: 'p-2',
          centered: true,
        })
        .then((val) => {
          if (val) {
            self.onSubmit();
          }
        });
    },
    /**
     * onSubmit
     *
     * Description: Inits payload and Creates New Sub Group (if chosen) and Create the account.
     */
    onSubmit() {
      const self = this;
      const payload = this.initPayload();
      this.isLoading = true;

      if (payload.gkdata.groupcode === 'New') {
        this.createSubGroup({
          groupname: this.newSubGroup,
          subgroupof: this.form.group,
        })
          .then((data) => {
            if (data.gkstatus === 0) {
              payload.gkdata.groupcode = data.gkresult;
              self.flags.setSubGroup = data.gkresult;
              self
                .createAccount(payload)
                .then(() => {
                  self.isLoading = false;
                })
                .finally(() => {
                  self.fetchSubGroups(true);
                });
            } else {
              self.isLoading = false;
            }
          })
          .catch((e) => {
            self.displayToast(
              this.$gettext(`Create Sub-Group Failed`),
              e.message,
              'warning'
            );
            self.isLoading = false;
          });
      } else {
        this.createAccount(payload)
          .then(() => {
            self.isLoading = false;
          })
          .catch((e) => {
            self.displayToast(
              this.$gettext(`Create Account Failed`),
              e.message,
              'warning'
            );
            self.isLoading = false;
          });
      }
    },
    /**
     * initPayload
     *
     * Description: Inits payload for account creation
     */
    initPayload() {
      let payload = {
        origin: 'createaccount',
      };
      let openingBal = !isNaN(this.form.openingBalance)
        ? Math.abs(this.form.openingBalance) * this.form.crdr
        : 0;
      let gkdata = {
        accountname: this.form.name,
        openingbal: parseFloat(openingBal).toFixed(2),
        groupcode: this.form.subGroup,
      };

      if (this.flags.newSubGroup) {
        if (this.newSubGroup) {
          gkdata.groupcode = 'New';
        } else {
          gkdata.groupcode = this.form.group;
        }
      } else if (!this.form.subGroup || this.form.subGroup < 0) {
        // if subGroup is None
        gkdata.groupcode = this.form.group;
      }

      if (this.defaultGroupName && this.form.defaultFlag) {
        let subGroupName = this.options.groupNameToCode[this.form.subGroup];
        if (this.options.defaultGroups[subGroupName]) {
          gkdata['defaultflag'] = this.options.defaultGroups[subGroupName].code;
        }
      }

      payload['gkdata'] = gkdata;
      return payload;
    },
    /** resetForm
     *
     * Description: Resets the form and also resets the subgroups list for the last chosen group
     */
    resetForm() {
      this.form.name = null;
      this.form.crdr = 1;
      this.form.openingBalance = '0.00';
      this.form.defaultFlag = false;
      this.flags.default = false;
      this.flags.newSubGroup = false;
    },
    /**
     * displayToast
     *
     * Description: A utility function to create toast messages
     */
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
    /**
     * fetchSubGroups
     *
     * Description: Fetches the subgroups for the selected group
     */
    fetchSubGroups(fetchNew) {
      if (typeof fetchNew !== 'boolean') {
        fetchNew = false;
      }
      const groupId = this.form.group;
      const self = this;
      if (!groupId) {
        this.form.subGroup = null;
        return;
      }
      if (!fetchNew) {
        if (this.options.subGroups[groupId]) {
          this.subGroups = this.options.subGroups[groupId];
          return;
        }
      }
      axios
        .get(`/groupDetails/${groupId}`)
        .then((resp) => {
          self.options.subGroups[groupId] = resp.data.gkresult;
          self.subGroups = self.options.subGroups[groupId];
          if (!self.subGroups.length) {
            self.flags.newSubGroup = true;
            this.form.subGroup = null;
          } else {
            self.subGroups.forEach((subGroup) => {
              self.options.groupNameToCode[subGroup.groupcode] =
                subGroup.subgroupname;
            });
            self.flags.newSubGroup = false;
            this.form.subGroup = self.subGroups[0].groupcode;
          }

          self.$nextTick().then(() => {
            // in edit mode, the sub group can't be updated as soon as the account data is fetched.
            // As after setting the group, the subgroup list is refreshed and will reset it.
            // using this check to update it after the subgroup list is refreshed.
            if (self.flags.setSubGroup) {
              self.form.subGroup = self.flags.setSubGroup;
              self.flags.setSubGroup = false;
            }
          });
        })
        .catch((e) => {
          self.displayToast(
            this.$gettext('Fetch SubGroups Data Failed!'),
            e.message,
            'warning'
          );
        });
    },
    /**
     * preloadData
     *
     * Description: preloads all the groups available
     */
    preloadData() {
      this.isPreloading = true;

      const requests = [
        axios.get('/groupsubgroups').catch((e) => {
          this.displayToast(
            this.$gettext('Fetch Groups Data Failed!'),
            e.message,
            'warning'
          );
        }),
      ];

      return Promise.all(requests)
        .then(([resp1]) => {
          this.isPreloading = false;
          if (resp1.data.gkstatus === 0) {
            this.options.groups = resp1.data.gkresult;
            this.options.groups.forEach((group) => {
              this.options.groupNameToCode[group.groupcode] = group.groupname;
            });
          }
          return;
        })
        .catch((e) => {
          this.isPreloading = false;
          this.displayToast(
            this.$gettext('Preload Data Failed!'),
            e.message,
            'warning'
          );
          return e;
        });
    },

    onOBalanceUpdate(balance) {
      balance = parseFloat(balance);
      if (balance < 0) {
        this.form.openingBalance = Math.abs(balance);
        if (this.form.crdr) {
          this.form.crdr = -1;
        }
      }
    },
  },
  mounted() {
    const self = this;
    this.preloadData().then(() => {
      self.form.group = parseInt(self.group);
      if (self.subGroup) {
        let subGroup = parseInt(self.subGroup);
        if (subGroup > 0) {
          self.flags.setSubGroup = subGroup;
        } else {
          this.form.subGroup = null;
        }
        this.fetchSubGroups(true);
      }
    });
  },
};
</script>
