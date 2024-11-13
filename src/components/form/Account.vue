<template>
  <div
    class="card"
    :style="{minWidth: '300px'}"
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="card-header text-left py-2">
      <b class="text-capitalize">
        <span
          v-if="mode === 'edit'"
          v-translate
        > Edit Account </span>
        <span
          v-else
          v-translate
        > Create Account </span>
      </b>
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
          <autocomplete
            size="sm"
            id="acc-input-10"
            v-model="form.group"
            :options="options.groups"
            text-field="groupname"
            value-field="groupcode"
            @input="fetchSubGroups"
            required
            value-uid="id"
            :readonly="disableFields.group"
          />
        </b-form-group>
        <b-form-group
          label="Sub-Group"
          label-for="acc-input-20"
          label-cols="3"
          label-size="sm"
        >
          <template #label>
            <translate> Sub Group </translate>
          </template>
          <autocomplete
            size="sm"
            id="acc-input-20"
            v-model="form.subGroup"
            :options="subGroups"
            text-field="subgroupname"
            value-field="groupcode"
            @input="onSubGroupSelect"
            :required="false"
            value-uid="id"
            :readonly="
              !subGroups.length || flags.newSubGroup || disableFields.subGroup
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
        >
          <translate :translate-params="{groupName: defaultGroupName}">
            Set default for %{groupName}
          </translate>
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
          label-class="required"
        >
          <template #label>
            <translate> Opening Balance </translate>
          </template>
          <b-form-input
            type="number"
            size="sm"
            required
            v-model="form.openingBalance"
            step="0.01"
            min="0.01"
          />
        </b-form-group>
        <hr class="my-2">
        <div class="float-right">
          <b-button
            v-if="!hideBackButton"
            size="sm"
            class="m-1"
            variant="danger"
            @click.prevent="$router.go(-1)"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-left"
            />
            <span
              class="align-middle"
              v-translate
            > Back</span>
          </b-button>
          <b-button
            size="sm"
            class="m-1"
            variant="warning"
            @click.prevent="resetForm"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-repeat"
            />
            <span
              class="align-middle"
              v-translate
            > Reset</span>
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
              class="align-middle"
              :icon="isEditMode ? 'cloud-arrow-up' : 'plus-square'"
            />
            <span class="align-middle">
              {{ isEditMode ? 'Update' : 'Save' }}</span>
          </b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../Autocomplete.vue';
export default {
  name: 'Account',
  components: {
    Autocomplete,
  },
  data() {
    return {
      form: {
        name: '',
        group: null,
        subGroup: null,
        openingBalance: null,
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
    mode: {
      type: String,
      validator: function(value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
    onSave: {
      type: Function,
      required: false,
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
    accountId: {
      type: Number,
      required: false,
    },
    overlayOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSysAccount: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    alertText: (self) => {
      if (self.isEditMode) {
        if (self.flags.default) {
          return this.$gettextInterpolate(
            this.$gettext(`This is a default account for %{groupName}.`),
            { groupName: self.defaultGroupName }
          );
        } else if (self.isSysAccount) {
          return this.$gettext(
            ` Only opening balance of this system generated account can be edited.`
          );
        }
        return '';
      }
    },
    isEditMode: (self) => self.mode === 'edit',
    disableFields: (self) => {
      let fields = {
        group: false,
        subGroup: false,
        newSubGroup: false,
        default: false,
        name: false,
        gst: false,
      };
      if ((self.isSysAccount || self.flags.default) && self.mode === 'edit') {
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
        if (this.mode === 'edit') {
          this.fetchAccountDetails();
        }
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
              this.$gettext('Create Sub-Group Success'),
              this.$gettextInterpolate(
                this.$gettext(
                  `Sub-Group: %{subGroup} was created Successfully!`
                ),
                { subGroup: self.newSubGroup }
              ),
              'success'
            );
          } else {
            self.displayToast(
              this.$gettext('Create Sub-Group Failed'),
              this.$gettextInterpolate(
                this.$gettext(`Could not Create Account: %{subGroup}!`),
                { subGroup: self.newSubGroup }
              ),
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
                this.$gettextInterpolate(
                  this.$gettext(
                    `Account: %{accountName} was created Successfully!`
                  ),
                  { accountName: self.form.name }
                ),
                'success'
              );

              const log = { activity: `${self.form.name} account created.` };
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
    editAccount(payload) {
      const self = this;
      return axios.put('/accounts', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          self.displayToast(
            this.$gettext('Edit Account Success'),
            this.$gettextInterpolate(
              this.$gettext(
                `Account: %{accountName} was Updated Successfully!`
              ),
              { accountName: self.form.name }
            ),
            'success'
          );
          self.fetchAccountDetails();
          self.$emit('account-edited');
        } else {
          self.displayToast(
            this.$gettext('Edit Account Failed'),
            this.$gettextInterpolate(
              this.$gettext(`Account: %{accountName} was not Updated!`),
              { accountName: self.form.name }
            ),
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
      const payload = this.isEditMode
        ? this.initEditPayload()
        : this.initPayload();

      // the method to call based on the current mode of the form (create/edit)
      const submitMethod = this.isEditMode ? 'editAccount' : 'createAccount';
      const mode = this.isEditMode ? 'Edit' : 'Create';
      this.isLoading = true;

      if (payload.gkdata.groupcode === 'New') {
        this.createSubGroup({
          groupname: this.newSubGroup,
          subgroupof: this.form.group,
        })
          .then((data) => {
            if (data.gkstatus === 0) {
              payload.gkdata.groupcode = data.gkresult;
              self[submitMethod](payload).then(() => {
                self.isLoading = false;
              });
            } else {
              self.isLoading = false;
            }
          })
          .catch((e) => {
            self.displayToast(`${mode} Sub-Group Failed`, e.message, 'warning');
            self.isLoading = false;
          });
      } else {
        this[submitMethod](payload)
          .then(() => {
            self.isLoading = false;
          })
          .catch((e) => {
            self.displayToast(`${mode} Account Failed`, e.message, 'warning');
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
      let gkdata = {
        accountname: this.form.name,
        openingbal: parseFloat(this.form.openingBalance).toFixed(2),
        groupcode: this.form.subGroup,
      };

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

      if (this.defaultGroupName) {
        let subGroupName = this.options.groupNameToCode[this.form.subGroup];
        if (this.options.defaultGroups[subGroupName]) {
          gkdata['defaultflag'] = this.options.defaultGroups[subGroupName].code;
        }
      }

      payload['gkdata'] = gkdata;
      return payload;
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

      let gkdata = {
        accountname: this.form.name,
        openingbal: parseFloat(this.form.openingBalance).toFixed(2),
        accountcode: this.accountId,
        groupcode: this.form.subGroup,
      };

      // set default flag
      if (this.defaultGroupName) {
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
      if (this.isEditMode) {
        Object.assign(this.form, this.options.accDetails);
        this.flags.setSubGroup = this.form.subGroup;
      } else {
        if (this.form.group) {
          delete this.options.subGroups[this.form.group];
        }
        this.form = {
          name: null,
          group: null,
          subGroup: null,
        };
        this.flags = {
          default: false,
          newSubGroup: false,
          gst: false,
          moreDetails: false,
          setSubGroup: false,
        };
        this.newSubGroup = '';
      }
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
        .get(`/account/${this.accountId}`)
        .then((resp1) => {
          if (resp1.data.gkstatus === 0) {
            const acc = resp1.data.gkresult;
            self.form.name = acc.accountname;
            self.form.openingBalance = acc.openingbal;
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
                  }
                }
              })
              .catch((e1) => {
                self.displayToast(
                  this.$gettext('Fetch Account Details Failed!'),
                  e1.message,
                  'danger'
                );
              });
          } else {
            self.displayToast(
              this.$gettext('Fetch Account Details Failed!'),
              this.$gettext(
                'Please Try after some time. Contact Admin if problem persists.'
              ),
              'danger'
            );
          }
          self.isPreloading = false;
        })
        .catch((e) => {
          self.isPreloading = false;
          self.displayToast(
            this.$gettext('Fetch Account Details Failed!'),
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
          } else {
            self.subGroups.forEach((subGroup) => {
              self.options.groupNameToCode[subGroup.groupcode] =
                subGroup.subgroupname;
            });
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

      Promise.all(requests)
        .then(([resp1]) => {
          this.isPreloading = false;
          if (resp1.data.gkstatus === 0) {
            this.options.groups = resp1.data.gkresult;
            this.options.groups.forEach((group) => {
              this.options.groupNameToCode[group.groupcode] = group.groupname;
            });
          }
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
  },
  mounted() {
    this.preloadData();
  },
};
</script>
