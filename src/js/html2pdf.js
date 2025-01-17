// Code taken from:  https://github.com/johnnywang1994/jsPDF-html2canvas
// License (MIT) : https://github.com/johnnywang1994/jsPDF-html2canvas/blob/master/LICENSE

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// const { jsPDF } = jspdf;

function isObject(v) {
  return v !== null && typeof v === 'object';
}

function isFn(v) {
  return typeof v === 'function';
}

function joinObject(obj1, obj2) {
  for (let i = 0, keys = Object.keys(obj1); i < keys.length; i++) {
    const key = keys[i];
    if (key in obj2) {
      const isObject_1 = isObject(obj1[key]);
      const isObject_2 = isObject(obj2[key]);
      if (isObject_1 && isObject_2) {
        if (isFn(obj1[key]) && isFn(obj2[key])) {
          if (isFn(obj1[key]) && !isFn(obj2[key])) {
            console.error(
              `[jspdf-html2canvas] config key "${key}" type invalid`
            );
          } else {
            obj1[key] = obj2[key];
          }
        } else {
          obj1[key] = joinObject(obj1[key], obj2[key]);
        }
      } else if (isObject_2) {
        obj2[key].old = obj1[key];
        obj1[key] = obj2[key];
      } else if (isObject_1) {
        obj1[key].new = obj2[key];
      } else {
        obj1[key] = obj2[key];
      }
      delete obj2[key];
    }
  }
  return Object.assign(obj1, obj2);
}

const defaultOpts = {
  jsPDF: {
    unit: 'px',
    format: 'a4',
  },
  html2canvas: {
    imageTimeout: 15000,
    logging: true,
    useCORS: false,
  },
  margin: {
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  imageType: 'image/png',
  imageQuality: 1,
  output: 'jspdf-generate.pdf',
  init: function() {},
  success: function(pdf) {
    pdf.save(this.output);
  },
};

const images = function(type) {
  let types = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
  };
  return types[type];
};

// ----- jsPDF -----
function getPdf(opts) {
  const { margin } = opts;
  const pdf = new jsPDF(opts.jsPDF);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const pdfContentWidth = pdfWidth - (margin.left + margin.right);
  const pdfContentHeight = pdfHeight - (margin.top + margin.bottom);
  const position = 0; // page's start position
  const currentPage = 1; // current page number of total pdf
  const pageOfCurrentNode = 1; // current page of current node
  return {
    pdf,
    pdfWidth,
    pdfHeight,
    pdfContentWidth,
    pdfContentHeight,
    position,
    currentPage,
    pageOfCurrentNode,
  };
}

// canvas to DataUri
function getPageData({ canvas, pdf, pdfContentWidth, opts }) {
  const pageData = canvas.toDataURL(opts.imageType, opts.imageQuality);
  const imgProps = pdf.getImageProperties(pageData);
  const imgHeight = (pdfContentWidth / imgProps.width) * imgProps.height;
  return {
    pageData,
    imgHeight,
  };
}

function onCanvasRendered(canvas, pdfInstance, opts) {
  let {
    pdf,
    pdfContentWidth,
    pdfContentHeight,
    pdfWidth,
    pdfHeight,
    position,
    currentPage,
    pageOfCurrentNode,
  } = pdfInstance;
  const { pageData, imgHeight } = getPageData({
    canvas,
    pdf,
    pdfContentWidth,
    opts,
  });

  // height which not yet print to PDF.
  let leftHeight = imgHeight;

  // check if need reset position(change node)
  if (position < 0) {
    pdf.addPage();
    currentPage += 1;
    pageOfCurrentNode = 1;
    position = 0;
  }

  // check if content needs multi pages
  const { margin } = opts;
  while (leftHeight > 0) {
    // add content
    pdf.addImage(
      pageData,
      images(opts.imageType),
      margin.left,
      position +
        margin.top * pageOfCurrentNode +
        margin.bottom * (pageOfCurrentNode - 1),
      pdfContentWidth,
      imgHeight
    );
    // add margin top/bottom
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, margin.top, 'F');
    pdf.rect(0, pdfHeight - margin.bottom, pdfWidth, margin.bottom, 'F');
    pdf.setFontSize(8);
    pdf.text(
      `(${currentPage})`,
      pdfWidth * 0.5,
      pdfHeight - margin.bottom * 0.5
    );
    // check left content
    if (leftHeight < pdfContentHeight) {
      position -= leftHeight;
      break;
    } else {
      leftHeight -= pdfContentHeight;
      position -= pdfHeight;
      pdf.addPage();
      currentPage += 1;
      pageOfCurrentNode += 1;
    }
  }

  // expose for next round
  pdfInstance.pdf = pdf;
  pdfInstance.position = position;
  pdfInstance.currentPage = currentPage;
  pdfInstance.pageOfCurrentNode = pageOfCurrentNode;

  return { pdf, position };
}

function addWaterMark(pdf, opts) {
  const totalPages = pdf.internal.getNumberOfPages();
  // image watermark
  if (opts.watermarkImg) {
    const waterProps = pdf.getImageProperties(opts.watermarkImg);
    const ratio = opts.watermark.scale || 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      // custom handler with image
      if (opts.watermark.src && opts.watermark.handler) {
        const param = {
          pdf,
          pageNumber: i,
          totalPageNumber: totalPages,
          imgNode: opts.watermarkImg,
        };
        opts.watermark.handler.call(opts, param);
      } else {
        // auto centeral watermark with ratio
        pdf.addImage(
          opts.watermarkImg,
          'PNG',
          (pdf.internal.pageSize.width - waterProps.width * ratio) / 2,
          (pdf.internal.pageSize.height - waterProps.height * ratio) / 2,
          waterProps.width * ratio,
          waterProps.height * ratio
        );
      }
    }
    // custom function handler
  } else if (typeof opts.watermark === 'function') {
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const param = {
        pdf,
        pageNumber: i,
        totalPageNumber: totalPages,
      };
      opts.watermark.call(opts, param);
    }
  } else {
    console.error(
      '[jspdf-html2canvas] "watermark" option should be either "string" or "function" type.'
    );
  }
  return pdf;
}

function useWaterMark(opts, callback) {
  const watermarkImg = new Image();
  const src =
    typeof opts.watermark === 'string' ? opts.watermark : opts.watermark.src;
  // image watermark
  if (src) {
    watermarkImg.onload = function() {
      callback(watermarkImg);
    };
    watermarkImg.crossOrigin = 'Anonymous';
    watermarkImg.src = src;
  } else {
    callback();
  }
}

async function html2PDF(dom, opts = {}) {
  opts = joinObject(defaultOpts, opts);
  const pdfInstance = getPdf(opts);
  // init pdf
  opts.init.call(opts, pdfInstance.pdf);

  // multi pages by nodes
  if (dom.length) {
    for (let i = 0; i < dom.length; i++) {
      const canvas = await html2canvas(dom[i], opts.html2canvas);
      onCanvasRendered(canvas, pdfInstance, opts);
    }
  } else {
    // single page for one node
    const canvas = await html2canvas(dom, opts.html2canvas);
    onCanvasRendered(canvas, pdfInstance, opts);
  }

  // check watermark
  if (opts.watermark) {
    useWaterMark(opts, function(watermarkImg) {
      if (watermarkImg) {
        opts.watermarkImg = watermarkImg;
      }
      pdfInstance.pdf = addWaterMark(pdfInstance.pdf, opts);
    });
  }

  return pdfInstance.pdf;
}

export default html2PDF;
