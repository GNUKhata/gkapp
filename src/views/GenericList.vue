<template>
  <div>
    <section class="m-2">
      <h3 class="text-center" v-translate>{{ title }}</h3>
      <gk-toolbar>
      </gk-toolbar>
      <div class="clearfix"></div>
      <div>
        <div class="d-flex flex-row-reverse">
          <div class="p-2">
            <router-link
              class="btn btn-outline-info btn-sm"
              :to="`/accounts`"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle mr-1"
                icon="table"
              ></b-icon>
              Accounts
            </router-link>
          </div>
          <div class="p-2">
            <b-button
              v-b-modal.item-create
              variant="outline-primary"
              size="sm"
            >
              + Add
            </b-button>
          </div>
          <div class="p-2">
            <b-form-group
              class="mb-0"
            >
              <b-input-group size="sm">
                <b-form-input
                  id="filter-input"
                  v-model="filter"
                  type="search"
                  placeholder="Type to Search"
                ></b-form-input>

                <b-input-group-append>
                  <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </div>
        </div>
        <b-table
          borderless
          hover
          class="mt-3"
          :items="items"
          :fields="fields"
          :key="tableItems[idField]"
          head-variant="light"
          responsive=""
          :filter="filter"
        >
          <template #cell(actions)="data">
            <b-button
              @click="$bvModal.show('item-edit'+data.item[idField])"
              variant="outline-primary"
              class="mr-2 pt-0"
              size="sm"
            >
              <b-icon
                font-scale="0.9"
                icon="pencil"
              ></b-icon>
            </b-button>
            <b-button
              variant="danger"
              @click.prevent="confirmOnDelete(data.item)"
              class="pt-0"
              size="sm"
            >
              <b-icon
                font-scale="0.9"
                icon="trash-fill"
              ></b-icon>
            </b-button>
            <b-modal
              centered
              static
              body-class="p-0"
              :id="'item-edit'+data.item[idField]"
              hide-header
              hide-footer
            >
              <component
                :is="formComponent"
                :apiUrl="apiUrl"
                :title="title"
                :options="options"
                :formData="data.item"
                :isEditMode="true"
                @item-edited="hideModal('item-edit'+data.item[idField])"
              >
                <template #close-button>
                  <b-button
                    size="sm"
                    class="float-right py-0"
                    @click="hideModal('item-edit'+data.item[idField])"
                  >
                    x
                  </b-button>
                </template>
              </component>
            </b-modal>
          </template>
        </b-table>
      </div>
    </section>
    <b-modal
      centered
      static
      body-class="p-0"
      id="item-create"
      hide-footer
      hide-header
    >
      <component
        :is="formComponent"
        :apiUrl="apiUrl"
        :title="title"
        :options="options"
        :isEditMode="false"
        @item-created="hideModal('item-create')"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click="hideModal('item-create')"
          >
            x
          </b-button>
        </template>
      </component>
    </b-modal>
  </div>
</template>

<script>
 import axios from 'axios';
 import GkToolbar from '../components/GkToolbar.vue';
 import { mapState } from 'vuex';
 export default {
   name: 'GenericList',
   components: { GkToolbar },
   /**
    * Props
    *
    * apiUrl: API url for POST, PUT and DELETE APIs
    * downloadables: URLs for downloadables (spreadsheet, PDF)
    * title: Page title
    * fields: Item fields to be shown in table
    * idField: Id field of items
    * items: Items list
    * options: Dropdown field select options. This should be an object with
    * field name as key and select options as array as value.
    * formComponent: Component for add/edit form.
    *
    */
   props: {
     apiUrl: {
       type: String,
       required: true,
     },
     downloadables: {
       type: Array,
       required: false,
     },
     title: {
       type: String,
       required: true,
     },
     fields: {
       type: Array,
       required: true,
     },
     idField: {
       type: String,
       required: true,
     },
     items: {
       type: Array,
       required: true,
     },
     options: {
       type: Object,
       required: false,
     },
     formComponent: {
       type: Object,
       required: true,
     }
   },
   data() {
     return {
       tableItems: [],
       filter: null,
     };
   },
   computed: {
     ...mapState(['orgName', 'yearStart', 'yearEnd', 'orgType']),
   },
   methods: {
     /**
      * hideModal
      *
      * Actions: Hides modal form and updates the list.
      */
     hideModal(modalId) {
       this.$bvModal.hide(modalId);
       this.$emit('list-updated');
     },
     /**
      * deleteItem
      *
      * Actions: Delete item. This will also delete related customer if exists.
      */
     deleteItem(id) {
       if (!id) return;
       return axios
         .delete(this.apiUrl, { // Fix url
           data: {
             [this.idField]: id,
           },
         })
         .then((resp) => {
           if (resp.data.gkstatus === 0) {
             return resp.data.gkstatus;
           } else {
             this.$bvToast.toast(`Delete ${this.title} Failed!`, {
               variant: 'danger',
               solid: true,
             });
           }
         });
     },
     /**
      * confirmOnDelete
      *
      * Actions: Asks for deletion confirmation.
      */
     confirmOnDelete(itemDetails) {
       let id = itemDetails[this.idField];
       const self = this;
       let text = `Delete ${this.title}?`;
       let textDom = this.$createElement('div', {
         domProps: {
           innerHTML: text,
         },
       });
       this.$bvModal
           .msgBoxConfirm(textDom, {
             size: 'md',
             buttonSize: 'sm',
             okVariant: 'danger',
             headerClass: 'p-0 border-bottom-0',
             footerClass: 'border-top-0',
             centered: true,
           })
           .then(val => {
             if (val) {
               self.deleteItem(
                 id
               )
                   .then((status) => {
                     if (status === 0) {
                       this.$emit('list-updated');
                     }
                   });
             }
           });
     },
   },
 };
</script>
