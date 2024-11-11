<template>
  <section :class="show ? '' : 'd-none d-print-block'">
    <!-- org details card, appears while printing only -->
    <div class="d-flex flex-row justify-content-between m-2 border-dark border">
      <!-- col 1 -->
      <div class="d-flex flex-row">
        <div
          class="flex-column"
          style="align-self: center"
        >
          <img
            :src="orgImg"
            width="60"
            height="60"
            class="rounded "
            alt="Org Logo"
          >
        </div>
        <div class="d-flex flex-column ml-2">
          <h6 class="font-weight-bold mt-1">
            {{ orgAddress.orgname || 'N/A' }}
          </h6>
          <small><b>Address: </b> {{ orgAddress.orgaddr || 'N/A' }}</small>
          <small><b>City: </b>{{ orgAddress.orgcity || 'N/A' }}</small>
        </div>
      </div>
      <!-- col 2 -->
      <div>
        <small><b>Phone: </b> {{ orgAddress.orgtelno || 'N/A' }}</small>
        <br>
        <small
          v-if="orgAddress.gstin != null"
        ><b>GSTIN: </b>
          {{ Object.values(orgAddress.gstin)[0] || 'N/A' }}</small><br>
        <small><b>State: </b>{{ orgAddress.orgstate || 'N/A' }}</small> <br>
      </div>
      <!-- col 3 -->
      <div>
        <small><b>Date:</b> {{ dateReverse(currentDate()) }}</small><br>
        <small><b>Time:</b> {{ new Date().toTimeString().split(' ')[0] }}
          {{ new Date().toTimeString().split(' ')[1] }}</small><br>
        <small><b>User:</b> {{ userName }}</small>
      </div>
    </div>
    <slot />
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  props: {
    show: {
      value: [String, Boolean],
      default: false,
    },
  },
  name: 'ReportHeader',
  computed: {
    ...mapState(['orgName', 'orgImg', 'userName', 'orgAddress']),
    gstin: (self) => (self?.orgAddress.gstin ? self.orgAddress.gstin[0] : ''),
  },
};
</script>
