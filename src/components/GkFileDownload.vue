<template>
  <b-button
    :disabled="disabled"
    :label="name"
    :title="title"
    :size="size"
    :variant="variant"
    @click.prevent="onFileDownload"
    class="d-print-none"
    :aria-label="`${this.title}`"
  >
    <b-overlay
      :spinner-variant="variant"
      spinner-type="grow"
      spinner-small
      :show="loading"
    >
      <b-icon
        aria-hidden="true"
        class="align-middle"
        :icon="icon"
        :font-scale="fontScale"
      />
      {{ name }}
    </b-overlay>
  </b-button>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'GkFileDownload',
  data() {
    return {
      loading: false,
    };
  },
  props: {
    messageFromParent: {
      type: String,
      required: true,
    },
    toggleFlag: Function,
    fileName: {
      type: String,
      required: false,
      default: `GNUKhata`,
    },
    fileExtn: {
      type: String,
      default: 'xlsx',
      note: 'Extension of the file to be downloaded, e.g. xlsx or jpeg',
    },
    addDate: {
      type: Boolean,
      required: false,
      default: true,
      note: 'Flag to add current date to the file name during download',
    },
    addTimeStamp: {
      type: Boolean,
      required: false,
      default: false,
      note: 'Flag to add time stamp to the file name during download',
    },
    url: {
      type: String,
      required: true,
      note: 'The Get URL to download the file from',
    },
    filePath: {
      type: Array,
      required: false,
      note: 'The path to tranverse to get the file after download',
    },
    fontScale: {
      type: Number,
      required: false,
      default: 1,
      note: 'The font scale of the icon used',
    },
    icon: {
      type: String,
      default: 'file-earmark-spreadsheet',
      note: 'Icon name',
    },
    name: {
      type: String,
      default: '',
      note: 'Button Name',
    },
    variant: {
      type: String,
      default: 'link',
    },
    disabled: {
      type: Boolean,
      default: false,
      note: 'Prop to disable the download button',
    },
    size: {
      type: String,
      default: 'sm',
    },
    title: {
      type: String,
      default: 'Download',
    },
    fileSuffix: {
      type: String,
      default: '',
    },
    commonParams: {
      type: [String, Boolean],
      default: true,
      note:
        'Some url params are common for all spreadsheet downloads. This prop if set to true, Adds common request params: fystart, fyend, orgname to url',
    },
  },
  computed: {
    ...mapState(['orgName', 'orgType', 'yearStart', 'yearEnd']),
  },
  methods: {
    onFileDownload() {
      this.loading = true;
      if (this.messageFromParent == "toggleFlagTrue") {
        this.toggleFlag();
      }

      let url = this.url;

      if (this.commonParams) {
        // prettier-ignore
        url += `&fystart=${this.dateReverse(this.yearStart)}&fyend=${this.dateReverse(this.yearEnd)}&orgname=${this.orgName}&orgtype=${this.orgType}`
      }
      axios
        .get(url, { responseType: 'blob' })
        .then((resp) => {
          console.log(resp.data.gkstatus);
          if (resp.data.gkstatus === 0 || resp.data.gkstatus === undefined) {
            let blob = resp.data;
            if (this.filePath) {
              if (this.filePath.length) {
                this.filePath.forEach((path) => {
                  blob = blob[path];
                });
              }
            }
            let fileUrl = window.URL.createObjectURL(blob);
            let atag = document.createElement('a');
            atag.href = fileUrl;
            let fileName = `${this.fileName}-${this.orgName}-${this.fileSuffix}`;
            if (this.addDate) {
              let date = this.dateReverse(this.currentDate());
              fileName += `-${date}`;
            }
            if (this.addTimeStamp) {
              let tStamp = new Date().toISOString().substr(11);
              fileName += `-${tStamp}`;
            }
            atag.download = `${fileName}.${this.fileExtn}`;
            atag.style.display = 'none';
            document.body.appendChild(atag);
            atag.click();
          } else {
            this.gk_toast(
              'File Download failed',
              `Failed with status code ${resp.data.gkstatus}`
            );
          }
          this.loading = false;
        })
        .catch((e) => {
          console.log(e);
          this.loading = false;
        });
    },
  },
};
</script>
