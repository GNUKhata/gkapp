<template>
  <!--Cards-->
  <b-row cols="2">
    <router-link
      v-for="(card, i) in cards"
      :key="i"
      :to="card.url"
    >
      <b-card
        :footer="card.name"
        class="text-center m-1"
        :footer-text-variant="card.textColor"
        footer-tag="footer"
        :footer-bg-variant="card.color"
        :border-variant="card.color"
        style="height: 10em; width: 10em"
      >
        <img
          v-if="card.name == 'Go To Workflow'"
          src="img/workflow.svg"
          width="100"
          style="position: relative; bottom: 20px"
        >
        <b-card-text v-else>
          <b-icon
            scale="4"
            :variant="card.color"
            :icon="card.icon"
            class="mt-3"
          />
        </b-card-text>
      </b-card>
    </router-link>
  </b-row>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'Tiles',
  computed: {
    isGstEnabled: (self) => self.$store.getters['global/isGstEnabled'],
    cards: (self) => {
      let report = {
        name: 'Balance Sheet',
        url: '/balance-sheet',
      };
      if (self.isGstEnabled) {
        report.name = 'GSTR-1';
        report.url = '/gst/r1';
      }
      const tiles = [
        {
          name: 'Go To Workflow',
          icon: 'tools',
          text: 'Manage Customers / Suppliers / Goods / Services',
          url: '/workflow/Transactions-Invoice/-1',
          color: 'dark',
          textColor: 'light',
        },
        {
          name: 'Adjust Bills',
          icon: 'receipt-cutoff',
          text: 'Manage Customers / Suppliers / Goods / Services',
          url: '/billwise/3/-1',
          color: 'dark',
          textColor: 'light',
        },
        {
          name: report.name,
          icon: 'file',
          text: report.name,
          url: report.url,
          color: 'dark',
          textColor: 'light',
        },
        {
          name: 'Settings',
          icon: 'gear',
          text: 'Settings',
          url: '/settings',
          color: 'dark',
          textColor: 'light',
        },
      ];
      return tiles;
    },
  },
};
</script>
