<template>
  <b-button
    @click.prevent="printordownloadaction"
    size="sm"
    :variant="variant"
  >
    <b-icon
      aria-hidden="true"
      class="align-middle"
      :icon="iconName"
      :font-scale="fontScale"
      :class="{'d-none': textMode}"
    />
    <span :class="{'sr-only': !textMode}">{{ textMode || 'Print' }}</span>
  </b-button>
</template>

<script>
import html2pdf from 'html2pdf.js';
import { mapState } from 'vuex';
export default {
  name: 'PrintHelper',
  props: {
    messageFromParent: {
      type: String,
      required: true,
    },
    toggleFlag: Function,
    contentId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
      default: 'Page',
    },
    printStyles: {
      type: String,
      required: false,
      default: 'Page',
      note:
        'Custom styles as string if sent will be added to the HTML page, before printing',
    },
    variant: {
      type: String,
      required: false,
      default: 'primary',
      note: 'Button variant',
    },
    pageTitle: {
      type: String,
      required: false,
      default: '',
      note:
        'Title of the page to be displayed in header. Must be sent as HTML text. Used in place of slots',
    },
    fileName: {
      type: String,
      required: false,
      default: 'GNUKhata-PrintOut',
      note: 'Pdf file name',
    },
    fontScale: {
      type: Number,
      required: false,
      default: 1,
      note: 'Font scale of the print icon',
    },
    textMode: {
      type: [Boolean, String],
      required: false,
      default: false,
      note:
        'A mode, where the button uses text instead of icon. The text to be displayed is sent via the prop, when text mode needs to be enabled',
    },
    iconName: {
      type: String,
      required: false,
      default: 'printer',
      note: 'Icon name',
    },
  },
  data() {
    return {
      input: '',
      date: '',
      valid: null,
      notValidText: '',
    };
  },
  computed: {
    ...mapState(['orgName', 'userName']),
  },
  watch: {},
  methods: {
    printordownloadaction() {
      if(this.iconName === 'printer') {
        this.onPrint();
      } else {
        this.downloadPdf();
      }
    },
    splitTable() {
      let pageHeight = window.innerWidth > window.innerHeight ? 1600 : 1500;
      let contentDom = document.getElementById(this.contentId);

      let pages = [];
      let thead = contentDom.querySelector('thead');
      let tbody = contentDom.querySelector('tbody');
      let rows = Array.from(tbody.children);

      let tableCount = Math.ceil(
        (rows.length * rows[0].offsetHeight) / pageHeight
      );
      let rowCount = Math.floor(pageHeight / rows[0].offsetHeight);
      let rowIterator = 0;
      for (let i = 0; i < tableCount; i++) {
        let table = contentDom.cloneNode();
        table.id += `-${i}`;
        table.appendChild(thead.cloneNode(true));
        let tbody2 = document.createElement('tbody');
        let j = 1;
        while (j < rowCount && rowIterator < rows.length) {
          tbody2.appendChild(rows[rowIterator++].cloneNode(true));
          j++;
        }
        table.appendChild(tbody2);

        pages.push(table);
      }
      return pages;
    },
    onPrint() {
      if (this.messageFromParent == "toggleFlagTrue") {
        this.toggleFlag();
      }
      let tableFlag = false;
      this.$emit('before-print');
      let contentDom = document.getElementById(this.contentId);
      if (!contentDom) {
        this.$bvToast.toast(
          this.$gettext(
            'Unable to print the page. Please contact Admin if problem persists.'
          ),
          {
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          }
        );
        return;
      }

      let printWindow = window.open(
        '',
        `Print ${this.name} - GNUKhata`,
        `scrollbars=1,resizable=1,width=${2480},height=${3508}`
      );

      let printContent = '';

      tableFlag = contentDom.tagName === 'TABLE';

      if (tableFlag) {
        let tables = this.splitTable(contentDom);

        tables.forEach((table) => {
          printContent += table.outerHTML;
        });
      } else {
        printContent += contentDom.outerHTML;
      }

      printContent += this.pageTitle;

      let links = '';
      let linkDoms = Array.from(document.getElementsByTagName('link'));
      if (linkDoms.length) {
        linkDoms.forEach((link) => {
          links += link.outerHTML;
        });
      }

      let styles = '';
      let styleDoms = Array.from(document.getElementsByTagName('style'));
      if (styleDoms.length) {
        styleDoms.forEach((style) => {
          styles += style.innerHTML;
        });
      }
      // styles for printing table row bg
      styles += this.printStyles;

      styles += `
        @media print {
          *{
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
						border: inherit;
						font-size: 1em;
            }
          ${this.printStyles}
        }
        .d-print-none{
          display: none;
        }
				body {
					margin-top: 1%
				}
      `;

      printWindow.document.open();
      printWindow.document.write(
        `<!DOCTYPE html><html><head>${links}<style>${styles}</style></head>`
      );
      printWindow.document.write(`<body>${printContent}</body>`);
      printWindow.document.write(`</html>`);
      printWindow.document.close();

      /* printWindow.onload = function() {
        self.downloadPdf(
          tableFlag
            ? printWindow.document.body.querySelectorAll('table')
            : printWindow.document.body,
          printWindow
        );
      }; */
      printWindow.print();
    },

    downloadPdf() {
      let dateString = new Date().toISOString().split('.')[0];
      let date = dateString
        .split('T')[0]
        .split('-')
        .reverse()
        .join('_');
      let time = dateString.split('T')[1];
      let timeStamp = `${date}_${time}`;
      let fileName = `${this.orgName}_${this.fileName}_${timeStamp}.pdf`;
      const element = document.querySelector('.table');
      
      html2pdf()
        .from(element)
        .set({
          filename: fileName + '.pdf',
          page: { format: 'a4', orientation: 'portrait' } // Set page size and orientation
        })
        .save();
    },
  },
};
</script>
