<template>
  <div class="card" :style="{ minWidth: '300px' }">
    <div class="card-header text-left py-2">
      <b class="text-capitalize">
        <span v-if="isEditMode" v-translate> Edit Account </span>
        <span v-else v-translate> Create Account </span>
      </b>
      <slot name="close-button" />
    </div>
    <div class="card-body pb-2">
      <b-alert
        class="p-1 text-left"
        v-if="accountDetails?.sysaccount ? true : false"
        show variant="warning">
        Only opening balance of this system generated account can be edited.
      </b-alert>
      <b-form class="text-left" @submit.prevent="confirmOnSubmit">
        <b-form-group
          label="Group"
          label-for="acc-input-10"
          label-cols="3"
          label-size="sm"
          label-class="required"
        >
          <template #label> <translate> Group </translate> </template>
        </b-form-group>
        <b-form-group
          label="Group"
          label-for="acc-input-10"
          label-cols="3"
          label-size="sm"
          label-class="required"
        >
          <template #label> <translate> Sub Group </translate> </template>
          <v-select
            id="acc-input-20"
            v-model="form.subGroup"
            :options="subGroups"
            label="groupname"
            :reduce="(subGroup) => subGroup.groupcode"
            :disabled="accountDetails?.sysaccount? true : false"
            :required="false"
          ></v-select>
        </b-form-group>
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
              {{ isEditMode ? 'Update' : 'Save' }}</span
                                                  >
          </b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
 import axios from 'axios';
 export default {
   name: 'Account',
   props: {
     accountDetails: {
       type: Object,
       required: false,
     },
     groupsSubgroups: {
       type: Object,
       required: true,
     },
   },
   data() {
     return {
       form: {
         id: null,
         name: '',
         group: null,
         subGroup: null,
         openingBalance: null,
         defaultFlag: false,
       },
       isEditMode: false,
       isLoading: false,
       groups: [],
       alterText: '',
     };
   },
   computed: {
     subGroups: (self) => {
       return Object.values(
         self.groupsSubgroups[self.form.group]?.childGroups ?? []
       );
     },
     disableFields: (self) => {
       let fields = {
         group: false,
         subGroup: false,
         default: false,
         name: false,
       };
       if (self.isSysAccount) {
         fields = {
           group: true,
           subGroup: true,
           default: true,
           name: true,
         };
       }

       return fields;
     },
   },
   methods: {
     /**
      * loadAccountData
      *
      * Actions: Load form data from accountDetails
      */
     loadAccountData(accountData) {
       this.form = Object.assign( {}, this.form, {
         id: accountData.accountcode,
         name: accountData.accountname,
         group: accountData.groupcode,
         subGroup: accountData?.subgroupcode,
         openingBalance: accountData?.openingbal,
         defaultFlag: accountData?.defaultflag, // [FIXME] check if it is needed here
       });
     },

     /**
      * setForm
      *
      * Actions: Clean form and and load form data from accountDetails
      * if it is edit mode.
      */
     setForm() {
       this.form = Object.assign({}, this.form, {
         id: null,
         name: '',
         group: null,
         subGroup: null,
         openingBalance: null,
         defaultFlag: false,
       });
       if (this.isEditMode) {
         this.loadAccountData(this.accountDetails);
       }
     },

     /**
      * createAccount
      *
      * Actions: Sends POST request to `/accounts`.
      */
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
     /**
      * editAccount
      *
      * Actions: Sends PUT request to `/accounts`.
      */
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

     /**
      * confirmOnSubmit
      *
      * Actions: Loads confirmation modal for create and edit
      */
     confirmOnSubmit() {
       const self = this;

       // the method to call based on the current mode of the form (create/edit)
       const mode = this.isEditMode ? 'Edit' : 'Create';
       let group = this.groupsSubgroups[this.form.group];
       let subGroup = group.childGroups[this.form.subGroup];
       let text = `${mode} Account <b>${this.form.name}</b> in (${group.groupname}) Group`;
       if (subGroup) {
         text += ` and (${subGroup.groupname}) Sub-Group`;
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
             footerClass: 'border-top-0',
             centered: true,
           })
           .then((val) => {
             if (val) {
               self.onSubmit(mode);
             }
           });
     },
     /**
      * prepareResult
      *
      * Actions: Prepare the payload for POST/PUT APIs from from the form
      *
      * The additional lines with "custsupflag" and "oldcustname" are to handle
      * the expected response structure. This has to be updated with API updation.
      */
     prepareResult() {
       let payload = {
         "gkdata":{
           accountname: this.form.name,
           groupcode: this.form?.subGroup || this.form?.group,
           openingbal: this.form.openingBalance,
         },
       }
       if (this.isEditMode) {
         payload.gkdata = Object.assign({}, payload.gkdata, {accountcode: this.form.id});
         payload = Object.assign(
           {}, payload, {
             "custsupflag": 0,
             "oldcustname": this.accountDetails["accountname"],
           }
         );
       } else {
         payload = Object.assign({}, payload, {"origin": "createaccount"});
       }
       return payload;
     },
     /**
      * onSubmit
      *
      * Actions: Inits payload and Creates New Sub Group (if chosen) and Create/Edit the account.
      */
     onSubmit(mode) {
       const self = this;
       const submitMethod = this.isEditMode ? 'editAccount' : 'createAccount';
       const payload = this.prepareResult(); // setup payload from form
       this.isLoading = true;

       this[submitMethod](payload)
         .then(() => {
           self.isLoading = false;
         })
         .catch((e) => {
           self.displayToast(`${mode} Account Failed`, e.message, 'warning');
           self.isLoading = false;
         });
     },
     /**
      * resetForm
      *
      * Actions: Resets form data
      */
     resetForm() {
       this.setForm();
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
   },
   /**
    * Actions: Sets edit mode, set form contents and updates group.
    *
    */
   created () {
     this.isEditMode = this.accountDetails ? true : false;
     this.setForm();
     this.groups = Object.values(this.groupsSubgroups);
   },
 };
</script>
