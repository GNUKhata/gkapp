<template>
  <div class="card" :style="{ minWidth: '300px' }">
    <b-overlay :show="false" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="card-header text-left py-2">
      <b class="text-capitalize">
        <span v-if="isEditMode" v-translate> Edit {{ title }} </span>
        <span v-else v-translate> Create {{ title }} </span>
      </b>
      <slot name="close-button"> </slot>
    </div>
    <div class="card-body pb-2">
      <b-form class="text-left" @submit.prevent="confirmOnSubmit">
        <b-form-group
          label="Subgroup Name"
          label-for="acc-input-40"
          label-cols="3"
          label-size="sm"
          label-class="required"
        >
          <template #label> <translate> Sub Group Name </translate> </template>
          <b-form-input
              type="text"
              size="sm"
              required
              v-model="form.groupname"
          ></b-form-input>
        </b-form-group>
        <b-form-group
            label="Group"
            label-for="acc-input-10"
            label-cols="3"
            label-size="sm"
            label-class="required"
        >
          <template #label> <translate> Group </translate> </template>
          <v-select
            size="sm"
            id="acc-input-10"
            v-model="form.subgroupof"
            :options="options.groups"
            label="groupname"
            :reduce="(group) => group.groupcode"
            required
          ></v-select>
        </b-form-group>
        <hr class="my-2" />
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
            ></b-icon>
            <span class="align-middle" v-translate> Reset</span>
          </b-button>
          <b-button size="sm" type="submit" class="m-1" variant="success">
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle"
              :icon="isEditMode ? 'cloud-arrow-up' : 'plus-square'"
            ></b-icon>
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
   name: 'SubGroup',
   /**
    * Props
    *
    * formData: Initial data for the form
    * apiUrl: API url for POST, PUT and DELETE APIs
    * title: Page title
    * options: Dropdown field select options. This should be an object with
    * field name as key and select options as array as value.
    * isEditMode: To select between create and edit forms
    *
    */
   props: {
     formData: {
       type: Object,
       required: false,
     },
     apiUrl: {
       type: String,
       required: true,
     },
     title: {
       type: String,
       required: true,
     },
     options: {
       type: Object,
       required: false,
     },
     isEditMode: {
       type: Boolean,
       required: true,
     },
   },
   data() {
     return {
       form: {
         id: null,
         name: '',
         group: null,
       },
       isLoading: false,
     };
   },
   methods: {
     /**
      * setForm
      *
      * Actions: Clean form and load form data
      * if it is edit mode.
      */
     setForm() {
       this.form = Object.assign({}, this.form, this.FormData);
     },

     /**
      * createItem
      *
      * Actions: Sends POST request to `apiUrl`.
      */
     createItem(payload) {
       const self = this;
       return axios
         .post(this.apiUrl, payload)
         .then((resp) => {
           switch (resp.data.gkstatus) {
             case 0:
               {
                 self.displayToast(
                   this.$gettext('Create Item Success'),
                   this.$gettextInterpolate(
                     this.$gettext(
                       `%{title} was created Successfully!`
                     ),
                     { title: self.title }
                   ),
                   'success'
                 );
                 const log = { activity: `${self.title} was created.` };
                 axios.post('/log', log);

                 self.resetForm();
                 self.$emit('item-created');
               }
               break;
             case 1:
               self.displayToast(
                 this.$gettext('Create Item Failed'),
                 this.$gettext(
                   `Duplicate Entry, change the name and try again!`
                 ),
                 'warning'
               );
               break;
             case 2:
               self.displayToast(
                 this.$gettext('Create Item Failed'),
                 this.$gettext(
                   `Unauthorized access, please sign in and try again!`
                 ),
                 'warning'
               );
               break;
             default:
               self.displayToast(
                 this.$gettext('Create Item Failed'),
                 this.$gettext(
                 'Unable to Create Item, please try again later!'
                 ),
                 'danger'
               );
           }
           return resp.data.gkstatus;
         })
         .catch((e) => {
           this.displayToast(
             this.$gettext('Create Item Failed!'),
             e.message,
             'warning'
           );
           return e;
         });
     },
     /**
      * editItem
      *
      * Actions: Sends PUT request to `apiUrl`.
      */
     editItem(payload) {
       const self = this;
       return axios.put(this.apiUrl, payload).then((resp) => {
         if (resp.data.gkstatus === 0) {
           self.displayToast(
             this.$gettext('Edit Item Success'),
             this.$gettextInterpolate(
               this.$gettext(
                 `%{title} was Updated Successfully!`
               ),
               { title: self.title }
             ),
             'success'
           );
           self.$emit('item-edited');
         } else {
           self.displayToast(
             this.$gettext('Edit Item Failed'),
             this.$gettextInterpolate(
               this.$gettext(`%{title} was not Updated!`),
               { title: self.title }
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
       let text = `${mode} Item?`;
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
      */
     prepareResult() {
       let payload = this.form;
       return payload;
     },
     /**
      * onSubmit
      *
      * Actions: create or update items wrt isEditMode.
      */
     onSubmit(mode) {
       const self = this;
       const submitMethod = this.isEditMode ? 'editItem' : 'createItem';
       const payload = this.prepareResult(); // setup payload from form
       this.isLoading = true;

       this[submitMethod](payload)
         .then(() => {
           self.isLoading = false;
         })
         .catch((e) => {
           self.displayToast(`${mode} Item Failed`, e.message, 'warning');
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
   mounted() {
     this.form = this.formData;
     this.setForm();
   },
 };
</script>
