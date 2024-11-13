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
          >Edit Account</b>
          <slot name="close-button" />
        </div>
        <div class="card-body pb-2">
          <b-alert
            class="p-1"
            v-if="alertText"
            show
            variant="warning"
          >
            {{
              alertText
            }}
          </b-alert>
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
                :disabled="disableFields.group"
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
                :reduce="(acc) => acc.groupcode"
                @input="onSubGroupSelect"
                :required="false"
                :disabled="
                  !subGroups.length ||
                    flags.newSubGroup ||
                    disableFields.subGroup
                "
              />
            </b-form-group>
            <b-card
              body-class="p-2"
              class="mb-3"
              bg-variant="light"
              v-if="!disableFields.newSubGroup"
            >
              <b-form-checkbox
                v-model="flags.newSubGroup"
                class="mb-2"
                switch
                size="sm"
                :disabled="!form.group || disableFields.newSubGroup"
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
              :disabled="disableFields.gst"
            >
              <translate> GST Account </translate>
            </b-form-checkbox>
            <b-form-checkbox
              v-if="defaultGroupName && !disableFields.default"
              size="sm"
              class="mb-2"
              :disabled="disableFields.default"
              v-model="form.defaultFlag"
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
                :readonly="disableFields.name"
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
                <span class="align-middle">
                  <translate>Back</translate>
                </span>
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
                <span class="align-middle">
                  <translate>Reset</translate>
                </span>
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
                  icon="cloud-arrow-up"
                />
                <span class="align-middle">
                  <translate>Update</translate>
                </span>
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
  name: 'AccountEdit',
  components: { },
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
        setSubGroup: false, // used for setting a subgroup with js after subgroup list is fetched, (in edit mode)
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
    id: {
      type: [Number, String],
      required: true,
    },
    sysFlag: {
      type: [Number, String],
      required: true,
      validator: (value) => {
        let val = parseInt(value);
        return val === 0 || val === 1;
      },
    },
  },
  computed: {
    isSysAccount: (self) => parseInt(self.sysFlag) === 1,
    alertText: (self) => {
      if (self.flags.default) {
        return `This is a default account for ${self.defaultGroupName}.`;
      } else if (self.isSysAccount) {
        return ` Only opening balance of this system generated account can be edited.`;
      }
      return '';
    },
    disableFields: (self) => {
      let fields = {
        group: false,
        subGroup: false,
        newSubGroup: false,
        default: false,
        name: false,
        gst: false,
      };
      if (self.isSysAccount || self.flags.default) {
        fields = {
          group: true,
          subGroup: true,
          newSubGroup: true,
          default: true,
          name: true,
          gst: true,
        };
      }

      if (self.flags.default) {
        fields.name = false;
      }
      return fields;
    },
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
    overlayOpen(isOpen) {
      if (isOpen) {
        this.resetForm();
        this.fetchAccountDetails();
      }
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
              'Create Sub-Group Success',
              `Sub-Group: ${self.newSubGroup} was created Successfully!`,
              'success'
            );
          } else {
            self.displayToast(
              'Create Sub-Group Failed',
              `Could not Create Account: ${self.newSubGroup}!`,
              'warning'
            );
          }
          return resp.data;
        })
        .catch((e) => {
          this.displayToast('Create Account Failed!', e.message, 'warning');
          return e;
        });
    },
    editAccount(payload) {
      const self = this;
      return axios.put('/accounts', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          self.displayToast(
            'Edit Account Success',
            `Account: ${self.form.name} was Updated Successfully!`,
            'success'
          );

          let log = { activity: `account updated: ${self.form.name}` };
          axios.post('/log', log);

          self.fetchAccountDetails();
        } else {
          self.displayToast(
            'Edit Account Failed',
            `Account: ${self.form.name} was not Updated!`,
            'danger'
          );
        }
        return resp.data.gkstatus;
      });
    },
    confirmOnSubmit() {
      const self = this;
      let group = this.options.groupNameToCode[this.form.group];
      let subGroup = this.options.groupNameToCode[this.form.subGroup];
      let text = `Edit Account <b>${this.form.name}</b> in (${group}) Group`;
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
     * Description: Inits payload and Creates New Sub Group (if chosen) and Create/Edit the account.
     */
    onSubmit() {
      const self = this;
      const payload = this.initEditPayload();
      this.isLoading = true;

      if (payload.gkdata.groupcode === 'New') {
        this.createSubGroup({
          groupname: this.newSubGroup,
          subgroupof: this.form.group,
        })
          .then((data) => {
            if (data.gkstatus === 0) {
              payload.gkdata.groupcode = data.gkresult;
              self.editAccount(payload).then(() => {
                self.isLoading = false;
              });
            } else {
              self.isLoading = false;
            }
          })
          .catch((e) => {
            self.displayToast(`Edit Sub-Group Failed`, e.message, 'warning');
            self.isLoading = false;
          });
      } else {
        this.editAccount(payload)
          .then(() => {
            self.isLoading = false;
          })
          .catch((e) => {
            self.displayToast(`Edit Account Failed`, e.message, 'warning');
            self.isLoading = false;
          });
      }
    },
    initEditPayload() {
      let groupName = this.options.groupNameToCode[this.form.group];
      let subGroupName = this.options.groupNameToCode[this.form.subGroup];
      let csflag = 0;
      if (
        (groupName === 'Current Assets' && subGroupName === 'Sundry Debtors') ||
        (groupName === 'Current Liabilities' &&
          subGroupName === 'Sundry Creditors for Purchase')
      ) {
        csflag = 1;
      }
      const payload = {
        oldcustname: this.options.accDetails.name,
        custsupflag: csflag,
        gkdata: {},
      };

      let crdr = this.form.crdr;
      let openingBal = !isNaN(this.form.openingBalance)
        ? Math.abs(this.form.openingBalance) * crdr
        : 0;
      let gkdata = {
        accountname: this.form.name,
        openingbal: parseFloat(openingBal).toFixed(2),
        accountcode: this.id,
        groupcode: this.form.subGroup,
      };

      // set default flag
      if (this.defaultGroupName && this.form.defaultFlag) {
        let subGroupName = this.options.groupNameToCode[this.form.subGroup];
        if (this.options.defaultGroups[subGroupName]) {
          gkdata.defaultflag = this.options.defaultGroups[subGroupName].code;
        }
      }

      // set groupcode
      if (this.flags.newSubGroup) {
        if (this.newSubGroup) {
          gkdata.groupcode = 'New';
        } else {
          gkdata.groupcode = this.form.group;
        }
      } else if (!this.form.subGroup) {
        // if subGroup is None
        gkdata.groupcode = this.form.group;
      }
      payload.gkdata = gkdata;
      return payload;
    },
    /** resetForm
     *
     * Description: Resets the form and also resets the subgroups list for the last chosen group
     */
    resetForm() {
      Object.assign(this.form, this.options.accDetails);
      this.flags.setSubGroup = this.form.subGroup;
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
    /** fetchAccountDetails
     *
     * Description: Fetches the details of the account to be edited
     */
    fetchAccountDetails() {
      this.isPreloading = true;
      const self = this;
      axios
        .get(`/account/${this.id}`)
        .then((resp1) => {
          if (resp1.data.gkstatus === 0) {
            const acc = resp1.data.gkresult;
            self.form.name = acc.accountname;
            if (acc.openingbal < 0) {
              self.form.openingBalance = Math.abs(acc.openingbal);
              self.form.crdr = -1;
            } else {
              self.form.openingBalance = acc.openingbal;
              self.form.crdr = 1;
            }
            self.flags.default = !!acc.defaultflag;
            axios
              .get(`/groupsubgroup/${acc.groupcode}`)
              .then((resp2) => {
                if (resp2.data.gkstatus === 0) {
                  const group = resp2.data.gkresult;
                  self.form.group = group.groupcode;
                  self.options.accDetails = JSON.parse(
                    JSON.stringify(self.form)
                  );
                  if (group.groupcode !== group.subgroupcode) {
                    self.flags.setSubGroup = group.subgroupcode;
                    self.options.accDetails.subGroup = group.subgroupcode;
                    self.fetchSubGroups(true);
                  }
                }
              })
              .catch((e1) => {
                self.displayToast(
                  'Fetch Account Details Failed!',
                  e1.message,
                  'danger'
                );
              });
          } else {
            self.displayToast(
              'Fetch Account Details Failed!',
              'Please Try after some time. Contact Admin if problem persists.',
              'danger'
            );
          }
          self.isPreloading = false;
        })
        .catch((e) => {
          self.isPreloading = false;
          self.displayToast(
            'Fetch Account Details Failed!',
            e.message,
            'danger'
          );
        });
    },
    /**
     * fetchSubGroups
     *
     * Description: Fetches the subgroups for the selected group
     */
    fetchSubGroups(fetchNew) {
      if(typeof(fetchNew) !== 'boolean') {
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
            'Fetch SubGroups Data Failed!',
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
          this.displayToast('Fetch Groups Data Failed!', e.message, 'warning');
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
          this.displayToast('Preload Data Failed!', e.message, 'warning');
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
    this.preloadData().then(() => {
      this.fetchAccountDetails();
    });
  },
};
</script>
