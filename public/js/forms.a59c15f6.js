(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["forms"],{"0894":function(t,e,n){"use strict";n.r(e);var o=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("title-bar",{attrs:{"title-stack":t.titleStack}}),n("hero-bar",[t._v(" Forms "),n("router-link",{staticClass:"button",attrs:{slot:"right",to:"/"},slot:"right"},[t._v(" Dashboard ")])],1),n("section",{staticClass:"section is-main-section"},[n("card-component",{attrs:{title:"Forms",icon:"ballot"}},[n("form",{on:{submit:function(e){return e.preventDefault(),t.submit(e)}}},[n("b-field",{attrs:{label:"From",horizontal:""}},[n("b-field",[n("b-input",{attrs:{icon:"account",placeholder:"Name",name:"name",required:""},model:{value:t.form.name,callback:function(e){t.$set(t.form,"name",e)},expression:"form.name"}})],1),n("b-field",[n("b-input",{attrs:{icon:"email",type:"email",placeholder:"E-mail",name:"email",required:""},model:{value:t.form.email,callback:function(e){t.$set(t.form,"email",e)},expression:"form.email"}})],1)],1),n("b-field",{attrs:{message:"Do not enter the leading zero",horizontal:""}},[n("b-field",[n("p",{staticClass:"control"},[n("a",{staticClass:"button is-static"},[t._v(" +44 ")])]),n("b-input",{attrs:{type:"tel",name:"phone",expanded:""},model:{value:t.form.phone,callback:function(e){t.$set(t.form,"phone",e)},expression:"form.phone"}})],1)],1),n("b-field",{attrs:{label:"Department",horizontal:""}},[n("b-select",{attrs:{placeholder:"Select a department",required:""},model:{value:t.form.department,callback:function(e){t.$set(t.form,"department",e)},expression:"form.department"}},t._l(t.departments,(function(e,o){return n("option",{key:o,domProps:{value:e}},[t._v(" "+t._s(e)+" ")])})),0)],1),n("hr"),n("b-field",{attrs:{label:"Subject",message:"Message subject",horizontal:""}},[n("b-input",{attrs:{placeholder:"e.g. Partnership proposal",required:""},model:{value:t.form.subject,callback:function(e){t.$set(t.form,"subject",e)},expression:"form.subject"}})],1),n("b-field",{attrs:{label:"Question",message:"Your question. Max 255 characters",horizontal:""}},[n("b-input",{attrs:{type:"textarea",placeholder:"Explain how we can help you",maxlength:"255",required:""},model:{value:t.form.question,callback:function(e){t.$set(t.form,"question",e)},expression:"form.question"}})],1),n("hr"),n("b-field",{attrs:{horizontal:""}},[n("b-field",{attrs:{grouped:""}},[n("div",{staticClass:"control"},[n("b-button",{attrs:{"native-type":"submit",type:"is-primary"}},[t._v("Submit")])],1),n("div",{staticClass:"control"},[n("b-button",{attrs:{type:"is-primary is-outlined"},on:{click:t.reset}},[t._v("Reset")])],1)])],1)],1)]),n("card-component",{attrs:{title:"Custom elements",icon:"ballot-outline"}},[n("b-field",{staticClass:"has-check",attrs:{label:"Checkbox",horizontal:""}},[n("checkbox-picker",{attrs:{options:{lorem:"Lorem",ipsum:"Ipsum",dolore:"Dolore"},type:"is-primary"},model:{value:t.customElementsForm.checkbox,callback:function(e){t.$set(t.customElementsForm,"checkbox",e)},expression:"customElementsForm.checkbox"}})],1),n("hr"),n("b-field",{staticClass:"has-check",attrs:{label:"Radio",horizontal:""}},[n("radio-picker",{attrs:{options:{one:"One",two:"Two"}},model:{value:t.customElementsForm.radio,callback:function(e){t.$set(t.customElementsForm,"radio",e)},expression:"customElementsForm.radio"}})],1),n("hr"),n("b-field",{attrs:{label:"Switch",horizontal:""}},[n("b-switch",{model:{value:t.customElementsForm.switch,callback:function(e){t.$set(t.customElementsForm,"switch",e)},expression:"customElementsForm.switch"}},[t._v(" Default ")])],1),n("hr"),n("b-field",{attrs:{label:"File",horizontal:""}},[n("file-picker",{model:{value:t.customElementsForm.file,callback:function(e){t.$set(t.customElementsForm,"file",e)},expression:"customElementsForm.file"}})],1)],1)],1)],1)},r=[];n("a4d3"),n("e01a"),n("d28b"),n("d3b7"),n("3ca3"),n("ddb0");function a(t){return a="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a(t)}var i=n("1e1d"),l=n("6df7"),s=n("9e86"),u=n.n(s),c=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("b-field",{attrs:{grouped:"","group-multiline":""}},t._l(t.options,(function(e,o){return n("div",{key:o,staticClass:"control"},[n("b-checkbox",{attrs:{"native-value":o,type:t.type},on:{input:t.input},model:{value:t.newValue,callback:function(e){t.newValue=e},expression:"newValue"}},[t._v(" "+t._s(e)+" ")])],1)})),0)},m=[],f={name:"CheckboxPicker",props:{options:{type:Object,default:null},type:{type:String,default:null},value:{default:[]}},data:function(){return{newValue:[]}},created:function(){this.newValue=this.value},methods:{input:function(){this.$emit("input",this.newValue)}},watch:{value:function(t){this.newValue=t}}},p=f,d=n("2877"),b=Object(d["a"])(p,c,m,!1,null,null,null),h=b.exports,v=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("b-field",{attrs:{grouped:"","group-multiline":""}},t._l(t.options,(function(e,o){return n("div",{key:o,staticClass:"control"},[n("b-radio",{attrs:{"native-value":o,type:t.type},on:{input:t.input},model:{value:t.newValue,callback:function(e){t.newValue=e},expression:"newValue"}},[t._v(" "+t._s(e)+" ")])],1)})),0)},y=[],k={name:"RadioPicker",props:{options:{type:Object,default:null},type:{type:String,default:null},value:{default:null}},data:function(){return{newValue:null}},created:function(){this.newValue=this.value},methods:{input:function(){this.$emit("input",this.newValue)}},watch:{value:function(t){this.newValue=t}}},g=k,x=Object(d["a"])(g,v,y,!1,null,null,null),w=x.exports,S=n("3b73"),_=n("503b"),F={name:"Forms",components:{HeroBar:_["a"],FilePicker:S["a"],RadioPicker:w,CheckboxPicker:h,CardComponent:l["a"],TitleBar:i["a"]},data:function(){return{isLoading:!1,form:{name:null,email:null,phone:null,department:null,subject:null,question:null},customElementsForm:{checkbox:[],radio:null,switch:!0,file:null},departments:["Business Development","Marketing","Sales"]}},computed:{titleStack:function(){return["Admin","Forms"]}},methods:{submit:function(){},reset:function(){this.form=u()(this.form,(function(t){return t&&"object"===a(t)?[]:null})),this.$buefy.snackbar.open({message:"Reset successfully",queue:!1})}}},E=F,$=Object(d["a"])(E,o,r,!1,null,null,null);e["default"]=$.exports},"242e":function(t,e,n){var o=n("72af"),r=n("ec69");function a(t,e){return t&&o(t,e,r)}t.exports=a},"3b4a":function(t,e,n){var o=n("0b07"),r=function(){try{var t=o(Object,"defineProperty");return t({},"",{}),t}catch(e){}}();t.exports=r},"3ca3":function(t,e,n){"use strict";var o=n("6547").charAt,r=n("69f3"),a=n("7dd0"),i="String Iterator",l=r.set,s=r.getterFor(i);a(String,"String",(function(t){l(this,{type:i,string:String(t),index:0})}),(function(){var t,e=s(this),n=e.string,r=e.index;return r>=n.length?{value:void 0,done:!0}:(t=o(n,r),e.index+=t.length,{value:t,done:!1})}))},"72af":function(t,e,n){var o=n("99cd"),r=o();t.exports=r},"872a":function(t,e,n){var o=n("3b4a");function r(t,e,n){"__proto__"==e&&o?o(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n}t.exports=r},"99cd":function(t,e){function n(t){return function(e,n,o){var r=-1,a=Object(e),i=o(e),l=i.length;while(l--){var s=i[t?l:++r];if(!1===n(a[s],s,a))break}return e}}t.exports=n},"9e86":function(t,e,n){var o=n("872a"),r=n("242e"),a=n("badf");function i(t,e){var n={};return e=a(e,3),r(t,(function(t,r,a){o(n,r,e(t,r,a))})),n}t.exports=i},d28b:function(t,e,n){var o=n("746f");o("iterator")},ddb0:function(t,e,n){var o=n("da84"),r=n("fdbc"),a=n("e260"),i=n("9112"),l=n("b622"),s=l("iterator"),u=l("toStringTag"),c=a.values;for(var m in r){var f=o[m],p=f&&f.prototype;if(p){if(p[s]!==c)try{i(p,s,c)}catch(b){p[s]=c}if(p[u]||i(p,u,m),r[m])for(var d in a)if(p[d]!==a[d])try{i(p,d,a[d])}catch(b){p[d]=a[d]}}}},e01a:function(t,e,n){"use strict";var o=n("23e7"),r=n("83ab"),a=n("da84"),i=n("5135"),l=n("861d"),s=n("9bf2").f,u=n("e893"),c=a.Symbol;if(r&&"function"==typeof c&&(!("description"in c.prototype)||void 0!==c().description)){var m={},f=function(){var t=arguments.length<1||void 0===arguments[0]?void 0:String(arguments[0]),e=this instanceof f?new c(t):void 0===t?c():c(t);return""===t&&(m[e]=!0),e};u(f,c);var p=f.prototype=c.prototype;p.constructor=f;var d=p.toString,b="Symbol(test)"==String(c("test")),h=/^Symbol\((.*)\)[^)]+$/;s(p,"description",{configurable:!0,get:function(){var t=l(this)?this.valueOf():this,e=d.call(t);if(i(m,t))return"";var n=b?e.slice(7,-1):e.replace(h,"$1");return""===n?void 0:n}}),o({global:!0,forced:!0},{Symbol:f})}}}]);
//# sourceMappingURL=forms.a59c15f6.js.map