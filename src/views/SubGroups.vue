<template>
  <generic-list
    apiUrl="/groups-subgroups"
    title="Sub Group"
    idField="groupcode"
    v-model="items"
    :items="items"
    :fields="fields"
    :options="options"
    :formComponent="formComponent"
    @list-updated="getSubGroups"
  >
  </generic-list>
</template>

<script>
 import GenericList from './GenericList.vue';
 import SubGroup from '../components/form/SubGroup.vue'
 import axios from 'axios';
 export default {
   name: '',
   components: { GenericList },
   data() {
     return {
       downloadables: [],
       fields: [
         {
           key: 'groupname',
           label: 'Name',
           class: 'text-break col-4',
         },
         {
           key: 'groupcode',
           label: 'Code',
           class: 'text-break col-2',
         },
         {
           key: 'parent_group_name',
           label: 'Parent Group',
           class: 'text-break col-4',
         },
         {
           key: 'actions',
           label: '',
           class: 'text-break text-right col-2',
         },
       ],
       formComponent: SubGroup,
       items: [],
       options: {
         "groups": []
       },
     }
   },
   methods: {
     prepareSubGroups(items) {
       this.items = items;
     },
     prepareGroups(groups) {
       this.options.groups = groups;
     },
     getGroups() {
       axios
         .get("/groups-subgroups?group_type=group")
         .then((resp) => {
           if (resp.data.gkstatus === 0) {
             this.prepareGroups(resp.data.gkresult);
           }
         })
         .catch((e) => {
           this.$bvToast.toast(e.message, {
             variant: 'danger',
             solid: true,
           });
         });
     },
     getSubGroups() {
       axios
         .get("/groups-subgroups?group_type=subgroup")
         .then((resp) => {
           if (resp.data.gkstatus === 0) {
             this.prepareSubGroups(resp.data.gkresult);
           }
         })
         .catch((e) => {
           this.$bvToast.toast(e.message, {
             variant: 'danger',
             solid: true,
           });
         });
     }
   },
   mounted() {
     this.getSubGroups();
     this.getGroups();
   },
 }
</script>
