<template>
  <section class="m-2">
    <h4
      class="text-center mb-5 bg-dark text-light p-2"
      v-translate
    >
      News From GST Portal
    </h4>
    <b-overlay :show="loading">
      <div class="container bg-light p-2">
        <h3>{{ post.title }}</h3>
        <span class="text-muted text-monospace">Date: {{ post.date }}</span>
        <p
          class="mt-3"
          style="max-width: 100%; overflow-x: scroll"
          v-html="post.content"
        />
      </div>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
export default {
  name: 'SinglePost',
  props: {
    id: {
      required: true,
    },
  },
  data() {
    return {
      post: () => {},
      loading: false,
    };
  },
  methods: {
    getNewsItem() {
      this.loading = true;
      axios
        .get(`/gst-news?id=${this.id}`)
        .then((r) => {
          if (r.status == 200) {
            this.post = r.data.gkresult;
          } else {
            console.log(r.data);
          }
          this.loading = false;
        })
        .catch((e) => {
          console.log(e);
          this.loading = false;
        });
    },
  },
  mounted() {
    this.getNewsItem();
  },
};
</script>
