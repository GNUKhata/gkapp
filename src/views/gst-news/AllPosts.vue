<template>
  <section class="m-2">
    <h4
      class="text-center mb-5 bg-dark text-light p-2"
      v-translate
    >
      News From GST Portal
    </h4>
    <b-overlay :show="loading">
      <div class="container">
        <div
          v-for="post in newsItems"
          :key="post.id"
          class="news-item bg-light mb-3 p-2"
        >
          <span class="text-muted text-monospace">{{ post.date }}</span>
          <router-link :to="`/gst/news/${post.id}`">
            <h5>{{ post.title }}</h5>
          </router-link>
        </div>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
export default {
  name: 'AllPosts',
  data() {
    return {
      newsItems: null,
      loading: false,
    };
  },
  methods: {
    getNewsSummary() {
      this.loading = true;
      axios
        .get('/gst-news')
        .then((r) => {
          if (r.data.gkstatus == 0) {
            this.newsItems = r.data.gkresult;
            // store the count of posts for future use
            localStorage.setItem('gstNewsCount', this.newsItems.length);
          } else {
            this.$bvToast.toast('Unable to fetch API');
          }
          this.loading = false;
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
  mounted() {
    this.getNewsSummary();
  },
};
</script>
