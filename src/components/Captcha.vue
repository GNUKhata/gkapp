<template>
  <b-form-row>
    <canvas
      aria-label="Question audio button"
      title="Audio question"
      :width="width"
      :height="height"
      ref="canvas"
      style="border: 1px solid black; background-color: antiquewhite"
      class="ml-2"
    />
    <b-icon
      class="ml-3 mt-2"
      @click="audioCaptcha"
      role="button"
      icon="volume-up-fill"
      variant="dark"
      title="Audio Captcha"
      aria-label="audio question button"
      scale="1.5x"
    />
    <b-icon
      class="ml-3 mt-2"
      @click="newCaptcha"
      role="button"
      icon="arrow-repeat"
      variant="dark"
      title="Generate New Captcha"
      aria-label="generate new captcha button"
      scale="1.3x"
    />
  </b-form-row>
</template>

<script>
export default {
  name: 'Captcha',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Number,
      note: 'this prop gets the answer',
    },
    width: {
      default: 90,
      note: 'Canvas Width (optional). Default is 90',
    },
    height: {
      default: 30,
      note: 'Canvas height (optional), Default is 30',
    },
  },
  data() {
    return {
      text: '',
    };
  },
  methods: {
    /*
     / This method randomly generates simple addition sums
     / in range of 0-10
     */
    newCaptcha() {
      let a = Math.floor(Math.random() * 11);
      let b = Math.floor(Math.random() * 11);
      this.text = `${a} + ${b}`;
      let answer = a + b;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillText(`${this.text} = `, this.width / 2, this.height / 2);
      this.$emit('change', answer);
    },
    /* This method converts the question to audio
    / for the pupose of users who require accessibility features
    /*/
    audioCaptcha() {
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = this.text;
        window.speechSynthesis.speak(msg);
      } else {
        this.$bvModal.msgBoxOk(
          'Your browser does not support speech synthesis'
        );
      }
    },
  },
  mounted() {
    this.newCaptcha();
  },
};
</script>
