<template>
  <div class="d-flex flex-row justify-content-left d-print-none">
    <div
      v-for="(style, index) in colorVersion"
      :key="index"
      :style="style"
    />
  </div>
</template>

<script>
import { version } from '../../package';
export default {
  name: 'ColorBar',
  data() {
    return {
      // color codes for numbers
      // number: {
      //     zero: 'violet',
      //     one: 'Indigo',
      //     two: 'blue',
      //     three: 'green',
      //     four: 'yellow',
      //     five: 'orange',
      //     six: 'red',
      //     seven: 'black',
      //     eight: 'maroon',
      //     nine: 'coral'
      //     },
      colors: [
        'violet',
        'Indigo',
        'blue',
        'green',
        'yellow',
        'orange',
        'red',
        'black',
        'maroon',
        'coral',
      ],
      colorVersion: [],
    };
  },
  methods: {
    ver() {
      const projectVersion = version.split('.');
      this.colorVersion = [
        `background-color: ${
          this.colors[projectVersion[0]]
        }; height: 3px; width: 55%`,
        `background-color: ${
          this.colors[projectVersion[1]]
        }; height: 3px; width: 35%`,
        `background-color: ${
          this.colors[projectVersion[2]]
        }; height: 3px; width: 15%`,
      ];
    },
  },
  mounted() {
    this.ver();
  },
};
</script>
