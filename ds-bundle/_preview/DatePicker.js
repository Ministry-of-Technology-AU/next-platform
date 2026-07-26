"use strict";
var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p2, k3) {
        var o = {};
        for (var x in p2) if (x !== "children") o[x] = p2[x];
        if (k3 !== void 0) o.key = k3;
        return o;
      }
      function jsx35(t2, p2, k3) {
        var c = p2 && p2.children;
        return c === void 0 ? R.createElement(t2, np(p2, k3)) : R.createElement(t2, np(p2, k3), c);
      }
      function jsxs9(t2, p2, k3) {
        return R.createElement.apply(R, [t2, np(p2, k3)].concat(p2.children));
      }
      module.exports = R;
      module.exports.jsx = jsx35;
      module.exports.jsxs = jsxs9;
      module.exports.jsxDEV = function(t2, p2, k3, s) {
        return (s ? jsxs9 : jsx35)(t2, p2, k3);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // shim:react-dom-shim
  var require_react_dom_shim = __commonJS({
    "shim:react-dom-shim"(exports, module) {
      init_define_import_meta_env();
      var D2 = window.ReactDOM;
      var n = function() {
      };
      module.exports = Object.assign({ preload: n, preinit: n, preconnect: n, prefetchDNS: n, preloadModule: n, preinitModule: n }, D2);
    }
  });

  // .design-sync/previews/DatePicker.tsx
  var DatePicker_exports = {};
  __export(DatePicker_exports, {
    Disabled: () => Disabled,
    Empty: () => Empty,
    Required: () => Required,
    Selected: () => Selected,
    WithError: () => WithError
  });
  init_define_import_meta_env();

  // src/components/form.tsx
  init_define_import_meta_env();
  var import_react40 = __toESM(require_react_shim());

  // node_modules/sonner/dist/index.mjs
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim(), 1);
  var import_react_dom = __toESM(require_react_dom_shim(), 1);
  function __insertCSS(code) {
    if (!code || typeof document == "undefined") return;
    let head = document.head || document.getElementsByTagName("head")[0];
    let style = document.createElement("style");
    style.type = "text/css";
    head.appendChild(style);
    style.styleSheet ? style.styleSheet.cssText = code : style.appendChild(document.createTextNode(code));
  }
  var bars = Array(12).fill(0);
  var toastsCounter = 1;
  var Observer = class {
    constructor() {
      this.subscribe = (subscriber) => {
        this.subscribers.push(subscriber);
        return () => {
          const index2 = this.subscribers.indexOf(subscriber);
          this.subscribers.splice(index2, 1);
        };
      };
      this.publish = (data) => {
        this.subscribers.forEach((subscriber) => subscriber(data));
      };
      this.addToast = (data) => {
        this.publish(data);
        this.toasts = [
          ...this.toasts,
          data
        ];
      };
      this.create = (data) => {
        var _data_id;
        const { message: message2, ...rest } = data;
        const id = typeof (data == null ? void 0 : data.id) === "number" || ((_data_id = data.id) == null ? void 0 : _data_id.length) > 0 ? data.id : toastsCounter++;
        const alreadyExists = this.toasts.find((toast2) => {
          return toast2.id === id;
        });
        const dismissible = data.dismissible === void 0 ? true : data.dismissible;
        if (this.dismissedToasts.has(id)) {
          this.dismissedToasts.delete(id);
        }
        if (alreadyExists) {
          this.toasts = this.toasts.map((toast2) => {
            if (toast2.id === id) {
              this.publish({
                ...toast2,
                ...data,
                id,
                title: message2
              });
              return {
                ...toast2,
                ...data,
                id,
                dismissible,
                title: message2
              };
            }
            return toast2;
          });
        } else {
          this.addToast({
            title: message2,
            ...rest,
            dismissible,
            id
          });
        }
        return id;
      };
      this.dismiss = (id) => {
        if (id) {
          this.dismissedToasts.add(id);
          requestAnimationFrame(() => this.subscribers.forEach((subscriber) => subscriber({
            id,
            dismiss: true
          })));
        } else {
          this.toasts.forEach((toast2) => {
            this.subscribers.forEach((subscriber) => subscriber({
              id: toast2.id,
              dismiss: true
            }));
          });
        }
        return id;
      };
      this.message = (message2, data) => {
        return this.create({
          ...data,
          message: message2
        });
      };
      this.error = (message2, data) => {
        return this.create({
          ...data,
          message: message2,
          type: "error"
        });
      };
      this.success = (message2, data) => {
        return this.create({
          ...data,
          type: "success",
          message: message2
        });
      };
      this.info = (message2, data) => {
        return this.create({
          ...data,
          type: "info",
          message: message2
        });
      };
      this.warning = (message2, data) => {
        return this.create({
          ...data,
          type: "warning",
          message: message2
        });
      };
      this.loading = (message2, data) => {
        return this.create({
          ...data,
          type: "loading",
          message: message2
        });
      };
      this.promise = (promise, data) => {
        if (!data) {
          return;
        }
        let id = void 0;
        if (data.loading !== void 0) {
          id = this.create({
            ...data,
            promise,
            type: "loading",
            message: data.loading,
            description: typeof data.description !== "function" ? data.description : void 0
          });
        }
        const p2 = Promise.resolve(promise instanceof Function ? promise() : promise);
        let shouldDismiss = id !== void 0;
        let result;
        const originalPromise = p2.then(async (response) => {
          result = [
            "resolve",
            response
          ];
          const isReactElementResponse = import_react.default.isValidElement(response);
          if (isReactElementResponse) {
            shouldDismiss = false;
            this.create({
              id,
              type: "default",
              message: response
            });
          } else if (isHttpResponse(response) && !response.ok) {
            shouldDismiss = false;
            const promiseData = typeof data.error === "function" ? await data.error(`HTTP error! status: ${response.status}`) : data.error;
            const description = typeof data.description === "function" ? await data.description(`HTTP error! status: ${response.status}`) : data.description;
            const isExtendedResult = typeof promiseData === "object" && !import_react.default.isValidElement(promiseData);
            const toastSettings = isExtendedResult ? promiseData : {
              message: promiseData
            };
            this.create({
              id,
              type: "error",
              description,
              ...toastSettings
            });
          } else if (response instanceof Error) {
            shouldDismiss = false;
            const promiseData = typeof data.error === "function" ? await data.error(response) : data.error;
            const description = typeof data.description === "function" ? await data.description(response) : data.description;
            const isExtendedResult = typeof promiseData === "object" && !import_react.default.isValidElement(promiseData);
            const toastSettings = isExtendedResult ? promiseData : {
              message: promiseData
            };
            this.create({
              id,
              type: "error",
              description,
              ...toastSettings
            });
          } else if (data.success !== void 0) {
            shouldDismiss = false;
            const promiseData = typeof data.success === "function" ? await data.success(response) : data.success;
            const description = typeof data.description === "function" ? await data.description(response) : data.description;
            const isExtendedResult = typeof promiseData === "object" && !import_react.default.isValidElement(promiseData);
            const toastSettings = isExtendedResult ? promiseData : {
              message: promiseData
            };
            this.create({
              id,
              type: "success",
              description,
              ...toastSettings
            });
          }
        }).catch(async (error) => {
          result = [
            "reject",
            error
          ];
          if (data.error !== void 0) {
            shouldDismiss = false;
            const promiseData = typeof data.error === "function" ? await data.error(error) : data.error;
            const description = typeof data.description === "function" ? await data.description(error) : data.description;
            const isExtendedResult = typeof promiseData === "object" && !import_react.default.isValidElement(promiseData);
            const toastSettings = isExtendedResult ? promiseData : {
              message: promiseData
            };
            this.create({
              id,
              type: "error",
              description,
              ...toastSettings
            });
          }
        }).finally(() => {
          if (shouldDismiss) {
            this.dismiss(id);
            id = void 0;
          }
          data.finally == null ? void 0 : data.finally.call(data);
        });
        const unwrap = () => new Promise((resolve, reject) => originalPromise.then(() => result[0] === "reject" ? reject(result[1]) : resolve(result[1])).catch(reject));
        if (typeof id !== "string" && typeof id !== "number") {
          return {
            unwrap
          };
        } else {
          return Object.assign(id, {
            unwrap
          });
        }
      };
      this.custom = (jsx35, data) => {
        const id = (data == null ? void 0 : data.id) || toastsCounter++;
        this.create({
          jsx: jsx35(id),
          id,
          ...data
        });
        return id;
      };
      this.getActiveToasts = () => {
        return this.toasts.filter((toast2) => !this.dismissedToasts.has(toast2.id));
      };
      this.subscribers = [];
      this.toasts = [];
      this.dismissedToasts = /* @__PURE__ */ new Set();
    }
  };
  var ToastState = new Observer();
  var toastFunction = (message2, data) => {
    const id = (data == null ? void 0 : data.id) || toastsCounter++;
    ToastState.addToast({
      title: message2,
      ...data,
      id
    });
    return id;
  };
  var isHttpResponse = (data) => {
    return data && typeof data === "object" && "ok" in data && typeof data.ok === "boolean" && "status" in data && typeof data.status === "number";
  };
  var basicToast = toastFunction;
  var getHistory = () => ToastState.toasts;
  var getToasts = () => ToastState.getActiveToasts();
  var toast = Object.assign(basicToast, {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading
  }, {
    getHistory,
    getToasts
  });
  __insertCSS("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");

  // src/components/ui/label.tsx
  init_define_import_meta_env();

  // node_modules/@radix-ui/react-label/dist/index.mjs
  init_define_import_meta_env();
  var React5 = __toESM(require_react_shim(), 1);

  // node_modules/@radix-ui/react-label/node_modules/@radix-ui/react-primitive/dist/index.mjs
  init_define_import_meta_env();
  var React4 = __toESM(require_react_shim(), 1);
  var ReactDOM2 = __toESM(require_react_dom_shim(), 1);

  // node_modules/@radix-ui/react-slot/dist/index.mjs
  init_define_import_meta_env();
  var React3 = __toESM(require_react_shim(), 1);

  // node_modules/@radix-ui/react-compose-refs/dist/index.mjs
  init_define_import_meta_env();
  var React2 = __toESM(require_react_shim(), 1);
  function setRef(ref, value) {
    if (typeof ref === "function") {
      return ref(value);
    } else if (ref !== null && ref !== void 0) {
      ref.current = value;
    }
  }
  function composeRefs(...refs) {
    return (node) => {
      let hasCleanup = false;
      const cleanups = refs.map((ref) => {
        const cleanup = setRef(ref, node);
        if (!hasCleanup && typeof cleanup == "function") {
          hasCleanup = true;
        }
        return cleanup;
      });
      if (hasCleanup) {
        return () => {
          for (let i = 0; i < cleanups.length; i++) {
            const cleanup = cleanups[i];
            if (typeof cleanup == "function") {
              cleanup();
            } else {
              setRef(refs[i], null);
            }
          }
        };
      }
    };
  }
  function useComposedRefs(...refs) {
    return React2.useCallback(composeRefs(...refs), refs);
  }

  // node_modules/@radix-ui/react-slot/dist/index.mjs
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
  var use = React3[" use ".trim().toString()];
  function isPromiseLike(value) {
    return typeof value === "object" && value !== null && "then" in value;
  }
  function isLazyComponent(element) {
    return element != null && typeof element === "object" && "$$typeof" in element && element.$$typeof === REACT_LAZY_TYPE && "_payload" in element && isPromiseLike(element._payload);
  }
  // @__NO_SIDE_EFFECTS__
  function createSlot(ownerName) {
    const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
    const Slot22 = React3.forwardRef((props, forwardedRef) => {
      let { children, ...slotProps } = props;
      if (isLazyComponent(children) && typeof use === "function") {
        children = use(children._payload);
      }
      const childrenArray = React3.Children.toArray(children);
      const slottable = childrenArray.find(isSlottable);
      if (slottable) {
        const newElement = slottable.props.children;
        const newChildren = childrenArray.map((child) => {
          if (child === slottable) {
            if (React3.Children.count(newElement) > 1) return React3.Children.only(null);
            return React3.isValidElement(newElement) ? newElement.props.children : null;
          } else {
            return child;
          }
        });
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children: React3.isValidElement(newElement) ? React3.cloneElement(newElement, void 0, newChildren) : null });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children });
    });
    Slot22.displayName = `${ownerName}.Slot`;
    return Slot22;
  }
  var Slot = /* @__PURE__ */ createSlot("Slot");
  // @__NO_SIDE_EFFECTS__
  function createSlotClone(ownerName) {
    const SlotClone = React3.forwardRef((props, forwardedRef) => {
      let { children, ...slotProps } = props;
      if (isLazyComponent(children) && typeof use === "function") {
        children = use(children._payload);
      }
      if (React3.isValidElement(children)) {
        const childrenRef = getElementRef(children);
        const props2 = mergeProps(slotProps, children.props);
        if (children.type !== React3.Fragment) {
          props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
        }
        return React3.cloneElement(children, props2);
      }
      return React3.Children.count(children) > 1 ? React3.Children.only(null) : null;
    });
    SlotClone.displayName = `${ownerName}.SlotClone`;
    return SlotClone;
  }
  var SLOTTABLE_IDENTIFIER = /* @__PURE__ */ Symbol("radix.slottable");
  function isSlottable(child) {
    return React3.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
  }
  function mergeProps(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
      const slotPropValue = slotProps[propName];
      const childPropValue = childProps[propName];
      const isHandler = /^on[A-Z]/.test(propName);
      if (isHandler) {
        if (slotPropValue && childPropValue) {
          overrideProps[propName] = (...args) => {
            const result = childPropValue(...args);
            slotPropValue(...args);
            return result;
          };
        } else if (slotPropValue) {
          overrideProps[propName] = slotPropValue;
        }
      } else if (propName === "style") {
        overrideProps[propName] = { ...slotPropValue, ...childPropValue };
      } else if (propName === "className") {
        overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
      }
    }
    return { ...slotProps, ...overrideProps };
  }
  function getElementRef(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }

  // node_modules/@radix-ui/react-label/node_modules/@radix-ui/react-primitive/dist/index.mjs
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  var NODES = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul"
  ];
  var Primitive = NODES.reduce((primitive, node) => {
    const Slot4 = createSlot(`Primitive.${node}`);
    const Node2 = React4.forwardRef((props, forwardedRef) => {
      const { asChild, ...primitiveProps } = props;
      const Comp = asChild ? Slot4 : node;
      if (typeof window !== "undefined") {
        window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
      }
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Comp, { ...primitiveProps, ref: forwardedRef });
    });
    Node2.displayName = `Primitive.${node}`;
    return { ...primitive, [node]: Node2 };
  }, {});

  // node_modules/@radix-ui/react-label/dist/index.mjs
  var import_jsx_runtime3 = __toESM(require_react_shim(), 1);
  var NAME = "Label";
  var Label = React5.forwardRef((props, forwardedRef) => {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Primitive.label,
      {
        ...props,
        ref: forwardedRef,
        onMouseDown: (event) => {
          const target = event.target;
          if (target.closest("button, input, select, textarea")) return;
          props.onMouseDown?.(event);
          if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
        }
      }
    );
  });
  Label.displayName = NAME;
  var Root = Label;

  // node_modules/class-variance-authority/dist/index.mjs
  init_define_import_meta_env();

  // node_modules/clsx/dist/clsx.mjs
  init_define_import_meta_env();
  function r(e) {
    var t2, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t2 = 0; t2 < o; t2++) e[t2] && (f = r(e[t2])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx() {
    for (var e, t2, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t2 = r(e)) && (n && (n += " "), n += t2);
    return n;
  }

  // node_modules/class-variance-authority/dist/index.mjs
  var falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
  var cx = clsx;
  var cva = (base, config) => (props) => {
    var _config_compoundVariants;
    if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
    const { variants, defaultVariants } = config;
    const getVariantClassNames = Object.keys(variants).map((variant) => {
      const variantProp = props === null || props === void 0 ? void 0 : props[variant];
      const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
      if (variantProp === null) return null;
      const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
      return variants[variant][variantKey];
    });
    const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
      let [key, value] = param;
      if (value === void 0) {
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});
    const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
      let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
      return Object.entries(compoundVariantOptions).every((param2) => {
        let [key, value] = param2;
        return Array.isArray(value) ? value.includes({
          ...defaultVariants,
          ...propsWithoutUndefined
        }[key]) : {
          ...defaultVariants,
          ...propsWithoutUndefined
        }[key] === value;
      }) ? [
        ...acc,
        cvClass,
        cvClassName
      ] : acc;
    }, []);
    return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
  };

  // src/lib/utils.ts
  init_define_import_meta_env();

  // node_modules/tailwind-merge/dist/bundle-mjs.mjs
  init_define_import_meta_env();
  var concatArrays = (array1, array2) => {
    const combinedArray = new Array(array1.length + array2.length);
    for (let i = 0; i < array1.length; i++) {
      combinedArray[i] = array1[i];
    }
    for (let i = 0; i < array2.length; i++) {
      combinedArray[array1.length + i] = array2[i];
    }
    return combinedArray;
  };
  var createClassValidatorObject = (classGroupId, validator) => ({
    classGroupId,
    validator
  });
  var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
    nextPart,
    validators,
    classGroupId
  });
  var CLASS_PART_SEPARATOR = "-";
  var EMPTY_CONFLICTS = [];
  var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
  var createClassGroupUtils = (config) => {
    const classMap = createClassMap(config);
    const {
      conflictingClassGroups,
      conflictingClassGroupModifiers
    } = config;
    const getClassGroupId = (className) => {
      if (className.startsWith("[") && className.endsWith("]")) {
        return getGroupIdForArbitraryProperty(className);
      }
      const classParts = className.split(CLASS_PART_SEPARATOR);
      const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
      return getGroupRecursive(classParts, startIndex, classMap);
    };
    const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
      if (hasPostfixModifier) {
        const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
        const baseConflicts = conflictingClassGroups[classGroupId];
        if (modifierConflicts) {
          if (baseConflicts) {
            return concatArrays(baseConflicts, modifierConflicts);
          }
          return modifierConflicts;
        }
        return baseConflicts || EMPTY_CONFLICTS;
      }
      return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
    };
    return {
      getClassGroupId,
      getConflictingClassGroupIds
    };
  };
  var getGroupRecursive = (classParts, startIndex, classPartObject) => {
    const classPathsLength = classParts.length - startIndex;
    if (classPathsLength === 0) {
      return classPartObject.classGroupId;
    }
    const currentClassPart = classParts[startIndex];
    const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
    if (nextClassPartObject) {
      const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
      if (result) return result;
    }
    const validators = classPartObject.validators;
    if (validators === null) {
      return void 0;
    }
    const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
    const validatorsLength = validators.length;
    for (let i = 0; i < validatorsLength; i++) {
      const validatorObj = validators[i];
      if (validatorObj.validator(classRest)) {
        return validatorObj.classGroupId;
      }
    }
    return void 0;
  };
  var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
    const content = className.slice(1, -1);
    const colonIndex = content.indexOf(":");
    const property = content.slice(0, colonIndex);
    return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
  })();
  var createClassMap = (config) => {
    const {
      theme,
      classGroups
    } = config;
    return processClassGroups(classGroups, theme);
  };
  var processClassGroups = (classGroups, theme) => {
    const classMap = createClassPartObject();
    for (const classGroupId in classGroups) {
      const group = classGroups[classGroupId];
      processClassesRecursively(group, classMap, classGroupId, theme);
    }
    return classMap;
  };
  var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
    const len = classGroup.length;
    for (let i = 0; i < len; i++) {
      const classDefinition = classGroup[i];
      processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
    }
  };
  var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
    if (typeof classDefinition === "string") {
      processStringDefinition(classDefinition, classPartObject, classGroupId);
      return;
    }
    if (typeof classDefinition === "function") {
      processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
      return;
    }
    processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
  };
  var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
    const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
    classPartObjectToEdit.classGroupId = classGroupId;
  };
  var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
    if (isThemeGetter(classDefinition)) {
      processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
      return;
    }
    if (classPartObject.validators === null) {
      classPartObject.validators = [];
    }
    classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
  };
  var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
    const entries = Object.entries(classDefinition);
    const len = entries.length;
    for (let i = 0; i < len; i++) {
      const [key, value] = entries[i];
      processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
    }
  };
  var getPart = (classPartObject, path) => {
    let current = classPartObject;
    const parts = path.split(CLASS_PART_SEPARATOR);
    const len = parts.length;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      let next = current.nextPart.get(part);
      if (!next) {
        next = createClassPartObject();
        current.nextPart.set(part, next);
      }
      current = next;
    }
    return current;
  };
  var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
  var createLruCache = (maxCacheSize) => {
    if (maxCacheSize < 1) {
      return {
        get: () => void 0,
        set: () => {
        }
      };
    }
    let cacheSize = 0;
    let cache = /* @__PURE__ */ Object.create(null);
    let previousCache = /* @__PURE__ */ Object.create(null);
    const update = (key, value) => {
      cache[key] = value;
      cacheSize++;
      if (cacheSize > maxCacheSize) {
        cacheSize = 0;
        previousCache = cache;
        cache = /* @__PURE__ */ Object.create(null);
      }
    };
    return {
      get(key) {
        let value = cache[key];
        if (value !== void 0) {
          return value;
        }
        if ((value = previousCache[key]) !== void 0) {
          update(key, value);
          return value;
        }
      },
      set(key, value) {
        if (key in cache) {
          cache[key] = value;
        } else {
          update(key, value);
        }
      }
    };
  };
  var IMPORTANT_MODIFIER = "!";
  var MODIFIER_SEPARATOR = ":";
  var EMPTY_MODIFIERS = [];
  var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
    modifiers,
    hasImportantModifier,
    baseClassName,
    maybePostfixModifierPosition,
    isExternal
  });
  var createParseClassName = (config) => {
    const {
      prefix,
      experimentalParseClassName
    } = config;
    let parseClassName = (className) => {
      const modifiers = [];
      let bracketDepth = 0;
      let parenDepth = 0;
      let modifierStart = 0;
      let postfixModifierPosition;
      const len = className.length;
      for (let index2 = 0; index2 < len; index2++) {
        const currentCharacter = className[index2];
        if (bracketDepth === 0 && parenDepth === 0) {
          if (currentCharacter === MODIFIER_SEPARATOR) {
            modifiers.push(className.slice(modifierStart, index2));
            modifierStart = index2 + 1;
            continue;
          }
          if (currentCharacter === "/") {
            postfixModifierPosition = index2;
            continue;
          }
        }
        if (currentCharacter === "[") bracketDepth++;
        else if (currentCharacter === "]") bracketDepth--;
        else if (currentCharacter === "(") parenDepth++;
        else if (currentCharacter === ")") parenDepth--;
      }
      const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
      let baseClassName = baseClassNameWithImportantModifier;
      let hasImportantModifier = false;
      if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
        baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
        hasImportantModifier = true;
      } else if (
        /**
         * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
         * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
         */
        baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
      ) {
        baseClassName = baseClassNameWithImportantModifier.slice(1);
        hasImportantModifier = true;
      }
      const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
      return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
    };
    if (prefix) {
      const fullPrefix = prefix + MODIFIER_SEPARATOR;
      const parseClassNameOriginal = parseClassName;
      parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
    }
    if (experimentalParseClassName) {
      const parseClassNameOriginal = parseClassName;
      parseClassName = (className) => experimentalParseClassName({
        className,
        parseClassName: parseClassNameOriginal
      });
    }
    return parseClassName;
  };
  var createSortModifiers = (config) => {
    const modifierWeights = /* @__PURE__ */ new Map();
    config.orderSensitiveModifiers.forEach((mod, index2) => {
      modifierWeights.set(mod, 1e6 + index2);
    });
    return (modifiers) => {
      const result = [];
      let currentSegment = [];
      for (let i = 0; i < modifiers.length; i++) {
        const modifier = modifiers[i];
        const isArbitrary = modifier[0] === "[";
        const isOrderSensitive = modifierWeights.has(modifier);
        if (isArbitrary || isOrderSensitive) {
          if (currentSegment.length > 0) {
            currentSegment.sort();
            result.push(...currentSegment);
            currentSegment = [];
          }
          result.push(modifier);
        } else {
          currentSegment.push(modifier);
        }
      }
      if (currentSegment.length > 0) {
        currentSegment.sort();
        result.push(...currentSegment);
      }
      return result;
    };
  };
  var createConfigUtils = (config) => ({
    cache: createLruCache(config.cacheSize),
    parseClassName: createParseClassName(config),
    sortModifiers: createSortModifiers(config),
    ...createClassGroupUtils(config)
  });
  var SPLIT_CLASSES_REGEX = /\s+/;
  var mergeClassList = (classList, configUtils) => {
    const {
      parseClassName,
      getClassGroupId,
      getConflictingClassGroupIds,
      sortModifiers
    } = configUtils;
    const classGroupsInConflict = [];
    const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
    let result = "";
    for (let index2 = classNames.length - 1; index2 >= 0; index2 -= 1) {
      const originalClassName = classNames[index2];
      const {
        isExternal,
        modifiers,
        hasImportantModifier,
        baseClassName,
        maybePostfixModifierPosition
      } = parseClassName(originalClassName);
      if (isExternal) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      let hasPostfixModifier = !!maybePostfixModifierPosition;
      let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
      if (!classGroupId) {
        if (!hasPostfixModifier) {
          result = originalClassName + (result.length > 0 ? " " + result : result);
          continue;
        }
        classGroupId = getClassGroupId(baseClassName);
        if (!classGroupId) {
          result = originalClassName + (result.length > 0 ? " " + result : result);
          continue;
        }
        hasPostfixModifier = false;
      }
      const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
      const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
      const classId = modifierId + classGroupId;
      if (classGroupsInConflict.indexOf(classId) > -1) {
        continue;
      }
      classGroupsInConflict.push(classId);
      const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
      for (let i = 0; i < conflictGroups.length; ++i) {
        const group = conflictGroups[i];
        classGroupsInConflict.push(modifierId + group);
      }
      result = originalClassName + (result.length > 0 ? " " + result : result);
    }
    return result;
  };
  var twJoin = (...classLists) => {
    let index2 = 0;
    let argument;
    let resolvedValue;
    let string = "";
    while (index2 < classLists.length) {
      if (argument = classLists[index2++]) {
        if (resolvedValue = toValue(argument)) {
          string && (string += " ");
          string += resolvedValue;
        }
      }
    }
    return string;
  };
  var toValue = (mix) => {
    if (typeof mix === "string") {
      return mix;
    }
    let resolvedValue;
    let string = "";
    for (let k3 = 0; k3 < mix.length; k3++) {
      if (mix[k3]) {
        if (resolvedValue = toValue(mix[k3])) {
          string && (string += " ");
          string += resolvedValue;
        }
      }
    }
    return string;
  };
  var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
    let configUtils;
    let cacheGet;
    let cacheSet;
    let functionToCall;
    const initTailwindMerge = (classList) => {
      const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
      configUtils = createConfigUtils(config);
      cacheGet = configUtils.cache.get;
      cacheSet = configUtils.cache.set;
      functionToCall = tailwindMerge;
      return tailwindMerge(classList);
    };
    const tailwindMerge = (classList) => {
      const cachedResult = cacheGet(classList);
      if (cachedResult) {
        return cachedResult;
      }
      const result = mergeClassList(classList, configUtils);
      cacheSet(classList, result);
      return result;
    };
    functionToCall = initTailwindMerge;
    return (...args) => functionToCall(twJoin(...args));
  };
  var fallbackThemeArr = [];
  var fromTheme = (key) => {
    const themeGetter = (theme) => theme[key] || fallbackThemeArr;
    themeGetter.isThemeGetter = true;
    return themeGetter;
  };
  var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
  var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
  var fractionRegex = /^\d+\/\d+$/;
  var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
  var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
  var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
  var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
  var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
  var isFraction = (value) => fractionRegex.test(value);
  var isNumber = (value) => !!value && !Number.isNaN(Number(value));
  var isInteger = (value) => !!value && Number.isInteger(Number(value));
  var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
  var isTshirtSize = (value) => tshirtUnitRegex.test(value);
  var isAny = () => true;
  var isLengthOnly = (value) => (
    // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
    // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
    // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
    lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
  );
  var isNever = () => false;
  var isShadow = (value) => shadowRegex.test(value);
  var isImage = (value) => imageRegex.test(value);
  var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
  var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
  var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
  var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
  var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
  var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
  var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
  var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
  var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
  var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
  var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
  var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
  var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
  var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
  var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
  var getIsArbitraryValue = (value, testLabel, testValue) => {
    const result = arbitraryValueRegex.exec(value);
    if (result) {
      if (result[1]) {
        return testLabel(result[1]);
      }
      return testValue(result[2]);
    }
    return false;
  };
  var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
    const result = arbitraryVariableRegex.exec(value);
    if (result) {
      if (result[1]) {
        return testLabel(result[1]);
      }
      return shouldMatchNoLabel;
    }
    return false;
  };
  var isLabelPosition = (label) => label === "position" || label === "percentage";
  var isLabelImage = (label) => label === "image" || label === "url";
  var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
  var isLabelLength = (label) => label === "length";
  var isLabelNumber = (label) => label === "number";
  var isLabelFamilyName = (label) => label === "family-name";
  var isLabelShadow = (label) => label === "shadow";
  var getDefaultConfig = () => {
    const themeColor = fromTheme("color");
    const themeFont = fromTheme("font");
    const themeText = fromTheme("text");
    const themeFontWeight = fromTheme("font-weight");
    const themeTracking = fromTheme("tracking");
    const themeLeading = fromTheme("leading");
    const themeBreakpoint = fromTheme("breakpoint");
    const themeContainer = fromTheme("container");
    const themeSpacing = fromTheme("spacing");
    const themeRadius = fromTheme("radius");
    const themeShadow = fromTheme("shadow");
    const themeInsetShadow = fromTheme("inset-shadow");
    const themeTextShadow = fromTheme("text-shadow");
    const themeDropShadow = fromTheme("drop-shadow");
    const themeBlur = fromTheme("blur");
    const themePerspective = fromTheme("perspective");
    const themeAspect = fromTheme("aspect");
    const themeEase = fromTheme("ease");
    const themeAnimate = fromTheme("animate");
    const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
    const scalePosition = () => [
      "center",
      "top",
      "bottom",
      "left",
      "right",
      "top-left",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "left-top",
      "top-right",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "right-top",
      "bottom-right",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "right-bottom",
      "bottom-left",
      // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
      "left-bottom"
    ];
    const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
    const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
    const scaleOverscroll = () => ["auto", "contain", "none"];
    const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
    const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
    const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
    const scaleGridColRowStartAndEnd = () => ["auto", {
      span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
    }, isInteger, isArbitraryVariable, isArbitraryValue];
    const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
    const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
    const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
    const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
    const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
    const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
    const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
    const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
      position: [isArbitraryVariable, isArbitraryValue]
    }];
    const scaleBgRepeat = () => ["no-repeat", {
      repeat: ["", "x", "y", "space", "round"]
    }];
    const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
      size: [isArbitraryVariable, isArbitraryValue]
    }];
    const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
    const scaleRadius = () => [
      // Deprecated since Tailwind CSS v4.0.0
      "",
      "none",
      "full",
      themeRadius,
      isArbitraryVariable,
      isArbitraryValue
    ];
    const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
    const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
    const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
    const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
    const scaleBlur = () => [
      // Deprecated since Tailwind CSS v4.0.0
      "",
      "none",
      themeBlur,
      isArbitraryVariable,
      isArbitraryValue
    ];
    const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
    const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
    const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
    const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
    return {
      cacheSize: 500,
      theme: {
        animate: ["spin", "ping", "pulse", "bounce"],
        aspect: ["video"],
        blur: [isTshirtSize],
        breakpoint: [isTshirtSize],
        color: [isAny],
        container: [isTshirtSize],
        "drop-shadow": [isTshirtSize],
        ease: ["in", "out", "in-out"],
        font: [isAnyNonArbitrary],
        "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
        "inset-shadow": [isTshirtSize],
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
        perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
        radius: [isTshirtSize],
        shadow: [isTshirtSize],
        spacing: ["px", isNumber],
        text: [isTshirtSize],
        "text-shadow": [isTshirtSize],
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
      },
      classGroups: {
        // --------------
        // --- Layout ---
        // --------------
        /**
         * Aspect Ratio
         * @see https://tailwindcss.com/docs/aspect-ratio
         */
        aspect: [{
          aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
        }],
        /**
         * Container
         * @see https://tailwindcss.com/docs/container
         * @deprecated since Tailwind CSS v4.0.0
         */
        container: ["container"],
        /**
         * Columns
         * @see https://tailwindcss.com/docs/columns
         */
        columns: [{
          columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
        }],
        /**
         * Break After
         * @see https://tailwindcss.com/docs/break-after
         */
        "break-after": [{
          "break-after": scaleBreak()
        }],
        /**
         * Break Before
         * @see https://tailwindcss.com/docs/break-before
         */
        "break-before": [{
          "break-before": scaleBreak()
        }],
        /**
         * Break Inside
         * @see https://tailwindcss.com/docs/break-inside
         */
        "break-inside": [{
          "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
        }],
        /**
         * Box Decoration Break
         * @see https://tailwindcss.com/docs/box-decoration-break
         */
        "box-decoration": [{
          "box-decoration": ["slice", "clone"]
        }],
        /**
         * Box Sizing
         * @see https://tailwindcss.com/docs/box-sizing
         */
        box: [{
          box: ["border", "content"]
        }],
        /**
         * Display
         * @see https://tailwindcss.com/docs/display
         */
        display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
        /**
         * Screen Reader Only
         * @see https://tailwindcss.com/docs/display#screen-reader-only
         */
        sr: ["sr-only", "not-sr-only"],
        /**
         * Floats
         * @see https://tailwindcss.com/docs/float
         */
        float: [{
          float: ["right", "left", "none", "start", "end"]
        }],
        /**
         * Clear
         * @see https://tailwindcss.com/docs/clear
         */
        clear: [{
          clear: ["left", "right", "both", "none", "start", "end"]
        }],
        /**
         * Isolation
         * @see https://tailwindcss.com/docs/isolation
         */
        isolation: ["isolate", "isolation-auto"],
        /**
         * Object Fit
         * @see https://tailwindcss.com/docs/object-fit
         */
        "object-fit": [{
          object: ["contain", "cover", "fill", "none", "scale-down"]
        }],
        /**
         * Object Position
         * @see https://tailwindcss.com/docs/object-position
         */
        "object-position": [{
          object: scalePositionWithArbitrary()
        }],
        /**
         * Overflow
         * @see https://tailwindcss.com/docs/overflow
         */
        overflow: [{
          overflow: scaleOverflow()
        }],
        /**
         * Overflow X
         * @see https://tailwindcss.com/docs/overflow
         */
        "overflow-x": [{
          "overflow-x": scaleOverflow()
        }],
        /**
         * Overflow Y
         * @see https://tailwindcss.com/docs/overflow
         */
        "overflow-y": [{
          "overflow-y": scaleOverflow()
        }],
        /**
         * Overscroll Behavior
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        overscroll: [{
          overscroll: scaleOverscroll()
        }],
        /**
         * Overscroll Behavior X
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        "overscroll-x": [{
          "overscroll-x": scaleOverscroll()
        }],
        /**
         * Overscroll Behavior Y
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        "overscroll-y": [{
          "overscroll-y": scaleOverscroll()
        }],
        /**
         * Position
         * @see https://tailwindcss.com/docs/position
         */
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        /**
         * Top / Right / Bottom / Left
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        inset: [{
          inset: scaleInset()
        }],
        /**
         * Right / Left
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-x": [{
          "inset-x": scaleInset()
        }],
        /**
         * Top / Bottom
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-y": [{
          "inset-y": scaleInset()
        }],
        /**
         * Start
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        start: [{
          start: scaleInset()
        }],
        /**
         * End
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        end: [{
          end: scaleInset()
        }],
        /**
         * Top
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        top: [{
          top: scaleInset()
        }],
        /**
         * Right
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        right: [{
          right: scaleInset()
        }],
        /**
         * Bottom
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        bottom: [{
          bottom: scaleInset()
        }],
        /**
         * Left
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        left: [{
          left: scaleInset()
        }],
        /**
         * Visibility
         * @see https://tailwindcss.com/docs/visibility
         */
        visibility: ["visible", "invisible", "collapse"],
        /**
         * Z-Index
         * @see https://tailwindcss.com/docs/z-index
         */
        z: [{
          z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
        }],
        // ------------------------
        // --- Flexbox and Grid ---
        // ------------------------
        /**
         * Flex Basis
         * @see https://tailwindcss.com/docs/flex-basis
         */
        basis: [{
          basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
        }],
        /**
         * Flex Direction
         * @see https://tailwindcss.com/docs/flex-direction
         */
        "flex-direction": [{
          flex: ["row", "row-reverse", "col", "col-reverse"]
        }],
        /**
         * Flex Wrap
         * @see https://tailwindcss.com/docs/flex-wrap
         */
        "flex-wrap": [{
          flex: ["nowrap", "wrap", "wrap-reverse"]
        }],
        /**
         * Flex
         * @see https://tailwindcss.com/docs/flex
         */
        flex: [{
          flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
        }],
        /**
         * Flex Grow
         * @see https://tailwindcss.com/docs/flex-grow
         */
        grow: [{
          grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Flex Shrink
         * @see https://tailwindcss.com/docs/flex-shrink
         */
        shrink: [{
          shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Order
         * @see https://tailwindcss.com/docs/order
         */
        order: [{
          order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Grid Template Columns
         * @see https://tailwindcss.com/docs/grid-template-columns
         */
        "grid-cols": [{
          "grid-cols": scaleGridTemplateColsRows()
        }],
        /**
         * Grid Column Start / End
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-start-end": [{
          col: scaleGridColRowStartAndEnd()
        }],
        /**
         * Grid Column Start
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-start": [{
          "col-start": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Column End
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-end": [{
          "col-end": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Template Rows
         * @see https://tailwindcss.com/docs/grid-template-rows
         */
        "grid-rows": [{
          "grid-rows": scaleGridTemplateColsRows()
        }],
        /**
         * Grid Row Start / End
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-start-end": [{
          row: scaleGridColRowStartAndEnd()
        }],
        /**
         * Grid Row Start
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-start": [{
          "row-start": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Row End
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-end": [{
          "row-end": scaleGridColRowStartOrEnd()
        }],
        /**
         * Grid Auto Flow
         * @see https://tailwindcss.com/docs/grid-auto-flow
         */
        "grid-flow": [{
          "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
        }],
        /**
         * Grid Auto Columns
         * @see https://tailwindcss.com/docs/grid-auto-columns
         */
        "auto-cols": [{
          "auto-cols": scaleGridAutoColsRows()
        }],
        /**
         * Grid Auto Rows
         * @see https://tailwindcss.com/docs/grid-auto-rows
         */
        "auto-rows": [{
          "auto-rows": scaleGridAutoColsRows()
        }],
        /**
         * Gap
         * @see https://tailwindcss.com/docs/gap
         */
        gap: [{
          gap: scaleUnambiguousSpacing()
        }],
        /**
         * Gap X
         * @see https://tailwindcss.com/docs/gap
         */
        "gap-x": [{
          "gap-x": scaleUnambiguousSpacing()
        }],
        /**
         * Gap Y
         * @see https://tailwindcss.com/docs/gap
         */
        "gap-y": [{
          "gap-y": scaleUnambiguousSpacing()
        }],
        /**
         * Justify Content
         * @see https://tailwindcss.com/docs/justify-content
         */
        "justify-content": [{
          justify: [...scaleAlignPrimaryAxis(), "normal"]
        }],
        /**
         * Justify Items
         * @see https://tailwindcss.com/docs/justify-items
         */
        "justify-items": [{
          "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
        }],
        /**
         * Justify Self
         * @see https://tailwindcss.com/docs/justify-self
         */
        "justify-self": [{
          "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
        }],
        /**
         * Align Content
         * @see https://tailwindcss.com/docs/align-content
         */
        "align-content": [{
          content: ["normal", ...scaleAlignPrimaryAxis()]
        }],
        /**
         * Align Items
         * @see https://tailwindcss.com/docs/align-items
         */
        "align-items": [{
          items: [...scaleAlignSecondaryAxis(), {
            baseline: ["", "last"]
          }]
        }],
        /**
         * Align Self
         * @see https://tailwindcss.com/docs/align-self
         */
        "align-self": [{
          self: ["auto", ...scaleAlignSecondaryAxis(), {
            baseline: ["", "last"]
          }]
        }],
        /**
         * Place Content
         * @see https://tailwindcss.com/docs/place-content
         */
        "place-content": [{
          "place-content": scaleAlignPrimaryAxis()
        }],
        /**
         * Place Items
         * @see https://tailwindcss.com/docs/place-items
         */
        "place-items": [{
          "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
        }],
        /**
         * Place Self
         * @see https://tailwindcss.com/docs/place-self
         */
        "place-self": [{
          "place-self": ["auto", ...scaleAlignSecondaryAxis()]
        }],
        // Spacing
        /**
         * Padding
         * @see https://tailwindcss.com/docs/padding
         */
        p: [{
          p: scaleUnambiguousSpacing()
        }],
        /**
         * Padding X
         * @see https://tailwindcss.com/docs/padding
         */
        px: [{
          px: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Y
         * @see https://tailwindcss.com/docs/padding
         */
        py: [{
          py: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Start
         * @see https://tailwindcss.com/docs/padding
         */
        ps: [{
          ps: scaleUnambiguousSpacing()
        }],
        /**
         * Padding End
         * @see https://tailwindcss.com/docs/padding
         */
        pe: [{
          pe: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Top
         * @see https://tailwindcss.com/docs/padding
         */
        pt: [{
          pt: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Right
         * @see https://tailwindcss.com/docs/padding
         */
        pr: [{
          pr: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Bottom
         * @see https://tailwindcss.com/docs/padding
         */
        pb: [{
          pb: scaleUnambiguousSpacing()
        }],
        /**
         * Padding Left
         * @see https://tailwindcss.com/docs/padding
         */
        pl: [{
          pl: scaleUnambiguousSpacing()
        }],
        /**
         * Margin
         * @see https://tailwindcss.com/docs/margin
         */
        m: [{
          m: scaleMargin()
        }],
        /**
         * Margin X
         * @see https://tailwindcss.com/docs/margin
         */
        mx: [{
          mx: scaleMargin()
        }],
        /**
         * Margin Y
         * @see https://tailwindcss.com/docs/margin
         */
        my: [{
          my: scaleMargin()
        }],
        /**
         * Margin Start
         * @see https://tailwindcss.com/docs/margin
         */
        ms: [{
          ms: scaleMargin()
        }],
        /**
         * Margin End
         * @see https://tailwindcss.com/docs/margin
         */
        me: [{
          me: scaleMargin()
        }],
        /**
         * Margin Top
         * @see https://tailwindcss.com/docs/margin
         */
        mt: [{
          mt: scaleMargin()
        }],
        /**
         * Margin Right
         * @see https://tailwindcss.com/docs/margin
         */
        mr: [{
          mr: scaleMargin()
        }],
        /**
         * Margin Bottom
         * @see https://tailwindcss.com/docs/margin
         */
        mb: [{
          mb: scaleMargin()
        }],
        /**
         * Margin Left
         * @see https://tailwindcss.com/docs/margin
         */
        ml: [{
          ml: scaleMargin()
        }],
        /**
         * Space Between X
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-x": [{
          "space-x": scaleUnambiguousSpacing()
        }],
        /**
         * Space Between X Reverse
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-x-reverse": ["space-x-reverse"],
        /**
         * Space Between Y
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-y": [{
          "space-y": scaleUnambiguousSpacing()
        }],
        /**
         * Space Between Y Reverse
         * @see https://tailwindcss.com/docs/margin#adding-space-between-children
         */
        "space-y-reverse": ["space-y-reverse"],
        // --------------
        // --- Sizing ---
        // --------------
        /**
         * Size
         * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
         */
        size: [{
          size: scaleSizing()
        }],
        /**
         * Width
         * @see https://tailwindcss.com/docs/width
         */
        w: [{
          w: [themeContainer, "screen", ...scaleSizing()]
        }],
        /**
         * Min-Width
         * @see https://tailwindcss.com/docs/min-width
         */
        "min-w": [{
          "min-w": [
            themeContainer,
            "screen",
            /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            "none",
            ...scaleSizing()
          ]
        }],
        /**
         * Max-Width
         * @see https://tailwindcss.com/docs/max-width
         */
        "max-w": [{
          "max-w": [
            themeContainer,
            "screen",
            "none",
            /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            "prose",
            /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            {
              screen: [themeBreakpoint]
            },
            ...scaleSizing()
          ]
        }],
        /**
         * Height
         * @see https://tailwindcss.com/docs/height
         */
        h: [{
          h: ["screen", "lh", ...scaleSizing()]
        }],
        /**
         * Min-Height
         * @see https://tailwindcss.com/docs/min-height
         */
        "min-h": [{
          "min-h": ["screen", "lh", "none", ...scaleSizing()]
        }],
        /**
         * Max-Height
         * @see https://tailwindcss.com/docs/max-height
         */
        "max-h": [{
          "max-h": ["screen", "lh", ...scaleSizing()]
        }],
        // ------------------
        // --- Typography ---
        // ------------------
        /**
         * Font Size
         * @see https://tailwindcss.com/docs/font-size
         */
        "font-size": [{
          text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
        }],
        /**
         * Font Smoothing
         * @see https://tailwindcss.com/docs/font-smoothing
         */
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        /**
         * Font Style
         * @see https://tailwindcss.com/docs/font-style
         */
        "font-style": ["italic", "not-italic"],
        /**
         * Font Weight
         * @see https://tailwindcss.com/docs/font-weight
         */
        "font-weight": [{
          font: [themeFontWeight, isArbitraryVariable, isArbitraryNumber]
        }],
        /**
         * Font Stretch
         * @see https://tailwindcss.com/docs/font-stretch
         */
        "font-stretch": [{
          "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
        }],
        /**
         * Font Family
         * @see https://tailwindcss.com/docs/font-family
         */
        "font-family": [{
          font: [isArbitraryVariableFamilyName, isArbitraryValue, themeFont]
        }],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-normal": ["normal-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-ordinal": ["ordinal"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-slashed-zero": ["slashed-zero"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        /**
         * Letter Spacing
         * @see https://tailwindcss.com/docs/letter-spacing
         */
        tracking: [{
          tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Line Clamp
         * @see https://tailwindcss.com/docs/line-clamp
         */
        "line-clamp": [{
          "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
        }],
        /**
         * Line Height
         * @see https://tailwindcss.com/docs/line-height
         */
        leading: [{
          leading: [
            /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
            themeLeading,
            ...scaleUnambiguousSpacing()
          ]
        }],
        /**
         * List Style Image
         * @see https://tailwindcss.com/docs/list-style-image
         */
        "list-image": [{
          "list-image": ["none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * List Style Position
         * @see https://tailwindcss.com/docs/list-style-position
         */
        "list-style-position": [{
          list: ["inside", "outside"]
        }],
        /**
         * List Style Type
         * @see https://tailwindcss.com/docs/list-style-type
         */
        "list-style-type": [{
          list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Text Alignment
         * @see https://tailwindcss.com/docs/text-align
         */
        "text-alignment": [{
          text: ["left", "center", "right", "justify", "start", "end"]
        }],
        /**
         * Placeholder Color
         * @deprecated since Tailwind CSS v3.0.0
         * @see https://v3.tailwindcss.com/docs/placeholder-color
         */
        "placeholder-color": [{
          placeholder: scaleColor()
        }],
        /**
         * Text Color
         * @see https://tailwindcss.com/docs/text-color
         */
        "text-color": [{
          text: scaleColor()
        }],
        /**
         * Text Decoration
         * @see https://tailwindcss.com/docs/text-decoration
         */
        "text-decoration": ["underline", "overline", "line-through", "no-underline"],
        /**
         * Text Decoration Style
         * @see https://tailwindcss.com/docs/text-decoration-style
         */
        "text-decoration-style": [{
          decoration: [...scaleLineStyle(), "wavy"]
        }],
        /**
         * Text Decoration Thickness
         * @see https://tailwindcss.com/docs/text-decoration-thickness
         */
        "text-decoration-thickness": [{
          decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
        }],
        /**
         * Text Decoration Color
         * @see https://tailwindcss.com/docs/text-decoration-color
         */
        "text-decoration-color": [{
          decoration: scaleColor()
        }],
        /**
         * Text Underline Offset
         * @see https://tailwindcss.com/docs/text-underline-offset
         */
        "underline-offset": [{
          "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Text Transform
         * @see https://tailwindcss.com/docs/text-transform
         */
        "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
        /**
         * Text Overflow
         * @see https://tailwindcss.com/docs/text-overflow
         */
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        /**
         * Text Wrap
         * @see https://tailwindcss.com/docs/text-wrap
         */
        "text-wrap": [{
          text: ["wrap", "nowrap", "balance", "pretty"]
        }],
        /**
         * Text Indent
         * @see https://tailwindcss.com/docs/text-indent
         */
        indent: [{
          indent: scaleUnambiguousSpacing()
        }],
        /**
         * Vertical Alignment
         * @see https://tailwindcss.com/docs/vertical-align
         */
        "vertical-align": [{
          align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Whitespace
         * @see https://tailwindcss.com/docs/whitespace
         */
        whitespace: [{
          whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
        }],
        /**
         * Word Break
         * @see https://tailwindcss.com/docs/word-break
         */
        break: [{
          break: ["normal", "words", "all", "keep"]
        }],
        /**
         * Overflow Wrap
         * @see https://tailwindcss.com/docs/overflow-wrap
         */
        wrap: [{
          wrap: ["break-word", "anywhere", "normal"]
        }],
        /**
         * Hyphens
         * @see https://tailwindcss.com/docs/hyphens
         */
        hyphens: [{
          hyphens: ["none", "manual", "auto"]
        }],
        /**
         * Content
         * @see https://tailwindcss.com/docs/content
         */
        content: [{
          content: ["none", isArbitraryVariable, isArbitraryValue]
        }],
        // -------------------
        // --- Backgrounds ---
        // -------------------
        /**
         * Background Attachment
         * @see https://tailwindcss.com/docs/background-attachment
         */
        "bg-attachment": [{
          bg: ["fixed", "local", "scroll"]
        }],
        /**
         * Background Clip
         * @see https://tailwindcss.com/docs/background-clip
         */
        "bg-clip": [{
          "bg-clip": ["border", "padding", "content", "text"]
        }],
        /**
         * Background Origin
         * @see https://tailwindcss.com/docs/background-origin
         */
        "bg-origin": [{
          "bg-origin": ["border", "padding", "content"]
        }],
        /**
         * Background Position
         * @see https://tailwindcss.com/docs/background-position
         */
        "bg-position": [{
          bg: scaleBgPosition()
        }],
        /**
         * Background Repeat
         * @see https://tailwindcss.com/docs/background-repeat
         */
        "bg-repeat": [{
          bg: scaleBgRepeat()
        }],
        /**
         * Background Size
         * @see https://tailwindcss.com/docs/background-size
         */
        "bg-size": [{
          bg: scaleBgSize()
        }],
        /**
         * Background Image
         * @see https://tailwindcss.com/docs/background-image
         */
        "bg-image": [{
          bg: ["none", {
            linear: [{
              to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
            }, isInteger, isArbitraryVariable, isArbitraryValue],
            radial: ["", isArbitraryVariable, isArbitraryValue],
            conic: [isInteger, isArbitraryVariable, isArbitraryValue]
          }, isArbitraryVariableImage, isArbitraryImage]
        }],
        /**
         * Background Color
         * @see https://tailwindcss.com/docs/background-color
         */
        "bg-color": [{
          bg: scaleColor()
        }],
        /**
         * Gradient Color Stops From Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-from-pos": [{
          from: scaleGradientStopPosition()
        }],
        /**
         * Gradient Color Stops Via Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-via-pos": [{
          via: scaleGradientStopPosition()
        }],
        /**
         * Gradient Color Stops To Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-to-pos": [{
          to: scaleGradientStopPosition()
        }],
        /**
         * Gradient Color Stops From
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-from": [{
          from: scaleColor()
        }],
        /**
         * Gradient Color Stops Via
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-via": [{
          via: scaleColor()
        }],
        /**
         * Gradient Color Stops To
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-to": [{
          to: scaleColor()
        }],
        // ---------------
        // --- Borders ---
        // ---------------
        /**
         * Border Radius
         * @see https://tailwindcss.com/docs/border-radius
         */
        rounded: [{
          rounded: scaleRadius()
        }],
        /**
         * Border Radius Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-s": [{
          "rounded-s": scaleRadius()
        }],
        /**
         * Border Radius End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-e": [{
          "rounded-e": scaleRadius()
        }],
        /**
         * Border Radius Top
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-t": [{
          "rounded-t": scaleRadius()
        }],
        /**
         * Border Radius Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-r": [{
          "rounded-r": scaleRadius()
        }],
        /**
         * Border Radius Bottom
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-b": [{
          "rounded-b": scaleRadius()
        }],
        /**
         * Border Radius Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-l": [{
          "rounded-l": scaleRadius()
        }],
        /**
         * Border Radius Start Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-ss": [{
          "rounded-ss": scaleRadius()
        }],
        /**
         * Border Radius Start End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-se": [{
          "rounded-se": scaleRadius()
        }],
        /**
         * Border Radius End End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-ee": [{
          "rounded-ee": scaleRadius()
        }],
        /**
         * Border Radius End Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-es": [{
          "rounded-es": scaleRadius()
        }],
        /**
         * Border Radius Top Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-tl": [{
          "rounded-tl": scaleRadius()
        }],
        /**
         * Border Radius Top Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-tr": [{
          "rounded-tr": scaleRadius()
        }],
        /**
         * Border Radius Bottom Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-br": [{
          "rounded-br": scaleRadius()
        }],
        /**
         * Border Radius Bottom Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-bl": [{
          "rounded-bl": scaleRadius()
        }],
        /**
         * Border Width
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w": [{
          border: scaleBorderWidth()
        }],
        /**
         * Border Width X
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-x": [{
          "border-x": scaleBorderWidth()
        }],
        /**
         * Border Width Y
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-y": [{
          "border-y": scaleBorderWidth()
        }],
        /**
         * Border Width Start
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-s": [{
          "border-s": scaleBorderWidth()
        }],
        /**
         * Border Width End
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-e": [{
          "border-e": scaleBorderWidth()
        }],
        /**
         * Border Width Top
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-t": [{
          "border-t": scaleBorderWidth()
        }],
        /**
         * Border Width Right
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-r": [{
          "border-r": scaleBorderWidth()
        }],
        /**
         * Border Width Bottom
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-b": [{
          "border-b": scaleBorderWidth()
        }],
        /**
         * Border Width Left
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-l": [{
          "border-l": scaleBorderWidth()
        }],
        /**
         * Divide Width X
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-x": [{
          "divide-x": scaleBorderWidth()
        }],
        /**
         * Divide Width X Reverse
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-x-reverse": ["divide-x-reverse"],
        /**
         * Divide Width Y
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-y": [{
          "divide-y": scaleBorderWidth()
        }],
        /**
         * Divide Width Y Reverse
         * @see https://tailwindcss.com/docs/border-width#between-children
         */
        "divide-y-reverse": ["divide-y-reverse"],
        /**
         * Border Style
         * @see https://tailwindcss.com/docs/border-style
         */
        "border-style": [{
          border: [...scaleLineStyle(), "hidden", "none"]
        }],
        /**
         * Divide Style
         * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
         */
        "divide-style": [{
          divide: [...scaleLineStyle(), "hidden", "none"]
        }],
        /**
         * Border Color
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color": [{
          border: scaleColor()
        }],
        /**
         * Border Color X
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-x": [{
          "border-x": scaleColor()
        }],
        /**
         * Border Color Y
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-y": [{
          "border-y": scaleColor()
        }],
        /**
         * Border Color S
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-s": [{
          "border-s": scaleColor()
        }],
        /**
         * Border Color E
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-e": [{
          "border-e": scaleColor()
        }],
        /**
         * Border Color Top
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-t": [{
          "border-t": scaleColor()
        }],
        /**
         * Border Color Right
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-r": [{
          "border-r": scaleColor()
        }],
        /**
         * Border Color Bottom
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-b": [{
          "border-b": scaleColor()
        }],
        /**
         * Border Color Left
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-l": [{
          "border-l": scaleColor()
        }],
        /**
         * Divide Color
         * @see https://tailwindcss.com/docs/divide-color
         */
        "divide-color": [{
          divide: scaleColor()
        }],
        /**
         * Outline Style
         * @see https://tailwindcss.com/docs/outline-style
         */
        "outline-style": [{
          outline: [...scaleLineStyle(), "none", "hidden"]
        }],
        /**
         * Outline Offset
         * @see https://tailwindcss.com/docs/outline-offset
         */
        "outline-offset": [{
          "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Outline Width
         * @see https://tailwindcss.com/docs/outline-width
         */
        "outline-w": [{
          outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
        }],
        /**
         * Outline Color
         * @see https://tailwindcss.com/docs/outline-color
         */
        "outline-color": [{
          outline: scaleColor()
        }],
        // ---------------
        // --- Effects ---
        // ---------------
        /**
         * Box Shadow
         * @see https://tailwindcss.com/docs/box-shadow
         */
        shadow: [{
          shadow: [
            // Deprecated since Tailwind CSS v4.0.0
            "",
            "none",
            themeShadow,
            isArbitraryVariableShadow,
            isArbitraryShadow
          ]
        }],
        /**
         * Box Shadow Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
         */
        "shadow-color": [{
          shadow: scaleColor()
        }],
        /**
         * Inset Box Shadow
         * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
         */
        "inset-shadow": [{
          "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
        }],
        /**
         * Inset Box Shadow Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
         */
        "inset-shadow-color": [{
          "inset-shadow": scaleColor()
        }],
        /**
         * Ring Width
         * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
         */
        "ring-w": [{
          ring: scaleBorderWidth()
        }],
        /**
         * Ring Width Inset
         * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
         * @deprecated since Tailwind CSS v4.0.0
         * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
         */
        "ring-w-inset": ["ring-inset"],
        /**
         * Ring Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
         */
        "ring-color": [{
          ring: scaleColor()
        }],
        /**
         * Ring Offset Width
         * @see https://v3.tailwindcss.com/docs/ring-offset-width
         * @deprecated since Tailwind CSS v4.0.0
         * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
         */
        "ring-offset-w": [{
          "ring-offset": [isNumber, isArbitraryLength]
        }],
        /**
         * Ring Offset Color
         * @see https://v3.tailwindcss.com/docs/ring-offset-color
         * @deprecated since Tailwind CSS v4.0.0
         * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
         */
        "ring-offset-color": [{
          "ring-offset": scaleColor()
        }],
        /**
         * Inset Ring Width
         * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
         */
        "inset-ring-w": [{
          "inset-ring": scaleBorderWidth()
        }],
        /**
         * Inset Ring Color
         * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
         */
        "inset-ring-color": [{
          "inset-ring": scaleColor()
        }],
        /**
         * Text Shadow
         * @see https://tailwindcss.com/docs/text-shadow
         */
        "text-shadow": [{
          "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
        }],
        /**
         * Text Shadow Color
         * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
         */
        "text-shadow-color": [{
          "text-shadow": scaleColor()
        }],
        /**
         * Opacity
         * @see https://tailwindcss.com/docs/opacity
         */
        opacity: [{
          opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Mix Blend Mode
         * @see https://tailwindcss.com/docs/mix-blend-mode
         */
        "mix-blend": [{
          "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
        }],
        /**
         * Background Blend Mode
         * @see https://tailwindcss.com/docs/background-blend-mode
         */
        "bg-blend": [{
          "bg-blend": scaleBlendMode()
        }],
        /**
         * Mask Clip
         * @see https://tailwindcss.com/docs/mask-clip
         */
        "mask-clip": [{
          "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
        }, "mask-no-clip"],
        /**
         * Mask Composite
         * @see https://tailwindcss.com/docs/mask-composite
         */
        "mask-composite": [{
          mask: ["add", "subtract", "intersect", "exclude"]
        }],
        /**
         * Mask Image
         * @see https://tailwindcss.com/docs/mask-image
         */
        "mask-image-linear-pos": [{
          "mask-linear": [isNumber]
        }],
        "mask-image-linear-from-pos": [{
          "mask-linear-from": scaleMaskImagePosition()
        }],
        "mask-image-linear-to-pos": [{
          "mask-linear-to": scaleMaskImagePosition()
        }],
        "mask-image-linear-from-color": [{
          "mask-linear-from": scaleColor()
        }],
        "mask-image-linear-to-color": [{
          "mask-linear-to": scaleColor()
        }],
        "mask-image-t-from-pos": [{
          "mask-t-from": scaleMaskImagePosition()
        }],
        "mask-image-t-to-pos": [{
          "mask-t-to": scaleMaskImagePosition()
        }],
        "mask-image-t-from-color": [{
          "mask-t-from": scaleColor()
        }],
        "mask-image-t-to-color": [{
          "mask-t-to": scaleColor()
        }],
        "mask-image-r-from-pos": [{
          "mask-r-from": scaleMaskImagePosition()
        }],
        "mask-image-r-to-pos": [{
          "mask-r-to": scaleMaskImagePosition()
        }],
        "mask-image-r-from-color": [{
          "mask-r-from": scaleColor()
        }],
        "mask-image-r-to-color": [{
          "mask-r-to": scaleColor()
        }],
        "mask-image-b-from-pos": [{
          "mask-b-from": scaleMaskImagePosition()
        }],
        "mask-image-b-to-pos": [{
          "mask-b-to": scaleMaskImagePosition()
        }],
        "mask-image-b-from-color": [{
          "mask-b-from": scaleColor()
        }],
        "mask-image-b-to-color": [{
          "mask-b-to": scaleColor()
        }],
        "mask-image-l-from-pos": [{
          "mask-l-from": scaleMaskImagePosition()
        }],
        "mask-image-l-to-pos": [{
          "mask-l-to": scaleMaskImagePosition()
        }],
        "mask-image-l-from-color": [{
          "mask-l-from": scaleColor()
        }],
        "mask-image-l-to-color": [{
          "mask-l-to": scaleColor()
        }],
        "mask-image-x-from-pos": [{
          "mask-x-from": scaleMaskImagePosition()
        }],
        "mask-image-x-to-pos": [{
          "mask-x-to": scaleMaskImagePosition()
        }],
        "mask-image-x-from-color": [{
          "mask-x-from": scaleColor()
        }],
        "mask-image-x-to-color": [{
          "mask-x-to": scaleColor()
        }],
        "mask-image-y-from-pos": [{
          "mask-y-from": scaleMaskImagePosition()
        }],
        "mask-image-y-to-pos": [{
          "mask-y-to": scaleMaskImagePosition()
        }],
        "mask-image-y-from-color": [{
          "mask-y-from": scaleColor()
        }],
        "mask-image-y-to-color": [{
          "mask-y-to": scaleColor()
        }],
        "mask-image-radial": [{
          "mask-radial": [isArbitraryVariable, isArbitraryValue]
        }],
        "mask-image-radial-from-pos": [{
          "mask-radial-from": scaleMaskImagePosition()
        }],
        "mask-image-radial-to-pos": [{
          "mask-radial-to": scaleMaskImagePosition()
        }],
        "mask-image-radial-from-color": [{
          "mask-radial-from": scaleColor()
        }],
        "mask-image-radial-to-color": [{
          "mask-radial-to": scaleColor()
        }],
        "mask-image-radial-shape": [{
          "mask-radial": ["circle", "ellipse"]
        }],
        "mask-image-radial-size": [{
          "mask-radial": [{
            closest: ["side", "corner"],
            farthest: ["side", "corner"]
          }]
        }],
        "mask-image-radial-pos": [{
          "mask-radial-at": scalePosition()
        }],
        "mask-image-conic-pos": [{
          "mask-conic": [isNumber]
        }],
        "mask-image-conic-from-pos": [{
          "mask-conic-from": scaleMaskImagePosition()
        }],
        "mask-image-conic-to-pos": [{
          "mask-conic-to": scaleMaskImagePosition()
        }],
        "mask-image-conic-from-color": [{
          "mask-conic-from": scaleColor()
        }],
        "mask-image-conic-to-color": [{
          "mask-conic-to": scaleColor()
        }],
        /**
         * Mask Mode
         * @see https://tailwindcss.com/docs/mask-mode
         */
        "mask-mode": [{
          mask: ["alpha", "luminance", "match"]
        }],
        /**
         * Mask Origin
         * @see https://tailwindcss.com/docs/mask-origin
         */
        "mask-origin": [{
          "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
        }],
        /**
         * Mask Position
         * @see https://tailwindcss.com/docs/mask-position
         */
        "mask-position": [{
          mask: scaleBgPosition()
        }],
        /**
         * Mask Repeat
         * @see https://tailwindcss.com/docs/mask-repeat
         */
        "mask-repeat": [{
          mask: scaleBgRepeat()
        }],
        /**
         * Mask Size
         * @see https://tailwindcss.com/docs/mask-size
         */
        "mask-size": [{
          mask: scaleBgSize()
        }],
        /**
         * Mask Type
         * @see https://tailwindcss.com/docs/mask-type
         */
        "mask-type": [{
          "mask-type": ["alpha", "luminance"]
        }],
        /**
         * Mask Image
         * @see https://tailwindcss.com/docs/mask-image
         */
        "mask-image": [{
          mask: ["none", isArbitraryVariable, isArbitraryValue]
        }],
        // ---------------
        // --- Filters ---
        // ---------------
        /**
         * Filter
         * @see https://tailwindcss.com/docs/filter
         */
        filter: [{
          filter: [
            // Deprecated since Tailwind CSS v3.0.0
            "",
            "none",
            isArbitraryVariable,
            isArbitraryValue
          ]
        }],
        /**
         * Blur
         * @see https://tailwindcss.com/docs/blur
         */
        blur: [{
          blur: scaleBlur()
        }],
        /**
         * Brightness
         * @see https://tailwindcss.com/docs/brightness
         */
        brightness: [{
          brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Contrast
         * @see https://tailwindcss.com/docs/contrast
         */
        contrast: [{
          contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Drop Shadow
         * @see https://tailwindcss.com/docs/drop-shadow
         */
        "drop-shadow": [{
          "drop-shadow": [
            // Deprecated since Tailwind CSS v4.0.0
            "",
            "none",
            themeDropShadow,
            isArbitraryVariableShadow,
            isArbitraryShadow
          ]
        }],
        /**
         * Drop Shadow Color
         * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
         */
        "drop-shadow-color": [{
          "drop-shadow": scaleColor()
        }],
        /**
         * Grayscale
         * @see https://tailwindcss.com/docs/grayscale
         */
        grayscale: [{
          grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Hue Rotate
         * @see https://tailwindcss.com/docs/hue-rotate
         */
        "hue-rotate": [{
          "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Invert
         * @see https://tailwindcss.com/docs/invert
         */
        invert: [{
          invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Saturate
         * @see https://tailwindcss.com/docs/saturate
         */
        saturate: [{
          saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Sepia
         * @see https://tailwindcss.com/docs/sepia
         */
        sepia: [{
          sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Filter
         * @see https://tailwindcss.com/docs/backdrop-filter
         */
        "backdrop-filter": [{
          "backdrop-filter": [
            // Deprecated since Tailwind CSS v3.0.0
            "",
            "none",
            isArbitraryVariable,
            isArbitraryValue
          ]
        }],
        /**
         * Backdrop Blur
         * @see https://tailwindcss.com/docs/backdrop-blur
         */
        "backdrop-blur": [{
          "backdrop-blur": scaleBlur()
        }],
        /**
         * Backdrop Brightness
         * @see https://tailwindcss.com/docs/backdrop-brightness
         */
        "backdrop-brightness": [{
          "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Contrast
         * @see https://tailwindcss.com/docs/backdrop-contrast
         */
        "backdrop-contrast": [{
          "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Grayscale
         * @see https://tailwindcss.com/docs/backdrop-grayscale
         */
        "backdrop-grayscale": [{
          "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Hue Rotate
         * @see https://tailwindcss.com/docs/backdrop-hue-rotate
         */
        "backdrop-hue-rotate": [{
          "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Invert
         * @see https://tailwindcss.com/docs/backdrop-invert
         */
        "backdrop-invert": [{
          "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Opacity
         * @see https://tailwindcss.com/docs/backdrop-opacity
         */
        "backdrop-opacity": [{
          "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Saturate
         * @see https://tailwindcss.com/docs/backdrop-saturate
         */
        "backdrop-saturate": [{
          "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Backdrop Sepia
         * @see https://tailwindcss.com/docs/backdrop-sepia
         */
        "backdrop-sepia": [{
          "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        // --------------
        // --- Tables ---
        // --------------
        /**
         * Border Collapse
         * @see https://tailwindcss.com/docs/border-collapse
         */
        "border-collapse": [{
          border: ["collapse", "separate"]
        }],
        /**
         * Border Spacing
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing": [{
          "border-spacing": scaleUnambiguousSpacing()
        }],
        /**
         * Border Spacing X
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing-x": [{
          "border-spacing-x": scaleUnambiguousSpacing()
        }],
        /**
         * Border Spacing Y
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing-y": [{
          "border-spacing-y": scaleUnambiguousSpacing()
        }],
        /**
         * Table Layout
         * @see https://tailwindcss.com/docs/table-layout
         */
        "table-layout": [{
          table: ["auto", "fixed"]
        }],
        /**
         * Caption Side
         * @see https://tailwindcss.com/docs/caption-side
         */
        caption: [{
          caption: ["top", "bottom"]
        }],
        // ---------------------------------
        // --- Transitions and Animation ---
        // ---------------------------------
        /**
         * Transition Property
         * @see https://tailwindcss.com/docs/transition-property
         */
        transition: [{
          transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Transition Behavior
         * @see https://tailwindcss.com/docs/transition-behavior
         */
        "transition-behavior": [{
          transition: ["normal", "discrete"]
        }],
        /**
         * Transition Duration
         * @see https://tailwindcss.com/docs/transition-duration
         */
        duration: [{
          duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Transition Timing Function
         * @see https://tailwindcss.com/docs/transition-timing-function
         */
        ease: [{
          ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Transition Delay
         * @see https://tailwindcss.com/docs/transition-delay
         */
        delay: [{
          delay: [isNumber, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Animation
         * @see https://tailwindcss.com/docs/animation
         */
        animate: [{
          animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
        }],
        // ------------------
        // --- Transforms ---
        // ------------------
        /**
         * Backface Visibility
         * @see https://tailwindcss.com/docs/backface-visibility
         */
        backface: [{
          backface: ["hidden", "visible"]
        }],
        /**
         * Perspective
         * @see https://tailwindcss.com/docs/perspective
         */
        perspective: [{
          perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Perspective Origin
         * @see https://tailwindcss.com/docs/perspective-origin
         */
        "perspective-origin": [{
          "perspective-origin": scalePositionWithArbitrary()
        }],
        /**
         * Rotate
         * @see https://tailwindcss.com/docs/rotate
         */
        rotate: [{
          rotate: scaleRotate()
        }],
        /**
         * Rotate X
         * @see https://tailwindcss.com/docs/rotate
         */
        "rotate-x": [{
          "rotate-x": scaleRotate()
        }],
        /**
         * Rotate Y
         * @see https://tailwindcss.com/docs/rotate
         */
        "rotate-y": [{
          "rotate-y": scaleRotate()
        }],
        /**
         * Rotate Z
         * @see https://tailwindcss.com/docs/rotate
         */
        "rotate-z": [{
          "rotate-z": scaleRotate()
        }],
        /**
         * Scale
         * @see https://tailwindcss.com/docs/scale
         */
        scale: [{
          scale: scaleScale()
        }],
        /**
         * Scale X
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-x": [{
          "scale-x": scaleScale()
        }],
        /**
         * Scale Y
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-y": [{
          "scale-y": scaleScale()
        }],
        /**
         * Scale Z
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-z": [{
          "scale-z": scaleScale()
        }],
        /**
         * Scale 3D
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-3d": ["scale-3d"],
        /**
         * Skew
         * @see https://tailwindcss.com/docs/skew
         */
        skew: [{
          skew: scaleSkew()
        }],
        /**
         * Skew X
         * @see https://tailwindcss.com/docs/skew
         */
        "skew-x": [{
          "skew-x": scaleSkew()
        }],
        /**
         * Skew Y
         * @see https://tailwindcss.com/docs/skew
         */
        "skew-y": [{
          "skew-y": scaleSkew()
        }],
        /**
         * Transform
         * @see https://tailwindcss.com/docs/transform
         */
        transform: [{
          transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
        }],
        /**
         * Transform Origin
         * @see https://tailwindcss.com/docs/transform-origin
         */
        "transform-origin": [{
          origin: scalePositionWithArbitrary()
        }],
        /**
         * Transform Style
         * @see https://tailwindcss.com/docs/transform-style
         */
        "transform-style": [{
          transform: ["3d", "flat"]
        }],
        /**
         * Translate
         * @see https://tailwindcss.com/docs/translate
         */
        translate: [{
          translate: scaleTranslate()
        }],
        /**
         * Translate X
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-x": [{
          "translate-x": scaleTranslate()
        }],
        /**
         * Translate Y
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-y": [{
          "translate-y": scaleTranslate()
        }],
        /**
         * Translate Z
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-z": [{
          "translate-z": scaleTranslate()
        }],
        /**
         * Translate None
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-none": ["translate-none"],
        // ---------------------
        // --- Interactivity ---
        // ---------------------
        /**
         * Accent Color
         * @see https://tailwindcss.com/docs/accent-color
         */
        accent: [{
          accent: scaleColor()
        }],
        /**
         * Appearance
         * @see https://tailwindcss.com/docs/appearance
         */
        appearance: [{
          appearance: ["none", "auto"]
        }],
        /**
         * Caret Color
         * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
         */
        "caret-color": [{
          caret: scaleColor()
        }],
        /**
         * Color Scheme
         * @see https://tailwindcss.com/docs/color-scheme
         */
        "color-scheme": [{
          scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
        }],
        /**
         * Cursor
         * @see https://tailwindcss.com/docs/cursor
         */
        cursor: [{
          cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
        }],
        /**
         * Field Sizing
         * @see https://tailwindcss.com/docs/field-sizing
         */
        "field-sizing": [{
          "field-sizing": ["fixed", "content"]
        }],
        /**
         * Pointer Events
         * @see https://tailwindcss.com/docs/pointer-events
         */
        "pointer-events": [{
          "pointer-events": ["auto", "none"]
        }],
        /**
         * Resize
         * @see https://tailwindcss.com/docs/resize
         */
        resize: [{
          resize: ["none", "", "y", "x"]
        }],
        /**
         * Scroll Behavior
         * @see https://tailwindcss.com/docs/scroll-behavior
         */
        "scroll-behavior": [{
          scroll: ["auto", "smooth"]
        }],
        /**
         * Scroll Margin
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-m": [{
          "scroll-m": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin X
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mx": [{
          "scroll-mx": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Y
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-my": [{
          "scroll-my": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Start
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-ms": [{
          "scroll-ms": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin End
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-me": [{
          "scroll-me": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Top
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mt": [{
          "scroll-mt": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Right
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mr": [{
          "scroll-mr": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Bottom
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mb": [{
          "scroll-mb": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Margin Left
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-ml": [{
          "scroll-ml": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-p": [{
          "scroll-p": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding X
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-px": [{
          "scroll-px": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Y
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-py": [{
          "scroll-py": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Start
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-ps": [{
          "scroll-ps": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding End
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pe": [{
          "scroll-pe": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Top
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pt": [{
          "scroll-pt": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Right
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pr": [{
          "scroll-pr": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Bottom
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pb": [{
          "scroll-pb": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Padding Left
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pl": [{
          "scroll-pl": scaleUnambiguousSpacing()
        }],
        /**
         * Scroll Snap Align
         * @see https://tailwindcss.com/docs/scroll-snap-align
         */
        "snap-align": [{
          snap: ["start", "end", "center", "align-none"]
        }],
        /**
         * Scroll Snap Stop
         * @see https://tailwindcss.com/docs/scroll-snap-stop
         */
        "snap-stop": [{
          snap: ["normal", "always"]
        }],
        /**
         * Scroll Snap Type
         * @see https://tailwindcss.com/docs/scroll-snap-type
         */
        "snap-type": [{
          snap: ["none", "x", "y", "both"]
        }],
        /**
         * Scroll Snap Type Strictness
         * @see https://tailwindcss.com/docs/scroll-snap-type
         */
        "snap-strictness": [{
          snap: ["mandatory", "proximity"]
        }],
        /**
         * Touch Action
         * @see https://tailwindcss.com/docs/touch-action
         */
        touch: [{
          touch: ["auto", "none", "manipulation"]
        }],
        /**
         * Touch Action X
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-x": [{
          "touch-pan": ["x", "left", "right"]
        }],
        /**
         * Touch Action Y
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-y": [{
          "touch-pan": ["y", "up", "down"]
        }],
        /**
         * Touch Action Pinch Zoom
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-pz": ["touch-pinch-zoom"],
        /**
         * User Select
         * @see https://tailwindcss.com/docs/user-select
         */
        select: [{
          select: ["none", "text", "all", "auto"]
        }],
        /**
         * Will Change
         * @see https://tailwindcss.com/docs/will-change
         */
        "will-change": [{
          "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
        }],
        // -----------
        // --- SVG ---
        // -----------
        /**
         * Fill
         * @see https://tailwindcss.com/docs/fill
         */
        fill: [{
          fill: ["none", ...scaleColor()]
        }],
        /**
         * Stroke Width
         * @see https://tailwindcss.com/docs/stroke-width
         */
        "stroke-w": [{
          stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
        }],
        /**
         * Stroke
         * @see https://tailwindcss.com/docs/stroke
         */
        stroke: [{
          stroke: ["none", ...scaleColor()]
        }],
        // ---------------------
        // --- Accessibility ---
        // ---------------------
        /**
         * Forced Color Adjust
         * @see https://tailwindcss.com/docs/forced-color-adjust
         */
        "forced-color-adjust": [{
          "forced-color-adjust": ["auto", "none"]
        }]
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        translate: ["translate-x", "translate-y", "translate-none"],
        "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
        "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"]
      },
      conflictingClassGroupModifiers: {
        "font-size": ["leading"]
      },
      orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
    };
  };
  var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);

  // src/lib/utils.ts
  function cn(...inputs) {
    return twMerge(clsx(inputs));
  }

  // src/components/ui/label.tsx
  var import_jsx_runtime4 = __toESM(require_react_shim());
  var labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  );
  function Label2({
    className,
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      Root,
      {
        "data-slot": "label",
        className: cn(labelVariants(), className),
        ...props
      }
    );
  }

  // src/components/ui/select.tsx
  init_define_import_meta_env();

  // node_modules/@radix-ui/primitive/dist/index.mjs
  init_define_import_meta_env();
  var canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
  function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
    return function handleEvent(event) {
      originalEventHandler?.(event);
      if (checkForDefaultPrevented === false || !event.defaultPrevented) {
        return ourEventHandler?.(event);
      }
    };
  }

  // node_modules/@radix-ui/react-context/dist/index.mjs
  init_define_import_meta_env();
  var React6 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime5 = __toESM(require_react_shim(), 1);
  function createContext2(rootComponentName, defaultContext) {
    const Context = React6.createContext(defaultContext);
    const Provider = (props) => {
      const { children, ...context } = props;
      const value = React6.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext22(consumerName) {
      const context = React6.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext22];
  }
  function createContextScope(scopeName, createContextScopeDeps = []) {
    let defaultContexts = [];
    function createContext32(rootComponentName, defaultContext) {
      const BaseContext = React6.createContext(defaultContext);
      const index2 = defaultContexts.length;
      defaultContexts = [...defaultContexts, defaultContext];
      const Provider = (props) => {
        const { scope, children, ...context } = props;
        const Context = scope?.[scopeName]?.[index2] || BaseContext;
        const value = React6.useMemo(() => context, Object.values(context));
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Context.Provider, { value, children });
      };
      Provider.displayName = rootComponentName + "Provider";
      function useContext22(consumerName, scope) {
        const Context = scope?.[scopeName]?.[index2] || BaseContext;
        const context = React6.useContext(Context);
        if (context) return context;
        if (defaultContext !== void 0) return defaultContext;
        throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
      }
      return [Provider, useContext22];
    }
    const createScope = () => {
      const scopeContexts = defaultContexts.map((defaultContext) => {
        return React6.createContext(defaultContext);
      });
      return function useScope(scope) {
        const contexts = scope?.[scopeName] || scopeContexts;
        return React6.useMemo(
          () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
          [scope, contexts]
        );
      };
    };
    createScope.scopeName = scopeName;
    return [createContext32, composeContextScopes(createScope, ...createContextScopeDeps)];
  }
  function composeContextScopes(...scopes) {
    const baseScope = scopes[0];
    if (scopes.length === 1) return baseScope;
    const createScope = () => {
      const scopeHooks = scopes.map((createScope2) => ({
        useScope: createScope2(),
        scopeName: createScope2.scopeName
      }));
      return function useComposedScopes(overrideScopes) {
        const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
          const scopeProps = useScope(overrideScopes);
          const currentScope = scopeProps[`__scope${scopeName}`];
          return { ...nextScopes2, ...currentScope };
        }, {});
        return React6.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
      };
    };
    createScope.scopeName = baseScope.scopeName;
    return createScope;
  }

  // node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
  init_define_import_meta_env();
  var React11 = __toESM(require_react_shim(), 1);

  // node_modules/@radix-ui/react-primitive/dist/index.mjs
  init_define_import_meta_env();
  var React8 = __toESM(require_react_shim(), 1);
  var ReactDOM3 = __toESM(require_react_dom_shim(), 1);

  // node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
  init_define_import_meta_env();
  var React7 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime6 = __toESM(require_react_shim(), 1);
  // @__NO_SIDE_EFFECTS__
  function createSlot2(ownerName) {
    const SlotClone = /* @__PURE__ */ createSlotClone2(ownerName);
    const Slot22 = React7.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      const childrenArray = React7.Children.toArray(children);
      const slottable = childrenArray.find(isSlottable2);
      if (slottable) {
        const newElement = slottable.props.children;
        const newChildren = childrenArray.map((child) => {
          if (child === slottable) {
            if (React7.Children.count(newElement) > 1) return React7.Children.only(null);
            return React7.isValidElement(newElement) ? newElement.props.children : null;
          } else {
            return child;
          }
        });
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children: React7.isValidElement(newElement) ? React7.cloneElement(newElement, void 0, newChildren) : null });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children });
    });
    Slot22.displayName = `${ownerName}.Slot`;
    return Slot22;
  }
  // @__NO_SIDE_EFFECTS__
  function createSlotClone2(ownerName) {
    const SlotClone = React7.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      if (React7.isValidElement(children)) {
        const childrenRef = getElementRef2(children);
        const props2 = mergeProps2(slotProps, children.props);
        if (children.type !== React7.Fragment) {
          props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
        }
        return React7.cloneElement(children, props2);
      }
      return React7.Children.count(children) > 1 ? React7.Children.only(null) : null;
    });
    SlotClone.displayName = `${ownerName}.SlotClone`;
    return SlotClone;
  }
  var SLOTTABLE_IDENTIFIER2 = /* @__PURE__ */ Symbol("radix.slottable");
  function isSlottable2(child) {
    return React7.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER2;
  }
  function mergeProps2(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
      const slotPropValue = slotProps[propName];
      const childPropValue = childProps[propName];
      const isHandler = /^on[A-Z]/.test(propName);
      if (isHandler) {
        if (slotPropValue && childPropValue) {
          overrideProps[propName] = (...args) => {
            const result = childPropValue(...args);
            slotPropValue(...args);
            return result;
          };
        } else if (slotPropValue) {
          overrideProps[propName] = slotPropValue;
        }
      } else if (propName === "style") {
        overrideProps[propName] = { ...slotPropValue, ...childPropValue };
      } else if (propName === "className") {
        overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
      }
    }
    return { ...slotProps, ...overrideProps };
  }
  function getElementRef2(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }

  // node_modules/@radix-ui/react-primitive/dist/index.mjs
  var import_jsx_runtime7 = __toESM(require_react_shim(), 1);
  var NODES2 = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul"
  ];
  var Primitive2 = NODES2.reduce((primitive, node) => {
    const Slot4 = createSlot2(`Primitive.${node}`);
    const Node2 = React8.forwardRef((props, forwardedRef) => {
      const { asChild, ...primitiveProps } = props;
      const Comp = asChild ? Slot4 : node;
      if (typeof window !== "undefined") {
        window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
      }
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Comp, { ...primitiveProps, ref: forwardedRef });
    });
    Node2.displayName = `Primitive.${node}`;
    return { ...primitive, [node]: Node2 };
  }, {});
  function dispatchDiscreteCustomEvent(target, event) {
    if (target) ReactDOM3.flushSync(() => target.dispatchEvent(event));
  }

  // node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
  init_define_import_meta_env();
  var React9 = __toESM(require_react_shim(), 1);
  function useCallbackRef(callback) {
    const callbackRef = React9.useRef(callback);
    React9.useEffect(() => {
      callbackRef.current = callback;
    });
    return React9.useMemo(() => (...args) => callbackRef.current?.(...args), []);
  }

  // node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
  init_define_import_meta_env();
  var React10 = __toESM(require_react_shim(), 1);
  function useEscapeKeydown(onEscapeKeyDownProp, ownerDocument = globalThis?.document) {
    const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownProp);
    React10.useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          onEscapeKeyDown(event);
        }
      };
      ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [onEscapeKeyDown, ownerDocument]);
  }

  // node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
  var import_jsx_runtime8 = __toESM(require_react_shim(), 1);
  var DISMISSABLE_LAYER_NAME = "DismissableLayer";
  var CONTEXT_UPDATE = "dismissableLayer.update";
  var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
  var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
  var originalBodyPointerEvents;
  var DismissableLayerContext = React11.createContext({
    layers: /* @__PURE__ */ new Set(),
    layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
    branches: /* @__PURE__ */ new Set()
  });
  var DismissableLayer = React11.forwardRef(
    (props, forwardedRef) => {
      const {
        disableOutsidePointerEvents = false,
        onEscapeKeyDown,
        onPointerDownOutside,
        onFocusOutside,
        onInteractOutside,
        onDismiss,
        ...layerProps
      } = props;
      const context = React11.useContext(DismissableLayerContext);
      const [node, setNode] = React11.useState(null);
      const ownerDocument = node?.ownerDocument ?? globalThis?.document;
      const [, force] = React11.useState({});
      const composedRefs = useComposedRefs(forwardedRef, (node2) => setNode(node2));
      const layers = Array.from(context.layers);
      const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
      const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
      const index2 = node ? layers.indexOf(node) : -1;
      const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
      const isPointerEventsEnabled = index2 >= highestLayerWithOutsidePointerEventsDisabledIndex;
      const pointerDownOutside = usePointerDownOutside((event) => {
        const target = event.target;
        const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
        if (!isPointerEventsEnabled || isPointerDownOnBranch) return;
        onPointerDownOutside?.(event);
        onInteractOutside?.(event);
        if (!event.defaultPrevented) onDismiss?.();
      }, ownerDocument);
      const focusOutside = useFocusOutside((event) => {
        const target = event.target;
        const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
        if (isFocusInBranch) return;
        onFocusOutside?.(event);
        onInteractOutside?.(event);
        if (!event.defaultPrevented) onDismiss?.();
      }, ownerDocument);
      useEscapeKeydown((event) => {
        const isHighestLayer = index2 === context.layers.size - 1;
        if (!isHighestLayer) return;
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented && onDismiss) {
          event.preventDefault();
          onDismiss();
        }
      }, ownerDocument);
      React11.useEffect(() => {
        if (!node) return;
        if (disableOutsidePointerEvents) {
          if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
            originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
            ownerDocument.body.style.pointerEvents = "none";
          }
          context.layersWithOutsidePointerEventsDisabled.add(node);
        }
        context.layers.add(node);
        dispatchUpdate();
        return () => {
          if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) {
            ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
          }
        };
      }, [node, ownerDocument, disableOutsidePointerEvents, context]);
      React11.useEffect(() => {
        return () => {
          if (!node) return;
          context.layers.delete(node);
          context.layersWithOutsidePointerEventsDisabled.delete(node);
          dispatchUpdate();
        };
      }, [node, context]);
      React11.useEffect(() => {
        const handleUpdate = () => force({});
        document.addEventListener(CONTEXT_UPDATE, handleUpdate);
        return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
      }, []);
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        Primitive2.div,
        {
          ...layerProps,
          ref: composedRefs,
          style: {
            pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
            ...props.style
          },
          onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
          onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
          onPointerDownCapture: composeEventHandlers(
            props.onPointerDownCapture,
            pointerDownOutside.onPointerDownCapture
          )
        }
      );
    }
  );
  DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;
  var BRANCH_NAME = "DismissableLayerBranch";
  var DismissableLayerBranch = React11.forwardRef((props, forwardedRef) => {
    const context = React11.useContext(DismissableLayerContext);
    const ref = React11.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    React11.useEffect(() => {
      const node = ref.current;
      if (node) {
        context.branches.add(node);
        return () => {
          context.branches.delete(node);
        };
      }
    }, [context.branches]);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Primitive2.div, { ...props, ref: composedRefs });
  });
  DismissableLayerBranch.displayName = BRANCH_NAME;
  function usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis?.document) {
    const handlePointerDownOutside = useCallbackRef(onPointerDownOutside);
    const isPointerInsideReactTreeRef = React11.useRef(false);
    const handleClickRef = React11.useRef(() => {
    });
    React11.useEffect(() => {
      const handlePointerDown = (event) => {
        if (event.target && !isPointerInsideReactTreeRef.current) {
          let handleAndDispatchPointerDownOutsideEvent2 = function() {
            handleAndDispatchCustomEvent(
              POINTER_DOWN_OUTSIDE,
              handlePointerDownOutside,
              eventDetail,
              { discrete: true }
            );
          };
          var handleAndDispatchPointerDownOutsideEvent = handleAndDispatchPointerDownOutsideEvent2;
          const eventDetail = { originalEvent: event };
          if (event.pointerType === "touch") {
            ownerDocument.removeEventListener("click", handleClickRef.current);
            handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
            ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
          } else {
            handleAndDispatchPointerDownOutsideEvent2();
          }
        } else {
          ownerDocument.removeEventListener("click", handleClickRef.current);
        }
        isPointerInsideReactTreeRef.current = false;
      };
      const timerId = window.setTimeout(() => {
        ownerDocument.addEventListener("pointerdown", handlePointerDown);
      }, 0);
      return () => {
        window.clearTimeout(timerId);
        ownerDocument.removeEventListener("pointerdown", handlePointerDown);
        ownerDocument.removeEventListener("click", handleClickRef.current);
      };
    }, [ownerDocument, handlePointerDownOutside]);
    return {
      // ensures we check React component tree (not just DOM tree)
      onPointerDownCapture: () => isPointerInsideReactTreeRef.current = true
    };
  }
  function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
    const handleFocusOutside = useCallbackRef(onFocusOutside);
    const isFocusInsideReactTreeRef = React11.useRef(false);
    React11.useEffect(() => {
      const handleFocus = (event) => {
        if (event.target && !isFocusInsideReactTreeRef.current) {
          const eventDetail = { originalEvent: event };
          handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
            discrete: false
          });
        }
      };
      ownerDocument.addEventListener("focusin", handleFocus);
      return () => ownerDocument.removeEventListener("focusin", handleFocus);
    }, [ownerDocument, handleFocusOutside]);
    return {
      onFocusCapture: () => isFocusInsideReactTreeRef.current = true,
      onBlurCapture: () => isFocusInsideReactTreeRef.current = false
    };
  }
  function dispatchUpdate() {
    const event = new CustomEvent(CONTEXT_UPDATE);
    document.dispatchEvent(event);
  }
  function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
    const target = detail.originalEvent.target;
    const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
    if (handler) target.addEventListener(name, handler, { once: true });
    if (discrete) {
      dispatchDiscreteCustomEvent(target, event);
    } else {
      target.dispatchEvent(event);
    }
  }

  // node_modules/@radix-ui/react-focus-guards/dist/index.mjs
  init_define_import_meta_env();
  var React12 = __toESM(require_react_shim(), 1);
  var count = 0;
  function useFocusGuards() {
    React12.useEffect(() => {
      const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
      document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
      document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
      count++;
      return () => {
        if (count === 1) {
          document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
        }
        count--;
      };
    }, []);
  }
  function createFocusGuard() {
    const element = document.createElement("span");
    element.setAttribute("data-radix-focus-guard", "");
    element.tabIndex = 0;
    element.style.outline = "none";
    element.style.opacity = "0";
    element.style.position = "fixed";
    element.style.pointerEvents = "none";
    return element;
  }

  // node_modules/@radix-ui/react-focus-scope/dist/index.mjs
  init_define_import_meta_env();
  var React13 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime9 = __toESM(require_react_shim(), 1);
  var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
  var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
  var EVENT_OPTIONS = { bubbles: false, cancelable: true };
  var FOCUS_SCOPE_NAME = "FocusScope";
  var FocusScope = React13.forwardRef((props, forwardedRef) => {
    const {
      loop = false,
      trapped = false,
      onMountAutoFocus: onMountAutoFocusProp,
      onUnmountAutoFocus: onUnmountAutoFocusProp,
      ...scopeProps
    } = props;
    const [container, setContainer] = React13.useState(null);
    const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
    const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
    const lastFocusedElementRef = React13.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node));
    const focusScope = React13.useRef({
      paused: false,
      pause() {
        this.paused = true;
      },
      resume() {
        this.paused = false;
      }
    }).current;
    React13.useEffect(() => {
      if (trapped) {
        let handleFocusIn2 = function(event) {
          if (focusScope.paused || !container) return;
          const target = event.target;
          if (container.contains(target)) {
            lastFocusedElementRef.current = target;
          } else {
            focus(lastFocusedElementRef.current, { select: true });
          }
        }, handleFocusOut2 = function(event) {
          if (focusScope.paused || !container) return;
          const relatedTarget = event.relatedTarget;
          if (relatedTarget === null) return;
          if (!container.contains(relatedTarget)) {
            focus(lastFocusedElementRef.current, { select: true });
          }
        }, handleMutations2 = function(mutations) {
          const focusedElement = document.activeElement;
          if (focusedElement !== document.body) return;
          for (const mutation of mutations) {
            if (mutation.removedNodes.length > 0) focus(container);
          }
        };
        var handleFocusIn = handleFocusIn2, handleFocusOut = handleFocusOut2, handleMutations = handleMutations2;
        document.addEventListener("focusin", handleFocusIn2);
        document.addEventListener("focusout", handleFocusOut2);
        const mutationObserver = new MutationObserver(handleMutations2);
        if (container) mutationObserver.observe(container, { childList: true, subtree: true });
        return () => {
          document.removeEventListener("focusin", handleFocusIn2);
          document.removeEventListener("focusout", handleFocusOut2);
          mutationObserver.disconnect();
        };
      }
    }, [trapped, container, focusScope.paused]);
    React13.useEffect(() => {
      if (container) {
        focusScopesStack.add(focusScope);
        const previouslyFocusedElement = document.activeElement;
        const hasFocusedCandidate = container.contains(previouslyFocusedElement);
        if (!hasFocusedCandidate) {
          const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          container.dispatchEvent(mountEvent);
          if (!mountEvent.defaultPrevented) {
            focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
            if (document.activeElement === previouslyFocusedElement) {
              focus(container);
            }
          }
        }
        return () => {
          container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          setTimeout(() => {
            const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
            container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
            container.dispatchEvent(unmountEvent);
            if (!unmountEvent.defaultPrevented) {
              focus(previouslyFocusedElement ?? document.body, { select: true });
            }
            container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
            focusScopesStack.remove(focusScope);
          }, 0);
        };
      }
    }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
    const handleKeyDown = React13.useCallback(
      (event) => {
        if (!loop && !trapped) return;
        if (focusScope.paused) return;
        const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
        const focusedElement = document.activeElement;
        if (isTabKey && focusedElement) {
          const container2 = event.currentTarget;
          const [first, last] = getTabbableEdges(container2);
          const hasTabbableElementsInside = first && last;
          if (!hasTabbableElementsInside) {
            if (focusedElement === container2) event.preventDefault();
          } else {
            if (!event.shiftKey && focusedElement === last) {
              event.preventDefault();
              if (loop) focus(first, { select: true });
            } else if (event.shiftKey && focusedElement === first) {
              event.preventDefault();
              if (loop) focus(last, { select: true });
            }
          }
        }
      },
      [loop, trapped, focusScope.paused]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Primitive2.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
  });
  FocusScope.displayName = FOCUS_SCOPE_NAME;
  function focusFirst(candidates, { select = false } = {}) {
    const previouslyFocusedElement = document.activeElement;
    for (const candidate of candidates) {
      focus(candidate, { select });
      if (document.activeElement !== previouslyFocusedElement) return;
    }
  }
  function getTabbableEdges(container) {
    const candidates = getTabbableCandidates(container);
    const first = findVisible(candidates, container);
    const last = findVisible(candidates.reverse(), container);
    return [first, last];
  }
  function getTabbableCandidates(container) {
    const nodes = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
        if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
        return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }
  function findVisible(elements, container) {
    for (const element of elements) {
      if (!isHidden(element, { upTo: container })) return element;
    }
  }
  function isHidden(node, { upTo }) {
    if (getComputedStyle(node).visibility === "hidden") return true;
    while (node) {
      if (upTo !== void 0 && node === upTo) return false;
      if (getComputedStyle(node).display === "none") return true;
      node = node.parentElement;
    }
    return false;
  }
  function isSelectableInput(element) {
    return element instanceof HTMLInputElement && "select" in element;
  }
  function focus(element, { select = false } = {}) {
    if (element && element.focus) {
      const previouslyFocusedElement = document.activeElement;
      element.focus({ preventScroll: true });
      if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
        element.select();
    }
  }
  var focusScopesStack = createFocusScopesStack();
  function createFocusScopesStack() {
    let stack = [];
    return {
      add(focusScope) {
        const activeFocusScope = stack[0];
        if (focusScope !== activeFocusScope) {
          activeFocusScope?.pause();
        }
        stack = arrayRemove(stack, focusScope);
        stack.unshift(focusScope);
      },
      remove(focusScope) {
        stack = arrayRemove(stack, focusScope);
        stack[0]?.resume();
      }
    };
  }
  function arrayRemove(array, item) {
    const updatedArray = [...array];
    const index2 = updatedArray.indexOf(item);
    if (index2 !== -1) {
      updatedArray.splice(index2, 1);
    }
    return updatedArray;
  }
  function removeLinks(items) {
    return items.filter((item) => item.tagName !== "A");
  }

  // node_modules/@radix-ui/react-id/dist/index.mjs
  init_define_import_meta_env();
  var React15 = __toESM(require_react_shim(), 1);

  // node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
  init_define_import_meta_env();
  var React14 = __toESM(require_react_shim(), 1);
  var useLayoutEffect2 = globalThis?.document ? React14.useLayoutEffect : () => {
  };

  // node_modules/@radix-ui/react-id/dist/index.mjs
  var useReactId = React15[" useId ".trim().toString()] || (() => void 0);
  var count2 = 0;
  function useId(deterministicId) {
    const [id, setId] = React15.useState(useReactId());
    useLayoutEffect2(() => {
      if (!deterministicId) setId((reactId) => reactId ?? String(count2++));
    }, [deterministicId]);
    return deterministicId || (id ? `radix-${id}` : "");
  }

  // node_modules/@radix-ui/react-popper/dist/index.mjs
  init_define_import_meta_env();
  var React19 = __toESM(require_react_shim(), 1);

  // node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.mjs
  init_define_import_meta_env();

  // node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
  init_define_import_meta_env();

  // node_modules/@floating-ui/core/dist/floating-ui.core.mjs
  init_define_import_meta_env();

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
  init_define_import_meta_env();
  var sides = ["top", "right", "bottom", "left"];
  var min = Math.min;
  var max = Math.max;
  var round = Math.round;
  var floor = Math.floor;
  var createCoords = (v) => ({
    x: v,
    y: v
  });
  var oppositeSideMap = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  var oppositeAlignmentMap = {
    start: "end",
    end: "start"
  };
  function clamp(start, value, end) {
    return max(start, min(value, end));
  }
  function evaluate(value, param) {
    return typeof value === "function" ? value(param) : value;
  }
  function getSide(placement) {
    return placement.split("-")[0];
  }
  function getAlignment(placement) {
    return placement.split("-")[1];
  }
  function getOppositeAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  function getAxisLength(axis) {
    return axis === "y" ? "height" : "width";
  }
  var yAxisSides = /* @__PURE__ */ new Set(["top", "bottom"]);
  function getSideAxis(placement) {
    return yAxisSides.has(getSide(placement)) ? "y" : "x";
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
  }
  var lrPlacement = ["left", "right"];
  var rlPlacement = ["right", "left"];
  var tbPlacement = ["top", "bottom"];
  var btPlacement = ["bottom", "top"];
  function getSideList(side, isStart, rtl) {
    switch (side) {
      case "top":
      case "bottom":
        if (rtl) return isStart ? rlPlacement : lrPlacement;
        return isStart ? lrPlacement : rlPlacement;
      case "left":
      case "right":
        return isStart ? tbPlacement : btPlacement;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === "start", rtl);
    if (alignment) {
      list = list.map((side) => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== "number" ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    const {
      x,
      y,
      width,
      height
    } = rect;
    return {
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y
    };
  }

  // node_modules/@floating-ui/core/dist/floating-ui.core.mjs
  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === "y";
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
    let coords;
    switch (side) {
      case "top":
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case "bottom":
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case "right":
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case "left":
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case "start":
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case "end":
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }
  var computePosition = async (reference, floating, config) => {
    const {
      placement = "bottom",
      strategy = "absolute",
      middleware = [],
      platform: platform2
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
    let rects = await platform2.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const {
        name,
        fn
      } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform: platform2,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data
        }
      };
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === "object") {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects = reset.rects === true ? await platform2.getElementRects({
              reference,
              floating,
              strategy
            }) : reset.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i = -1;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  };
  async function detectOverflow(state, options2) {
    var _await$platform$isEle;
    if (options2 === void 0) {
      options2 = {};
    }
    const {
      x,
      y,
      platform: platform2,
      rects,
      elements,
      strategy
    } = state;
    const {
      boundary = "clippingAncestors",
      rootBoundary = "viewport",
      elementContext = "floating",
      altBoundary = false,
      padding = 0
    } = evaluate(options2, state);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === "floating" ? "reference" : "floating";
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
      element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === "floating" ? {
      x,
      y,
      width: rects.floating.width,
      height: rects.floating.height
    } : rects.reference;
    const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
    const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
      x: 1,
      y: 1
    } : {
      x: 1,
      y: 1
    };
    const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
      elements,
      rect,
      offsetParent,
      strategy
    }) : rect);
    return {
      top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
      bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
      left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
      right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
    };
  }
  var arrow = (options2) => ({
    name: "arrow",
    options: options2,
    async fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        platform: platform2,
        elements,
        middlewareData
      } = state;
      const {
        element,
        padding = 0
      } = evaluate(options2, state) || {};
      if (element == null) {
        return {};
      }
      const paddingObject = getPaddingObject(padding);
      const coords = {
        x,
        y
      };
      const axis = getAlignmentAxis(placement);
      const length = getAxisLength(axis);
      const arrowDimensions = await platform2.getDimensions(element);
      const isYAxis = axis === "y";
      const minProp = isYAxis ? "top" : "left";
      const maxProp = isYAxis ? "bottom" : "right";
      const clientProp = isYAxis ? "clientHeight" : "clientWidth";
      const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
      const startDiff = coords[axis] - rects.reference[axis];
      const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
      let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
      if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
        clientSize = elements.floating[clientProp] || rects.floating[length];
      }
      const centerToReference = endDiff / 2 - startDiff / 2;
      const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
      const minPadding = min(paddingObject[minProp], largestPossiblePadding);
      const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
      const min$1 = minPadding;
      const max3 = clientSize - arrowDimensions[length] - maxPadding;
      const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
      const offset4 = clamp(min$1, center, max3);
      const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset4 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
      const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max3 : 0;
      return {
        [axis]: coords[axis] + alignmentOffset,
        data: {
          [axis]: offset4,
          centerOffset: center - offset4 - alignmentOffset,
          ...shouldAddOffset && {
            alignmentOffset
          }
        },
        reset: shouldAddOffset
      };
    }
  });
  var flip = function(options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    return {
      name: "flip",
      options: options2,
      async fn(state) {
        var _middlewareData$arrow, _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform: platform2,
          elements
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = "bestFit",
          fallbackAxisSideDirection = "none",
          flipAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options2, state);
        if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        const side = getSide(placement);
        const initialSideAxis = getSideAxis(initialPlacement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
        if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
          fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
        }
        const placements2 = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const overflows = [];
        let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const sides2 = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
        }
        overflowsData = [...overflowsData, {
          placement,
          overflows
        }];
        if (!overflows.every((side2) => side2 <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements2[nextIndex];
          if (nextPlacement) {
            const ignoreCrossAxisOverflow = checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false;
            if (!ignoreCrossAxisOverflow || // We leave the current main axis only if every placement on that axis
            // overflows the main axis.
            overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
              return {
                data: {
                  index: nextIndex,
                  overflows: overflowsData
                },
                reset: {
                  placement: nextPlacement
                }
              };
            }
          }
          let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case "bestFit": {
                var _overflowsData$filter2;
                const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === "y";
                  }
                  return true;
                }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                if (placement2) {
                  resetPlacement = placement2;
                }
                break;
              }
              case "initialPlacement":
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement
              }
            };
          }
        }
        return {};
      }
    };
  };
  function getSideOffsets(overflow, rect) {
    return {
      top: overflow.top - rect.height,
      right: overflow.right - rect.width,
      bottom: overflow.bottom - rect.height,
      left: overflow.left - rect.width
    };
  }
  function isAnySideFullyClipped(overflow) {
    return sides.some((side) => overflow[side] >= 0);
  }
  var hide = function(options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    return {
      name: "hide",
      options: options2,
      async fn(state) {
        const {
          rects
        } = state;
        const {
          strategy = "referenceHidden",
          ...detectOverflowOptions
        } = evaluate(options2, state);
        switch (strategy) {
          case "referenceHidden": {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              elementContext: "reference"
            });
            const offsets = getSideOffsets(overflow, rects.reference);
            return {
              data: {
                referenceHiddenOffsets: offsets,
                referenceHidden: isAnySideFullyClipped(offsets)
              }
            };
          }
          case "escaped": {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              altBoundary: true
            });
            const offsets = getSideOffsets(overflow, rects.floating);
            return {
              data: {
                escapedOffsets: offsets,
                escaped: isAnySideFullyClipped(offsets)
              }
            };
          }
          default: {
            return {};
          }
        }
      }
    };
  };
  var originSides = /* @__PURE__ */ new Set(["left", "top"]);
  async function convertValueToCoords(state, options2) {
    const {
      placement,
      platform: platform2,
      elements
    } = state;
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === "y";
    const mainAxisMulti = originSides.has(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options2, state);
    let {
      mainAxis,
      crossAxis,
      alignmentAxis
    } = typeof rawValue === "number" ? {
      mainAxis: rawValue,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: rawValue.mainAxis || 0,
      crossAxis: rawValue.crossAxis || 0,
      alignmentAxis: rawValue.alignmentAxis
    };
    if (alignment && typeof alignmentAxis === "number") {
      crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical ? {
      x: crossAxis * crossAxisMulti,
      y: mainAxis * mainAxisMulti
    } : {
      x: mainAxis * mainAxisMulti,
      y: crossAxis * crossAxisMulti
    };
  }
  var offset = function(options2) {
    if (options2 === void 0) {
      options2 = 0;
    }
    return {
      name: "offset",
      options: options2,
      async fn(state) {
        var _middlewareData$offse, _middlewareData$arrow;
        const {
          x,
          y,
          placement,
          middlewareData
        } = state;
        const diffCoords = await convertValueToCoords(state, options2);
        if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: {
            ...diffCoords,
            placement
          }
        };
      }
    };
  };
  var shift = function(options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    return {
      name: "shift",
      options: options2,
      async fn(state) {
        const {
          x,
          y,
          placement
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = false,
          limiter = {
            fn: (_ref) => {
              let {
                x: x2,
                y: y2
              } = _ref;
              return {
                x: x2,
                y: y2
              };
            }
          },
          ...detectOverflowOptions
        } = evaluate(options2, state);
        const coords = {
          x,
          y
        };
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const crossAxis = getSideAxis(getSide(placement));
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        if (checkMainAxis) {
          const minSide = mainAxis === "y" ? "top" : "left";
          const maxSide = mainAxis === "y" ? "bottom" : "right";
          const min3 = mainAxisCoord + overflow[minSide];
          const max3 = mainAxisCoord - overflow[maxSide];
          mainAxisCoord = clamp(min3, mainAxisCoord, max3);
        }
        if (checkCrossAxis) {
          const minSide = crossAxis === "y" ? "top" : "left";
          const maxSide = crossAxis === "y" ? "bottom" : "right";
          const min3 = crossAxisCoord + overflow[minSide];
          const max3 = crossAxisCoord - overflow[maxSide];
          crossAxisCoord = clamp(min3, crossAxisCoord, max3);
        }
        const limitedCoords = limiter.fn({
          ...state,
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        });
        return {
          ...limitedCoords,
          data: {
            x: limitedCoords.x - x,
            y: limitedCoords.y - y,
            enabled: {
              [mainAxis]: checkMainAxis,
              [crossAxis]: checkCrossAxis
            }
          }
        };
      }
    };
  };
  var limitShift = function(options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    return {
      options: options2,
      fn(state) {
        const {
          x,
          y,
          placement,
          rects,
          middlewareData
        } = state;
        const {
          offset: offset4 = 0,
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true
        } = evaluate(options2, state);
        const coords = {
          x,
          y
        };
        const crossAxis = getSideAxis(placement);
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        const rawOffset = evaluate(offset4, state);
        const computedOffset = typeof rawOffset === "number" ? {
          mainAxis: rawOffset,
          crossAxis: 0
        } : {
          mainAxis: 0,
          crossAxis: 0,
          ...rawOffset
        };
        if (checkMainAxis) {
          const len = mainAxis === "y" ? "height" : "width";
          const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
          const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
          if (mainAxisCoord < limitMin) {
            mainAxisCoord = limitMin;
          } else if (mainAxisCoord > limitMax) {
            mainAxisCoord = limitMax;
          }
        }
        if (checkCrossAxis) {
          var _middlewareData$offse, _middlewareData$offse2;
          const len = mainAxis === "y" ? "width" : "height";
          const isOriginSide = originSides.has(getSide(placement));
          const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
          const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
          if (crossAxisCoord < limitMin) {
            crossAxisCoord = limitMin;
          } else if (crossAxisCoord > limitMax) {
            crossAxisCoord = limitMax;
          }
        }
        return {
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        };
      }
    };
  };
  var size = function(options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    return {
      name: "size",
      options: options2,
      async fn(state) {
        var _state$middlewareData, _state$middlewareData2;
        const {
          placement,
          rects,
          platform: platform2,
          elements
        } = state;
        const {
          apply = () => {
          },
          ...detectOverflowOptions
        } = evaluate(options2, state);
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const side = getSide(placement);
        const alignment = getAlignment(placement);
        const isYAxis = getSideAxis(placement) === "y";
        const {
          width,
          height
        } = rects.floating;
        let heightSide;
        let widthSide;
        if (side === "top" || side === "bottom") {
          heightSide = side;
          widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
        } else {
          widthSide = side;
          heightSide = alignment === "end" ? "top" : "bottom";
        }
        const maximumClippingHeight = height - overflow.top - overflow.bottom;
        const maximumClippingWidth = width - overflow.left - overflow.right;
        const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
        const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
        const noShift = !state.middlewareData.shift;
        let availableHeight = overflowAvailableHeight;
        let availableWidth = overflowAvailableWidth;
        if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
          availableWidth = maximumClippingWidth;
        }
        if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
          availableHeight = maximumClippingHeight;
        }
        if (noShift && !alignment) {
          const xMin = max(overflow.left, 0);
          const xMax = max(overflow.right, 0);
          const yMin = max(overflow.top, 0);
          const yMax = max(overflow.bottom, 0);
          if (isYAxis) {
            availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
          } else {
            availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
          }
        }
        await apply({
          ...state,
          availableWidth,
          availableHeight
        });
        const nextDimensions = await platform2.getDimensions(elements.floating);
        if (width !== nextDimensions.width || height !== nextDimensions.height) {
          return {
            reset: {
              rects: true
            }
          };
        }
        return {};
      }
    };
  };

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
  init_define_import_meta_env();
  function hasWindow() {
    return typeof window !== "undefined";
  }
  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || "").toLowerCase();
    }
    return "#document";
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
  }
  function isNode(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Node || value instanceof getWindow(value).Node;
  }
  function isElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Element || value instanceof getWindow(value).Element;
  }
  function isHTMLElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
  }
  function isShadowRoot(value) {
    if (!hasWindow() || typeof ShadowRoot === "undefined") {
      return false;
    }
    return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
  }
  var invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
  function isOverflowElement(element) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle2(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
  }
  var tableElements = /* @__PURE__ */ new Set(["table", "td", "th"]);
  function isTableElement(element) {
    return tableElements.has(getNodeName(element));
  }
  var topLayerSelectors = [":popover-open", ":modal"];
  function isTopLayer(element) {
    return topLayerSelectors.some((selector) => {
      try {
        return element.matches(selector);
      } catch (_e2) {
        return false;
      }
    });
  }
  var transformProperties = ["transform", "translate", "scale", "rotate", "perspective"];
  var willChangeValues = ["transform", "translate", "scale", "rotate", "perspective", "filter"];
  var containValues = ["paint", "layout", "strict", "content"];
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
    return transformProperties.some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || willChangeValues.some((value) => (css.willChange || "").includes(value)) || containValues.some((value) => (css.contain || "").includes(value));
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else if (isTopLayer(currentNode)) {
        return null;
      }
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === "undefined" || !CSS.supports) return false;
    return CSS.supports("-webkit-backdrop-filter", "none");
  }
  var lastTraversableNodeNames = /* @__PURE__ */ new Set(["html", "body", "#document"]);
  function isLastTraversableNode(node) {
    return lastTraversableNodeNames.has(getNodeName(node));
  }
  function getComputedStyle2(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.scrollX,
      scrollTop: element.scrollY
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === "html") {
      return node;
    }
    const result = (
      // Step into the shadow DOM of the parent of a slotted node.
      node.assignedSlot || // DOM Element detected.
      node.parentNode || // ShadowRoot detected.
      isShadowRoot(node) && node.host || // Fallback.
      getDocumentElement(node)
    );
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list, traverseIframes) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    if (traverseIframes === void 0) {
      traverseIframes = true;
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      const frameElement = getFrameElement(win);
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
  }

  // node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
  function getCssDimensions(element) {
    const css = getComputedStyle2(element);
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      $: shouldFallback
    };
  }
  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }
  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      $: $2
    } = getCssDimensions(domElement);
    let x = ($2 ? round(rect.width) : rect.width) / width;
    let y = ($2 ? round(rect.height) : rect.height) / height;
    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }
  var noOffsets = /* @__PURE__ */ createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop
    };
  }
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
      return false;
    }
    return isFixed;
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle2(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }
  function getWindowScrollBarX(element, rect) {
    const leftScroll = getNodeScroll(element).scrollLeft;
    if (!rect) {
      return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
    }
    return rect.left + leftScroll;
  }
  function getHTMLOffset(documentElement, scroll) {
    const htmlRect = documentElement.getBoundingClientRect();
    const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
    const y = htmlRect.top + scroll.scrollTop;
    return {
      x,
      y
    };
  }
  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      elements,
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isFixed = strategy === "fixed";
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || topLayer && isFixed) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
    };
  }
  function getClientRects(element) {
    return Array.from(element.getClientRects());
  }
  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle2(body).direction === "rtl") {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  var SCROLLBAR_MAX = 25;
  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isWebKit();
      if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    const windowScrollbarX = getWindowScrollBarX(html);
    if (windowScrollbarX <= 0) {
      const doc = html.ownerDocument;
      const body = doc.body;
      const bodyStyles = getComputedStyle(body);
      const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
      const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
      if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
        width -= clippingStableScrollbarWidth;
      }
    } else if (windowScrollbarX <= SCROLLBAR_MAX) {
      width += windowScrollbarX;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  var absoluteOrFixed = /* @__PURE__ */ new Set(["absolute", "fixed"]);
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y
    };
  }
  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === "viewport") {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === "document") {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element);
      rect = {
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y,
        width: clippingAncestor.width,
        height: clippingAncestor.height
      };
    }
    return rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
  }
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle2(element).position === "fixed";
    let currentNode = elementIsFixed ? getParentNode(element) : element;
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle2(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === "fixed") {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
      if (shouldDropCurrentNode) {
        result = result.filter((ancestor) => ancestor !== currentNode);
      } else {
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }
  function getClippingRect(_ref) {
    let {
      element,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }
  function getDimensions(element) {
    const {
      width,
      height
    } = getCssDimensions(element);
    return {
      width,
      height
    };
  }
  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === "fixed";
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = createCoords(0);
    function setLeftRTLScrollbarOffset() {
      offsets.x = getWindowScrollBarX(documentElement);
    }
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        setLeftRTLScrollbarOffset();
      }
    }
    if (isFixed && !isOffsetParentAnElement && documentElement) {
      setLeftRTLScrollbarOffset();
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
    return {
      x,
      y,
      width: rect.width,
      height: rect.height
    };
  }
  function isStaticPositioned(element) {
    return getComputedStyle2(element).position === "static";
  }
  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    let rawOffsetParent = element.offsetParent;
    if (getDocumentElement(element) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }
  function getOffsetParent(element, polyfill) {
    const win = getWindow(element);
    if (isTopLayer(element)) {
      return win;
    }
    if (!isHTMLElement(element)) {
      let svgOffsetParent = getParentNode(element);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
      return win;
    }
    return offsetParent || getContainingBlock(element) || win;
  }
  var getElementRects = async function(data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height
      }
    };
  };
  function isRTL(element) {
    return getComputedStyle2(element).direction === "rtl";
  }
  var platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };
  function rectsAreEqual(a, b) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  }
  function observeMove(element, onMove) {
    let io = null;
    let timeoutId;
    const root = getDocumentElement(element);
    function cleanup() {
      var _io;
      clearTimeout(timeoutId);
      (_io = io) == null || _io.disconnect();
      io = null;
    }
    function refresh(skip, threshold) {
      if (skip === void 0) {
        skip = false;
      }
      if (threshold === void 0) {
        threshold = 1;
      }
      cleanup();
      const elementRectForRootMargin = element.getBoundingClientRect();
      const {
        left,
        top,
        width,
        height
      } = elementRectForRootMargin;
      if (!skip) {
        onMove();
      }
      if (!width || !height) {
        return;
      }
      const insetTop = floor(top);
      const insetRight = floor(root.clientWidth - (left + width));
      const insetBottom = floor(root.clientHeight - (top + height));
      const insetLeft = floor(left);
      const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
      const options2 = {
        rootMargin,
        threshold: max(0, min(1, threshold)) || 1
      };
      let isFirstUpdate = true;
      function handleObserve(entries) {
        const ratio = entries[0].intersectionRatio;
        if (ratio !== threshold) {
          if (!isFirstUpdate) {
            return refresh();
          }
          if (!ratio) {
            timeoutId = setTimeout(() => {
              refresh(false, 1e-7);
            }, 1e3);
          } else {
            refresh(false, ratio);
          }
        }
        if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
          refresh();
        }
        isFirstUpdate = false;
      }
      try {
        io = new IntersectionObserver(handleObserve, {
          ...options2,
          // Handle <iframe>s
          root: root.ownerDocument
        });
      } catch (_e2) {
        io = new IntersectionObserver(handleObserve, options2);
      }
      io.observe(element);
    }
    refresh(true);
    return cleanup;
  }
  function autoUpdate(reference, floating, update, options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    const {
      ancestorScroll = true,
      ancestorResize = true,
      elementResize = typeof ResizeObserver === "function",
      layoutShift = typeof IntersectionObserver === "function",
      animationFrame = false
    } = options2;
    const referenceEl = unwrapElement(reference);
    const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.addEventListener("scroll", update, {
        passive: true
      });
      ancestorResize && ancestor.addEventListener("resize", update);
    });
    const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
    let reobserveFrame = -1;
    let resizeObserver = null;
    if (elementResize) {
      resizeObserver = new ResizeObserver((_ref) => {
        let [firstEntry] = _ref;
        if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
          resizeObserver.unobserve(floating);
          cancelAnimationFrame(reobserveFrame);
          reobserveFrame = requestAnimationFrame(() => {
            var _resizeObserver;
            (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
          });
        }
        update();
      });
      if (referenceEl && !animationFrame) {
        resizeObserver.observe(referenceEl);
      }
      resizeObserver.observe(floating);
    }
    let frameId;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
    if (animationFrame) {
      frameLoop();
    }
    function frameLoop() {
      const nextRefRect = getBoundingClientRect(reference);
      if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
        update();
      }
      prevRefRect = nextRefRect;
      frameId = requestAnimationFrame(frameLoop);
    }
    update();
    return () => {
      var _resizeObserver2;
      ancestors.forEach((ancestor) => {
        ancestorScroll && ancestor.removeEventListener("scroll", update);
        ancestorResize && ancestor.removeEventListener("resize", update);
      });
      cleanupIo == null || cleanupIo();
      (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
      resizeObserver = null;
      if (animationFrame) {
        cancelAnimationFrame(frameId);
      }
    };
  }
  var offset2 = offset;
  var shift2 = shift;
  var flip2 = flip;
  var size2 = size;
  var hide2 = hide;
  var arrow2 = arrow;
  var limitShift2 = limitShift;
  var computePosition2 = (reference, floating, options2) => {
    const cache = /* @__PURE__ */ new Map();
    const mergedOptions = {
      platform,
      ...options2
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache
    };
    return computePosition(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache
    });
  };

  // node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.mjs
  var React16 = __toESM(require_react_shim(), 1);
  var import_react2 = __toESM(require_react_shim(), 1);
  var ReactDOM4 = __toESM(require_react_dom_shim(), 1);
  var isClient = typeof document !== "undefined";
  var noop = function noop2() {
  };
  var index = isClient ? import_react2.useLayoutEffect : noop;
  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (typeof a !== typeof b) {
      return false;
    }
    if (typeof a === "function" && a.toString() === b.toString()) {
      return true;
    }
    let length;
    let i;
    let keys;
    if (a && b && typeof a === "object") {
      if (Array.isArray(a)) {
        length = a.length;
        if (length !== b.length) return false;
        for (i = length; i-- !== 0; ) {
          if (!deepEqual(a[i], b[i])) {
            return false;
          }
        }
        return true;
      }
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) {
        return false;
      }
      for (i = length; i-- !== 0; ) {
        if (!{}.hasOwnProperty.call(b, keys[i])) {
          return false;
        }
      }
      for (i = length; i-- !== 0; ) {
        const key = keys[i];
        if (key === "_owner" && a.$$typeof) {
          continue;
        }
        if (!deepEqual(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }
    return a !== a && b !== b;
  }
  function getDPR(element) {
    if (typeof window === "undefined") {
      return 1;
    }
    const win = element.ownerDocument.defaultView || window;
    return win.devicePixelRatio || 1;
  }
  function roundByDPR(element, value) {
    const dpr = getDPR(element);
    return Math.round(value * dpr) / dpr;
  }
  function useLatestRef(value) {
    const ref = React16.useRef(value);
    index(() => {
      ref.current = value;
    });
    return ref;
  }
  function useFloating(options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    const {
      placement = "bottom",
      strategy = "absolute",
      middleware = [],
      platform: platform2,
      elements: {
        reference: externalReference,
        floating: externalFloating
      } = {},
      transform = true,
      whileElementsMounted,
      open
    } = options2;
    const [data, setData] = React16.useState({
      x: 0,
      y: 0,
      strategy,
      placement,
      middlewareData: {},
      isPositioned: false
    });
    const [latestMiddleware, setLatestMiddleware] = React16.useState(middleware);
    if (!deepEqual(latestMiddleware, middleware)) {
      setLatestMiddleware(middleware);
    }
    const [_reference, _setReference] = React16.useState(null);
    const [_floating, _setFloating] = React16.useState(null);
    const setReference = React16.useCallback((node) => {
      if (node !== referenceRef.current) {
        referenceRef.current = node;
        _setReference(node);
      }
    }, []);
    const setFloating = React16.useCallback((node) => {
      if (node !== floatingRef.current) {
        floatingRef.current = node;
        _setFloating(node);
      }
    }, []);
    const referenceEl = externalReference || _reference;
    const floatingEl = externalFloating || _floating;
    const referenceRef = React16.useRef(null);
    const floatingRef = React16.useRef(null);
    const dataRef = React16.useRef(data);
    const hasWhileElementsMounted = whileElementsMounted != null;
    const whileElementsMountedRef = useLatestRef(whileElementsMounted);
    const platformRef = useLatestRef(platform2);
    const openRef = useLatestRef(open);
    const update = React16.useCallback(() => {
      if (!referenceRef.current || !floatingRef.current) {
        return;
      }
      const config = {
        placement,
        strategy,
        middleware: latestMiddleware
      };
      if (platformRef.current) {
        config.platform = platformRef.current;
      }
      computePosition2(referenceRef.current, floatingRef.current, config).then((data2) => {
        const fullData = {
          ...data2,
          // The floating element's position may be recomputed while it's closed
          // but still mounted (such as when transitioning out). To ensure
          // `isPositioned` will be `false` initially on the next open, avoid
          // setting it to `true` when `open === false` (must be specified).
          isPositioned: openRef.current !== false
        };
        if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
          dataRef.current = fullData;
          ReactDOM4.flushSync(() => {
            setData(fullData);
          });
        }
      });
    }, [latestMiddleware, placement, strategy, platformRef, openRef]);
    index(() => {
      if (open === false && dataRef.current.isPositioned) {
        dataRef.current.isPositioned = false;
        setData((data2) => ({
          ...data2,
          isPositioned: false
        }));
      }
    }, [open]);
    const isMountedRef = React16.useRef(false);
    index(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);
    index(() => {
      if (referenceEl) referenceRef.current = referenceEl;
      if (floatingEl) floatingRef.current = floatingEl;
      if (referenceEl && floatingEl) {
        if (whileElementsMountedRef.current) {
          return whileElementsMountedRef.current(referenceEl, floatingEl, update);
        }
        update();
      }
    }, [referenceEl, floatingEl, update, whileElementsMountedRef, hasWhileElementsMounted]);
    const refs = React16.useMemo(() => ({
      reference: referenceRef,
      floating: floatingRef,
      setReference,
      setFloating
    }), [setReference, setFloating]);
    const elements = React16.useMemo(() => ({
      reference: referenceEl,
      floating: floatingEl
    }), [referenceEl, floatingEl]);
    const floatingStyles = React16.useMemo(() => {
      const initialStyles = {
        position: strategy,
        left: 0,
        top: 0
      };
      if (!elements.floating) {
        return initialStyles;
      }
      const x = roundByDPR(elements.floating, data.x);
      const y = roundByDPR(elements.floating, data.y);
      if (transform) {
        return {
          ...initialStyles,
          transform: "translate(" + x + "px, " + y + "px)",
          ...getDPR(elements.floating) >= 1.5 && {
            willChange: "transform"
          }
        };
      }
      return {
        position: strategy,
        left: x,
        top: y
      };
    }, [strategy, transform, elements.floating, data.x, data.y]);
    return React16.useMemo(() => ({
      ...data,
      update,
      refs,
      elements,
      floatingStyles
    }), [data, update, refs, elements, floatingStyles]);
  }
  var arrow$1 = (options2) => {
    function isRef(value) {
      return {}.hasOwnProperty.call(value, "current");
    }
    return {
      name: "arrow",
      options: options2,
      fn(state) {
        const {
          element,
          padding
        } = typeof options2 === "function" ? options2(state) : options2;
        if (element && isRef(element)) {
          if (element.current != null) {
            return arrow2({
              element: element.current,
              padding
            }).fn(state);
          }
          return {};
        }
        if (element) {
          return arrow2({
            element,
            padding
          }).fn(state);
        }
        return {};
      }
    };
  };
  var offset3 = (options2, deps) => ({
    ...offset2(options2),
    options: [options2, deps]
  });
  var shift3 = (options2, deps) => ({
    ...shift2(options2),
    options: [options2, deps]
  });
  var limitShift3 = (options2, deps) => ({
    ...limitShift2(options2),
    options: [options2, deps]
  });
  var flip3 = (options2, deps) => ({
    ...flip2(options2),
    options: [options2, deps]
  });
  var size3 = (options2, deps) => ({
    ...size2(options2),
    options: [options2, deps]
  });
  var hide3 = (options2, deps) => ({
    ...hide2(options2),
    options: [options2, deps]
  });
  var arrow3 = (options2, deps) => ({
    ...arrow$1(options2),
    options: [options2, deps]
  });

  // node_modules/@radix-ui/react-arrow/dist/index.mjs
  init_define_import_meta_env();
  var React17 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime10 = __toESM(require_react_shim(), 1);
  var NAME2 = "Arrow";
  var Arrow = React17.forwardRef((props, forwardedRef) => {
    const { children, width = 10, height = 5, ...arrowProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      Primitive2.svg,
      {
        ...arrowProps,
        ref: forwardedRef,
        width,
        height,
        viewBox: "0 0 30 10",
        preserveAspectRatio: "none",
        children: props.asChild ? children : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("polygon", { points: "0,0 30,0 15,10" })
      }
    );
  });
  Arrow.displayName = NAME2;
  var Root2 = Arrow;

  // node_modules/@radix-ui/react-use-size/dist/index.mjs
  init_define_import_meta_env();
  var React18 = __toESM(require_react_shim(), 1);
  function useSize(element) {
    const [size4, setSize] = React18.useState(void 0);
    useLayoutEffect2(() => {
      if (element) {
        setSize({ width: element.offsetWidth, height: element.offsetHeight });
        const resizeObserver = new ResizeObserver((entries) => {
          if (!Array.isArray(entries)) {
            return;
          }
          if (!entries.length) {
            return;
          }
          const entry = entries[0];
          let width;
          let height;
          if ("borderBoxSize" in entry) {
            const borderSizeEntry = entry["borderBoxSize"];
            const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
            width = borderSize["inlineSize"];
            height = borderSize["blockSize"];
          } else {
            width = element.offsetWidth;
            height = element.offsetHeight;
          }
          setSize({ width, height });
        });
        resizeObserver.observe(element, { box: "border-box" });
        return () => resizeObserver.unobserve(element);
      } else {
        setSize(void 0);
      }
    }, [element]);
    return size4;
  }

  // node_modules/@radix-ui/react-popper/dist/index.mjs
  var import_jsx_runtime11 = __toESM(require_react_shim(), 1);
  var POPPER_NAME = "Popper";
  var [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME);
  var [PopperProvider, usePopperContext] = createPopperContext(POPPER_NAME);
  var Popper = (props) => {
    const { __scopePopper, children } = props;
    const [anchor, setAnchor] = React19.useState(null);
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(PopperProvider, { scope: __scopePopper, anchor, onAnchorChange: setAnchor, children });
  };
  Popper.displayName = POPPER_NAME;
  var ANCHOR_NAME = "PopperAnchor";
  var PopperAnchor = React19.forwardRef(
    (props, forwardedRef) => {
      const { __scopePopper, virtualRef, ...anchorProps } = props;
      const context = usePopperContext(ANCHOR_NAME, __scopePopper);
      const ref = React19.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const anchorRef = React19.useRef(null);
      React19.useEffect(() => {
        const previousAnchor = anchorRef.current;
        anchorRef.current = virtualRef?.current || ref.current;
        if (previousAnchor !== anchorRef.current) {
          context.onAnchorChange(anchorRef.current);
        }
      });
      return virtualRef ? null : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Primitive2.div, { ...anchorProps, ref: composedRefs });
    }
  );
  PopperAnchor.displayName = ANCHOR_NAME;
  var CONTENT_NAME = "PopperContent";
  var [PopperContentProvider, useContentContext] = createPopperContext(CONTENT_NAME);
  var PopperContent = React19.forwardRef(
    (props, forwardedRef) => {
      const {
        __scopePopper,
        side = "bottom",
        sideOffset = 0,
        align = "center",
        alignOffset = 0,
        arrowPadding = 0,
        avoidCollisions = true,
        collisionBoundary = [],
        collisionPadding: collisionPaddingProp = 0,
        sticky = "partial",
        hideWhenDetached = false,
        updatePositionStrategy = "optimized",
        onPlaced,
        ...contentProps
      } = props;
      const context = usePopperContext(CONTENT_NAME, __scopePopper);
      const [content, setContent] = React19.useState(null);
      const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
      const [arrow4, setArrow] = React19.useState(null);
      const arrowSize = useSize(arrow4);
      const arrowWidth = arrowSize?.width ?? 0;
      const arrowHeight = arrowSize?.height ?? 0;
      const desiredPlacement = side + (align !== "center" ? "-" + align : "");
      const collisionPadding = typeof collisionPaddingProp === "number" ? collisionPaddingProp : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp };
      const boundary = Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary];
      const hasExplicitBoundaries = boundary.length > 0;
      const detectOverflowOptions = {
        padding: collisionPadding,
        boundary: boundary.filter(isNotNull),
        // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
        altBoundary: hasExplicitBoundaries
      };
      const { refs, floatingStyles, placement, isPositioned, middlewareData } = useFloating({
        // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
        strategy: "fixed",
        placement: desiredPlacement,
        whileElementsMounted: (...args) => {
          const cleanup = autoUpdate(...args, {
            animationFrame: updatePositionStrategy === "always"
          });
          return cleanup;
        },
        elements: {
          reference: context.anchor
        },
        middleware: [
          offset3({ mainAxis: sideOffset + arrowHeight, alignmentAxis: alignOffset }),
          avoidCollisions && shift3({
            mainAxis: true,
            crossAxis: false,
            limiter: sticky === "partial" ? limitShift3() : void 0,
            ...detectOverflowOptions
          }),
          avoidCollisions && flip3({ ...detectOverflowOptions }),
          size3({
            ...detectOverflowOptions,
            apply: ({ elements, rects, availableWidth, availableHeight }) => {
              const { width: anchorWidth, height: anchorHeight } = rects.reference;
              const contentStyle = elements.floating.style;
              contentStyle.setProperty("--radix-popper-available-width", `${availableWidth}px`);
              contentStyle.setProperty("--radix-popper-available-height", `${availableHeight}px`);
              contentStyle.setProperty("--radix-popper-anchor-width", `${anchorWidth}px`);
              contentStyle.setProperty("--radix-popper-anchor-height", `${anchorHeight}px`);
            }
          }),
          arrow4 && arrow3({ element: arrow4, padding: arrowPadding }),
          transformOrigin({ arrowWidth, arrowHeight }),
          hideWhenDetached && hide3({ strategy: "referenceHidden", ...detectOverflowOptions })
        ]
      });
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const handlePlaced = useCallbackRef(onPlaced);
      useLayoutEffect2(() => {
        if (isPositioned) {
          handlePlaced?.();
        }
      }, [isPositioned, handlePlaced]);
      const arrowX = middlewareData.arrow?.x;
      const arrowY = middlewareData.arrow?.y;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const [contentZIndex, setContentZIndex] = React19.useState();
      useLayoutEffect2(() => {
        if (content) setContentZIndex(window.getComputedStyle(content).zIndex);
      }, [content]);
      return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "div",
        {
          ref: refs.setFloating,
          "data-radix-popper-content-wrapper": "",
          style: {
            ...floatingStyles,
            transform: isPositioned ? floatingStyles.transform : "translate(0, -200%)",
            // keep off the page when measuring
            minWidth: "max-content",
            zIndex: contentZIndex,
            ["--radix-popper-transform-origin"]: [
              middlewareData.transformOrigin?.x,
              middlewareData.transformOrigin?.y
            ].join(" "),
            // hide the content if using the hide middleware and should be hidden
            // set visibility to hidden and disable pointer events so the UI behaves
            // as if the PopperContent isn't there at all
            ...middlewareData.hide?.referenceHidden && {
              visibility: "hidden",
              pointerEvents: "none"
            }
          },
          dir: props.dir,
          children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            PopperContentProvider,
            {
              scope: __scopePopper,
              placedSide,
              onArrowChange: setArrow,
              arrowX,
              arrowY,
              shouldHideArrow: cannotCenterArrow,
              children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                Primitive2.div,
                {
                  "data-side": placedSide,
                  "data-align": placedAlign,
                  ...contentProps,
                  ref: composedRefs,
                  style: {
                    ...contentProps.style,
                    // if the PopperContent hasn't been placed yet (not all measurements done)
                    // we prevent animations so that users's animation don't kick in too early referring wrong sides
                    animation: !isPositioned ? "none" : void 0
                  }
                }
              )
            }
          )
        }
      );
    }
  );
  PopperContent.displayName = CONTENT_NAME;
  var ARROW_NAME = "PopperArrow";
  var OPPOSITE_SIDE = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right"
  };
  var PopperArrow = React19.forwardRef(function PopperArrow2(props, forwardedRef) {
    const { __scopePopper, ...arrowProps } = props;
    const contentContext = useContentContext(ARROW_NAME, __scopePopper);
    const baseSide = OPPOSITE_SIDE[contentContext.placedSide];
    return (
      // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
      // doesn't report size as we'd expect on SVG elements.
      // it reports their bounding box which is effectively the largest path inside the SVG.
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "span",
        {
          ref: contentContext.onArrowChange,
          style: {
            position: "absolute",
            left: contentContext.arrowX,
            top: contentContext.arrowY,
            [baseSide]: 0,
            transformOrigin: {
              top: "",
              right: "0 0",
              bottom: "center 0",
              left: "100% 0"
            }[contentContext.placedSide],
            transform: {
              top: "translateY(100%)",
              right: "translateY(50%) rotate(90deg) translateX(-50%)",
              bottom: `rotate(180deg)`,
              left: "translateY(50%) rotate(-90deg) translateX(50%)"
            }[contentContext.placedSide],
            visibility: contentContext.shouldHideArrow ? "hidden" : void 0
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            Root2,
            {
              ...arrowProps,
              ref: forwardedRef,
              style: {
                ...arrowProps.style,
                // ensures the element can be measured correctly (mostly for if SVG)
                display: "block"
              }
            }
          )
        }
      )
    );
  });
  PopperArrow.displayName = ARROW_NAME;
  function isNotNull(value) {
    return value !== null;
  }
  var transformOrigin = (options2) => ({
    name: "transformOrigin",
    options: options2,
    fn(data) {
      const { placement, rects, middlewareData } = data;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const isArrowHidden = cannotCenterArrow;
      const arrowWidth = isArrowHidden ? 0 : options2.arrowWidth;
      const arrowHeight = isArrowHidden ? 0 : options2.arrowHeight;
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
      const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
      const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
      let x = "";
      let y = "";
      if (placedSide === "bottom") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${-arrowHeight}px`;
      } else if (placedSide === "top") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${rects.floating.height + arrowHeight}px`;
      } else if (placedSide === "right") {
        x = `${-arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      } else if (placedSide === "left") {
        x = `${rects.floating.width + arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      }
      return { data: { x, y } };
    }
  });
  function getSideAndAlignFromPlacement(placement) {
    const [side, align = "center"] = placement.split("-");
    return [side, align];
  }
  var Root22 = Popper;
  var Anchor = PopperAnchor;
  var Content = PopperContent;
  var Arrow2 = PopperArrow;

  // node_modules/@radix-ui/react-portal/dist/index.mjs
  init_define_import_meta_env();
  var React20 = __toESM(require_react_shim(), 1);
  var import_react_dom3 = __toESM(require_react_dom_shim(), 1);
  var import_jsx_runtime12 = __toESM(require_react_shim(), 1);
  var PORTAL_NAME = "Portal";
  var Portal = React20.forwardRef((props, forwardedRef) => {
    const { container: containerProp, ...portalProps } = props;
    const [mounted, setMounted] = React20.useState(false);
    useLayoutEffect2(() => setMounted(true), []);
    const container = containerProp || mounted && globalThis?.document?.body;
    return container ? import_react_dom3.default.createPortal(/* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Primitive2.div, { ...portalProps, ref: forwardedRef }), container) : null;
  });
  Portal.displayName = PORTAL_NAME;

  // node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
  init_define_import_meta_env();
  var React21 = __toESM(require_react_shim(), 1);
  var React22 = __toESM(require_react_shim(), 1);
  var useInsertionEffect = React21[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
  function useControllableState({
    prop,
    defaultProp,
    onChange = () => {
    },
    caller
  }) {
    const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
      defaultProp,
      onChange
    });
    const isControlled = prop !== void 0;
    const value = isControlled ? prop : uncontrolledProp;
    if (true) {
      const isControlledRef = React21.useRef(prop !== void 0);
      React21.useEffect(() => {
        const wasControlled = isControlledRef.current;
        if (wasControlled !== isControlled) {
          const from = wasControlled ? "controlled" : "uncontrolled";
          const to = isControlled ? "controlled" : "uncontrolled";
          console.warn(
            `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
          );
        }
        isControlledRef.current = isControlled;
      }, [isControlled, caller]);
    }
    const setValue = React21.useCallback(
      (nextValue) => {
        if (isControlled) {
          const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
          if (value2 !== prop) {
            onChangeRef.current?.(value2);
          }
        } else {
          setUncontrolledProp(nextValue);
        }
      },
      [isControlled, prop, setUncontrolledProp, onChangeRef]
    );
    return [value, setValue];
  }
  function useUncontrolledState({
    defaultProp,
    onChange
  }) {
    const [value, setValue] = React21.useState(defaultProp);
    const prevValueRef = React21.useRef(value);
    const onChangeRef = React21.useRef(onChange);
    useInsertionEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);
    React21.useEffect(() => {
      if (prevValueRef.current !== value) {
        onChangeRef.current?.(value);
        prevValueRef.current = value;
      }
    }, [value, prevValueRef]);
    return [value, setValue, onChangeRef];
  }
  function isFunction(value) {
    return typeof value === "function";
  }

  // node_modules/aria-hidden/dist/es2015/index.js
  init_define_import_meta_env();
  var getDefaultParent = function(originalTarget) {
    if (typeof document === "undefined") {
      return null;
    }
    var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
    return sampleTarget.ownerDocument.body;
  };
  var counterMap = /* @__PURE__ */ new WeakMap();
  var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
  var markerMap = {};
  var lockCount = 0;
  var unwrapHost = function(node) {
    return node && (node.host || unwrapHost(node.parentNode));
  };
  var correctTargets = function(parent, targets) {
    return targets.map(function(target) {
      if (parent.contains(target)) {
        return target;
      }
      var correctedTarget = unwrapHost(target);
      if (correctedTarget && parent.contains(correctedTarget)) {
        return correctedTarget;
      }
      console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
      return null;
    }).filter(function(x) {
      return Boolean(x);
    });
  };
  var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
    var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
    if (!markerMap[markerName]) {
      markerMap[markerName] = /* @__PURE__ */ new WeakMap();
    }
    var markerCounter = markerMap[markerName];
    var hiddenNodes = [];
    var elementsToKeep = /* @__PURE__ */ new Set();
    var elementsToStop = new Set(targets);
    var keep = function(el) {
      if (!el || elementsToKeep.has(el)) {
        return;
      }
      elementsToKeep.add(el);
      keep(el.parentNode);
    };
    targets.forEach(keep);
    var deep = function(parent) {
      if (!parent || elementsToStop.has(parent)) {
        return;
      }
      Array.prototype.forEach.call(parent.children, function(node) {
        if (elementsToKeep.has(node)) {
          deep(node);
        } else {
          try {
            var attr = node.getAttribute(controlAttribute);
            var alreadyHidden = attr !== null && attr !== "false";
            var counterValue = (counterMap.get(node) || 0) + 1;
            var markerValue = (markerCounter.get(node) || 0) + 1;
            counterMap.set(node, counterValue);
            markerCounter.set(node, markerValue);
            hiddenNodes.push(node);
            if (counterValue === 1 && alreadyHidden) {
              uncontrolledNodes.set(node, true);
            }
            if (markerValue === 1) {
              node.setAttribute(markerName, "true");
            }
            if (!alreadyHidden) {
              node.setAttribute(controlAttribute, "true");
            }
          } catch (e) {
            console.error("aria-hidden: cannot operate on ", node, e);
          }
        }
      });
    };
    deep(parentNode);
    elementsToKeep.clear();
    lockCount++;
    return function() {
      hiddenNodes.forEach(function(node) {
        var counterValue = counterMap.get(node) - 1;
        var markerValue = markerCounter.get(node) - 1;
        counterMap.set(node, counterValue);
        markerCounter.set(node, markerValue);
        if (!counterValue) {
          if (!uncontrolledNodes.has(node)) {
            node.removeAttribute(controlAttribute);
          }
          uncontrolledNodes.delete(node);
        }
        if (!markerValue) {
          node.removeAttribute(markerName);
        }
      });
      lockCount--;
      if (!lockCount) {
        counterMap = /* @__PURE__ */ new WeakMap();
        counterMap = /* @__PURE__ */ new WeakMap();
        uncontrolledNodes = /* @__PURE__ */ new WeakMap();
        markerMap = {};
      }
    };
  };
  var hideOthers = function(originalTarget, parentNode, markerName) {
    if (markerName === void 0) {
      markerName = "data-aria-hidden";
    }
    var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
    var activeParentNode = parentNode || getDefaultParent(originalTarget);
    if (!activeParentNode) {
      return function() {
        return null;
      };
    }
    targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
    return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
  };

  // node_modules/react-remove-scroll/dist/es2015/index.js
  init_define_import_meta_env();

  // node_modules/react-remove-scroll/dist/es2015/Combination.js
  init_define_import_meta_env();

  // node_modules/tslib/tslib.es6.mjs
  init_define_import_meta_env();
  var __assign = function() {
    __assign = Object.assign || function __assign2(t2) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p2 in s) if (Object.prototype.hasOwnProperty.call(s, p2)) t2[p2] = s[p2];
      }
      return t2;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s, e) {
    var t2 = {};
    for (var p2 in s) if (Object.prototype.hasOwnProperty.call(s, p2) && e.indexOf(p2) < 0)
      t2[p2] = s[p2];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p2 = Object.getOwnPropertySymbols(s); i < p2.length; i++) {
        if (e.indexOf(p2[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p2[i]))
          t2[p2[i]] = s[p2[i]];
      }
    return t2;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  // node_modules/react-remove-scroll/dist/es2015/Combination.js
  var React29 = __toESM(require_react_shim());

  // node_modules/react-remove-scroll/dist/es2015/UI.js
  init_define_import_meta_env();
  var React25 = __toESM(require_react_shim());

  // node_modules/react-remove-scroll-bar/dist/es2015/constants.js
  init_define_import_meta_env();
  var zeroRightClassName = "right-scroll-bar-position";
  var fullWidthClassName = "width-before-scroll-bar";
  var noScrollbarsClassName = "with-scroll-bars-hidden";
  var removedBarSizeVariable = "--removed-body-scroll-bar-size";

  // node_modules/use-callback-ref/dist/es2015/index.js
  init_define_import_meta_env();

  // node_modules/use-callback-ref/dist/es2015/assignRef.js
  init_define_import_meta_env();
  function assignRef(ref, value) {
    if (typeof ref === "function") {
      ref(value);
    } else if (ref) {
      ref.current = value;
    }
    return ref;
  }

  // node_modules/use-callback-ref/dist/es2015/useRef.js
  init_define_import_meta_env();
  var import_react3 = __toESM(require_react_shim());
  function useCallbackRef2(initialValue, callback) {
    var ref = (0, import_react3.useState)(function() {
      return {
        // value
        value: initialValue,
        // last callback
        callback,
        // "memoized" public interface
        facade: {
          get current() {
            return ref.value;
          },
          set current(value) {
            var last = ref.value;
            if (last !== value) {
              ref.value = value;
              ref.callback(value, last);
            }
          }
        }
      };
    })[0];
    ref.callback = callback;
    return ref.facade;
  }

  // node_modules/use-callback-ref/dist/es2015/useMergeRef.js
  init_define_import_meta_env();
  var React23 = __toESM(require_react_shim());
  var useIsomorphicLayoutEffect = typeof window !== "undefined" ? React23.useLayoutEffect : React23.useEffect;
  var currentValues = /* @__PURE__ */ new WeakMap();
  function useMergeRefs(refs, defaultValue) {
    var callbackRef = useCallbackRef2(defaultValue || null, function(newValue) {
      return refs.forEach(function(ref) {
        return assignRef(ref, newValue);
      });
    });
    useIsomorphicLayoutEffect(function() {
      var oldValue = currentValues.get(callbackRef);
      if (oldValue) {
        var prevRefs_1 = new Set(oldValue);
        var nextRefs_1 = new Set(refs);
        var current_1 = callbackRef.current;
        prevRefs_1.forEach(function(ref) {
          if (!nextRefs_1.has(ref)) {
            assignRef(ref, null);
          }
        });
        nextRefs_1.forEach(function(ref) {
          if (!prevRefs_1.has(ref)) {
            assignRef(ref, current_1);
          }
        });
      }
      currentValues.set(callbackRef, refs);
    }, [refs]);
    return callbackRef;
  }

  // node_modules/react-remove-scroll/dist/es2015/medium.js
  init_define_import_meta_env();

  // node_modules/use-sidecar/dist/es2015/index.js
  init_define_import_meta_env();

  // node_modules/use-sidecar/dist/es2015/medium.js
  init_define_import_meta_env();
  function ItoI(a) {
    return a;
  }
  function innerCreateMedium(defaults, middleware) {
    if (middleware === void 0) {
      middleware = ItoI;
    }
    var buffer = [];
    var assigned = false;
    var medium = {
      read: function() {
        if (assigned) {
          throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
        }
        if (buffer.length) {
          return buffer[buffer.length - 1];
        }
        return defaults;
      },
      useMedium: function(data) {
        var item = middleware(data, assigned);
        buffer.push(item);
        return function() {
          buffer = buffer.filter(function(x) {
            return x !== item;
          });
        };
      },
      assignSyncMedium: function(cb) {
        assigned = true;
        while (buffer.length) {
          var cbs = buffer;
          buffer = [];
          cbs.forEach(cb);
        }
        buffer = {
          push: function(x) {
            return cb(x);
          },
          filter: function() {
            return buffer;
          }
        };
      },
      assignMedium: function(cb) {
        assigned = true;
        var pendingQueue = [];
        if (buffer.length) {
          var cbs = buffer;
          buffer = [];
          cbs.forEach(cb);
          pendingQueue = buffer;
        }
        var executeQueue = function() {
          var cbs2 = pendingQueue;
          pendingQueue = [];
          cbs2.forEach(cb);
        };
        var cycle = function() {
          return Promise.resolve().then(executeQueue);
        };
        cycle();
        buffer = {
          push: function(x) {
            pendingQueue.push(x);
            cycle();
          },
          filter: function(filter) {
            pendingQueue = pendingQueue.filter(filter);
            return buffer;
          }
        };
      }
    };
    return medium;
  }
  function createSidecarMedium(options2) {
    if (options2 === void 0) {
      options2 = {};
    }
    var medium = innerCreateMedium(null);
    medium.options = __assign({ async: true, ssr: false }, options2);
    return medium;
  }

  // node_modules/use-sidecar/dist/es2015/exports.js
  init_define_import_meta_env();
  var React24 = __toESM(require_react_shim());
  var SideCar = function(_a) {
    var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
    if (!sideCar) {
      throw new Error("Sidecar: please provide `sideCar` property to import the right car");
    }
    var Target = sideCar.read();
    if (!Target) {
      throw new Error("Sidecar medium not found");
    }
    return React24.createElement(Target, __assign({}, rest));
  };
  SideCar.isSideCarExport = true;
  function exportSidecar(medium, exported) {
    medium.useMedium(exported);
    return SideCar;
  }

  // node_modules/react-remove-scroll/dist/es2015/medium.js
  var effectCar = createSidecarMedium();

  // node_modules/react-remove-scroll/dist/es2015/UI.js
  var nothing = function() {
    return;
  };
  var RemoveScroll = React25.forwardRef(function(props, parentRef) {
    var ref = React25.useRef(null);
    var _a = React25.useState({
      onScrollCapture: nothing,
      onWheelCapture: nothing,
      onTouchMoveCapture: nothing
    }), callbacks = _a[0], setCallbacks = _a[1];
    var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noRelative = props.noRelative, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
    var SideCar2 = sideCar;
    var containerRef = useMergeRefs([ref, parentRef]);
    var containerProps = __assign(__assign({}, rest), callbacks);
    return React25.createElement(
      React25.Fragment,
      null,
      enabled && React25.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noRelative, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }),
      forwardProps ? React25.cloneElement(React25.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : React25.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
    );
  });
  RemoveScroll.defaultProps = {
    enabled: true,
    removeScrollBar: true,
    inert: false
  };
  RemoveScroll.classNames = {
    fullWidth: fullWidthClassName,
    zeroRight: zeroRightClassName
  };

  // node_modules/react-remove-scroll/dist/es2015/sidecar.js
  init_define_import_meta_env();

  // node_modules/react-remove-scroll/dist/es2015/SideEffect.js
  init_define_import_meta_env();
  var React28 = __toESM(require_react_shim());

  // node_modules/react-remove-scroll-bar/dist/es2015/index.js
  init_define_import_meta_env();

  // node_modules/react-remove-scroll-bar/dist/es2015/component.js
  init_define_import_meta_env();
  var React27 = __toESM(require_react_shim());

  // node_modules/react-style-singleton/dist/es2015/index.js
  init_define_import_meta_env();

  // node_modules/react-style-singleton/dist/es2015/component.js
  init_define_import_meta_env();

  // node_modules/react-style-singleton/dist/es2015/hook.js
  init_define_import_meta_env();
  var React26 = __toESM(require_react_shim());

  // node_modules/react-style-singleton/dist/es2015/singleton.js
  init_define_import_meta_env();

  // node_modules/get-nonce/dist/es2015/index.js
  init_define_import_meta_env();
  var currentNonce;
  var getNonce = function() {
    if (currentNonce) {
      return currentNonce;
    }
    if (typeof __webpack_nonce__ !== "undefined") {
      return __webpack_nonce__;
    }
    return void 0;
  };

  // node_modules/react-style-singleton/dist/es2015/singleton.js
  function makeStyleTag() {
    if (!document)
      return null;
    var tag = document.createElement("style");
    tag.type = "text/css";
    var nonce = getNonce();
    if (nonce) {
      tag.setAttribute("nonce", nonce);
    }
    return tag;
  }
  function injectStyles(tag, css) {
    if (tag.styleSheet) {
      tag.styleSheet.cssText = css;
    } else {
      tag.appendChild(document.createTextNode(css));
    }
  }
  function insertStyleTag(tag) {
    var head = document.head || document.getElementsByTagName("head")[0];
    head.appendChild(tag);
  }
  var stylesheetSingleton = function() {
    var counter = 0;
    var stylesheet = null;
    return {
      add: function(style) {
        if (counter == 0) {
          if (stylesheet = makeStyleTag()) {
            injectStyles(stylesheet, style);
            insertStyleTag(stylesheet);
          }
        }
        counter++;
      },
      remove: function() {
        counter--;
        if (!counter && stylesheet) {
          stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
          stylesheet = null;
        }
      }
    };
  };

  // node_modules/react-style-singleton/dist/es2015/hook.js
  var styleHookSingleton = function() {
    var sheet = stylesheetSingleton();
    return function(styles, isDynamic) {
      React26.useEffect(function() {
        sheet.add(styles);
        return function() {
          sheet.remove();
        };
      }, [styles && isDynamic]);
    };
  };

  // node_modules/react-style-singleton/dist/es2015/component.js
  var styleSingleton = function() {
    var useStyle = styleHookSingleton();
    var Sheet = function(_a) {
      var styles = _a.styles, dynamic = _a.dynamic;
      useStyle(styles, dynamic);
      return null;
    };
    return Sheet;
  };

  // node_modules/react-remove-scroll-bar/dist/es2015/utils.js
  init_define_import_meta_env();
  var zeroGap = {
    left: 0,
    top: 0,
    right: 0,
    gap: 0
  };
  var parse = function(x) {
    return parseInt(x || "", 10) || 0;
  };
  var getOffset = function(gapMode) {
    var cs = window.getComputedStyle(document.body);
    var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
    var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
    var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
    return [parse(left), parse(top), parse(right)];
  };
  var getGapWidth = function(gapMode) {
    if (gapMode === void 0) {
      gapMode = "margin";
    }
    if (typeof window === "undefined") {
      return zeroGap;
    }
    var offsets = getOffset(gapMode);
    var documentWidth = document.documentElement.clientWidth;
    var windowWidth = window.innerWidth;
    return {
      left: offsets[0],
      top: offsets[1],
      right: offsets[2],
      gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
    };
  };

  // node_modules/react-remove-scroll-bar/dist/es2015/component.js
  var Style = styleSingleton();
  var lockAttribute = "data-scroll-locked";
  var getStyles = function(_a, allowRelative, gapMode, important) {
    var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
    if (gapMode === void 0) {
      gapMode = "margin";
    }
    return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body[").concat(lockAttribute, "] {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
      allowRelative && "position: relative ".concat(important, ";"),
      gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
      gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
    ].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body[").concat(lockAttribute, "] {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
  };
  var getCurrentUseCounter = function() {
    var counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
    return isFinite(counter) ? counter : 0;
  };
  var useLockAttribute = function() {
    React27.useEffect(function() {
      document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
      return function() {
        var newCounter = getCurrentUseCounter() - 1;
        if (newCounter <= 0) {
          document.body.removeAttribute(lockAttribute);
        } else {
          document.body.setAttribute(lockAttribute, newCounter.toString());
        }
      };
    }, []);
  };
  var RemoveScrollBar = function(_a) {
    var noRelative = _a.noRelative, noImportant = _a.noImportant, _b = _a.gapMode, gapMode = _b === void 0 ? "margin" : _b;
    useLockAttribute();
    var gap = React27.useMemo(function() {
      return getGapWidth(gapMode);
    }, [gapMode]);
    return React27.createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
  };

  // node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js
  init_define_import_meta_env();
  var passiveSupported = false;
  if (typeof window !== "undefined") {
    try {
      options = Object.defineProperty({}, "passive", {
        get: function() {
          passiveSupported = true;
          return true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (err) {
      passiveSupported = false;
    }
  }
  var options;
  var nonPassive = passiveSupported ? { passive: false } : false;

  // node_modules/react-remove-scroll/dist/es2015/handleScroll.js
  init_define_import_meta_env();
  var alwaysContainsScroll = function(node) {
    return node.tagName === "TEXTAREA";
  };
  var elementCanBeScrolled = function(node, overflow) {
    if (!(node instanceof Element)) {
      return false;
    }
    var styles = window.getComputedStyle(node);
    return (
      // not-not-scrollable
      styles[overflow] !== "hidden" && // contains scroll inside self
      !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
    );
  };
  var elementCouldBeVScrolled = function(node) {
    return elementCanBeScrolled(node, "overflowY");
  };
  var elementCouldBeHScrolled = function(node) {
    return elementCanBeScrolled(node, "overflowX");
  };
  var locationCouldBeScrolled = function(axis, node) {
    var ownerDocument = node.ownerDocument;
    var current = node;
    do {
      if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
        current = current.host;
      }
      var isScrollable = elementCouldBeScrolled(axis, current);
      if (isScrollable) {
        var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
        if (scrollHeight > clientHeight) {
          return true;
        }
      }
      current = current.parentNode;
    } while (current && current !== ownerDocument.body);
    return false;
  };
  var getVScrollVariables = function(_a) {
    var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
    return [
      scrollTop,
      scrollHeight,
      clientHeight
    ];
  };
  var getHScrollVariables = function(_a) {
    var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
    return [
      scrollLeft,
      scrollWidth,
      clientWidth
    ];
  };
  var elementCouldBeScrolled = function(axis, node) {
    return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
  };
  var getScrollVariables = function(axis, node) {
    return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
  };
  var getDirectionFactor = function(axis, direction) {
    return axis === "h" && direction === "rtl" ? -1 : 1;
  };
  var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
    var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
    var delta = directionFactor * sourceDelta;
    var target = event.target;
    var targetInLock = endTarget.contains(target);
    var shouldCancelScroll = false;
    var isDeltaPositive = delta > 0;
    var availableScroll = 0;
    var availableScrollTop = 0;
    do {
      if (!target) {
        break;
      }
      var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
      var elementScroll = scroll_1 - capacity - directionFactor * position;
      if (position || elementScroll) {
        if (elementCouldBeScrolled(axis, target)) {
          availableScroll += elementScroll;
          availableScrollTop += position;
        }
      }
      var parent_1 = target.parentNode;
      target = parent_1 && parent_1.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? parent_1.host : parent_1;
    } while (
      // portaled content
      !targetInLock && target !== document.body || // self content
      targetInLock && (endTarget.contains(target) || endTarget === target)
    );
    if (isDeltaPositive && (noOverscroll && Math.abs(availableScroll) < 1 || !noOverscroll && delta > availableScroll)) {
      shouldCancelScroll = true;
    } else if (!isDeltaPositive && (noOverscroll && Math.abs(availableScrollTop) < 1 || !noOverscroll && -delta > availableScrollTop)) {
      shouldCancelScroll = true;
    }
    return shouldCancelScroll;
  };

  // node_modules/react-remove-scroll/dist/es2015/SideEffect.js
  var getTouchXY = function(event) {
    return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
  };
  var getDeltaXY = function(event) {
    return [event.deltaX, event.deltaY];
  };
  var extractRef = function(ref) {
    return ref && "current" in ref ? ref.current : ref;
  };
  var deltaCompare = function(x, y) {
    return x[0] === y[0] && x[1] === y[1];
  };
  var generateStyle = function(id) {
    return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
  };
  var idCounter = 0;
  var lockStack = [];
  function RemoveScrollSideCar(props) {
    var shouldPreventQueue = React28.useRef([]);
    var touchStartRef = React28.useRef([0, 0]);
    var activeAxis = React28.useRef();
    var id = React28.useState(idCounter++)[0];
    var Style2 = React28.useState(styleSingleton)[0];
    var lastProps = React28.useRef(props);
    React28.useEffect(function() {
      lastProps.current = props;
    }, [props]);
    React28.useEffect(function() {
      if (props.inert) {
        document.body.classList.add("block-interactivity-".concat(id));
        var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
        allow_1.forEach(function(el) {
          return el.classList.add("allow-interactivity-".concat(id));
        });
        return function() {
          document.body.classList.remove("block-interactivity-".concat(id));
          allow_1.forEach(function(el) {
            return el.classList.remove("allow-interactivity-".concat(id));
          });
        };
      }
      return;
    }, [props.inert, props.lockRef.current, props.shards]);
    var shouldCancelEvent = React28.useCallback(function(event, parent) {
      if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
        return !lastProps.current.allowPinchZoom;
      }
      var touch = getTouchXY(event);
      var touchStart = touchStartRef.current;
      var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
      var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
      var currentAxis;
      var target = event.target;
      var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
      if ("touches" in event && moveDirection === "h" && target.type === "range") {
        return false;
      }
      var selection = window.getSelection();
      var anchorNode = selection && selection.anchorNode;
      var isTouchingSelection = anchorNode ? anchorNode === target || anchorNode.contains(target) : false;
      if (isTouchingSelection) {
        return false;
      }
      var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
      if (!canBeScrolledInMainDirection) {
        return true;
      }
      if (canBeScrolledInMainDirection) {
        currentAxis = moveDirection;
      } else {
        currentAxis = moveDirection === "v" ? "h" : "v";
        canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
      }
      if (!canBeScrolledInMainDirection) {
        return false;
      }
      if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
        activeAxis.current = currentAxis;
      }
      if (!currentAxis) {
        return true;
      }
      var cancelingAxis = activeAxis.current || currentAxis;
      return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
    }, []);
    var shouldPrevent = React28.useCallback(function(_event) {
      var event = _event;
      if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
        return;
      }
      var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
      var sourceEvent = shouldPreventQueue.current.filter(function(e) {
        return e.name === event.type && (e.target === event.target || event.target === e.shadowParent) && deltaCompare(e.delta, delta);
      })[0];
      if (sourceEvent && sourceEvent.should) {
        if (event.cancelable) {
          event.preventDefault();
        }
        return;
      }
      if (!sourceEvent) {
        var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
          return node.contains(event.target);
        });
        var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
        if (shouldStop) {
          if (event.cancelable) {
            event.preventDefault();
          }
        }
      }
    }, []);
    var shouldCancel = React28.useCallback(function(name, delta, target, should) {
      var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
      shouldPreventQueue.current.push(event);
      setTimeout(function() {
        shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
          return e !== event;
        });
      }, 1);
    }, []);
    var scrollTouchStart = React28.useCallback(function(event) {
      touchStartRef.current = getTouchXY(event);
      activeAxis.current = void 0;
    }, []);
    var scrollWheel = React28.useCallback(function(event) {
      shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
    }, []);
    var scrollTouchMove = React28.useCallback(function(event) {
      shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
    }, []);
    React28.useEffect(function() {
      lockStack.push(Style2);
      props.setCallbacks({
        onScrollCapture: scrollWheel,
        onWheelCapture: scrollWheel,
        onTouchMoveCapture: scrollTouchMove
      });
      document.addEventListener("wheel", shouldPrevent, nonPassive);
      document.addEventListener("touchmove", shouldPrevent, nonPassive);
      document.addEventListener("touchstart", scrollTouchStart, nonPassive);
      return function() {
        lockStack = lockStack.filter(function(inst) {
          return inst !== Style2;
        });
        document.removeEventListener("wheel", shouldPrevent, nonPassive);
        document.removeEventListener("touchmove", shouldPrevent, nonPassive);
        document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
      };
    }, []);
    var removeScrollBar = props.removeScrollBar, inert = props.inert;
    return React28.createElement(
      React28.Fragment,
      null,
      inert ? React28.createElement(Style2, { styles: generateStyle(id) }) : null,
      removeScrollBar ? React28.createElement(RemoveScrollBar, { noRelative: props.noRelative, gapMode: props.gapMode }) : null
    );
  }
  function getOutermostShadowParent(node) {
    var shadowParent = null;
    while (node !== null) {
      if (node instanceof ShadowRoot) {
        shadowParent = node.host;
        node = node.host;
      }
      node = node.parentNode;
    }
    return shadowParent;
  }

  // node_modules/react-remove-scroll/dist/es2015/sidecar.js
  var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar);

  // node_modules/react-remove-scroll/dist/es2015/Combination.js
  var ReactRemoveScroll = React29.forwardRef(function(props, ref) {
    return React29.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: sidecar_default }));
  });
  ReactRemoveScroll.classNames = RemoveScroll.classNames;
  var Combination_default = ReactRemoveScroll;

  // node_modules/lucide-react/dist/esm/lucide-react.js
  init_define_import_meta_env();

  // node_modules/lucide-react/dist/esm/createLucideIcon.js
  init_define_import_meta_env();
  var import_react5 = __toESM(require_react_shim());

  // node_modules/lucide-react/dist/esm/shared/src/utils.js
  init_define_import_meta_env();
  var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  var toCamelCase = (string) => string.replace(
    /^([A-Z])|[\s-_]+(\w)/g,
    (match2, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
  );
  var toPascalCase = (string) => {
    const camelCase = toCamelCase(string);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  };
  var mergeClasses = (...classes) => classes.filter((className, index2, array) => {
    return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index2;
  }).join(" ").trim();
  var hasA11yProp = (props) => {
    for (const prop in props) {
      if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
        return true;
      }
    }
  };

  // node_modules/lucide-react/dist/esm/Icon.js
  init_define_import_meta_env();
  var import_react4 = __toESM(require_react_shim());

  // node_modules/lucide-react/dist/esm/defaultAttributes.js
  init_define_import_meta_env();
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  // node_modules/lucide-react/dist/esm/Icon.js
  var Icon = (0, import_react4.forwardRef)(
    ({
      color = "currentColor",
      size: size4 = 24,
      strokeWidth = 2,
      absoluteStrokeWidth,
      className = "",
      children,
      iconNode,
      ...rest
    }, ref) => (0, import_react4.createElement)(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size4,
        height: size4,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size4) : strokeWidth,
        className: mergeClasses("lucide", className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => (0, import_react4.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    )
  );

  // node_modules/lucide-react/dist/esm/createLucideIcon.js
  var createLucideIcon = (iconName, iconNode) => {
    const Component = (0, import_react5.forwardRef)(
      ({ className, ...props }, ref) => (0, import_react5.createElement)(Icon, {
        ref,
        iconNode,
        className: mergeClasses(
          `lucide-${toKebabCase(toPascalCase(iconName))}`,
          `lucide-${iconName}`,
          className
        ),
        ...props
      })
    );
    Component.displayName = toPascalCase(iconName);
    return Component;
  };

  // node_modules/lucide-react/dist/esm/icons/calendar.js
  init_define_import_meta_env();
  var __iconNode = [
    ["path", { d: "M8 2v4", key: "1cmpym" }],
    ["path", { d: "M16 2v4", key: "4m81vk" }],
    ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
    ["path", { d: "M3 10h18", key: "8toen8" }]
  ];
  var Calendar = createLucideIcon("calendar", __iconNode);

  // node_modules/lucide-react/dist/esm/icons/chevron-down.js
  init_define_import_meta_env();
  var __iconNode2 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
  var ChevronDown = createLucideIcon("chevron-down", __iconNode2);

  // node_modules/lucide-react/dist/esm/icons/chevron-left.js
  init_define_import_meta_env();
  var __iconNode3 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
  var ChevronLeft = createLucideIcon("chevron-left", __iconNode3);

  // node_modules/lucide-react/dist/esm/icons/chevron-right.js
  init_define_import_meta_env();
  var __iconNode4 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
  var ChevronRight = createLucideIcon("chevron-right", __iconNode4);

  // node_modules/lucide-react/dist/esm/icons/x.js
  init_define_import_meta_env();
  var __iconNode5 = [
    ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
    ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
  ];
  var X = createLucideIcon("x", __iconNode5);

  // src/components/ui/select.tsx
  var import_jsx_runtime13 = __toESM(require_react_shim());

  // src/components/ui/card.tsx
  init_define_import_meta_env();
  var import_jsx_runtime14 = __toESM(require_react_shim());

  // src/components/ui/input.tsx
  init_define_import_meta_env();
  var import_jsx_runtime15 = __toESM(require_react_shim());

  // src/components/ui/calendar.tsx
  init_define_import_meta_env();
  var React57 = __toESM(require_react_shim());

  // node_modules/@date-fns/tz/index.js
  init_define_import_meta_env();

  // node_modules/@date-fns/tz/constants/index.js
  init_define_import_meta_env();

  // node_modules/@date-fns/tz/date/index.js
  init_define_import_meta_env();

  // node_modules/@date-fns/tz/tzName/index.js
  init_define_import_meta_env();
  function tzName(timeZone, date, format2 = "long") {
    return new Intl.DateTimeFormat("en-US", {
      // Enforces engine to render the time. Without the option JavaScriptCore omits it.
      hour: "numeric",
      timeZone,
      timeZoneName: format2
    }).format(date).split(/\s/g).slice(2).join(" ");
  }

  // node_modules/@date-fns/tz/date/mini.js
  init_define_import_meta_env();

  // node_modules/@date-fns/tz/tzOffset/index.js
  init_define_import_meta_env();
  var offsetFormatCache = {};
  var offsetCache = {};
  function tzOffset(timeZone, date) {
    try {
      const format2 = offsetFormatCache[timeZone] ||= new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "longOffset"
      }).format;
      const offsetStr = format2(date).split("GMT")[1];
      if (offsetStr in offsetCache) return offsetCache[offsetStr];
      return calcOffset(offsetStr, offsetStr.split(":"));
    } catch {
      if (timeZone in offsetCache) return offsetCache[timeZone];
      const captures = timeZone?.match(offsetRe);
      if (captures) return calcOffset(timeZone, captures.slice(1));
      return NaN;
    }
  }
  var offsetRe = /([+-]\d\d):?(\d\d)?/;
  function calcOffset(cacheStr, values) {
    const hours = +(values[0] || 0);
    const minutes = +(values[1] || 0);
    const seconds = +(values[2] || 0) / 60;
    return offsetCache[cacheStr] = hours * 60 + minutes > 0 ? hours * 60 + minutes + seconds : hours * 60 - minutes - seconds;
  }

  // node_modules/@date-fns/tz/date/mini.js
  var TZDateMini = class _TZDateMini extends Date {
    //#region static
    constructor(...args) {
      super();
      if (args.length > 1 && typeof args[args.length - 1] === "string") {
        this.timeZone = args.pop();
      }
      this.internal = /* @__PURE__ */ new Date();
      if (isNaN(tzOffset(this.timeZone, this))) {
        this.setTime(NaN);
      } else {
        if (!args.length) {
          this.setTime(Date.now());
        } else if (typeof args[0] === "number" && (args.length === 1 || args.length === 2 && typeof args[1] !== "number")) {
          this.setTime(args[0]);
        } else if (typeof args[0] === "string") {
          this.setTime(+new Date(args[0]));
        } else if (args[0] instanceof Date) {
          this.setTime(+args[0]);
        } else {
          this.setTime(+new Date(...args));
          adjustToSystemTZ(this, NaN);
          syncToInternal(this);
        }
      }
    }
    static tz(tz, ...args) {
      return args.length ? new _TZDateMini(...args, tz) : new _TZDateMini(Date.now(), tz);
    }
    //#endregion
    //#region time zone
    withTimeZone(timeZone) {
      return new _TZDateMini(+this, timeZone);
    }
    getTimezoneOffset() {
      const offset4 = -tzOffset(this.timeZone, this);
      return offset4 > 0 ? Math.floor(offset4) : Math.ceil(offset4);
    }
    //#endregion
    //#region time
    setTime(time) {
      Date.prototype.setTime.apply(this, arguments);
      syncToInternal(this);
      return +this;
    }
    //#endregion
    //#region date-fns integration
    [/* @__PURE__ */ Symbol.for("constructDateFrom")](date) {
      return new _TZDateMini(+new Date(date), this.timeZone);
    }
    //#endregion
  };
  var re = /^(get|set)(?!UTC)/;
  Object.getOwnPropertyNames(Date.prototype).forEach((method) => {
    if (!re.test(method)) return;
    const utcMethod = method.replace(re, "$1UTC");
    if (!TZDateMini.prototype[utcMethod]) return;
    if (method.startsWith("get")) {
      TZDateMini.prototype[method] = function() {
        return this.internal[utcMethod]();
      };
    } else {
      TZDateMini.prototype[method] = function() {
        Date.prototype[utcMethod].apply(this.internal, arguments);
        syncFromInternal(this);
        return +this;
      };
      TZDateMini.prototype[utcMethod] = function() {
        Date.prototype[utcMethod].apply(this, arguments);
        syncToInternal(this);
        return +this;
      };
    }
  });
  function syncToInternal(date) {
    date.internal.setTime(+date);
    date.internal.setUTCSeconds(date.internal.getUTCSeconds() - Math.round(-tzOffset(date.timeZone, date) * 60));
  }
  function syncFromInternal(date) {
    Date.prototype.setFullYear.call(date, date.internal.getUTCFullYear(), date.internal.getUTCMonth(), date.internal.getUTCDate());
    Date.prototype.setHours.call(date, date.internal.getUTCHours(), date.internal.getUTCMinutes(), date.internal.getUTCSeconds(), date.internal.getUTCMilliseconds());
    adjustToSystemTZ(date);
  }
  function adjustToSystemTZ(date) {
    const baseOffset = tzOffset(date.timeZone, date);
    const offset4 = baseOffset > 0 ? Math.floor(baseOffset) : Math.ceil(baseOffset);
    const prevHour = /* @__PURE__ */ new Date(+date);
    prevHour.setUTCHours(prevHour.getUTCHours() - 1);
    const systemOffset = -(/* @__PURE__ */ new Date(+date)).getTimezoneOffset();
    const prevHourSystemOffset = -(/* @__PURE__ */ new Date(+prevHour)).getTimezoneOffset();
    const systemDSTChange = systemOffset - prevHourSystemOffset;
    const dstShift = Date.prototype.getHours.apply(date) !== date.internal.getUTCHours();
    if (systemDSTChange && dstShift) date.internal.setUTCMinutes(date.internal.getUTCMinutes() + systemDSTChange);
    const offsetDiff = systemOffset - offset4;
    if (offsetDiff) Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + offsetDiff);
    const systemDate = /* @__PURE__ */ new Date(+date);
    systemDate.setUTCSeconds(0);
    const systemSecondsOffset = systemOffset > 0 ? systemDate.getSeconds() : (systemDate.getSeconds() - 60) % 60;
    const secondsOffset = Math.round(-(tzOffset(date.timeZone, date) * 60)) % 60;
    if (secondsOffset || systemSecondsOffset) {
      date.internal.setUTCSeconds(date.internal.getUTCSeconds() + secondsOffset);
      Date.prototype.setUTCSeconds.call(date, Date.prototype.getUTCSeconds.call(date) + secondsOffset + systemSecondsOffset);
    }
    const postBaseOffset = tzOffset(date.timeZone, date);
    const postOffset = postBaseOffset > 0 ? Math.floor(postBaseOffset) : Math.ceil(postBaseOffset);
    const postSystemOffset = -(/* @__PURE__ */ new Date(+date)).getTimezoneOffset();
    const postOffsetDiff = postSystemOffset - postOffset;
    const offsetChanged = postOffset !== offset4;
    const postDiff = postOffsetDiff - offsetDiff;
    if (offsetChanged && postDiff) {
      Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + postDiff);
      const newBaseOffset = tzOffset(date.timeZone, date);
      const newOffset = newBaseOffset > 0 ? Math.floor(newBaseOffset) : Math.ceil(newBaseOffset);
      const offsetChange = postOffset - newOffset;
      if (offsetChange) {
        date.internal.setUTCMinutes(date.internal.getUTCMinutes() + offsetChange);
        Date.prototype.setUTCMinutes.call(date, Date.prototype.getUTCMinutes.call(date) + offsetChange);
      }
    }
  }

  // node_modules/@date-fns/tz/date/index.js
  var TZDate = class _TZDate extends TZDateMini {
    //#region static
    static tz(tz, ...args) {
      return args.length ? new _TZDate(...args, tz) : new _TZDate(Date.now(), tz);
    }
    //#endregion
    //#region representation
    toISOString() {
      const [sign, hours, minutes] = this.tzComponents();
      const tz = `${sign}${hours}:${minutes}`;
      return this.internal.toISOString().slice(0, -1) + tz;
    }
    toString() {
      return `${this.toDateString()} ${this.toTimeString()}`;
    }
    toDateString() {
      const [day, date, month, year] = this.internal.toUTCString().split(" ");
      return `${day?.slice(0, -1)} ${month} ${date} ${year}`;
    }
    toTimeString() {
      const time = this.internal.toUTCString().split(" ")[4];
      const [sign, hours, minutes] = this.tzComponents();
      return `${time} GMT${sign}${hours}${minutes} (${tzName(this.timeZone, this)})`;
    }
    toLocaleString(locales, options2) {
      return Date.prototype.toLocaleString.call(this, locales, {
        ...options2,
        timeZone: options2?.timeZone || this.timeZone
      });
    }
    toLocaleDateString(locales, options2) {
      return Date.prototype.toLocaleDateString.call(this, locales, {
        ...options2,
        timeZone: options2?.timeZone || this.timeZone
      });
    }
    toLocaleTimeString(locales, options2) {
      return Date.prototype.toLocaleTimeString.call(this, locales, {
        ...options2,
        timeZone: options2?.timeZone || this.timeZone
      });
    }
    //#endregion
    //#region private
    tzComponents() {
      const offset4 = this.getTimezoneOffset();
      const sign = offset4 > 0 ? "-" : "+";
      const hours = String(Math.floor(Math.abs(offset4) / 60)).padStart(2, "0");
      const minutes = String(Math.abs(offset4) % 60).padStart(2, "0");
      return [sign, hours, minutes];
    }
    //#endregion
    withTimeZone(timeZone) {
      return new _TZDate(+this, timeZone);
    }
    //#region date-fns integration
    [/* @__PURE__ */ Symbol.for("constructDateFrom")](date) {
      return new _TZDate(+new Date(date), this.timeZone);
    }
    //#endregion
  };

  // node_modules/@date-fns/tz/tz/index.js
  init_define_import_meta_env();

  // node_modules/@date-fns/tz/tzScan/index.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/classes/CalendarDay.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/classes/DateLib.js
  init_define_import_meta_env();

  // node_modules/date-fns/addDays.js
  init_define_import_meta_env();

  // node_modules/date-fns/constructFrom.js
  init_define_import_meta_env();

  // node_modules/date-fns/constants.js
  init_define_import_meta_env();
  var daysInYear = 365.2425;
  var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
  var minTime = -maxTime;
  var millisecondsInWeek = 6048e5;
  var millisecondsInDay = 864e5;
  var secondsInHour = 3600;
  var secondsInDay = secondsInHour * 24;
  var secondsInWeek = secondsInDay * 7;
  var secondsInYear = secondsInDay * daysInYear;
  var secondsInMonth = secondsInYear / 12;
  var secondsInQuarter = secondsInMonth * 3;
  var constructFromSymbol = /* @__PURE__ */ Symbol.for("constructDateFrom");

  // node_modules/date-fns/constructFrom.js
  function constructFrom(date, value) {
    if (typeof date === "function") return date(value);
    if (date && typeof date === "object" && constructFromSymbol in date)
      return date[constructFromSymbol](value);
    if (date instanceof Date) return new date.constructor(value);
    return new Date(value);
  }

  // node_modules/date-fns/toDate.js
  init_define_import_meta_env();
  function toDate(argument, context) {
    return constructFrom(context || argument, argument);
  }

  // node_modules/date-fns/addDays.js
  function addDays(date, amount, options2) {
    const _date = toDate(date, options2?.in);
    if (isNaN(amount)) return constructFrom(options2?.in || date, NaN);
    if (!amount) return _date;
    _date.setDate(_date.getDate() + amount);
    return _date;
  }

  // node_modules/date-fns/addMonths.js
  init_define_import_meta_env();
  function addMonths(date, amount, options2) {
    const _date = toDate(date, options2?.in);
    if (isNaN(amount)) return constructFrom(options2?.in || date, NaN);
    if (!amount) {
      return _date;
    }
    const dayOfMonth = _date.getDate();
    const endOfDesiredMonth = constructFrom(options2?.in || date, _date.getTime());
    endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
    const daysInMonth = endOfDesiredMonth.getDate();
    if (dayOfMonth >= daysInMonth) {
      return endOfDesiredMonth;
    } else {
      _date.setFullYear(
        endOfDesiredMonth.getFullYear(),
        endOfDesiredMonth.getMonth(),
        dayOfMonth
      );
      return _date;
    }
  }

  // node_modules/date-fns/getISOWeekYear.js
  init_define_import_meta_env();

  // node_modules/date-fns/startOfISOWeek.js
  init_define_import_meta_env();

  // node_modules/date-fns/startOfWeek.js
  init_define_import_meta_env();

  // node_modules/date-fns/_lib/defaultOptions.js
  init_define_import_meta_env();
  var defaultOptions = {};
  function getDefaultOptions() {
    return defaultOptions;
  }

  // node_modules/date-fns/startOfWeek.js
  function startOfWeek(date, options2) {
    const defaultOptions2 = getDefaultOptions();
    const weekStartsOn = options2?.weekStartsOn ?? options2?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const _date = toDate(date, options2?.in);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    _date.setDate(_date.getDate() - diff);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/startOfISOWeek.js
  function startOfISOWeek(date, options2) {
    return startOfWeek(date, { ...options2, weekStartsOn: 1 });
  }

  // node_modules/date-fns/getISOWeekYear.js
  function getISOWeekYear(date, options2) {
    const _date = toDate(date, options2?.in);
    const year = _date.getFullYear();
    const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
    const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
    fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
    if (_date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/differenceInCalendarDays.js
  init_define_import_meta_env();

  // node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
  init_define_import_meta_env();
  function getTimezoneOffsetInMilliseconds(date) {
    const _date = toDate(date);
    const utcDate = new Date(
      Date.UTC(
        _date.getFullYear(),
        _date.getMonth(),
        _date.getDate(),
        _date.getHours(),
        _date.getMinutes(),
        _date.getSeconds(),
        _date.getMilliseconds()
      )
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
  }

  // node_modules/date-fns/_lib/normalizeDates.js
  init_define_import_meta_env();
  function normalizeDates(context, ...dates) {
    const normalize = constructFrom.bind(
      null,
      context || dates.find((date) => typeof date === "object")
    );
    return dates.map(normalize);
  }

  // node_modules/date-fns/startOfDay.js
  init_define_import_meta_env();
  function startOfDay(date, options2) {
    const _date = toDate(date, options2?.in);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/differenceInCalendarDays.js
  function differenceInCalendarDays(laterDate, earlierDate, options2) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options2?.in,
      laterDate,
      earlierDate
    );
    const laterStartOfDay = startOfDay(laterDate_);
    const earlierStartOfDay = startOfDay(earlierDate_);
    const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
    const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
    return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
  }

  // node_modules/date-fns/startOfISOWeekYear.js
  init_define_import_meta_env();
  function startOfISOWeekYear(date, options2) {
    const year = getISOWeekYear(date, options2);
    const fourthOfJanuary = constructFrom(options2?.in || date, 0);
    fourthOfJanuary.setFullYear(year, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    return startOfISOWeek(fourthOfJanuary);
  }

  // node_modules/date-fns/addWeeks.js
  init_define_import_meta_env();
  function addWeeks(date, amount, options2) {
    return addDays(date, amount * 7, options2);
  }

  // node_modules/date-fns/addYears.js
  init_define_import_meta_env();
  function addYears(date, amount, options2) {
    return addMonths(date, amount * 12, options2);
  }

  // node_modules/date-fns/max.js
  init_define_import_meta_env();
  function max2(dates, options2) {
    let result;
    let context = options2?.in;
    dates.forEach((date) => {
      if (!context && typeof date === "object")
        context = constructFrom.bind(null, date);
      const date_ = toDate(date, context);
      if (!result || result < date_ || isNaN(+date_)) result = date_;
    });
    return constructFrom(context, result || NaN);
  }

  // node_modules/date-fns/min.js
  init_define_import_meta_env();
  function min2(dates, options2) {
    let result;
    let context = options2?.in;
    dates.forEach((date) => {
      if (!context && typeof date === "object")
        context = constructFrom.bind(null, date);
      const date_ = toDate(date, context);
      if (!result || result > date_ || isNaN(+date_)) result = date_;
    });
    return constructFrom(context, result || NaN);
  }

  // node_modules/date-fns/isSameDay.js
  init_define_import_meta_env();
  function isSameDay(laterDate, earlierDate, options2) {
    const [dateLeft_, dateRight_] = normalizeDates(
      options2?.in,
      laterDate,
      earlierDate
    );
    return +startOfDay(dateLeft_) === +startOfDay(dateRight_);
  }

  // node_modules/date-fns/isValid.js
  init_define_import_meta_env();

  // node_modules/date-fns/isDate.js
  init_define_import_meta_env();
  function isDate(value) {
    return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
  }

  // node_modules/date-fns/isValid.js
  function isValid(date) {
    return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
  }

  // node_modules/date-fns/differenceInCalendarMonths.js
  init_define_import_meta_env();
  function differenceInCalendarMonths(laterDate, earlierDate, options2) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options2?.in,
      laterDate,
      earlierDate
    );
    const yearsDiff = laterDate_.getFullYear() - earlierDate_.getFullYear();
    const monthsDiff = laterDate_.getMonth() - earlierDate_.getMonth();
    return yearsDiff * 12 + monthsDiff;
  }

  // node_modules/date-fns/endOfMonth.js
  init_define_import_meta_env();
  function endOfMonth(date, options2) {
    const _date = toDate(date, options2?.in);
    const month = _date.getMonth();
    _date.setFullYear(_date.getFullYear(), month + 1, 0);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  // node_modules/date-fns/_lib/normalizeInterval.js
  init_define_import_meta_env();
  function normalizeInterval(context, interval) {
    const [start, end] = normalizeDates(context, interval.start, interval.end);
    return { start, end };
  }

  // node_modules/date-fns/eachMonthOfInterval.js
  init_define_import_meta_env();
  function eachMonthOfInterval(interval, options2) {
    const { start, end } = normalizeInterval(options2?.in, interval);
    let reversed = +start > +end;
    const endTime = reversed ? +start : +end;
    const date = reversed ? end : start;
    date.setHours(0, 0, 0, 0);
    date.setDate(1);
    let step = options2?.step ?? 1;
    if (!step) return [];
    if (step < 0) {
      step = -step;
      reversed = !reversed;
    }
    const dates = [];
    while (+date <= endTime) {
      dates.push(constructFrom(start, date));
      date.setMonth(date.getMonth() + step);
    }
    return reversed ? dates.reverse() : dates;
  }

  // node_modules/date-fns/startOfMonth.js
  init_define_import_meta_env();
  function startOfMonth(date, options2) {
    const _date = toDate(date, options2?.in);
    _date.setDate(1);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/endOfYear.js
  init_define_import_meta_env();
  function endOfYear(date, options2) {
    const _date = toDate(date, options2?.in);
    const year = _date.getFullYear();
    _date.setFullYear(year + 1, 0, 0);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  // node_modules/date-fns/startOfYear.js
  init_define_import_meta_env();
  function startOfYear(date, options2) {
    const date_ = toDate(date, options2?.in);
    date_.setFullYear(date_.getFullYear(), 0, 1);
    date_.setHours(0, 0, 0, 0);
    return date_;
  }

  // node_modules/date-fns/eachYearOfInterval.js
  init_define_import_meta_env();
  function eachYearOfInterval(interval, options2) {
    const { start, end } = normalizeInterval(options2?.in, interval);
    let reversed = +start > +end;
    const endTime = reversed ? +start : +end;
    const date = reversed ? end : start;
    date.setHours(0, 0, 0, 0);
    date.setMonth(0, 1);
    let step = options2?.step ?? 1;
    if (!step) return [];
    if (step < 0) {
      step = -step;
      reversed = !reversed;
    }
    const dates = [];
    while (+date <= endTime) {
      dates.push(constructFrom(start, date));
      date.setFullYear(date.getFullYear() + step);
    }
    return reversed ? dates.reverse() : dates;
  }

  // node_modules/date-fns/endOfISOWeek.js
  init_define_import_meta_env();

  // node_modules/date-fns/endOfWeek.js
  init_define_import_meta_env();
  function endOfWeek(date, options2) {
    const defaultOptions2 = getDefaultOptions();
    const weekStartsOn = options2?.weekStartsOn ?? options2?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const _date = toDate(date, options2?.in);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
    _date.setDate(_date.getDate() + diff);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  // node_modules/date-fns/endOfISOWeek.js
  function endOfISOWeek(date, options2) {
    return endOfWeek(date, { ...options2, weekStartsOn: 1 });
  }

  // node_modules/date-fns/format.js
  init_define_import_meta_env();

  // node_modules/date-fns/_lib/defaultLocale.js
  init_define_import_meta_env();

  // node_modules/date-fns/locale/en-US.js
  init_define_import_meta_env();

  // node_modules/date-fns/locale/en-US/_lib/formatDistance.js
  init_define_import_meta_env();
  var formatDistanceLocale = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds"
    },
    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds"
    },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes"
    },
    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes"
    },
    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours"
    },
    xHours: {
      one: "1 hour",
      other: "{{count}} hours"
    },
    xDays: {
      one: "1 day",
      other: "{{count}} days"
    },
    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks"
    },
    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks"
    },
    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months"
    },
    xMonths: {
      one: "1 month",
      other: "{{count}} months"
    },
    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years"
    },
    xYears: {
      one: "1 year",
      other: "{{count}} years"
    },
    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years"
    },
    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years"
    }
  };
  var formatDistance = (token, count3, options2) => {
    let result;
    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count3 === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count3.toString());
    }
    if (options2?.addSuffix) {
      if (options2.comparison && options2.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }
    return result;
  };

  // node_modules/date-fns/locale/en-US/_lib/formatLong.js
  init_define_import_meta_env();

  // node_modules/date-fns/locale/_lib/buildFormatLongFn.js
  init_define_import_meta_env();
  function buildFormatLongFn(args) {
    return (options2 = {}) => {
      const width = options2.width ? String(options2.width) : args.defaultWidth;
      const format2 = args.formats[width] || args.formats[args.defaultWidth];
      return format2;
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/formatLong.js
  var dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy"
  };
  var timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a"
  };
  var dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}"
  };
  var formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full"
    }),
    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full"
    }),
    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full"
    })
  };

  // node_modules/date-fns/locale/en-US/_lib/formatRelative.js
  init_define_import_meta_env();
  var formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P"
  };
  var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

  // node_modules/date-fns/locale/en-US/_lib/localize.js
  init_define_import_meta_env();

  // node_modules/date-fns/locale/_lib/buildLocalizeFn.js
  init_define_import_meta_env();
  function buildLocalizeFn(args) {
    return (value, options2) => {
      const context = options2?.context ? String(options2.context) : "standalone";
      let valuesArray;
      if (context === "formatting" && args.formattingValues) {
        const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        const width = options2?.width ? String(options2.width) : defaultWidth;
        valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        const defaultWidth = args.defaultWidth;
        const width = options2?.width ? String(options2.width) : args.defaultWidth;
        valuesArray = args.values[width] || args.values[defaultWidth];
      }
      const index2 = args.argumentCallback ? args.argumentCallback(value) : value;
      return valuesArray[index2];
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/localize.js
  var eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"]
  };
  var quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
  };
  var monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  };
  var dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  };
  var dayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    }
  };
  var formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    }
  };
  var ordinalNumber = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);
    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };
  var localize = {
    ordinalNumber,
    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide"
    }),
    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1
    }),
    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide"
    }),
    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide"
    }),
    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide"
    })
  };

  // node_modules/date-fns/locale/en-US/_lib/match.js
  init_define_import_meta_env();

  // node_modules/date-fns/locale/_lib/buildMatchFn.js
  init_define_import_meta_env();
  function buildMatchFn(args) {
    return (string, options2 = {}) => {
      const width = options2.width;
      const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
      const matchResult = string.match(matchPattern);
      if (!matchResult) {
        return null;
      }
      const matchedString = matchResult[0];
      const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
      const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
        // [TODO] -- I challenge you to fix the type
        findKey(parsePatterns, (pattern) => pattern.test(matchedString))
      );
      let value;
      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options2.valueCallback ? (
        // [TODO] -- I challenge you to fix the type
        options2.valueCallback(value)
      ) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }
  function findKey(object, predicate) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
        return key;
      }
    }
    return void 0;
  }
  function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return void 0;
  }

  // node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
  init_define_import_meta_env();
  function buildMatchPatternFn(args) {
    return (string, options2 = {}) => {
      const matchResult = string.match(args.matchPattern);
      if (!matchResult) return null;
      const matchedString = matchResult[0];
      const parseResult = string.match(args.parsePattern);
      if (!parseResult) return null;
      let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
      value = options2.valueCallback ? options2.valueCallback(value) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/match.js
  var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
  var parseOrdinalNumberPattern = /\d+/i;
  var matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i
  };
  var parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i]
  };
  var matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i
  };
  var parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i]
  };
  var matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
  };
  var parseMonthPatterns = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ],
    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ]
  };
  var matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
  };
  var parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
  };
  var matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
  };
  var parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i
    }
  };
  var match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: (value) => parseInt(value, 10)
    }),
    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any"
    }),
    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: (index2) => index2 + 1
    }),
    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any"
    }),
    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any"
    }),
    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any"
    })
  };

  // node_modules/date-fns/locale/en-US.js
  var enUS = {
    code: "en-US",
    formatDistance,
    formatLong,
    formatRelative,
    localize,
    match,
    options: {
      weekStartsOn: 0,
      firstWeekContainsDate: 1
    }
  };

  // node_modules/date-fns/_lib/format/formatters.js
  init_define_import_meta_env();

  // node_modules/date-fns/getDayOfYear.js
  init_define_import_meta_env();
  function getDayOfYear(date, options2) {
    const _date = toDate(date, options2?.in);
    const diff = differenceInCalendarDays(_date, startOfYear(_date));
    const dayOfYear = diff + 1;
    return dayOfYear;
  }

  // node_modules/date-fns/getISOWeek.js
  init_define_import_meta_env();
  function getISOWeek(date, options2) {
    const _date = toDate(date, options2?.in);
    const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/getWeek.js
  init_define_import_meta_env();

  // node_modules/date-fns/startOfWeekYear.js
  init_define_import_meta_env();

  // node_modules/date-fns/getWeekYear.js
  init_define_import_meta_env();
  function getWeekYear(date, options2) {
    const _date = toDate(date, options2?.in);
    const year = _date.getFullYear();
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options2?.firstWeekContainsDate ?? options2?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const firstWeekOfNextYear = constructFrom(options2?.in || date, 0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfWeek(firstWeekOfNextYear, options2);
    const firstWeekOfThisYear = constructFrom(options2?.in || date, 0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfWeek(firstWeekOfThisYear, options2);
    if (+_date >= +startOfNextYear) {
      return year + 1;
    } else if (+_date >= +startOfThisYear) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/startOfWeekYear.js
  function startOfWeekYear(date, options2) {
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options2?.firstWeekContainsDate ?? options2?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const year = getWeekYear(date, options2);
    const firstWeek = constructFrom(options2?.in || date, 0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    const _date = startOfWeek(firstWeek, options2);
    return _date;
  }

  // node_modules/date-fns/getWeek.js
  function getWeek(date, options2) {
    const _date = toDate(date, options2?.in);
    const diff = +startOfWeek(_date, options2) - +startOfWeekYear(_date, options2);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/_lib/addLeadingZeros.js
  init_define_import_meta_env();
  function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? "-" : "";
    const output = Math.abs(number).toString().padStart(targetLength, "0");
    return sign + output;
  }

  // node_modules/date-fns/_lib/format/lightFormatters.js
  init_define_import_meta_env();
  var lightFormatters = {
    // Year
    y(date, token) {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },
    // Month
    M(date, token) {
      const month = date.getMonth();
      return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },
    // Day of the month
    d(date, token) {
      return addLeadingZeros(date.getDate(), token.length);
    },
    // AM or PM
    a(date, token) {
      const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return dayPeriodEnumValue.toUpperCase();
        case "aaa":
          return dayPeriodEnumValue;
        case "aaaaa":
          return dayPeriodEnumValue[0];
        case "aaaa":
        default:
          return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
      }
    },
    // Hour [1-12]
    h(date, token) {
      return addLeadingZeros(date.getHours() % 12 || 12, token.length);
    },
    // Hour [0-23]
    H(date, token) {
      return addLeadingZeros(date.getHours(), token.length);
    },
    // Minute
    m(date, token) {
      return addLeadingZeros(date.getMinutes(), token.length);
    },
    // Second
    s(date, token) {
      return addLeadingZeros(date.getSeconds(), token.length);
    },
    // Fraction of second
    S(date, token) {
      const numberOfDigits = token.length;
      const milliseconds = date.getMilliseconds();
      const fractionalSeconds = Math.trunc(
        milliseconds * Math.pow(10, numberOfDigits - 3)
      );
      return addLeadingZeros(fractionalSeconds, token.length);
    }
  };

  // node_modules/date-fns/_lib/format/formatters.js
  var dayPeriodEnum = {
    am: "am",
    pm: "pm",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  };
  var formatters = {
    // Era
    G: function(date, token, localize2) {
      const era = date.getFullYear() > 0 ? 1 : 0;
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return localize2.era(era, { width: "abbreviated" });
        // A, B
        case "GGGGG":
          return localize2.era(era, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return localize2.era(era, { width: "wide" });
      }
    },
    // Year
    y: function(date, token, localize2) {
      if (token === "yo") {
        const signedYear = date.getFullYear();
        const year = signedYear > 0 ? signedYear : 1 - signedYear;
        return localize2.ordinalNumber(year, { unit: "year" });
      }
      return lightFormatters.y(date, token);
    },
    // Local week-numbering year
    Y: function(date, token, localize2, options2) {
      const signedWeekYear = getWeekYear(date, options2);
      const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
      if (token === "YY") {
        const twoDigitYear = weekYear % 100;
        return addLeadingZeros(twoDigitYear, 2);
      }
      if (token === "Yo") {
        return localize2.ordinalNumber(weekYear, { unit: "year" });
      }
      return addLeadingZeros(weekYear, token.length);
    },
    // ISO week-numbering year
    R: function(date, token) {
      const isoWeekYear = getISOWeekYear(date);
      return addLeadingZeros(isoWeekYear, token.length);
    },
    // Extended year. This is a single number designating the year of this calendar system.
    // The main difference between `y` and `u` localizers are B.C. years:
    // | Year | `y` | `u` |
    // |------|-----|-----|
    // | AC 1 |   1 |   1 |
    // | BC 1 |   1 |   0 |
    // | BC 2 |   2 |  -1 |
    // Also `yy` always returns the last two digits of a year,
    // while `uu` pads single digit years to 2 characters and returns other years unchanged.
    u: function(date, token) {
      const year = date.getFullYear();
      return addLeadingZeros(year, token.length);
    },
    // Quarter
    Q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
          return String(quarter);
        // 01, 02, 03, 04
        case "QQ":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "formatting"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "formatting"
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone quarter
    q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "q":
          return String(quarter);
        // 01, 02, 03, 04
        case "qq":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "standalone"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "standalone"
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // Month
    M: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        case "M":
        case "MM":
          return lightFormatters.M(date, token);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "MMM":
          return localize2.month(month, {
            width: "abbreviated",
            context: "formatting"
          });
        // J, F, ..., D
        case "MMMMM":
          return localize2.month(month, {
            width: "narrow",
            context: "formatting"
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return localize2.month(month, { width: "wide", context: "formatting" });
      }
    },
    // Stand-alone month
    L: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return String(month + 1);
        // 01, 02, ..., 12
        case "LL":
          return addLeadingZeros(month + 1, 2);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "LLL":
          return localize2.month(month, {
            width: "abbreviated",
            context: "standalone"
          });
        // J, F, ..., D
        case "LLLLL":
          return localize2.month(month, {
            width: "narrow",
            context: "standalone"
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return localize2.month(month, { width: "wide", context: "standalone" });
      }
    },
    // Local week of year
    w: function(date, token, localize2, options2) {
      const week = getWeek(date, options2);
      if (token === "wo") {
        return localize2.ordinalNumber(week, { unit: "week" });
      }
      return addLeadingZeros(week, token.length);
    },
    // ISO week of year
    I: function(date, token, localize2) {
      const isoWeek = getISOWeek(date);
      if (token === "Io") {
        return localize2.ordinalNumber(isoWeek, { unit: "week" });
      }
      return addLeadingZeros(isoWeek, token.length);
    },
    // Day of the month
    d: function(date, token, localize2) {
      if (token === "do") {
        return localize2.ordinalNumber(date.getDate(), { unit: "date" });
      }
      return lightFormatters.d(date, token);
    },
    // Day of year
    D: function(date, token, localize2) {
      const dayOfYear = getDayOfYear(date);
      if (token === "Do") {
        return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
      }
      return addLeadingZeros(dayOfYear, token.length);
    },
    // Day of week
    E: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "EEEEE":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "EEEEEE":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "EEEE":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Local day of week
    e: function(date, token, localize2, options2) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options2.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (Nth day of week with current locale or weekStartsOn)
        case "e":
          return String(localDayOfWeek);
        // Padded numerical value
        case "ee":
          return addLeadingZeros(localDayOfWeek, 2);
        // 1st, 2nd, ..., 7th
        case "eo":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "eee":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "eeeee":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "eeeeee":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "eeee":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone local day of week
    c: function(date, token, localize2, options2) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options2.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (same as in `e`)
        case "c":
          return String(localDayOfWeek);
        // Padded numerical value
        case "cc":
          return addLeadingZeros(localDayOfWeek, token.length);
        // 1st, 2nd, ..., 7th
        case "co":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "ccc":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "standalone"
          });
        // T
        case "ccccc":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "standalone"
          });
        // Tu
        case "cccccc":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "standalone"
          });
        // Tuesday
        case "cccc":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // ISO day of week
    i: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      switch (token) {
        // 2
        case "i":
          return String(isoDayOfWeek);
        // 02
        case "ii":
          return addLeadingZeros(isoDayOfWeek, token.length);
        // 2nd
        case "io":
          return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
        // Tue
        case "iii":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "iiiii":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "iiiiii":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "iiii":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM or PM
    a: function(date, token, localize2) {
      const hours = date.getHours();
      const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "aaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "aaaaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaa":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM, PM, midnight, noon
    b: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours === 12) {
        dayPeriodEnumValue = dayPeriodEnum.noon;
      } else if (hours === 0) {
        dayPeriodEnumValue = dayPeriodEnum.midnight;
      } else {
        dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      }
      switch (token) {
        case "b":
        case "bb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "bbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "bbbbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbb":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // in the morning, in the afternoon, in the evening, at night
    B: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours >= 17) {
        dayPeriodEnumValue = dayPeriodEnum.evening;
      } else if (hours >= 12) {
        dayPeriodEnumValue = dayPeriodEnum.afternoon;
      } else if (hours >= 4) {
        dayPeriodEnumValue = dayPeriodEnum.morning;
      } else {
        dayPeriodEnumValue = dayPeriodEnum.night;
      }
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "BBBBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBB":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Hour [1-12]
    h: function(date, token, localize2) {
      if (token === "ho") {
        let hours = date.getHours() % 12;
        if (hours === 0) hours = 12;
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return lightFormatters.h(date, token);
    },
    // Hour [0-23]
    H: function(date, token, localize2) {
      if (token === "Ho") {
        return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
      }
      return lightFormatters.H(date, token);
    },
    // Hour [0-11]
    K: function(date, token, localize2) {
      const hours = date.getHours() % 12;
      if (token === "Ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Hour [1-24]
    k: function(date, token, localize2) {
      let hours = date.getHours();
      if (hours === 0) hours = 24;
      if (token === "ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Minute
    m: function(date, token, localize2) {
      if (token === "mo") {
        return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
      }
      return lightFormatters.m(date, token);
    },
    // Second
    s: function(date, token, localize2) {
      if (token === "so") {
        return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
      }
      return lightFormatters.s(date, token);
    },
    // Fraction of second
    S: function(date, token) {
      return lightFormatters.S(date, token);
    },
    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      if (timezoneOffset === 0) {
        return "Z";
      }
      switch (token) {
        // Hours and optional minutes
        case "X":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XX`
        case "XXXX":
        case "XX":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XXX`
        case "XXXXX":
        case "XXX":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Hours and optional minutes
        case "x":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xx`
        case "xxxx":
        case "xx":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xxx`
        case "xxxxx":
        case "xxx":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (GMT)
    O: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "OOOO":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (specific non-location)
    z: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "zzzz":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Seconds timestamp
    t: function(date, token, _localize) {
      const timestamp = Math.trunc(+date / 1e3);
      return addLeadingZeros(timestamp, token.length);
    },
    // Milliseconds timestamp
    T: function(date, token, _localize) {
      return addLeadingZeros(+date, token.length);
    }
  };
  function formatTimezoneShort(offset4, delimiter = "") {
    const sign = offset4 > 0 ? "-" : "+";
    const absOffset = Math.abs(offset4);
    const hours = Math.trunc(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
      return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
  }
  function formatTimezoneWithOptionalMinutes(offset4, delimiter) {
    if (offset4 % 60 === 0) {
      const sign = offset4 > 0 ? "-" : "+";
      return sign + addLeadingZeros(Math.abs(offset4) / 60, 2);
    }
    return formatTimezone(offset4, delimiter);
  }
  function formatTimezone(offset4, delimiter = "") {
    const sign = offset4 > 0 ? "-" : "+";
    const absOffset = Math.abs(offset4);
    const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
    const minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
  }

  // node_modules/date-fns/_lib/format/longFormatters.js
  init_define_import_meta_env();
  var dateLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "P":
        return formatLong2.date({ width: "short" });
      case "PP":
        return formatLong2.date({ width: "medium" });
      case "PPP":
        return formatLong2.date({ width: "long" });
      case "PPPP":
      default:
        return formatLong2.date({ width: "full" });
    }
  };
  var timeLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "p":
        return formatLong2.time({ width: "short" });
      case "pp":
        return formatLong2.time({ width: "medium" });
      case "ppp":
        return formatLong2.time({ width: "long" });
      case "pppp":
      default:
        return formatLong2.time({ width: "full" });
    }
  };
  var dateTimeLongFormatter = (pattern, formatLong2) => {
    const matchResult = pattern.match(/(P+)(p+)?/) || [];
    const datePattern = matchResult[1];
    const timePattern = matchResult[2];
    if (!timePattern) {
      return dateLongFormatter(pattern, formatLong2);
    }
    let dateTimeFormat;
    switch (datePattern) {
      case "P":
        dateTimeFormat = formatLong2.dateTime({ width: "short" });
        break;
      case "PP":
        dateTimeFormat = formatLong2.dateTime({ width: "medium" });
        break;
      case "PPP":
        dateTimeFormat = formatLong2.dateTime({ width: "long" });
        break;
      case "PPPP":
      default:
        dateTimeFormat = formatLong2.dateTime({ width: "full" });
        break;
    }
    return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
  };
  var longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter
  };

  // node_modules/date-fns/_lib/protectedTokens.js
  init_define_import_meta_env();
  var dayOfYearTokenRE = /^D+$/;
  var weekYearTokenRE = /^Y+$/;
  var throwTokens = ["D", "DD", "YY", "YYYY"];
  function isProtectedDayOfYearToken(token) {
    return dayOfYearTokenRE.test(token);
  }
  function isProtectedWeekYearToken(token) {
    return weekYearTokenRE.test(token);
  }
  function warnOrThrowProtectedError(token, format2, input) {
    const _message = message(token, format2, input);
    console.warn(_message);
    if (throwTokens.includes(token)) throw new RangeError(_message);
  }
  function message(token, format2, input) {
    const subject = token[0] === "Y" ? "years" : "days of the month";
    return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format2}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
  }

  // node_modules/date-fns/format.js
  var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
  var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
  var escapedStringRegExp = /^'([^]*?)'?$/;
  var doubleQuoteRegExp = /''/g;
  var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
  function format(date, formatStr, options2) {
    const defaultOptions2 = getDefaultOptions();
    const locale = options2?.locale ?? defaultOptions2.locale ?? enUS;
    const firstWeekContainsDate = options2?.firstWeekContainsDate ?? options2?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const weekStartsOn = options2?.weekStartsOn ?? options2?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const originalDate = toDate(date, options2?.in);
    if (!isValid(originalDate)) {
      throw new RangeError("Invalid time value");
    }
    let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter === "p" || firstCharacter === "P") {
        const longFormatter = longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    }).join("").match(formattingTokensRegExp).map((substring) => {
      if (substring === "''") {
        return { isToken: false, value: "'" };
      }
      const firstCharacter = substring[0];
      if (firstCharacter === "'") {
        return { isToken: false, value: cleanEscapedString(substring) };
      }
      if (formatters[firstCharacter]) {
        return { isToken: true, value: substring };
      }
      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
        );
      }
      return { isToken: false, value: substring };
    });
    if (locale.localize.preprocessor) {
      parts = locale.localize.preprocessor(originalDate, parts);
    }
    const formatterOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale
    };
    return parts.map((part) => {
      if (!part.isToken) return part.value;
      const token = part.value;
      if (!options2?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options2?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
        warnOrThrowProtectedError(token, formatStr, String(date));
      }
      const formatter = formatters[token[0]];
      return formatter(originalDate, token, locale.localize, formatterOptions);
    }).join("");
  }
  function cleanEscapedString(input) {
    const matched = input.match(escapedStringRegExp);
    if (!matched) {
      return input;
    }
    return matched[1].replace(doubleQuoteRegExp, "'");
  }

  // node_modules/date-fns/getDaysInMonth.js
  init_define_import_meta_env();
  function getDaysInMonth(date, options2) {
    const _date = toDate(date, options2?.in);
    const year = _date.getFullYear();
    const monthIndex = _date.getMonth();
    const lastDayOfMonth = constructFrom(_date, 0);
    lastDayOfMonth.setFullYear(year, monthIndex + 1, 0);
    lastDayOfMonth.setHours(0, 0, 0, 0);
    return lastDayOfMonth.getDate();
  }

  // node_modules/date-fns/getMonth.js
  init_define_import_meta_env();
  function getMonth(date, options2) {
    return toDate(date, options2?.in).getMonth();
  }

  // node_modules/date-fns/getYear.js
  init_define_import_meta_env();
  function getYear(date, options2) {
    return toDate(date, options2?.in).getFullYear();
  }

  // node_modules/date-fns/isAfter.js
  init_define_import_meta_env();
  function isAfter(date, dateToCompare) {
    return +toDate(date) > +toDate(dateToCompare);
  }

  // node_modules/date-fns/isBefore.js
  init_define_import_meta_env();
  function isBefore(date, dateToCompare) {
    return +toDate(date) < +toDate(dateToCompare);
  }

  // node_modules/date-fns/isSameMonth.js
  init_define_import_meta_env();
  function isSameMonth(laterDate, earlierDate, options2) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options2?.in,
      laterDate,
      earlierDate
    );
    return laterDate_.getFullYear() === earlierDate_.getFullYear() && laterDate_.getMonth() === earlierDate_.getMonth();
  }

  // node_modules/date-fns/isSameYear.js
  init_define_import_meta_env();
  function isSameYear(laterDate, earlierDate, options2) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options2?.in,
      laterDate,
      earlierDate
    );
    return laterDate_.getFullYear() === earlierDate_.getFullYear();
  }

  // node_modules/date-fns/setMonth.js
  init_define_import_meta_env();
  function setMonth(date, month, options2) {
    const _date = toDate(date, options2?.in);
    const year = _date.getFullYear();
    const day = _date.getDate();
    const midMonth = constructFrom(options2?.in || date, 0);
    midMonth.setFullYear(year, month, 15);
    midMonth.setHours(0, 0, 0, 0);
    const daysInMonth = getDaysInMonth(midMonth);
    _date.setMonth(month, Math.min(day, daysInMonth));
    return _date;
  }

  // node_modules/date-fns/setYear.js
  init_define_import_meta_env();
  function setYear(date, year, options2) {
    const date_ = toDate(date, options2?.in);
    if (isNaN(+date_)) return constructFrom(options2?.in || date, NaN);
    date_.setFullYear(year);
    return date_;
  }

  // node_modules/react-day-picker/dist/esm/helpers/endOfBroadcastWeek.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/helpers/getBroadcastWeeksInMonth.js
  init_define_import_meta_env();
  var FIVE_WEEKS = 5;
  var FOUR_WEEKS = 4;
  function getBroadcastWeeksInMonth(month, dateLib) {
    const firstDayOfMonth = dateLib.startOfMonth(month);
    const firstDayOfWeek = firstDayOfMonth.getDay() > 0 ? firstDayOfMonth.getDay() : 7;
    const broadcastStartDate = dateLib.addDays(month, -firstDayOfWeek + 1);
    const lastDateOfLastWeek = dateLib.addDays(broadcastStartDate, FIVE_WEEKS * 7 - 1);
    const numberOfWeeks = dateLib.getMonth(month) === dateLib.getMonth(lastDateOfLastWeek) ? FIVE_WEEKS : FOUR_WEEKS;
    return numberOfWeeks;
  }

  // node_modules/react-day-picker/dist/esm/helpers/startOfBroadcastWeek.js
  init_define_import_meta_env();
  function startOfBroadcastWeek(date, dateLib) {
    const firstOfMonth = dateLib.startOfMonth(date);
    const dayOfWeek = firstOfMonth.getDay();
    if (dayOfWeek === 1) {
      return firstOfMonth;
    } else if (dayOfWeek === 0) {
      return dateLib.addDays(firstOfMonth, -1 * 6);
    } else {
      return dateLib.addDays(firstOfMonth, -1 * (dayOfWeek - 1));
    }
  }

  // node_modules/react-day-picker/dist/esm/helpers/endOfBroadcastWeek.js
  function endOfBroadcastWeek(date, dateLib) {
    const startDate = startOfBroadcastWeek(date, dateLib);
    const numberOfWeeks = getBroadcastWeeksInMonth(date, dateLib);
    const endDate = dateLib.addDays(startDate, numberOfWeeks * 7 - 1);
    return endDate;
  }

  // node_modules/react-day-picker/dist/esm/locale/en-US.js
  init_define_import_meta_env();
  var enUS2 = {
    ...enUS,
    labels: {
      labelDayButton: (date, modifiers, options2, dateLib) => {
        let formatDate;
        if (dateLib && typeof dateLib.format === "function") {
          formatDate = dateLib.format.bind(dateLib);
        } else {
          formatDate = (d, pattern) => format(d, pattern, { locale: enUS, ...options2 });
        }
        let label = formatDate(date, "PPPP");
        if (modifiers.today)
          label = `Today, ${label}`;
        if (modifiers.selected)
          label = `${label}, selected`;
        return label;
      },
      labelMonthDropdown: "Choose the Month",
      labelNext: "Go to the Next Month",
      labelPrevious: "Go to the Previous Month",
      labelWeekNumber: (weekNumber) => `Week ${weekNumber}`,
      labelYearDropdown: "Choose the Year",
      labelGrid: (date, options2, dateLib) => {
        let formatDate;
        if (dateLib && typeof dateLib.format === "function") {
          formatDate = dateLib.format.bind(dateLib);
        } else {
          formatDate = (d, pattern) => format(d, pattern, { locale: enUS, ...options2 });
        }
        return formatDate(date, "LLLL yyyy");
      },
      labelGridcell: (date, modifiers, options2, dateLib) => {
        let formatDate;
        if (dateLib && typeof dateLib.format === "function") {
          formatDate = dateLib.format.bind(dateLib);
        } else {
          formatDate = (d, pattern) => format(d, pattern, { locale: enUS, ...options2 });
        }
        let label = formatDate(date, "PPPP");
        if (modifiers?.today) {
          label = `Today, ${label}`;
        }
        return label;
      },
      labelNav: "Navigation bar",
      labelWeekNumberHeader: "Week Number",
      labelWeekday: (date, options2, dateLib) => {
        let formatDate;
        if (dateLib && typeof dateLib.format === "function") {
          formatDate = dateLib.format.bind(dateLib);
        } else {
          formatDate = (d, pattern) => format(d, pattern, { locale: enUS, ...options2 });
        }
        return formatDate(date, "cccc");
      }
    }
  };

  // node_modules/react-day-picker/dist/esm/classes/DateLib.js
  var DateLib = class _DateLib {
    /**
     * Creates an instance of `DateLib`.
     *
     * @param options Configuration options for the date library.
     * @param overrides Custom overrides for the date library functions.
     */
    constructor(options2, overrides) {
      this.Date = Date;
      this.today = () => {
        if (this.overrides?.today) {
          return this.overrides.today();
        }
        if (this.options.timeZone) {
          return TZDate.tz(this.options.timeZone);
        }
        return new this.Date();
      };
      this.newDate = (year, monthIndex, date) => {
        if (this.overrides?.newDate) {
          return this.overrides.newDate(year, monthIndex, date);
        }
        if (this.options.timeZone) {
          return new TZDate(year, monthIndex, date, this.options.timeZone);
        }
        return new Date(year, monthIndex, date);
      };
      this.addDays = (date, amount) => {
        return this.overrides?.addDays ? this.overrides.addDays(date, amount) : addDays(date, amount);
      };
      this.addMonths = (date, amount) => {
        return this.overrides?.addMonths ? this.overrides.addMonths(date, amount) : addMonths(date, amount);
      };
      this.addWeeks = (date, amount) => {
        return this.overrides?.addWeeks ? this.overrides.addWeeks(date, amount) : addWeeks(date, amount);
      };
      this.addYears = (date, amount) => {
        return this.overrides?.addYears ? this.overrides.addYears(date, amount) : addYears(date, amount);
      };
      this.differenceInCalendarDays = (dateLeft, dateRight) => {
        return this.overrides?.differenceInCalendarDays ? this.overrides.differenceInCalendarDays(dateLeft, dateRight) : differenceInCalendarDays(dateLeft, dateRight);
      };
      this.differenceInCalendarMonths = (dateLeft, dateRight) => {
        return this.overrides?.differenceInCalendarMonths ? this.overrides.differenceInCalendarMonths(dateLeft, dateRight) : differenceInCalendarMonths(dateLeft, dateRight);
      };
      this.eachMonthOfInterval = (interval) => {
        return this.overrides?.eachMonthOfInterval ? this.overrides.eachMonthOfInterval(interval) : eachMonthOfInterval(interval);
      };
      this.eachYearOfInterval = (interval) => {
        const years = this.overrides?.eachYearOfInterval ? this.overrides.eachYearOfInterval(interval) : eachYearOfInterval(interval);
        const uniqueYears = new Set(years.map((d) => this.getYear(d)));
        if (uniqueYears.size === years.length) {
          return years;
        }
        const yearsArray = [];
        uniqueYears.forEach((y) => {
          yearsArray.push(new Date(y, 0, 1));
        });
        return yearsArray;
      };
      this.endOfBroadcastWeek = (date) => {
        return this.overrides?.endOfBroadcastWeek ? this.overrides.endOfBroadcastWeek(date) : endOfBroadcastWeek(date, this);
      };
      this.endOfISOWeek = (date) => {
        return this.overrides?.endOfISOWeek ? this.overrides.endOfISOWeek(date) : endOfISOWeek(date);
      };
      this.endOfMonth = (date) => {
        return this.overrides?.endOfMonth ? this.overrides.endOfMonth(date) : endOfMonth(date);
      };
      this.endOfWeek = (date, options3) => {
        return this.overrides?.endOfWeek ? this.overrides.endOfWeek(date, options3) : endOfWeek(date, this.options);
      };
      this.endOfYear = (date) => {
        return this.overrides?.endOfYear ? this.overrides.endOfYear(date) : endOfYear(date);
      };
      this.format = (date, formatStr, _options) => {
        const formatted = this.overrides?.format ? this.overrides.format(date, formatStr, this.options) : format(date, formatStr, this.options);
        if (this.options.numerals && this.options.numerals !== "latn") {
          return this.replaceDigits(formatted);
        }
        return formatted;
      };
      this.getISOWeek = (date) => {
        return this.overrides?.getISOWeek ? this.overrides.getISOWeek(date) : getISOWeek(date);
      };
      this.getMonth = (date, _options) => {
        return this.overrides?.getMonth ? this.overrides.getMonth(date, this.options) : getMonth(date, this.options);
      };
      this.getYear = (date, _options) => {
        return this.overrides?.getYear ? this.overrides.getYear(date, this.options) : getYear(date, this.options);
      };
      this.getWeek = (date, _options) => {
        return this.overrides?.getWeek ? this.overrides.getWeek(date, this.options) : getWeek(date, this.options);
      };
      this.isAfter = (date, dateToCompare) => {
        return this.overrides?.isAfter ? this.overrides.isAfter(date, dateToCompare) : isAfter(date, dateToCompare);
      };
      this.isBefore = (date, dateToCompare) => {
        return this.overrides?.isBefore ? this.overrides.isBefore(date, dateToCompare) : isBefore(date, dateToCompare);
      };
      this.isDate = (value) => {
        return this.overrides?.isDate ? this.overrides.isDate(value) : isDate(value);
      };
      this.isSameDay = (dateLeft, dateRight) => {
        return this.overrides?.isSameDay ? this.overrides.isSameDay(dateLeft, dateRight) : isSameDay(dateLeft, dateRight);
      };
      this.isSameMonth = (dateLeft, dateRight) => {
        return this.overrides?.isSameMonth ? this.overrides.isSameMonth(dateLeft, dateRight) : isSameMonth(dateLeft, dateRight);
      };
      this.isSameYear = (dateLeft, dateRight) => {
        return this.overrides?.isSameYear ? this.overrides.isSameYear(dateLeft, dateRight) : isSameYear(dateLeft, dateRight);
      };
      this.max = (dates) => {
        return this.overrides?.max ? this.overrides.max(dates) : max2(dates);
      };
      this.min = (dates) => {
        return this.overrides?.min ? this.overrides.min(dates) : min2(dates);
      };
      this.setMonth = (date, month) => {
        return this.overrides?.setMonth ? this.overrides.setMonth(date, month) : setMonth(date, month);
      };
      this.setYear = (date, year) => {
        return this.overrides?.setYear ? this.overrides.setYear(date, year) : setYear(date, year);
      };
      this.startOfBroadcastWeek = (date, _dateLib) => {
        return this.overrides?.startOfBroadcastWeek ? this.overrides.startOfBroadcastWeek(date, this) : startOfBroadcastWeek(date, this);
      };
      this.startOfDay = (date) => {
        return this.overrides?.startOfDay ? this.overrides.startOfDay(date) : startOfDay(date);
      };
      this.startOfISOWeek = (date) => {
        return this.overrides?.startOfISOWeek ? this.overrides.startOfISOWeek(date) : startOfISOWeek(date);
      };
      this.startOfMonth = (date) => {
        return this.overrides?.startOfMonth ? this.overrides.startOfMonth(date) : startOfMonth(date);
      };
      this.startOfWeek = (date, _options) => {
        return this.overrides?.startOfWeek ? this.overrides.startOfWeek(date, this.options) : startOfWeek(date, this.options);
      };
      this.startOfYear = (date) => {
        return this.overrides?.startOfYear ? this.overrides.startOfYear(date) : startOfYear(date);
      };
      this.options = { locale: enUS2, ...options2 };
      this.overrides = overrides;
    }
    /**
     * Generates a mapping of Arabic digits (0-9) to the target numbering system
     * digits.
     *
     * @since 9.5.0
     * @returns A record mapping Arabic digits to the target numerals.
     */
    getDigitMap() {
      const { numerals = "latn" } = this.options;
      const formatter = new Intl.NumberFormat("en-US", {
        numberingSystem: numerals
      });
      const digitMap = {};
      for (let i = 0; i < 10; i++) {
        digitMap[i.toString()] = formatter.format(i);
      }
      return digitMap;
    }
    /**
     * Replaces Arabic digits in a string with the target numbering system digits.
     *
     * @since 9.5.0
     * @param input The string containing Arabic digits.
     * @returns The string with digits replaced.
     */
    replaceDigits(input) {
      const digitMap = this.getDigitMap();
      return input.replace(/\d/g, (digit) => digitMap[digit] || digit);
    }
    /**
     * Formats a number using the configured numbering system.
     *
     * @since 9.5.0
     * @param value The number to format.
     * @returns The formatted number as a string.
     */
    formatNumber(value) {
      return this.replaceDigits(value.toString());
    }
    /**
     * Returns the preferred ordering for month and year labels for the current
     * locale.
     */
    getMonthYearOrder() {
      const code = this.options.locale?.code;
      if (!code) {
        return "month-first";
      }
      return _DateLib.yearFirstLocales.has(code) ? "year-first" : "month-first";
    }
    /**
     * Formats the month/year pair respecting locale conventions.
     *
     * @since 9.11.0
     */
    formatMonthYear(date) {
      const { locale, timeZone, numerals } = this.options;
      const localeCode = locale?.code;
      if (localeCode && _DateLib.yearFirstLocales.has(localeCode)) {
        try {
          const intl = new Intl.DateTimeFormat(localeCode, {
            month: "long",
            year: "numeric",
            timeZone,
            numberingSystem: numerals
          });
          const formatted = intl.format(date);
          return formatted;
        } catch {
        }
      }
      const pattern = this.getMonthYearOrder() === "year-first" ? "y LLLL" : "LLLL y";
      return this.format(date, pattern);
    }
  };
  DateLib.yearFirstLocales = /* @__PURE__ */ new Set([
    "eu",
    "hu",
    "ja",
    "ja-Hira",
    "ja-JP",
    "ko",
    "ko-KR",
    "lt",
    "lt-LT",
    "lv",
    "lv-LV",
    "mn",
    "mn-MN",
    "zh",
    "zh-CN",
    "zh-HK",
    "zh-TW"
  ]);
  var defaultDateLib = new DateLib();

  // node_modules/react-day-picker/dist/esm/classes/CalendarDay.js
  var CalendarDay = class {
    constructor(date, displayMonth, dateLib = defaultDateLib) {
      this.date = date;
      this.displayMonth = displayMonth;
      this.outside = Boolean(displayMonth && !dateLib.isSameMonth(date, displayMonth));
      this.dateLib = dateLib;
      this.isoDate = dateLib.format(date, "yyyy-MM-dd");
      this.displayMonthId = dateLib.format(displayMonth, "yyyy-MM");
      this.dateMonthId = dateLib.format(date, "yyyy-MM");
    }
    /**
     * Checks if this day is equal to another `CalendarDay`, considering both the
     * date and the displayed month.
     *
     * @param day The `CalendarDay` to compare with.
     * @returns `true` if the days are equal, otherwise `false`.
     */
    isEqualTo(day) {
      return this.dateLib.isSameDay(day.date, this.date) && this.dateLib.isSameMonth(day.displayMonth, this.displayMonth);
    }
  };

  // node_modules/react-day-picker/dist/esm/classes/CalendarMonth.js
  init_define_import_meta_env();
  var CalendarMonth = class {
    constructor(month, weeks) {
      this.date = month;
      this.weeks = weeks;
    }
  };

  // node_modules/react-day-picker/dist/esm/classes/CalendarWeek.js
  init_define_import_meta_env();
  var CalendarWeek = class {
    constructor(weekNumber, days) {
      this.days = days;
      this.weekNumber = weekNumber;
    }
  };

  // node_modules/react-day-picker/dist/esm/components/custom-components.js
  var custom_components_exports = {};
  __export(custom_components_exports, {
    Button: () => Button,
    CaptionLabel: () => CaptionLabel,
    Chevron: () => Chevron,
    Day: () => Day,
    DayButton: () => DayButton,
    Dropdown: () => Dropdown,
    DropdownNav: () => DropdownNav,
    Footer: () => Footer,
    Month: () => Month,
    MonthCaption: () => MonthCaption,
    MonthGrid: () => MonthGrid,
    Months: () => Months,
    MonthsDropdown: () => MonthsDropdown,
    Nav: () => Nav,
    NextMonthButton: () => NextMonthButton,
    Option: () => Option,
    PreviousMonthButton: () => PreviousMonthButton,
    Root: () => Root3,
    Select: () => Select,
    Week: () => Week,
    WeekNumber: () => WeekNumber,
    WeekNumberHeader: () => WeekNumberHeader,
    Weekday: () => Weekday,
    Weekdays: () => Weekdays,
    Weeks: () => Weeks,
    YearsDropdown: () => YearsDropdown
  });
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/components/Button.js
  init_define_import_meta_env();
  var import_react6 = __toESM(require_react_shim());
  function Button(props) {
    return import_react6.default.createElement("button", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/CaptionLabel.js
  init_define_import_meta_env();
  var import_react7 = __toESM(require_react_shim());
  function CaptionLabel(props) {
    return import_react7.default.createElement("span", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Chevron.js
  init_define_import_meta_env();
  var import_react8 = __toESM(require_react_shim());
  function Chevron(props) {
    const { size: size4 = 24, orientation = "left", className } = props;
    return (
      // biome-ignore lint/a11y/noSvgWithoutTitle: handled by the parent component
      import_react8.default.createElement(
        "svg",
        { className, width: size4, height: size4, viewBox: "0 0 24 24" },
        orientation === "up" && import_react8.default.createElement("polygon", { points: "6.77 17 12.5 11.43 18.24 17 20 15.28 12.5 8 5 15.28" }),
        orientation === "down" && import_react8.default.createElement("polygon", { points: "6.77 8 12.5 13.57 18.24 8 20 9.72 12.5 17 5 9.72" }),
        orientation === "left" && import_react8.default.createElement("polygon", { points: "16 18.112 9.81111111 12 16 5.87733333 14.0888889 4 6 12 14.0888889 20" }),
        orientation === "right" && import_react8.default.createElement("polygon", { points: "8 18.112 14.18888889 12 8 5.87733333 9.91111111 4 18 12 9.91111111 20" })
      )
    );
  }

  // node_modules/react-day-picker/dist/esm/components/Day.js
  init_define_import_meta_env();
  var import_react9 = __toESM(require_react_shim());
  function Day(props) {
    const { day, modifiers, ...tdProps } = props;
    return import_react9.default.createElement("td", { ...tdProps });
  }

  // node_modules/react-day-picker/dist/esm/components/DayButton.js
  init_define_import_meta_env();
  var import_react10 = __toESM(require_react_shim());
  function DayButton(props) {
    const { day, modifiers, ...buttonProps } = props;
    const ref = import_react10.default.useRef(null);
    import_react10.default.useEffect(() => {
      if (modifiers.focused)
        ref.current?.focus();
    }, [modifiers.focused]);
    return import_react10.default.createElement("button", { ref, ...buttonProps });
  }

  // node_modules/react-day-picker/dist/esm/components/Dropdown.js
  init_define_import_meta_env();
  var import_react11 = __toESM(require_react_shim());

  // node_modules/react-day-picker/dist/esm/UI.js
  init_define_import_meta_env();
  var UI;
  (function(UI2) {
    UI2["Root"] = "root";
    UI2["Chevron"] = "chevron";
    UI2["Day"] = "day";
    UI2["DayButton"] = "day_button";
    UI2["CaptionLabel"] = "caption_label";
    UI2["Dropdowns"] = "dropdowns";
    UI2["Dropdown"] = "dropdown";
    UI2["DropdownRoot"] = "dropdown_root";
    UI2["Footer"] = "footer";
    UI2["MonthGrid"] = "month_grid";
    UI2["MonthCaption"] = "month_caption";
    UI2["MonthsDropdown"] = "months_dropdown";
    UI2["Month"] = "month";
    UI2["Months"] = "months";
    UI2["Nav"] = "nav";
    UI2["NextMonthButton"] = "button_next";
    UI2["PreviousMonthButton"] = "button_previous";
    UI2["Week"] = "week";
    UI2["Weeks"] = "weeks";
    UI2["Weekday"] = "weekday";
    UI2["Weekdays"] = "weekdays";
    UI2["WeekNumber"] = "week_number";
    UI2["WeekNumberHeader"] = "week_number_header";
    UI2["YearsDropdown"] = "years_dropdown";
  })(UI || (UI = {}));
  var DayFlag;
  (function(DayFlag2) {
    DayFlag2["disabled"] = "disabled";
    DayFlag2["hidden"] = "hidden";
    DayFlag2["outside"] = "outside";
    DayFlag2["focused"] = "focused";
    DayFlag2["today"] = "today";
  })(DayFlag || (DayFlag = {}));
  var SelectionState;
  (function(SelectionState2) {
    SelectionState2["range_end"] = "range_end";
    SelectionState2["range_middle"] = "range_middle";
    SelectionState2["range_start"] = "range_start";
    SelectionState2["selected"] = "selected";
  })(SelectionState || (SelectionState = {}));
  var Animation;
  (function(Animation2) {
    Animation2["weeks_before_enter"] = "weeks_before_enter";
    Animation2["weeks_before_exit"] = "weeks_before_exit";
    Animation2["weeks_after_enter"] = "weeks_after_enter";
    Animation2["weeks_after_exit"] = "weeks_after_exit";
    Animation2["caption_after_enter"] = "caption_after_enter";
    Animation2["caption_after_exit"] = "caption_after_exit";
    Animation2["caption_before_enter"] = "caption_before_enter";
    Animation2["caption_before_exit"] = "caption_before_exit";
  })(Animation || (Animation = {}));

  // node_modules/react-day-picker/dist/esm/components/Dropdown.js
  function Dropdown(props) {
    const { options: options2, className, components, classNames, ...selectProps } = props;
    const cssClassSelect = [classNames[UI.Dropdown], className].join(" ");
    const selectedOption = options2?.find(({ value }) => value === selectProps.value);
    return import_react11.default.createElement(
      "span",
      { "data-disabled": selectProps.disabled, className: classNames[UI.DropdownRoot] },
      import_react11.default.createElement(components.Select, { className: cssClassSelect, ...selectProps }, options2?.map(({ value, label, disabled }) => import_react11.default.createElement(components.Option, { key: value, value, disabled }, label))),
      import_react11.default.createElement(
        "span",
        { className: classNames[UI.CaptionLabel], "aria-hidden": true },
        selectedOption?.label,
        import_react11.default.createElement(components.Chevron, { orientation: "down", size: 18, className: classNames[UI.Chevron] })
      )
    );
  }

  // node_modules/react-day-picker/dist/esm/components/DropdownNav.js
  init_define_import_meta_env();
  var import_react12 = __toESM(require_react_shim());
  function DropdownNav(props) {
    return import_react12.default.createElement("div", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Footer.js
  init_define_import_meta_env();
  var import_react13 = __toESM(require_react_shim());
  function Footer(props) {
    return import_react13.default.createElement("div", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Month.js
  init_define_import_meta_env();
  var import_react14 = __toESM(require_react_shim());
  function Month(props) {
    const { calendarMonth, displayIndex, ...divProps } = props;
    return import_react14.default.createElement("div", { ...divProps }, props.children);
  }

  // node_modules/react-day-picker/dist/esm/components/MonthCaption.js
  init_define_import_meta_env();
  var import_react15 = __toESM(require_react_shim());
  function MonthCaption(props) {
    const { calendarMonth, displayIndex, ...divProps } = props;
    return import_react15.default.createElement("div", { ...divProps });
  }

  // node_modules/react-day-picker/dist/esm/components/MonthGrid.js
  init_define_import_meta_env();
  var import_react16 = __toESM(require_react_shim());
  function MonthGrid(props) {
    return import_react16.default.createElement("table", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Months.js
  init_define_import_meta_env();
  var import_react17 = __toESM(require_react_shim());
  function Months(props) {
    return import_react17.default.createElement("div", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/MonthsDropdown.js
  init_define_import_meta_env();
  var import_react19 = __toESM(require_react_shim());

  // node_modules/react-day-picker/dist/esm/useDayPicker.js
  init_define_import_meta_env();
  var import_react18 = __toESM(require_react_shim());
  var dayPickerContext = (0, import_react18.createContext)(void 0);
  function useDayPicker() {
    const context = (0, import_react18.useContext)(dayPickerContext);
    if (context === void 0) {
      throw new Error("useDayPicker() must be used within a custom component.");
    }
    return context;
  }

  // node_modules/react-day-picker/dist/esm/components/MonthsDropdown.js
  function MonthsDropdown(props) {
    const { components } = useDayPicker();
    return import_react19.default.createElement(components.Dropdown, { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Nav.js
  init_define_import_meta_env();
  var import_react20 = __toESM(require_react_shim());
  function Nav(props) {
    const { onPreviousClick, onNextClick, previousMonth, nextMonth, ...navProps } = props;
    const { components, classNames, labels: { labelPrevious: labelPrevious2, labelNext: labelNext2 } } = useDayPicker();
    const handleNextClick = (0, import_react20.useCallback)((e) => {
      if (nextMonth) {
        onNextClick?.(e);
      }
    }, [nextMonth, onNextClick]);
    const handlePreviousClick = (0, import_react20.useCallback)((e) => {
      if (previousMonth) {
        onPreviousClick?.(e);
      }
    }, [previousMonth, onPreviousClick]);
    return import_react20.default.createElement(
      "nav",
      { ...navProps },
      import_react20.default.createElement(
        components.PreviousMonthButton,
        { type: "button", className: classNames[UI.PreviousMonthButton], tabIndex: previousMonth ? void 0 : -1, "aria-disabled": previousMonth ? void 0 : true, "aria-label": labelPrevious2(previousMonth), onClick: handlePreviousClick },
        import_react20.default.createElement(components.Chevron, { disabled: previousMonth ? void 0 : true, className: classNames[UI.Chevron], orientation: "left" })
      ),
      import_react20.default.createElement(
        components.NextMonthButton,
        { type: "button", className: classNames[UI.NextMonthButton], tabIndex: nextMonth ? void 0 : -1, "aria-disabled": nextMonth ? void 0 : true, "aria-label": labelNext2(nextMonth), onClick: handleNextClick },
        import_react20.default.createElement(components.Chevron, { disabled: nextMonth ? void 0 : true, orientation: "right", className: classNames[UI.Chevron] })
      )
    );
  }

  // node_modules/react-day-picker/dist/esm/components/NextMonthButton.js
  init_define_import_meta_env();
  var import_react21 = __toESM(require_react_shim());
  function NextMonthButton(props) {
    const { components } = useDayPicker();
    return import_react21.default.createElement(components.Button, { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Option.js
  init_define_import_meta_env();
  var import_react22 = __toESM(require_react_shim());
  function Option(props) {
    return import_react22.default.createElement("option", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/PreviousMonthButton.js
  init_define_import_meta_env();
  var import_react23 = __toESM(require_react_shim());
  function PreviousMonthButton(props) {
    const { components } = useDayPicker();
    return import_react23.default.createElement(components.Button, { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Root.js
  init_define_import_meta_env();
  var import_react24 = __toESM(require_react_shim());
  function Root3(props) {
    const { rootRef, ...rest } = props;
    return import_react24.default.createElement("div", { ...rest, ref: rootRef });
  }

  // node_modules/react-day-picker/dist/esm/components/Select.js
  init_define_import_meta_env();
  var import_react25 = __toESM(require_react_shim());
  function Select(props) {
    return import_react25.default.createElement("select", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Week.js
  init_define_import_meta_env();
  var import_react26 = __toESM(require_react_shim());
  function Week(props) {
    const { week, ...trProps } = props;
    return import_react26.default.createElement("tr", { ...trProps });
  }

  // node_modules/react-day-picker/dist/esm/components/Weekday.js
  init_define_import_meta_env();
  var import_react27 = __toESM(require_react_shim());
  function Weekday(props) {
    return import_react27.default.createElement("th", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Weekdays.js
  init_define_import_meta_env();
  var import_react28 = __toESM(require_react_shim());
  function Weekdays(props) {
    return import_react28.default.createElement(
      "thead",
      { "aria-hidden": true },
      import_react28.default.createElement("tr", { ...props })
    );
  }

  // node_modules/react-day-picker/dist/esm/components/WeekNumber.js
  init_define_import_meta_env();
  var import_react29 = __toESM(require_react_shim());
  function WeekNumber(props) {
    const { week, ...thProps } = props;
    return import_react29.default.createElement("th", { ...thProps });
  }

  // node_modules/react-day-picker/dist/esm/components/WeekNumberHeader.js
  init_define_import_meta_env();
  var import_react30 = __toESM(require_react_shim());
  function WeekNumberHeader(props) {
    return import_react30.default.createElement("th", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/Weeks.js
  init_define_import_meta_env();
  var import_react31 = __toESM(require_react_shim());
  function Weeks(props) {
    return import_react31.default.createElement("tbody", { ...props });
  }

  // node_modules/react-day-picker/dist/esm/components/YearsDropdown.js
  init_define_import_meta_env();
  var import_react32 = __toESM(require_react_shim());
  function YearsDropdown(props) {
    const { components } = useDayPicker();
    return import_react32.default.createElement(components.Dropdown, { ...props });
  }

  // node_modules/react-day-picker/dist/esm/DayPicker.js
  init_define_import_meta_env();
  var import_react37 = __toESM(require_react_shim());

  // node_modules/react-day-picker/dist/esm/helpers/createGetModifiers.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/utils/dateMatchModifiers.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/utils/rangeIncludesDate.js
  init_define_import_meta_env();
  function rangeIncludesDate(range, date, excludeEnds = false, dateLib = defaultDateLib) {
    let { from, to } = range;
    const { differenceInCalendarDays: differenceInCalendarDays2, isSameDay: isSameDay2 } = dateLib;
    if (from && to) {
      const isRangeInverted = differenceInCalendarDays2(to, from) < 0;
      if (isRangeInverted) {
        [from, to] = [to, from];
      }
      const isInRange = differenceInCalendarDays2(date, from) >= (excludeEnds ? 1 : 0) && differenceInCalendarDays2(to, date) >= (excludeEnds ? 1 : 0);
      return isInRange;
    }
    if (!excludeEnds && to) {
      return isSameDay2(to, date);
    }
    if (!excludeEnds && from) {
      return isSameDay2(from, date);
    }
    return false;
  }

  // node_modules/react-day-picker/dist/esm/utils/typeguards.js
  init_define_import_meta_env();
  function isDateInterval(matcher) {
    return Boolean(matcher && typeof matcher === "object" && "before" in matcher && "after" in matcher);
  }
  function isDateRange(value) {
    return Boolean(value && typeof value === "object" && "from" in value);
  }
  function isDateAfterType(value) {
    return Boolean(value && typeof value === "object" && "after" in value);
  }
  function isDateBeforeType(value) {
    return Boolean(value && typeof value === "object" && "before" in value);
  }
  function isDayOfWeekType(value) {
    return Boolean(value && typeof value === "object" && "dayOfWeek" in value);
  }
  function isDatesArray(value, dateLib) {
    return Array.isArray(value) && value.every(dateLib.isDate);
  }

  // node_modules/react-day-picker/dist/esm/utils/dateMatchModifiers.js
  function dateMatchModifiers(date, matchers, dateLib = defaultDateLib) {
    const matchersArr = !Array.isArray(matchers) ? [matchers] : matchers;
    const { isSameDay: isSameDay2, differenceInCalendarDays: differenceInCalendarDays2, isAfter: isAfter2 } = dateLib;
    return matchersArr.some((matcher) => {
      if (typeof matcher === "boolean") {
        return matcher;
      }
      if (dateLib.isDate(matcher)) {
        return isSameDay2(date, matcher);
      }
      if (isDatesArray(matcher, dateLib)) {
        return matcher.some((matcherDate) => isSameDay2(date, matcherDate));
      }
      if (isDateRange(matcher)) {
        return rangeIncludesDate(matcher, date, false, dateLib);
      }
      if (isDayOfWeekType(matcher)) {
        if (!Array.isArray(matcher.dayOfWeek)) {
          return matcher.dayOfWeek === date.getDay();
        }
        return matcher.dayOfWeek.includes(date.getDay());
      }
      if (isDateInterval(matcher)) {
        const diffBefore = differenceInCalendarDays2(matcher.before, date);
        const diffAfter = differenceInCalendarDays2(matcher.after, date);
        const isDayBefore = diffBefore > 0;
        const isDayAfter = diffAfter < 0;
        const isClosedInterval = isAfter2(matcher.before, matcher.after);
        if (isClosedInterval) {
          return isDayAfter && isDayBefore;
        } else {
          return isDayBefore || isDayAfter;
        }
      }
      if (isDateAfterType(matcher)) {
        return differenceInCalendarDays2(date, matcher.after) > 0;
      }
      if (isDateBeforeType(matcher)) {
        return differenceInCalendarDays2(matcher.before, date) > 0;
      }
      if (typeof matcher === "function") {
        return matcher(date);
      }
      return false;
    });
  }

  // node_modules/react-day-picker/dist/esm/helpers/createGetModifiers.js
  function createGetModifiers(days, props, navStart, navEnd, dateLib) {
    const { disabled, hidden, modifiers, showOutsideDays, broadcastCalendar, today = dateLib.today() } = props;
    const { isSameDay: isSameDay2, isSameMonth: isSameMonth2, startOfMonth: startOfMonth2, isBefore: isBefore2, endOfMonth: endOfMonth2, isAfter: isAfter2 } = dateLib;
    const computedNavStart = navStart && startOfMonth2(navStart);
    const computedNavEnd = navEnd && endOfMonth2(navEnd);
    const internalModifiersMap = {
      [DayFlag.focused]: [],
      [DayFlag.outside]: [],
      [DayFlag.disabled]: [],
      [DayFlag.hidden]: [],
      [DayFlag.today]: []
    };
    const customModifiersMap = {};
    for (const day of days) {
      const { date, displayMonth } = day;
      const isOutside = Boolean(displayMonth && !isSameMonth2(date, displayMonth));
      const isBeforeNavStart = Boolean(computedNavStart && isBefore2(date, computedNavStart));
      const isAfterNavEnd = Boolean(computedNavEnd && isAfter2(date, computedNavEnd));
      const isDisabled = Boolean(disabled && dateMatchModifiers(date, disabled, dateLib));
      const isHidden2 = Boolean(hidden && dateMatchModifiers(date, hidden, dateLib)) || isBeforeNavStart || isAfterNavEnd || // Broadcast calendar will show outside days as default
      !broadcastCalendar && !showOutsideDays && isOutside || broadcastCalendar && showOutsideDays === false && isOutside;
      const isToday = isSameDay2(date, today);
      if (isOutside)
        internalModifiersMap.outside.push(day);
      if (isDisabled)
        internalModifiersMap.disabled.push(day);
      if (isHidden2)
        internalModifiersMap.hidden.push(day);
      if (isToday)
        internalModifiersMap.today.push(day);
      if (modifiers) {
        Object.keys(modifiers).forEach((name) => {
          const modifierValue = modifiers?.[name];
          const isMatch = modifierValue ? dateMatchModifiers(date, modifierValue, dateLib) : false;
          if (!isMatch)
            return;
          if (customModifiersMap[name]) {
            customModifiersMap[name].push(day);
          } else {
            customModifiersMap[name] = [day];
          }
        });
      }
    }
    return (day) => {
      const dayFlags = {
        [DayFlag.focused]: false,
        [DayFlag.disabled]: false,
        [DayFlag.hidden]: false,
        [DayFlag.outside]: false,
        [DayFlag.today]: false
      };
      const customModifiers = {};
      for (const name in internalModifiersMap) {
        const days2 = internalModifiersMap[name];
        dayFlags[name] = days2.some((d) => d === day);
      }
      for (const name in customModifiersMap) {
        customModifiers[name] = customModifiersMap[name].some((d) => d === day);
      }
      return {
        ...dayFlags,
        // custom modifiers should override all the previous ones
        ...customModifiers
      };
    };
  }

  // node_modules/react-day-picker/dist/esm/helpers/getClassNamesForModifiers.js
  init_define_import_meta_env();
  function getClassNamesForModifiers(modifiers, classNames, modifiersClassNames = {}) {
    const modifierClassNames = Object.entries(modifiers).filter(([, active]) => active === true).reduce((previousValue, [key]) => {
      if (modifiersClassNames[key]) {
        previousValue.push(modifiersClassNames[key]);
      } else if (classNames[DayFlag[key]]) {
        previousValue.push(classNames[DayFlag[key]]);
      } else if (classNames[SelectionState[key]]) {
        previousValue.push(classNames[SelectionState[key]]);
      }
      return previousValue;
    }, [classNames[UI.Day]]);
    return modifierClassNames;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getComponents.js
  init_define_import_meta_env();
  function getComponents(customComponents) {
    return {
      ...custom_components_exports,
      ...customComponents
    };
  }

  // node_modules/react-day-picker/dist/esm/helpers/getDataAttributes.js
  init_define_import_meta_env();
  function getDataAttributes(props) {
    const dataAttributes = {
      "data-mode": props.mode ?? void 0,
      "data-required": "required" in props ? props.required : void 0,
      "data-multiple-months": props.numberOfMonths && props.numberOfMonths > 1 || void 0,
      "data-week-numbers": props.showWeekNumber || void 0,
      "data-broadcast-calendar": props.broadcastCalendar || void 0,
      "data-nav-layout": props.navLayout || void 0
    };
    Object.entries(props).forEach(([key, val]) => {
      if (key.startsWith("data-")) {
        dataAttributes[key] = val;
      }
    });
    return dataAttributes;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getDefaultClassNames.js
  init_define_import_meta_env();
  function getDefaultClassNames() {
    const classNames = {};
    for (const key in UI) {
      classNames[UI[key]] = `rdp-${UI[key]}`;
    }
    for (const key in DayFlag) {
      classNames[DayFlag[key]] = `rdp-${DayFlag[key]}`;
    }
    for (const key in SelectionState) {
      classNames[SelectionState[key]] = `rdp-${SelectionState[key]}`;
    }
    for (const key in Animation) {
      classNames[Animation[key]] = `rdp-${Animation[key]}`;
    }
    return classNames;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getFormatters.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/formatters/index.js
  var formatters_exports = {};
  __export(formatters_exports, {
    formatCaption: () => formatCaption,
    formatDay: () => formatDay,
    formatMonthCaption: () => formatMonthCaption,
    formatMonthDropdown: () => formatMonthDropdown,
    formatWeekNumber: () => formatWeekNumber,
    formatWeekNumberHeader: () => formatWeekNumberHeader,
    formatWeekdayName: () => formatWeekdayName,
    formatYearCaption: () => formatYearCaption,
    formatYearDropdown: () => formatYearDropdown
  });
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/formatters/formatCaption.js
  init_define_import_meta_env();
  function formatCaption(month, options2, dateLib) {
    const lib = dateLib ?? new DateLib(options2);
    return lib.formatMonthYear(month);
  }
  var formatMonthCaption = formatCaption;

  // node_modules/react-day-picker/dist/esm/formatters/formatDay.js
  init_define_import_meta_env();
  function formatDay(date, options2, dateLib) {
    return (dateLib ?? new DateLib(options2)).format(date, "d");
  }

  // node_modules/react-day-picker/dist/esm/formatters/formatMonthDropdown.js
  init_define_import_meta_env();
  function formatMonthDropdown(month, dateLib = defaultDateLib) {
    return dateLib.format(month, "LLLL");
  }

  // node_modules/react-day-picker/dist/esm/formatters/formatWeekdayName.js
  init_define_import_meta_env();
  function formatWeekdayName(weekday, options2, dateLib) {
    return (dateLib ?? new DateLib(options2)).format(weekday, "cccccc");
  }

  // node_modules/react-day-picker/dist/esm/formatters/formatWeekNumber.js
  init_define_import_meta_env();
  function formatWeekNumber(weekNumber, dateLib = defaultDateLib) {
    if (weekNumber < 10) {
      return dateLib.formatNumber(`0${weekNumber.toLocaleString()}`);
    }
    return dateLib.formatNumber(`${weekNumber.toLocaleString()}`);
  }

  // node_modules/react-day-picker/dist/esm/formatters/formatWeekNumberHeader.js
  init_define_import_meta_env();
  function formatWeekNumberHeader() {
    return ``;
  }

  // node_modules/react-day-picker/dist/esm/formatters/formatYearDropdown.js
  init_define_import_meta_env();
  function formatYearDropdown(year, dateLib = defaultDateLib) {
    return dateLib.format(year, "yyyy");
  }
  var formatYearCaption = formatYearDropdown;

  // node_modules/react-day-picker/dist/esm/helpers/getFormatters.js
  function getFormatters(customFormatters) {
    if (customFormatters?.formatMonthCaption && !customFormatters.formatCaption) {
      customFormatters.formatCaption = customFormatters.formatMonthCaption;
    }
    if (customFormatters?.formatYearCaption && !customFormatters.formatYearDropdown) {
      customFormatters.formatYearDropdown = customFormatters.formatYearCaption;
    }
    return {
      ...formatters_exports,
      ...customFormatters
    };
  }

  // node_modules/react-day-picker/dist/esm/helpers/getLabels.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/labels/index.js
  var labels_exports = {};
  __export(labels_exports, {
    labelCaption: () => labelCaption,
    labelDay: () => labelDay,
    labelDayButton: () => labelDayButton,
    labelGrid: () => labelGrid,
    labelGridcell: () => labelGridcell,
    labelMonthDropdown: () => labelMonthDropdown,
    labelNav: () => labelNav,
    labelNext: () => labelNext,
    labelPrevious: () => labelPrevious,
    labelWeekNumber: () => labelWeekNumber,
    labelWeekNumberHeader: () => labelWeekNumberHeader,
    labelWeekday: () => labelWeekday,
    labelYearDropdown: () => labelYearDropdown
  });
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/labels/labelDayButton.js
  init_define_import_meta_env();
  function labelDayButton(date, modifiers, options2, dateLib) {
    let label = (dateLib ?? new DateLib(options2)).format(date, "PPPP");
    if (modifiers.today)
      label = `Today, ${label}`;
    if (modifiers.selected)
      label = `${label}, selected`;
    return label;
  }
  var labelDay = labelDayButton;

  // node_modules/react-day-picker/dist/esm/labels/labelGrid.js
  init_define_import_meta_env();
  function labelGrid(date, options2, dateLib) {
    const lib = dateLib ?? new DateLib(options2);
    return lib.formatMonthYear(date);
  }
  var labelCaption = labelGrid;

  // node_modules/react-day-picker/dist/esm/labels/labelGridcell.js
  init_define_import_meta_env();
  function labelGridcell(date, modifiers, options2, dateLib) {
    let label = (dateLib ?? new DateLib(options2)).format(date, "PPPP");
    if (modifiers?.today) {
      label = `Today, ${label}`;
    }
    return label;
  }

  // node_modules/react-day-picker/dist/esm/labels/labelMonthDropdown.js
  init_define_import_meta_env();
  function labelMonthDropdown(_options) {
    return "Choose the Month";
  }

  // node_modules/react-day-picker/dist/esm/labels/labelNav.js
  init_define_import_meta_env();
  function labelNav() {
    return "";
  }

  // node_modules/react-day-picker/dist/esm/labels/labelNext.js
  init_define_import_meta_env();
  var defaultLabel = "Go to the Next Month";
  function labelNext(_month, _options) {
    return defaultLabel;
  }

  // node_modules/react-day-picker/dist/esm/labels/labelPrevious.js
  init_define_import_meta_env();
  function labelPrevious(_month) {
    return "Go to the Previous Month";
  }

  // node_modules/react-day-picker/dist/esm/labels/labelWeekday.js
  init_define_import_meta_env();
  function labelWeekday(date, options2, dateLib) {
    return (dateLib ?? new DateLib(options2)).format(date, "cccc");
  }

  // node_modules/react-day-picker/dist/esm/labels/labelWeekNumber.js
  init_define_import_meta_env();
  function labelWeekNumber(weekNumber, _options) {
    return `Week ${weekNumber}`;
  }

  // node_modules/react-day-picker/dist/esm/labels/labelWeekNumberHeader.js
  init_define_import_meta_env();
  function labelWeekNumberHeader(_options) {
    return "Week Number";
  }

  // node_modules/react-day-picker/dist/esm/labels/labelYearDropdown.js
  init_define_import_meta_env();
  function labelYearDropdown(_options) {
    return "Choose the Year";
  }

  // node_modules/react-day-picker/dist/esm/helpers/getLabels.js
  var resolveLabel = (defaultLabel2, customLabel, localeLabel) => {
    if (customLabel)
      return customLabel;
    if (localeLabel) {
      return typeof localeLabel === "function" ? localeLabel : (..._args) => localeLabel;
    }
    return defaultLabel2;
  };
  function getLabels(customLabels, options2) {
    const localeLabels = options2.locale?.labels ?? {};
    return {
      ...labels_exports,
      ...customLabels ?? {},
      labelDayButton: resolveLabel(labelDayButton, customLabels?.labelDayButton, localeLabels.labelDayButton),
      labelMonthDropdown: resolveLabel(labelMonthDropdown, customLabels?.labelMonthDropdown, localeLabels.labelMonthDropdown),
      labelNext: resolveLabel(labelNext, customLabels?.labelNext, localeLabels.labelNext),
      labelPrevious: resolveLabel(labelPrevious, customLabels?.labelPrevious, localeLabels.labelPrevious),
      labelWeekNumber: resolveLabel(labelWeekNumber, customLabels?.labelWeekNumber, localeLabels.labelWeekNumber),
      labelYearDropdown: resolveLabel(labelYearDropdown, customLabels?.labelYearDropdown, localeLabels.labelYearDropdown),
      labelGrid: resolveLabel(labelGrid, customLabels?.labelGrid, localeLabels.labelGrid),
      labelGridcell: resolveLabel(labelGridcell, customLabels?.labelGridcell, localeLabels.labelGridcell),
      labelNav: resolveLabel(labelNav, customLabels?.labelNav, localeLabels.labelNav),
      labelWeekNumberHeader: resolveLabel(labelWeekNumberHeader, customLabels?.labelWeekNumberHeader, localeLabels.labelWeekNumberHeader),
      labelWeekday: resolveLabel(labelWeekday, customLabels?.labelWeekday, localeLabels.labelWeekday)
    };
  }

  // node_modules/react-day-picker/dist/esm/helpers/getMonthOptions.js
  init_define_import_meta_env();
  function getMonthOptions(displayMonth, navStart, navEnd, formatters2, dateLib) {
    const { startOfMonth: startOfMonth2, startOfYear: startOfYear2, endOfYear: endOfYear2, eachMonthOfInterval: eachMonthOfInterval2, getMonth: getMonth2 } = dateLib;
    const months = eachMonthOfInterval2({
      start: startOfYear2(displayMonth),
      end: endOfYear2(displayMonth)
    });
    const options2 = months.map((month) => {
      const label = formatters2.formatMonthDropdown(month, dateLib);
      const value = getMonth2(month);
      const disabled = navStart && month < startOfMonth2(navStart) || navEnd && month > startOfMonth2(navEnd) || false;
      return { value, label, disabled };
    });
    return options2;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getStyleForModifiers.js
  init_define_import_meta_env();
  function getStyleForModifiers(dayModifiers, styles = {}, modifiersStyles = {}) {
    let style = { ...styles?.[UI.Day] };
    Object.entries(dayModifiers).filter(([, active]) => active === true).forEach(([modifier]) => {
      style = {
        ...style,
        ...modifiersStyles?.[modifier]
      };
    });
    return style;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getWeekdays.js
  init_define_import_meta_env();
  function getWeekdays(dateLib, ISOWeek, broadcastCalendar, today) {
    const referenceToday = today ?? dateLib.today();
    const start = broadcastCalendar ? dateLib.startOfBroadcastWeek(referenceToday, dateLib) : ISOWeek ? dateLib.startOfISOWeek(referenceToday) : dateLib.startOfWeek(referenceToday);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = dateLib.addDays(start, i);
      days.push(day);
    }
    return days;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getYearOptions.js
  init_define_import_meta_env();
  function getYearOptions(navStart, navEnd, formatters2, dateLib, reverse = false) {
    if (!navStart)
      return void 0;
    if (!navEnd)
      return void 0;
    const { startOfYear: startOfYear2, endOfYear: endOfYear2, eachYearOfInterval: eachYearOfInterval2, getYear: getYear2 } = dateLib;
    const firstNavYear = startOfYear2(navStart);
    const lastNavYear = endOfYear2(navEnd);
    const years = eachYearOfInterval2({ start: firstNavYear, end: lastNavYear });
    if (reverse)
      years.reverse();
    return years.map((year) => {
      const label = formatters2.formatYearDropdown(year, dateLib);
      return {
        value: getYear2(year),
        label,
        disabled: false
      };
    });
  }

  // node_modules/react-day-picker/dist/esm/noonDateLib.js
  init_define_import_meta_env();
  function createNoonOverrides(timeZone, options2 = {}) {
    const { weekStartsOn, locale } = options2;
    const fallbackWeekStartsOn = weekStartsOn ?? locale?.options?.weekStartsOn ?? 0;
    const toNoonTZDate = (date) => {
      const normalizedDate = typeof date === "number" || typeof date === "string" ? new Date(date) : date;
      return new TZDate(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate(), 12, 0, 0, timeZone);
    };
    const toCalendarDate = (date) => {
      const zoned = toNoonTZDate(date);
      return new Date(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), 0, 0, 0, 0);
    };
    return {
      today: () => {
        return toNoonTZDate(TZDate.tz(timeZone));
      },
      newDate: (year, monthIndex, date) => {
        return new TZDate(year, monthIndex, date, 12, 0, 0, timeZone);
      },
      startOfDay: (date) => {
        return toNoonTZDate(date);
      },
      startOfWeek: (date, options3) => {
        const base = toNoonTZDate(date);
        const weekStartsOnValue = options3?.weekStartsOn ?? fallbackWeekStartsOn;
        const diff = (base.getDay() - weekStartsOnValue + 7) % 7;
        base.setDate(base.getDate() - diff);
        return base;
      },
      startOfISOWeek: (date) => {
        const base = toNoonTZDate(date);
        const diff = (base.getDay() - 1 + 7) % 7;
        base.setDate(base.getDate() - diff);
        return base;
      },
      startOfMonth: (date) => {
        const base = toNoonTZDate(date);
        base.setDate(1);
        return base;
      },
      startOfYear: (date) => {
        const base = toNoonTZDate(date);
        base.setMonth(0, 1);
        return base;
      },
      endOfWeek: (date, options3) => {
        const base = toNoonTZDate(date);
        const weekStartsOnValue = options3?.weekStartsOn ?? fallbackWeekStartsOn;
        const endDow = (weekStartsOnValue + 6) % 7;
        const diff = (endDow - base.getDay() + 7) % 7;
        base.setDate(base.getDate() + diff);
        return base;
      },
      endOfISOWeek: (date) => {
        const base = toNoonTZDate(date);
        const diff = (7 - base.getDay()) % 7;
        base.setDate(base.getDate() + diff);
        return base;
      },
      endOfMonth: (date) => {
        const base = toNoonTZDate(date);
        base.setMonth(base.getMonth() + 1, 0);
        return base;
      },
      endOfYear: (date) => {
        const base = toNoonTZDate(date);
        base.setMonth(11, 31);
        return base;
      },
      eachMonthOfInterval: (interval) => {
        const start = toNoonTZDate(interval.start);
        const end = toNoonTZDate(interval.end);
        const result = [];
        const cursor = new TZDate(start.getFullYear(), start.getMonth(), 1, 12, 0, 0, timeZone);
        const endKey = end.getFullYear() * 12 + end.getMonth();
        while (cursor.getFullYear() * 12 + cursor.getMonth() <= endKey) {
          result.push(new TZDate(cursor, timeZone));
          cursor.setMonth(cursor.getMonth() + 1, 1);
        }
        return result;
      },
      // Normalize to noon once before arithmetic (avoid DST/midnight edge cases),
      // mutate the same TZDate, and return it.
      addDays: (date, amount) => {
        const base = toNoonTZDate(date);
        base.setDate(base.getDate() + amount);
        return base;
      },
      addWeeks: (date, amount) => {
        const base = toNoonTZDate(date);
        base.setDate(base.getDate() + amount * 7);
        return base;
      },
      addMonths: (date, amount) => {
        const base = toNoonTZDate(date);
        base.setMonth(base.getMonth() + amount);
        return base;
      },
      addYears: (date, amount) => {
        const base = toNoonTZDate(date);
        base.setFullYear(base.getFullYear() + amount);
        return base;
      },
      eachYearOfInterval: (interval) => {
        const start = toNoonTZDate(interval.start);
        const end = toNoonTZDate(interval.end);
        const years = [];
        const cursor = new TZDate(start.getFullYear(), 0, 1, 12, 0, 0, timeZone);
        while (cursor.getFullYear() <= end.getFullYear()) {
          years.push(new TZDate(cursor, timeZone));
          cursor.setFullYear(cursor.getFullYear() + 1, 0, 1);
        }
        return years;
      },
      getWeek: (date, options3) => {
        const base = toCalendarDate(date);
        return getWeek(base, {
          weekStartsOn: options3?.weekStartsOn ?? fallbackWeekStartsOn,
          firstWeekContainsDate: options3?.firstWeekContainsDate ?? locale?.options?.firstWeekContainsDate ?? 1
        });
      },
      getISOWeek: (date) => {
        const base = toCalendarDate(date);
        return getISOWeek(base);
      },
      differenceInCalendarDays: (dateLeft, dateRight) => {
        const left = toCalendarDate(dateLeft);
        const right = toCalendarDate(dateRight);
        return differenceInCalendarDays(left, right);
      },
      differenceInCalendarMonths: (dateLeft, dateRight) => {
        const left = toCalendarDate(dateLeft);
        const right = toCalendarDate(dateRight);
        return differenceInCalendarMonths(left, right);
      }
    };
  }

  // node_modules/react-day-picker/dist/esm/useAnimation.js
  init_define_import_meta_env();
  var import_react33 = __toESM(require_react_shim());
  var asHtmlElement = (element) => {
    if (element instanceof HTMLElement)
      return element;
    return null;
  };
  var queryMonthEls = (element) => [
    ...element.querySelectorAll("[data-animated-month]") ?? []
  ];
  var queryMonthEl = (element) => asHtmlElement(element.querySelector("[data-animated-month]"));
  var queryCaptionEl = (element) => asHtmlElement(element.querySelector("[data-animated-caption]"));
  var queryWeeksEl = (element) => asHtmlElement(element.querySelector("[data-animated-weeks]"));
  var queryNavEl = (element) => asHtmlElement(element.querySelector("[data-animated-nav]"));
  var queryWeekdaysEl = (element) => asHtmlElement(element.querySelector("[data-animated-weekdays]"));
  function useAnimation(rootElRef, enabled, { classNames, months, focused, dateLib }) {
    const previousRootElSnapshotRef = (0, import_react33.useRef)(null);
    const previousMonthsRef = (0, import_react33.useRef)(months);
    const animatingRef = (0, import_react33.useRef)(false);
    (0, import_react33.useLayoutEffect)(() => {
      const previousMonths = previousMonthsRef.current;
      previousMonthsRef.current = months;
      if (!enabled || !rootElRef.current || // safety check because the ref can be set to anything by consumers
      !(rootElRef.current instanceof HTMLElement) || // validation required for the animation to work as expected
      months.length === 0 || previousMonths.length === 0 || months.length !== previousMonths.length) {
        return;
      }
      const isSameMonth2 = dateLib.isSameMonth(months[0].date, previousMonths[0].date);
      const isAfterPreviousMonth = dateLib.isAfter(months[0].date, previousMonths[0].date);
      const captionAnimationClass = isAfterPreviousMonth ? classNames[Animation.caption_after_enter] : classNames[Animation.caption_before_enter];
      const weeksAnimationClass = isAfterPreviousMonth ? classNames[Animation.weeks_after_enter] : classNames[Animation.weeks_before_enter];
      const previousRootElSnapshot = previousRootElSnapshotRef.current;
      const rootElSnapshot = rootElRef.current.cloneNode(true);
      if (rootElSnapshot instanceof HTMLElement) {
        const currentMonthElsSnapshot = queryMonthEls(rootElSnapshot);
        currentMonthElsSnapshot.forEach((currentMonthElSnapshot) => {
          if (!(currentMonthElSnapshot instanceof HTMLElement))
            return;
          const previousMonthElSnapshot = queryMonthEl(currentMonthElSnapshot);
          if (previousMonthElSnapshot && currentMonthElSnapshot.contains(previousMonthElSnapshot)) {
            currentMonthElSnapshot.removeChild(previousMonthElSnapshot);
          }
          const captionEl = queryCaptionEl(currentMonthElSnapshot);
          if (captionEl) {
            captionEl.classList.remove(captionAnimationClass);
          }
          const weeksEl = queryWeeksEl(currentMonthElSnapshot);
          if (weeksEl) {
            weeksEl.classList.remove(weeksAnimationClass);
          }
        });
        previousRootElSnapshotRef.current = rootElSnapshot;
      } else {
        previousRootElSnapshotRef.current = null;
      }
      if (animatingRef.current || isSameMonth2 || // skip animation if a day is focused because it can cause issues to the animation and is better for a11y
      focused) {
        return;
      }
      const previousMonthEls = previousRootElSnapshot instanceof HTMLElement ? queryMonthEls(previousRootElSnapshot) : [];
      const currentMonthEls = queryMonthEls(rootElRef.current);
      if (currentMonthEls?.every((el) => el instanceof HTMLElement) && previousMonthEls && previousMonthEls.every((el) => el instanceof HTMLElement)) {
        animatingRef.current = true;
        const cleanUpFunctions = [];
        rootElRef.current.style.isolation = "isolate";
        const navEl = queryNavEl(rootElRef.current);
        if (navEl) {
          navEl.style.zIndex = "1";
        }
        currentMonthEls.forEach((currentMonthEl, index2) => {
          const previousMonthEl = previousMonthEls[index2];
          if (!previousMonthEl) {
            return;
          }
          currentMonthEl.style.position = "relative";
          currentMonthEl.style.overflow = "hidden";
          const captionEl = queryCaptionEl(currentMonthEl);
          if (captionEl) {
            captionEl.classList.add(captionAnimationClass);
          }
          const weeksEl = queryWeeksEl(currentMonthEl);
          if (weeksEl) {
            weeksEl.classList.add(weeksAnimationClass);
          }
          const cleanUp = () => {
            animatingRef.current = false;
            if (rootElRef.current) {
              rootElRef.current.style.isolation = "";
            }
            if (navEl) {
              navEl.style.zIndex = "";
            }
            if (captionEl) {
              captionEl.classList.remove(captionAnimationClass);
            }
            if (weeksEl) {
              weeksEl.classList.remove(weeksAnimationClass);
            }
            currentMonthEl.style.position = "";
            currentMonthEl.style.overflow = "";
            if (currentMonthEl.contains(previousMonthEl)) {
              currentMonthEl.removeChild(previousMonthEl);
            }
          };
          cleanUpFunctions.push(cleanUp);
          previousMonthEl.style.pointerEvents = "none";
          previousMonthEl.style.position = "absolute";
          previousMonthEl.style.overflow = "hidden";
          previousMonthEl.setAttribute("aria-hidden", "true");
          const previousWeekdaysEl = queryWeekdaysEl(previousMonthEl);
          if (previousWeekdaysEl) {
            previousWeekdaysEl.style.opacity = "0";
          }
          const previousCaptionEl = queryCaptionEl(previousMonthEl);
          if (previousCaptionEl) {
            previousCaptionEl.classList.add(isAfterPreviousMonth ? classNames[Animation.caption_before_exit] : classNames[Animation.caption_after_exit]);
            previousCaptionEl.addEventListener("animationend", cleanUp);
          }
          const previousWeeksEl = queryWeeksEl(previousMonthEl);
          if (previousWeeksEl) {
            previousWeeksEl.classList.add(isAfterPreviousMonth ? classNames[Animation.weeks_before_exit] : classNames[Animation.weeks_after_exit]);
          }
          currentMonthEl.insertBefore(previousMonthEl, currentMonthEl.firstChild);
        });
      }
    });
  }

  // node_modules/react-day-picker/dist/esm/useCalendar.js
  init_define_import_meta_env();
  var import_react35 = __toESM(require_react_shim());

  // node_modules/react-day-picker/dist/esm/helpers/getDates.js
  init_define_import_meta_env();
  function getDates(displayMonths, maxDate, props, dateLib) {
    const firstMonth = displayMonths[0];
    const lastMonth = displayMonths[displayMonths.length - 1];
    const { ISOWeek, fixedWeeks, broadcastCalendar } = props ?? {};
    const { addDays: addDays2, differenceInCalendarDays: differenceInCalendarDays2, differenceInCalendarMonths: differenceInCalendarMonths2, endOfBroadcastWeek: endOfBroadcastWeek2, endOfISOWeek: endOfISOWeek2, endOfMonth: endOfMonth2, endOfWeek: endOfWeek2, isAfter: isAfter2, startOfBroadcastWeek: startOfBroadcastWeek2, startOfISOWeek: startOfISOWeek2, startOfWeek: startOfWeek2 } = dateLib;
    const startWeekFirstDate = broadcastCalendar ? startOfBroadcastWeek2(firstMonth, dateLib) : ISOWeek ? startOfISOWeek2(firstMonth) : startOfWeek2(firstMonth);
    const displayMonthsWeekEnd = broadcastCalendar ? endOfBroadcastWeek2(lastMonth) : ISOWeek ? endOfISOWeek2(endOfMonth2(lastMonth)) : endOfWeek2(endOfMonth2(lastMonth));
    const constraintWeekEnd = maxDate && (broadcastCalendar ? endOfBroadcastWeek2(maxDate) : ISOWeek ? endOfISOWeek2(maxDate) : endOfWeek2(maxDate));
    const gridEndDate = constraintWeekEnd && isAfter2(displayMonthsWeekEnd, constraintWeekEnd) ? constraintWeekEnd : displayMonthsWeekEnd;
    const nOfDays = differenceInCalendarDays2(gridEndDate, startWeekFirstDate);
    const nOfMonths = differenceInCalendarMonths2(lastMonth, firstMonth) + 1;
    const dates = [];
    for (let i = 0; i <= nOfDays; i++) {
      const date = addDays2(startWeekFirstDate, i);
      dates.push(date);
    }
    const nrOfDaysWithFixedWeeks = broadcastCalendar ? 35 : 42;
    const extraDates = nrOfDaysWithFixedWeeks * nOfMonths;
    if (fixedWeeks && dates.length < extraDates) {
      const daysToAdd = extraDates - dates.length;
      for (let i = 0; i < daysToAdd; i++) {
        const date = addDays2(dates[dates.length - 1], 1);
        dates.push(date);
      }
    }
    return dates;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getDays.js
  init_define_import_meta_env();
  function getDays(calendarMonths) {
    const initialDays = [];
    return calendarMonths.reduce((days, month) => {
      const weekDays = month.weeks.reduce((weekDays2, week) => {
        return weekDays2.concat(week.days.slice());
      }, initialDays.slice());
      return days.concat(weekDays.slice());
    }, initialDays.slice());
  }

  // node_modules/react-day-picker/dist/esm/helpers/getDisplayMonths.js
  init_define_import_meta_env();
  function getDisplayMonths(firstDisplayedMonth, calendarEndMonth, props, dateLib) {
    const { numberOfMonths = 1 } = props;
    const months = [];
    for (let i = 0; i < numberOfMonths; i++) {
      const month = dateLib.addMonths(firstDisplayedMonth, i);
      if (calendarEndMonth && month > calendarEndMonth) {
        break;
      }
      months.push(month);
    }
    return months;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getInitialMonth.js
  init_define_import_meta_env();
  function getInitialMonth(props, navStart, navEnd, dateLib) {
    const { month, defaultMonth, today = dateLib.today(), numberOfMonths = 1 } = props;
    let initialMonth = month || defaultMonth || today;
    const { differenceInCalendarMonths: differenceInCalendarMonths2, addMonths: addMonths2, startOfMonth: startOfMonth2 } = dateLib;
    if (navEnd && differenceInCalendarMonths2(navEnd, initialMonth) < numberOfMonths - 1) {
      const offset4 = -1 * (numberOfMonths - 1);
      initialMonth = addMonths2(navEnd, offset4);
    }
    if (navStart && differenceInCalendarMonths2(initialMonth, navStart) < 0) {
      initialMonth = navStart;
    }
    return startOfMonth2(initialMonth);
  }

  // node_modules/react-day-picker/dist/esm/helpers/getMonths.js
  init_define_import_meta_env();
  function getMonths(displayMonths, dates, props, dateLib) {
    const { addDays: addDays2, endOfBroadcastWeek: endOfBroadcastWeek2, endOfISOWeek: endOfISOWeek2, endOfMonth: endOfMonth2, endOfWeek: endOfWeek2, getISOWeek: getISOWeek2, getWeek: getWeek2, startOfBroadcastWeek: startOfBroadcastWeek2, startOfISOWeek: startOfISOWeek2, startOfWeek: startOfWeek2 } = dateLib;
    const dayPickerMonths = displayMonths.reduce((months, month) => {
      const firstDateOfFirstWeek = props.broadcastCalendar ? startOfBroadcastWeek2(month, dateLib) : props.ISOWeek ? startOfISOWeek2(month) : startOfWeek2(month);
      const lastDateOfLastWeek = props.broadcastCalendar ? endOfBroadcastWeek2(month) : props.ISOWeek ? endOfISOWeek2(endOfMonth2(month)) : endOfWeek2(endOfMonth2(month));
      const monthDates = dates.filter((date) => {
        return date >= firstDateOfFirstWeek && date <= lastDateOfLastWeek;
      });
      const nrOfDaysWithFixedWeeks = props.broadcastCalendar ? 35 : 42;
      if (props.fixedWeeks && monthDates.length < nrOfDaysWithFixedWeeks) {
        const extraDates = dates.filter((date) => {
          const daysToAdd = nrOfDaysWithFixedWeeks - monthDates.length;
          return date > lastDateOfLastWeek && date <= addDays2(lastDateOfLastWeek, daysToAdd);
        });
        monthDates.push(...extraDates);
      }
      const weeks = monthDates.reduce((weeks2, date) => {
        const weekNumber = props.ISOWeek ? getISOWeek2(date) : getWeek2(date);
        const week = weeks2.find((week2) => week2.weekNumber === weekNumber);
        const day = new CalendarDay(date, month, dateLib);
        if (!week) {
          weeks2.push(new CalendarWeek(weekNumber, [day]));
        } else {
          week.days.push(day);
        }
        return weeks2;
      }, []);
      const dayPickerMonth = new CalendarMonth(month, weeks);
      months.push(dayPickerMonth);
      return months;
    }, []);
    if (!props.reverseMonths) {
      return dayPickerMonths;
    } else {
      return dayPickerMonths.reverse();
    }
  }

  // node_modules/react-day-picker/dist/esm/helpers/getNavMonth.js
  init_define_import_meta_env();
  function getNavMonths(props, dateLib) {
    let { startMonth, endMonth } = props;
    const { startOfYear: startOfYear2, startOfDay: startOfDay2, startOfMonth: startOfMonth2, endOfMonth: endOfMonth2, addYears: addYears2, endOfYear: endOfYear2, newDate, today } = dateLib;
    const { fromYear, toYear, fromMonth, toMonth } = props;
    if (!startMonth && fromMonth) {
      startMonth = fromMonth;
    }
    if (!startMonth && fromYear) {
      startMonth = dateLib.newDate(fromYear, 0, 1);
    }
    if (!endMonth && toMonth) {
      endMonth = toMonth;
    }
    if (!endMonth && toYear) {
      endMonth = newDate(toYear, 11, 31);
    }
    const hasYearDropdown = props.captionLayout === "dropdown" || props.captionLayout === "dropdown-years";
    if (startMonth) {
      startMonth = startOfMonth2(startMonth);
    } else if (fromYear) {
      startMonth = newDate(fromYear, 0, 1);
    } else if (!startMonth && hasYearDropdown) {
      startMonth = startOfYear2(addYears2(props.today ?? today(), -100));
    }
    if (endMonth) {
      endMonth = endOfMonth2(endMonth);
    } else if (toYear) {
      endMonth = newDate(toYear, 11, 31);
    } else if (!endMonth && hasYearDropdown) {
      endMonth = endOfYear2(props.today ?? today());
    }
    return [
      startMonth ? startOfDay2(startMonth) : startMonth,
      endMonth ? startOfDay2(endMonth) : endMonth
    ];
  }

  // node_modules/react-day-picker/dist/esm/helpers/getNextMonth.js
  init_define_import_meta_env();
  function getNextMonth(firstDisplayedMonth, calendarEndMonth, options2, dateLib) {
    if (options2.disableNavigation) {
      return void 0;
    }
    const { pagedNavigation, numberOfMonths = 1 } = options2;
    const { startOfMonth: startOfMonth2, addMonths: addMonths2, differenceInCalendarMonths: differenceInCalendarMonths2 } = dateLib;
    const offset4 = pagedNavigation ? numberOfMonths : 1;
    const month = startOfMonth2(firstDisplayedMonth);
    if (!calendarEndMonth) {
      return addMonths2(month, offset4);
    }
    const monthsDiff = differenceInCalendarMonths2(calendarEndMonth, firstDisplayedMonth);
    if (monthsDiff < numberOfMonths) {
      return void 0;
    }
    return addMonths2(month, offset4);
  }

  // node_modules/react-day-picker/dist/esm/helpers/getPreviousMonth.js
  init_define_import_meta_env();
  function getPreviousMonth(firstDisplayedMonth, calendarStartMonth, options2, dateLib) {
    if (options2.disableNavigation) {
      return void 0;
    }
    const { pagedNavigation, numberOfMonths } = options2;
    const { startOfMonth: startOfMonth2, addMonths: addMonths2, differenceInCalendarMonths: differenceInCalendarMonths2 } = dateLib;
    const offset4 = pagedNavigation ? numberOfMonths ?? 1 : 1;
    const month = startOfMonth2(firstDisplayedMonth);
    if (!calendarStartMonth) {
      return addMonths2(month, -offset4);
    }
    const monthsDiff = differenceInCalendarMonths2(month, calendarStartMonth);
    if (monthsDiff <= 0) {
      return void 0;
    }
    return addMonths2(month, -offset4);
  }

  // node_modules/react-day-picker/dist/esm/helpers/getWeeks.js
  init_define_import_meta_env();
  function getWeeks(months) {
    const initialWeeks = [];
    return months.reduce((weeks, month) => {
      return weeks.concat(month.weeks.slice());
    }, initialWeeks.slice());
  }

  // node_modules/react-day-picker/dist/esm/helpers/useControlledValue.js
  init_define_import_meta_env();
  var import_react34 = __toESM(require_react_shim());
  function useControlledValue(defaultValue, controlledValue) {
    const [uncontrolledValue, setValue] = (0, import_react34.useState)(defaultValue);
    const value = controlledValue === void 0 ? uncontrolledValue : controlledValue;
    return [value, setValue];
  }

  // node_modules/react-day-picker/dist/esm/useCalendar.js
  function useCalendar(props, dateLib) {
    const [navStart, navEnd] = getNavMonths(props, dateLib);
    const { startOfMonth: startOfMonth2, endOfMonth: endOfMonth2 } = dateLib;
    const initialMonth = getInitialMonth(props, navStart, navEnd, dateLib);
    const [firstMonth, setFirstMonth] = useControlledValue(
      initialMonth,
      // initialMonth is always computed from props.month if provided
      props.month ? initialMonth : void 0
    );
    (0, import_react35.useEffect)(() => {
      const newInitialMonth = getInitialMonth(props, navStart, navEnd, dateLib);
      setFirstMonth(newInitialMonth);
    }, [props.timeZone]);
    const { months, weeks, days, previousMonth, nextMonth } = (0, import_react35.useMemo)(() => {
      const displayMonths = getDisplayMonths(firstMonth, navEnd, { numberOfMonths: props.numberOfMonths }, dateLib);
      const dates = getDates(displayMonths, props.endMonth ? endOfMonth2(props.endMonth) : void 0, {
        ISOWeek: props.ISOWeek,
        fixedWeeks: props.fixedWeeks,
        broadcastCalendar: props.broadcastCalendar
      }, dateLib);
      const months2 = getMonths(displayMonths, dates, {
        broadcastCalendar: props.broadcastCalendar,
        fixedWeeks: props.fixedWeeks,
        ISOWeek: props.ISOWeek,
        reverseMonths: props.reverseMonths
      }, dateLib);
      const weeks2 = getWeeks(months2);
      const days2 = getDays(months2);
      const previousMonth2 = getPreviousMonth(firstMonth, navStart, props, dateLib);
      const nextMonth2 = getNextMonth(firstMonth, navEnd, props, dateLib);
      return {
        months: months2,
        weeks: weeks2,
        days: days2,
        previousMonth: previousMonth2,
        nextMonth: nextMonth2
      };
    }, [
      dateLib,
      firstMonth.getTime(),
      navEnd?.getTime(),
      navStart?.getTime(),
      props.disableNavigation,
      props.broadcastCalendar,
      props.endMonth?.getTime(),
      props.fixedWeeks,
      props.ISOWeek,
      props.numberOfMonths,
      props.pagedNavigation,
      props.reverseMonths
    ]);
    const { disableNavigation, onMonthChange } = props;
    const isDayInCalendar = (day) => weeks.some((week) => week.days.some((d) => d.isEqualTo(day)));
    const goToMonth = (date) => {
      if (disableNavigation) {
        return;
      }
      let newMonth = startOfMonth2(date);
      if (navStart && newMonth < startOfMonth2(navStart)) {
        newMonth = startOfMonth2(navStart);
      }
      if (navEnd && newMonth > startOfMonth2(navEnd)) {
        newMonth = startOfMonth2(navEnd);
      }
      setFirstMonth(newMonth);
      onMonthChange?.(newMonth);
    };
    const goToDay = (day) => {
      if (isDayInCalendar(day)) {
        return;
      }
      goToMonth(day.date);
    };
    const calendar = {
      months,
      weeks,
      days,
      navStart,
      navEnd,
      previousMonth,
      nextMonth,
      goToMonth,
      goToDay
    };
    return calendar;
  }

  // node_modules/react-day-picker/dist/esm/useFocus.js
  init_define_import_meta_env();
  var import_react36 = __toESM(require_react_shim());

  // node_modules/react-day-picker/dist/esm/helpers/calculateFocusTarget.js
  init_define_import_meta_env();
  var FocusTargetPriority;
  (function(FocusTargetPriority2) {
    FocusTargetPriority2[FocusTargetPriority2["Today"] = 0] = "Today";
    FocusTargetPriority2[FocusTargetPriority2["Selected"] = 1] = "Selected";
    FocusTargetPriority2[FocusTargetPriority2["LastFocused"] = 2] = "LastFocused";
    FocusTargetPriority2[FocusTargetPriority2["FocusedModifier"] = 3] = "FocusedModifier";
  })(FocusTargetPriority || (FocusTargetPriority = {}));
  function isFocusableDay(modifiers) {
    return !modifiers[DayFlag.disabled] && !modifiers[DayFlag.hidden] && !modifiers[DayFlag.outside];
  }
  function calculateFocusTarget(days, getModifiers, isSelected, lastFocused) {
    let focusTarget;
    let foundFocusTargetPriority = -1;
    for (const day of days) {
      const modifiers = getModifiers(day);
      if (isFocusableDay(modifiers)) {
        if (modifiers[DayFlag.focused] && foundFocusTargetPriority < FocusTargetPriority.FocusedModifier) {
          focusTarget = day;
          foundFocusTargetPriority = FocusTargetPriority.FocusedModifier;
        } else if (lastFocused?.isEqualTo(day) && foundFocusTargetPriority < FocusTargetPriority.LastFocused) {
          focusTarget = day;
          foundFocusTargetPriority = FocusTargetPriority.LastFocused;
        } else if (isSelected(day.date) && foundFocusTargetPriority < FocusTargetPriority.Selected) {
          focusTarget = day;
          foundFocusTargetPriority = FocusTargetPriority.Selected;
        } else if (modifiers[DayFlag.today] && foundFocusTargetPriority < FocusTargetPriority.Today) {
          focusTarget = day;
          foundFocusTargetPriority = FocusTargetPriority.Today;
        }
      }
    }
    if (!focusTarget) {
      focusTarget = days.find((day) => isFocusableDay(getModifiers(day)));
    }
    return focusTarget;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getNextFocus.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/helpers/getFocusableDate.js
  init_define_import_meta_env();
  function getFocusableDate(moveBy, moveDir, refDate, navStart, navEnd, props, dateLib) {
    const { ISOWeek, broadcastCalendar } = props;
    const { addDays: addDays2, addMonths: addMonths2, addWeeks: addWeeks2, addYears: addYears2, endOfBroadcastWeek: endOfBroadcastWeek2, endOfISOWeek: endOfISOWeek2, endOfWeek: endOfWeek2, max: max3, min: min3, startOfBroadcastWeek: startOfBroadcastWeek2, startOfISOWeek: startOfISOWeek2, startOfWeek: startOfWeek2 } = dateLib;
    const moveFns = {
      day: addDays2,
      week: addWeeks2,
      month: addMonths2,
      year: addYears2,
      startOfWeek: (date) => broadcastCalendar ? startOfBroadcastWeek2(date, dateLib) : ISOWeek ? startOfISOWeek2(date) : startOfWeek2(date),
      endOfWeek: (date) => broadcastCalendar ? endOfBroadcastWeek2(date) : ISOWeek ? endOfISOWeek2(date) : endOfWeek2(date)
    };
    let focusableDate = moveFns[moveBy](refDate, moveDir === "after" ? 1 : -1);
    if (moveDir === "before" && navStart) {
      focusableDate = max3([navStart, focusableDate]);
    } else if (moveDir === "after" && navEnd) {
      focusableDate = min3([navEnd, focusableDate]);
    }
    return focusableDate;
  }

  // node_modules/react-day-picker/dist/esm/helpers/getNextFocus.js
  function getNextFocus(moveBy, moveDir, refDay, calendarStartMonth, calendarEndMonth, props, dateLib, attempt = 0) {
    if (attempt > 365) {
      return void 0;
    }
    const focusableDate = getFocusableDate(moveBy, moveDir, refDay.date, calendarStartMonth, calendarEndMonth, props, dateLib);
    const isDisabled = Boolean(props.disabled && dateMatchModifiers(focusableDate, props.disabled, dateLib));
    const isHidden2 = Boolean(props.hidden && dateMatchModifiers(focusableDate, props.hidden, dateLib));
    const targetMonth = focusableDate;
    const focusDay = new CalendarDay(focusableDate, targetMonth, dateLib);
    if (!isDisabled && !isHidden2) {
      return focusDay;
    }
    return getNextFocus(moveBy, moveDir, focusDay, calendarStartMonth, calendarEndMonth, props, dateLib, attempt + 1);
  }

  // node_modules/react-day-picker/dist/esm/useFocus.js
  function useFocus(props, calendar, getModifiers, isSelected, dateLib) {
    const { autoFocus } = props;
    const [lastFocused, setLastFocused] = (0, import_react36.useState)();
    const focusTarget = calculateFocusTarget(calendar.days, getModifiers, isSelected || (() => false), lastFocused);
    const [focusedDay, setFocused] = (0, import_react36.useState)(autoFocus ? focusTarget : void 0);
    const blur = () => {
      setLastFocused(focusedDay);
      setFocused(void 0);
    };
    const moveFocus = (moveBy, moveDir) => {
      if (!focusedDay)
        return;
      const nextFocus = getNextFocus(moveBy, moveDir, focusedDay, calendar.navStart, calendar.navEnd, props, dateLib);
      if (!nextFocus)
        return;
      if (props.disableNavigation) {
        const isNextInCalendar = calendar.days.some((day) => day.isEqualTo(nextFocus));
        if (!isNextInCalendar) {
          return;
        }
      }
      calendar.goToDay(nextFocus);
      setFocused(nextFocus);
    };
    const isFocusTarget = (day) => {
      return Boolean(focusTarget?.isEqualTo(day));
    };
    const useFocus2 = {
      isFocusTarget,
      setFocused,
      focused: focusedDay,
      blur,
      moveFocus
    };
    return useFocus2;
  }

  // node_modules/react-day-picker/dist/esm/useSelection.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/selection/useMulti.js
  init_define_import_meta_env();
  function useMulti(props, dateLib) {
    const { selected: initiallySelected, required, onSelect } = props;
    const [internallySelected, setSelected] = useControlledValue(initiallySelected, onSelect ? initiallySelected : void 0);
    const selected = !onSelect ? internallySelected : initiallySelected;
    const { isSameDay: isSameDay2 } = dateLib;
    const isSelected = (date) => {
      return selected?.some((d) => isSameDay2(d, date)) ?? false;
    };
    const { min: min3, max: max3 } = props;
    const select = (triggerDate, modifiers, e) => {
      let newDates = [...selected ?? []];
      if (isSelected(triggerDate)) {
        if (selected?.length === min3) {
          return;
        }
        if (required && selected?.length === 1) {
          return;
        }
        newDates = selected?.filter((d) => !isSameDay2(d, triggerDate));
      } else {
        if (selected?.length === max3) {
          newDates = [triggerDate];
        } else {
          newDates = [...newDates, triggerDate];
        }
      }
      if (!onSelect) {
        setSelected(newDates);
      }
      onSelect?.(newDates, triggerDate, modifiers, e);
      return newDates;
    };
    return {
      selected,
      select,
      isSelected
    };
  }

  // node_modules/react-day-picker/dist/esm/selection/useRange.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/utils/addToRange.js
  init_define_import_meta_env();
  function addToRange(date, initialRange, min3 = 0, max3 = 0, required = false, dateLib = defaultDateLib) {
    const { from, to } = initialRange || {};
    const { isSameDay: isSameDay2, isAfter: isAfter2, isBefore: isBefore2 } = dateLib;
    let range;
    if (!from && !to) {
      range = { from: date, to: min3 > 0 ? void 0 : date };
    } else if (from && !to) {
      if (isSameDay2(from, date)) {
        if (min3 === 0) {
          range = { from, to: date };
        } else if (required) {
          range = { from, to: void 0 };
        } else {
          range = void 0;
        }
      } else if (isBefore2(date, from)) {
        range = { from: date, to: from };
      } else {
        range = { from, to: date };
      }
    } else if (from && to) {
      if (isSameDay2(from, date) && isSameDay2(to, date)) {
        if (required) {
          range = { from, to };
        } else {
          range = void 0;
        }
      } else if (isSameDay2(from, date)) {
        range = { from, to: min3 > 0 ? void 0 : date };
      } else if (isSameDay2(to, date)) {
        range = { from: date, to: min3 > 0 ? void 0 : date };
      } else if (isBefore2(date, from)) {
        range = { from: date, to };
      } else if (isAfter2(date, from)) {
        range = { from, to: date };
      } else if (isAfter2(date, to)) {
        range = { from, to: date };
      } else {
        throw new Error("Invalid range");
      }
    }
    if (range?.from && range?.to) {
      const diff = dateLib.differenceInCalendarDays(range.to, range.from);
      if (max3 > 0 && diff > max3) {
        range = { from: date, to: void 0 };
      } else if (min3 > 1 && diff < min3) {
        range = { from: date, to: void 0 };
      }
    }
    return range;
  }

  // node_modules/react-day-picker/dist/esm/utils/rangeContainsDayOfWeek.js
  init_define_import_meta_env();
  function rangeContainsDayOfWeek(range, dayOfWeek, dateLib = defaultDateLib) {
    const dayOfWeekArr = !Array.isArray(dayOfWeek) ? [dayOfWeek] : dayOfWeek;
    let date = range.from;
    const totalDays = dateLib.differenceInCalendarDays(range.to, range.from);
    const totalDaysLimit = Math.min(totalDays, 6);
    for (let i = 0; i <= totalDaysLimit; i++) {
      if (dayOfWeekArr.includes(date.getDay())) {
        return true;
      }
      date = dateLib.addDays(date, 1);
    }
    return false;
  }

  // node_modules/react-day-picker/dist/esm/utils/rangeContainsModifiers.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/utils/rangeOverlaps.js
  init_define_import_meta_env();
  function rangeOverlaps(rangeLeft, rangeRight, dateLib = defaultDateLib) {
    return rangeIncludesDate(rangeLeft, rangeRight.from, false, dateLib) || rangeIncludesDate(rangeLeft, rangeRight.to, false, dateLib) || rangeIncludesDate(rangeRight, rangeLeft.from, false, dateLib) || rangeIncludesDate(rangeRight, rangeLeft.to, false, dateLib);
  }

  // node_modules/react-day-picker/dist/esm/utils/rangeContainsModifiers.js
  function rangeContainsModifiers(range, modifiers, dateLib = defaultDateLib) {
    const matchers = Array.isArray(modifiers) ? modifiers : [modifiers];
    const nonFunctionMatchers = matchers.filter((matcher) => typeof matcher !== "function");
    const nonFunctionMatchersResult = nonFunctionMatchers.some((matcher) => {
      if (typeof matcher === "boolean")
        return matcher;
      if (dateLib.isDate(matcher)) {
        return rangeIncludesDate(range, matcher, false, dateLib);
      }
      if (isDatesArray(matcher, dateLib)) {
        return matcher.some((date) => rangeIncludesDate(range, date, false, dateLib));
      }
      if (isDateRange(matcher)) {
        if (matcher.from && matcher.to) {
          return rangeOverlaps(range, { from: matcher.from, to: matcher.to }, dateLib);
        }
        return false;
      }
      if (isDayOfWeekType(matcher)) {
        return rangeContainsDayOfWeek(range, matcher.dayOfWeek, dateLib);
      }
      if (isDateInterval(matcher)) {
        const isClosedInterval = dateLib.isAfter(matcher.before, matcher.after);
        if (isClosedInterval) {
          return rangeOverlaps(range, {
            from: dateLib.addDays(matcher.after, 1),
            to: dateLib.addDays(matcher.before, -1)
          }, dateLib);
        }
        return dateMatchModifiers(range.from, matcher, dateLib) || dateMatchModifiers(range.to, matcher, dateLib);
      }
      if (isDateAfterType(matcher) || isDateBeforeType(matcher)) {
        return dateMatchModifiers(range.from, matcher, dateLib) || dateMatchModifiers(range.to, matcher, dateLib);
      }
      return false;
    });
    if (nonFunctionMatchersResult) {
      return true;
    }
    const functionMatchers = matchers.filter((matcher) => typeof matcher === "function");
    if (functionMatchers.length) {
      let date = range.from;
      const totalDays = dateLib.differenceInCalendarDays(range.to, range.from);
      for (let i = 0; i <= totalDays; i++) {
        if (functionMatchers.some((matcher) => matcher(date))) {
          return true;
        }
        date = dateLib.addDays(date, 1);
      }
    }
    return false;
  }

  // node_modules/react-day-picker/dist/esm/selection/useRange.js
  function useRange(props, dateLib) {
    const { disabled, excludeDisabled, selected: initiallySelected, required, onSelect } = props;
    const [internallySelected, setSelected] = useControlledValue(initiallySelected, onSelect ? initiallySelected : void 0);
    const selected = !onSelect ? internallySelected : initiallySelected;
    const isSelected = (date) => selected && rangeIncludesDate(selected, date, false, dateLib);
    const select = (triggerDate, modifiers, e) => {
      const { min: min3, max: max3 } = props;
      const newRange = triggerDate ? addToRange(triggerDate, selected, min3, max3, required, dateLib) : void 0;
      if (excludeDisabled && disabled && newRange?.from && newRange.to) {
        if (rangeContainsModifiers({ from: newRange.from, to: newRange.to }, disabled, dateLib)) {
          newRange.from = triggerDate;
          newRange.to = void 0;
        }
      }
      if (!onSelect) {
        setSelected(newRange);
      }
      onSelect?.(newRange, triggerDate, modifiers, e);
      return newRange;
    };
    return {
      selected,
      select,
      isSelected
    };
  }

  // node_modules/react-day-picker/dist/esm/selection/useSingle.js
  init_define_import_meta_env();
  function useSingle(props, dateLib) {
    const { selected: initiallySelected, required, onSelect } = props;
    const [internallySelected, setSelected] = useControlledValue(initiallySelected, onSelect ? initiallySelected : void 0);
    const selected = !onSelect ? internallySelected : initiallySelected;
    const { isSameDay: isSameDay2 } = dateLib;
    const isSelected = (compareDate) => {
      return selected ? isSameDay2(selected, compareDate) : false;
    };
    const select = (triggerDate, modifiers, e) => {
      let newDate = triggerDate;
      if (!required && selected && selected && isSameDay2(triggerDate, selected)) {
        newDate = void 0;
      }
      if (!onSelect) {
        setSelected(newDate);
      }
      if (required) {
        onSelect?.(newDate, triggerDate, modifiers, e);
      } else {
        onSelect?.(newDate, triggerDate, modifiers, e);
      }
      return newDate;
    };
    return {
      selected,
      select,
      isSelected
    };
  }

  // node_modules/react-day-picker/dist/esm/useSelection.js
  function useSelection(props, dateLib) {
    const single = useSingle(props, dateLib);
    const multi = useMulti(props, dateLib);
    const range = useRange(props, dateLib);
    switch (props.mode) {
      case "single":
        return single;
      case "multiple":
        return multi;
      case "range":
        return range;
      default:
        return void 0;
    }
  }

  // node_modules/react-day-picker/dist/esm/utils/convertMatchersToTimeZone.js
  init_define_import_meta_env();

  // node_modules/react-day-picker/dist/esm/utils/toTimeZone.js
  init_define_import_meta_env();
  function toTimeZone(date, timeZone) {
    if (date instanceof TZDate && date.timeZone === timeZone) {
      return date;
    }
    return new TZDate(date, timeZone);
  }

  // node_modules/react-day-picker/dist/esm/utils/convertMatchersToTimeZone.js
  function toZoneNoon(date, timeZone, noonSafe) {
    if (!noonSafe)
      return toTimeZone(date, timeZone);
    const zoned = toTimeZone(date, timeZone);
    const noonZoned = new TZDate(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), 12, 0, 0, timeZone);
    return new Date(noonZoned.getTime());
  }
  function convertMatcher(matcher, timeZone, noonSafe) {
    if (typeof matcher === "boolean" || typeof matcher === "function") {
      return matcher;
    }
    if (matcher instanceof Date) {
      return toZoneNoon(matcher, timeZone, noonSafe);
    }
    if (Array.isArray(matcher)) {
      return matcher.map((value) => value instanceof Date ? toZoneNoon(value, timeZone, noonSafe) : value);
    }
    if (isDateRange(matcher)) {
      return {
        ...matcher,
        from: matcher.from ? toTimeZone(matcher.from, timeZone) : matcher.from,
        to: matcher.to ? toTimeZone(matcher.to, timeZone) : matcher.to
      };
    }
    if (isDateInterval(matcher)) {
      return {
        before: toZoneNoon(matcher.before, timeZone, noonSafe),
        after: toZoneNoon(matcher.after, timeZone, noonSafe)
      };
    }
    if (isDateAfterType(matcher)) {
      return {
        after: toZoneNoon(matcher.after, timeZone, noonSafe)
      };
    }
    if (isDateBeforeType(matcher)) {
      return {
        before: toZoneNoon(matcher.before, timeZone, noonSafe)
      };
    }
    return matcher;
  }
  function convertMatchersToTimeZone(matchers, timeZone, noonSafe) {
    if (!matchers) {
      return matchers;
    }
    if (Array.isArray(matchers)) {
      return matchers.map((matcher) => convertMatcher(matcher, timeZone, noonSafe));
    }
    return convertMatcher(matchers, timeZone, noonSafe);
  }

  // node_modules/react-day-picker/dist/esm/DayPicker.js
  function DayPicker(initialProps) {
    let props = initialProps;
    const timeZone = props.timeZone;
    if (timeZone) {
      props = {
        ...initialProps,
        timeZone
      };
      if (props.today) {
        props.today = toTimeZone(props.today, timeZone);
      }
      if (props.month) {
        props.month = toTimeZone(props.month, timeZone);
      }
      if (props.defaultMonth) {
        props.defaultMonth = toTimeZone(props.defaultMonth, timeZone);
      }
      if (props.startMonth) {
        props.startMonth = toTimeZone(props.startMonth, timeZone);
      }
      if (props.endMonth) {
        props.endMonth = toTimeZone(props.endMonth, timeZone);
      }
      if (props.mode === "single" && props.selected) {
        props.selected = toTimeZone(props.selected, timeZone);
      } else if (props.mode === "multiple" && props.selected) {
        props.selected = props.selected?.map((date) => toTimeZone(date, timeZone));
      } else if (props.mode === "range" && props.selected) {
        props.selected = {
          from: props.selected.from ? toTimeZone(props.selected.from, timeZone) : props.selected.from,
          to: props.selected.to ? toTimeZone(props.selected.to, timeZone) : props.selected.to
        };
      }
      if (props.disabled !== void 0) {
        props.disabled = convertMatchersToTimeZone(props.disabled, timeZone);
      }
      if (props.hidden !== void 0) {
        props.hidden = convertMatchersToTimeZone(props.hidden, timeZone);
      }
      if (props.modifiers) {
        const nextModifiers = {};
        Object.keys(props.modifiers).forEach((key) => {
          nextModifiers[key] = convertMatchersToTimeZone(props.modifiers?.[key], timeZone);
        });
        props.modifiers = nextModifiers;
      }
    }
    const { components, formatters: formatters2, labels, dateLib, locale, classNames } = (0, import_react37.useMemo)(() => {
      const locale2 = { ...enUS2, ...props.locale };
      const weekStartsOn = props.broadcastCalendar ? 1 : props.weekStartsOn;
      const noonOverrides = props.noonSafe && props.timeZone ? createNoonOverrides(props.timeZone, {
        weekStartsOn,
        locale: locale2
      }) : void 0;
      const overrides = props.dateLib && noonOverrides ? { ...noonOverrides, ...props.dateLib } : props.dateLib ?? noonOverrides;
      const dateLib2 = new DateLib({
        locale: locale2,
        weekStartsOn,
        firstWeekContainsDate: props.firstWeekContainsDate,
        useAdditionalWeekYearTokens: props.useAdditionalWeekYearTokens,
        useAdditionalDayOfYearTokens: props.useAdditionalDayOfYearTokens,
        timeZone: props.timeZone,
        numerals: props.numerals
      }, overrides);
      return {
        dateLib: dateLib2,
        components: getComponents(props.components),
        formatters: getFormatters(props.formatters),
        labels: getLabels(props.labels, dateLib2.options),
        locale: locale2,
        classNames: { ...getDefaultClassNames(), ...props.classNames }
      };
    }, [
      props.locale,
      props.broadcastCalendar,
      props.weekStartsOn,
      props.firstWeekContainsDate,
      props.useAdditionalWeekYearTokens,
      props.useAdditionalDayOfYearTokens,
      props.timeZone,
      props.numerals,
      props.dateLib,
      props.noonSafe,
      props.components,
      props.formatters,
      props.labels,
      props.classNames
    ]);
    if (!props.today) {
      props = { ...props, today: dateLib.today() };
    }
    const { captionLayout, mode, navLayout, numberOfMonths = 1, onDayBlur, onDayClick, onDayFocus, onDayKeyDown, onDayMouseEnter, onDayMouseLeave, onNextClick, onPrevClick, showWeekNumber, styles } = props;
    const { formatCaption: formatCaption2, formatDay: formatDay2, formatMonthDropdown: formatMonthDropdown2, formatWeekNumber: formatWeekNumber2, formatWeekNumberHeader: formatWeekNumberHeader2, formatWeekdayName: formatWeekdayName2, formatYearDropdown: formatYearDropdown2 } = formatters2;
    const calendar = useCalendar(props, dateLib);
    const { days, months, navStart, navEnd, previousMonth, nextMonth, goToMonth } = calendar;
    const getModifiers = createGetModifiers(days, props, navStart, navEnd, dateLib);
    const { isSelected, select, selected: selectedValue } = useSelection(props, dateLib) ?? {};
    const { blur, focused, isFocusTarget, moveFocus, setFocused } = useFocus(props, calendar, getModifiers, isSelected ?? (() => false), dateLib);
    const { labelDayButton: labelDayButton2, labelGridcell: labelGridcell2, labelGrid: labelGrid2, labelMonthDropdown: labelMonthDropdown2, labelNav: labelNav2, labelPrevious: labelPrevious2, labelNext: labelNext2, labelWeekday: labelWeekday2, labelWeekNumber: labelWeekNumber2, labelWeekNumberHeader: labelWeekNumberHeader2, labelYearDropdown: labelYearDropdown2 } = labels;
    const weekdays = (0, import_react37.useMemo)(() => getWeekdays(dateLib, props.ISOWeek, props.broadcastCalendar, props.today), [dateLib, props.ISOWeek, props.broadcastCalendar, props.today]);
    const isInteractive = mode !== void 0 || onDayClick !== void 0;
    const handlePreviousClick = (0, import_react37.useCallback)(() => {
      if (!previousMonth)
        return;
      goToMonth(previousMonth);
      onPrevClick?.(previousMonth);
    }, [previousMonth, goToMonth, onPrevClick]);
    const handleNextClick = (0, import_react37.useCallback)(() => {
      if (!nextMonth)
        return;
      goToMonth(nextMonth);
      onNextClick?.(nextMonth);
    }, [goToMonth, nextMonth, onNextClick]);
    const handleDayClick = (0, import_react37.useCallback)((day, m2) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      setFocused(day);
      if (m2.disabled) {
        return;
      }
      select?.(day.date, m2, e);
      onDayClick?.(day.date, m2, e);
    }, [select, onDayClick, setFocused]);
    const handleDayFocus = (0, import_react37.useCallback)((day, m2) => (e) => {
      setFocused(day);
      onDayFocus?.(day.date, m2, e);
    }, [onDayFocus, setFocused]);
    const handleDayBlur = (0, import_react37.useCallback)((day, m2) => (e) => {
      blur();
      onDayBlur?.(day.date, m2, e);
    }, [blur, onDayBlur]);
    const handleDayKeyDown = (0, import_react37.useCallback)((day, modifiers) => (e) => {
      const keyMap = {
        ArrowLeft: [
          e.shiftKey ? "month" : "day",
          props.dir === "rtl" ? "after" : "before"
        ],
        ArrowRight: [
          e.shiftKey ? "month" : "day",
          props.dir === "rtl" ? "before" : "after"
        ],
        ArrowDown: [e.shiftKey ? "year" : "week", "after"],
        ArrowUp: [e.shiftKey ? "year" : "week", "before"],
        PageUp: [e.shiftKey ? "year" : "month", "before"],
        PageDown: [e.shiftKey ? "year" : "month", "after"],
        Home: ["startOfWeek", "before"],
        End: ["endOfWeek", "after"]
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        const [moveBy, moveDir] = keyMap[e.key];
        moveFocus(moveBy, moveDir);
      }
      onDayKeyDown?.(day.date, modifiers, e);
    }, [moveFocus, onDayKeyDown, props.dir]);
    const handleDayMouseEnter = (0, import_react37.useCallback)((day, modifiers) => (e) => {
      onDayMouseEnter?.(day.date, modifiers, e);
    }, [onDayMouseEnter]);
    const handleDayMouseLeave = (0, import_react37.useCallback)((day, modifiers) => (e) => {
      onDayMouseLeave?.(day.date, modifiers, e);
    }, [onDayMouseLeave]);
    const handleMonthChange = (0, import_react37.useCallback)((date) => (e) => {
      const selectedMonth = Number(e.target.value);
      const month = dateLib.setMonth(dateLib.startOfMonth(date), selectedMonth);
      goToMonth(month);
    }, [dateLib, goToMonth]);
    const handleYearChange = (0, import_react37.useCallback)((date) => (e) => {
      const selectedYear = Number(e.target.value);
      const month = dateLib.setYear(dateLib.startOfMonth(date), selectedYear);
      goToMonth(month);
    }, [dateLib, goToMonth]);
    const { className, style } = (0, import_react37.useMemo)(() => ({
      className: [classNames[UI.Root], props.className].filter(Boolean).join(" "),
      style: { ...styles?.[UI.Root], ...props.style }
    }), [classNames, props.className, props.style, styles]);
    const dataAttributes = getDataAttributes(props);
    const rootElRef = (0, import_react37.useRef)(null);
    useAnimation(rootElRef, Boolean(props.animate), {
      classNames,
      months,
      focused,
      dateLib
    });
    const contextValue = {
      dayPickerProps: props,
      selected: selectedValue,
      select,
      isSelected,
      months,
      nextMonth,
      previousMonth,
      goToMonth,
      getModifiers,
      components,
      classNames,
      styles,
      labels,
      formatters: formatters2
    };
    return import_react37.default.createElement(
      dayPickerContext.Provider,
      { value: contextValue },
      import_react37.default.createElement(
        components.Root,
        { rootRef: props.animate ? rootElRef : void 0, className, style, dir: props.dir, id: props.id, lang: props.lang, nonce: props.nonce, title: props.title, role: props.role, "aria-label": props["aria-label"], "aria-labelledby": props["aria-labelledby"], ...dataAttributes },
        import_react37.default.createElement(
          components.Months,
          { className: classNames[UI.Months], style: styles?.[UI.Months] },
          !props.hideNavigation && !navLayout && import_react37.default.createElement(components.Nav, { "data-animated-nav": props.animate ? "true" : void 0, className: classNames[UI.Nav], style: styles?.[UI.Nav], "aria-label": labelNav2(), onPreviousClick: handlePreviousClick, onNextClick: handleNextClick, previousMonth, nextMonth }),
          months.map((calendarMonth, displayIndex) => {
            return import_react37.default.createElement(
              components.Month,
              {
                "data-animated-month": props.animate ? "true" : void 0,
                className: classNames[UI.Month],
                style: styles?.[UI.Month],
                // biome-ignore lint/suspicious/noArrayIndexKey: breaks animation
                key: displayIndex,
                displayIndex,
                calendarMonth
              },
              navLayout === "around" && !props.hideNavigation && displayIndex === 0 && import_react37.default.createElement(
                components.PreviousMonthButton,
                { type: "button", className: classNames[UI.PreviousMonthButton], tabIndex: previousMonth ? void 0 : -1, "aria-disabled": previousMonth ? void 0 : true, "aria-label": labelPrevious2(previousMonth), onClick: handlePreviousClick, "data-animated-button": props.animate ? "true" : void 0 },
                import_react37.default.createElement(components.Chevron, { disabled: previousMonth ? void 0 : true, className: classNames[UI.Chevron], orientation: props.dir === "rtl" ? "right" : "left" })
              ),
              import_react37.default.createElement(components.MonthCaption, { "data-animated-caption": props.animate ? "true" : void 0, className: classNames[UI.MonthCaption], style: styles?.[UI.MonthCaption], calendarMonth, displayIndex }, captionLayout?.startsWith("dropdown") ? import_react37.default.createElement(
                components.DropdownNav,
                { className: classNames[UI.Dropdowns], style: styles?.[UI.Dropdowns] },
                (() => {
                  const monthControl = captionLayout === "dropdown" || captionLayout === "dropdown-months" ? import_react37.default.createElement(components.MonthsDropdown, { key: "month", className: classNames[UI.MonthsDropdown], "aria-label": labelMonthDropdown2(), classNames, components, disabled: Boolean(props.disableNavigation), onChange: handleMonthChange(calendarMonth.date), options: getMonthOptions(calendarMonth.date, navStart, navEnd, formatters2, dateLib), style: styles?.[UI.Dropdown], value: dateLib.getMonth(calendarMonth.date) }) : import_react37.default.createElement("span", { key: "month" }, formatMonthDropdown2(calendarMonth.date, dateLib));
                  const yearControl = captionLayout === "dropdown" || captionLayout === "dropdown-years" ? import_react37.default.createElement(components.YearsDropdown, { key: "year", className: classNames[UI.YearsDropdown], "aria-label": labelYearDropdown2(dateLib.options), classNames, components, disabled: Boolean(props.disableNavigation), onChange: handleYearChange(calendarMonth.date), options: getYearOptions(navStart, navEnd, formatters2, dateLib, Boolean(props.reverseYears)), style: styles?.[UI.Dropdown], value: dateLib.getYear(calendarMonth.date) }) : import_react37.default.createElement("span", { key: "year" }, formatYearDropdown2(calendarMonth.date, dateLib));
                  const controls = dateLib.getMonthYearOrder() === "year-first" ? [yearControl, monthControl] : [monthControl, yearControl];
                  return controls;
                })(),
                import_react37.default.createElement("span", { role: "status", "aria-live": "polite", style: {
                  border: 0,
                  clip: "rect(0 0 0 0)",
                  height: "1px",
                  margin: "-1px",
                  overflow: "hidden",
                  padding: 0,
                  position: "absolute",
                  width: "1px",
                  whiteSpace: "nowrap",
                  wordWrap: "normal"
                } }, formatCaption2(calendarMonth.date, dateLib.options, dateLib))
              ) : import_react37.default.createElement(components.CaptionLabel, { className: classNames[UI.CaptionLabel], role: "status", "aria-live": "polite" }, formatCaption2(calendarMonth.date, dateLib.options, dateLib))),
              navLayout === "around" && !props.hideNavigation && displayIndex === numberOfMonths - 1 && import_react37.default.createElement(
                components.NextMonthButton,
                { type: "button", className: classNames[UI.NextMonthButton], tabIndex: nextMonth ? void 0 : -1, "aria-disabled": nextMonth ? void 0 : true, "aria-label": labelNext2(nextMonth), onClick: handleNextClick, "data-animated-button": props.animate ? "true" : void 0 },
                import_react37.default.createElement(components.Chevron, { disabled: nextMonth ? void 0 : true, className: classNames[UI.Chevron], orientation: props.dir === "rtl" ? "left" : "right" })
              ),
              displayIndex === numberOfMonths - 1 && navLayout === "after" && !props.hideNavigation && import_react37.default.createElement(components.Nav, { "data-animated-nav": props.animate ? "true" : void 0, className: classNames[UI.Nav], style: styles?.[UI.Nav], "aria-label": labelNav2(), onPreviousClick: handlePreviousClick, onNextClick: handleNextClick, previousMonth, nextMonth }),
              import_react37.default.createElement(
                components.MonthGrid,
                { role: "grid", "aria-multiselectable": mode === "multiple" || mode === "range", "aria-label": labelGrid2(calendarMonth.date, dateLib.options, dateLib) || void 0, className: classNames[UI.MonthGrid], style: styles?.[UI.MonthGrid] },
                !props.hideWeekdays && import_react37.default.createElement(
                  components.Weekdays,
                  { "data-animated-weekdays": props.animate ? "true" : void 0, className: classNames[UI.Weekdays], style: styles?.[UI.Weekdays] },
                  showWeekNumber && import_react37.default.createElement(components.WeekNumberHeader, { "aria-label": labelWeekNumberHeader2(dateLib.options), className: classNames[UI.WeekNumberHeader], style: styles?.[UI.WeekNumberHeader], scope: "col" }, formatWeekNumberHeader2()),
                  weekdays.map((weekday) => import_react37.default.createElement(components.Weekday, { "aria-label": labelWeekday2(weekday, dateLib.options, dateLib), className: classNames[UI.Weekday], key: String(weekday), style: styles?.[UI.Weekday], scope: "col" }, formatWeekdayName2(weekday, dateLib.options, dateLib)))
                ),
                import_react37.default.createElement(components.Weeks, { "data-animated-weeks": props.animate ? "true" : void 0, className: classNames[UI.Weeks], style: styles?.[UI.Weeks] }, calendarMonth.weeks.map((week) => {
                  return import_react37.default.createElement(
                    components.Week,
                    { className: classNames[UI.Week], key: week.weekNumber, style: styles?.[UI.Week], week },
                    showWeekNumber && import_react37.default.createElement(components.WeekNumber, { week, style: styles?.[UI.WeekNumber], "aria-label": labelWeekNumber2(week.weekNumber, {
                      locale
                    }), className: classNames[UI.WeekNumber], scope: "row", role: "rowheader" }, formatWeekNumber2(week.weekNumber, dateLib)),
                    week.days.map((day) => {
                      const { date } = day;
                      const modifiers = getModifiers(day);
                      modifiers[DayFlag.focused] = !modifiers.hidden && Boolean(focused?.isEqualTo(day));
                      modifiers[SelectionState.selected] = isSelected?.(date) || modifiers.selected;
                      if (isDateRange(selectedValue)) {
                        const { from, to } = selectedValue;
                        modifiers[SelectionState.range_start] = Boolean(from && to && dateLib.isSameDay(date, from));
                        modifiers[SelectionState.range_end] = Boolean(from && to && dateLib.isSameDay(date, to));
                        modifiers[SelectionState.range_middle] = rangeIncludesDate(selectedValue, date, true, dateLib);
                      }
                      const style2 = getStyleForModifiers(modifiers, styles, props.modifiersStyles);
                      const className2 = getClassNamesForModifiers(modifiers, classNames, props.modifiersClassNames);
                      const ariaLabel = !isInteractive && !modifiers.hidden ? labelGridcell2(date, modifiers, dateLib.options, dateLib) : void 0;
                      return import_react37.default.createElement(components.Day, { key: `${day.isoDate}_${day.displayMonthId}`, day, modifiers, className: className2.join(" "), style: style2, role: "gridcell", "aria-selected": modifiers.selected || void 0, "aria-label": ariaLabel, "data-day": day.isoDate, "data-month": day.outside ? day.dateMonthId : void 0, "data-selected": modifiers.selected || void 0, "data-disabled": modifiers.disabled || void 0, "data-hidden": modifiers.hidden || void 0, "data-outside": day.outside || void 0, "data-focused": modifiers.focused || void 0, "data-today": modifiers.today || void 0 }, !modifiers.hidden && isInteractive ? import_react37.default.createElement(components.DayButton, { className: classNames[UI.DayButton], style: styles?.[UI.DayButton], type: "button", day, modifiers, disabled: !modifiers.focused && modifiers.disabled || void 0, "aria-disabled": modifiers.focused && modifiers.disabled || void 0, tabIndex: isFocusTarget(day) ? 0 : -1, "aria-label": labelDayButton2(date, modifiers, dateLib.options, dateLib), onClick: handleDayClick(day, modifiers), onBlur: handleDayBlur(day, modifiers), onFocus: handleDayFocus(day, modifiers), onKeyDown: handleDayKeyDown(day, modifiers), onMouseEnter: handleDayMouseEnter(day, modifiers), onMouseLeave: handleDayMouseLeave(day, modifiers) }, formatDay2(date, dateLib.options, dateLib)) : !modifiers.hidden && formatDay2(day.date, dateLib.options, dateLib));
                    })
                  );
                }))
              )
            );
          })
        ),
        props.footer && import_react37.default.createElement(components.Footer, { className: classNames[UI.Footer], style: styles?.[UI.Footer], role: "status", "aria-live": "polite" }, props.footer)
      )
    );
  }

  // src/components/ui/button.tsx
  init_define_import_meta_env();
  var import_jsx_runtime16 = __toESM(require_react_shim());
  var buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
      variants: {
        variant: {
          default: "bg-primary text-white shadow-xs hover:bg-primary-dark/90",
          destructive: "bg-green text-white shadow-xs hover:bg-green-light/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
          outline: "border border-black bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-neutral-light dark:border-input dark:hover:bg-input/50",
          secondary: "bg-secondary text-black shadow-xs hover:bg-secondary-extradark/80",
          ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
          link: "text-primary underline-offset-4 hover:underline",
          animated: "bg-primary text-white shadow-xs button-animated",
          animatedGhost: "transition-all duration-300 hover:[transform:translateY(-.315rem)]"
        },
        size: {
          default: "h-9 px-4 py-2 has-[>svg]:px-3",
          sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
          lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
          icon: "size-9"
        }
      },
      defaultVariants: {
        variant: "default",
        size: "default"
      }
    }
  );
  function Button2({
    className,
    variant,
    size: size4,
    asChild = false,
    ...props
  }) {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      Comp,
      {
        "data-slot": "button",
        className: cn(buttonVariants({ variant, size: size4, className })),
        ...props
      }
    );
  }

  // src/components/ui/calendar.tsx
  var import_jsx_runtime17 = __toESM(require_react_shim());
  function Calendar2({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    formatters: formatters2,
    components,
    ...props
  }) {
    const defaultClassNames = getDefaultClassNames();
    return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
      DayPicker,
      {
        showOutsideDays,
        className: cn(
          "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        ),
        captionLayout,
        formatters: {
          formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
          ...formatters2
        },
        classNames: {
          root: cn("w-fit", defaultClassNames.root),
          months: cn(
            "flex gap-4 flex-col md:flex-row relative",
            defaultClassNames.months
          ),
          month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
          nav: cn(
            "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn(
            "absolute bg-popover inset-0 opacity-0",
            defaultClassNames.dropdown
          ),
          caption_label: cn(
            "select-none font-medium",
            captionLayout === "label" ? "text-sm" : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
            defaultClassNames.caption_label
          ),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
            defaultClassNames.weekday
          ),
          week: cn("flex w-full mt-2", defaultClassNames.week),
          week_number_header: cn(
            "select-none w-(--cell-size)",
            defaultClassNames.week_number_header
          ),
          week_number: cn(
            "text-[0.8rem] select-none text-muted-foreground",
            defaultClassNames.week_number
          ),
          day: cn(
            "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
            defaultClassNames.day
          ),
          range_start: cn(
            "rounded-l-md bg-accent",
            defaultClassNames.range_start
          ),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
          today: cn(
            "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground aria-selected:text-muted-foreground",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-50",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames
        },
        components: {
          Root: ({ className: className2, rootRef, ...props2 }) => {
            return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
              "div",
              {
                "data-slot": "calendar",
                ref: rootRef,
                className: cn(className2),
                ...props2
              }
            );
          },
          Chevron: ({ className: className2, orientation, ...props2 }) => {
            if (orientation === "left") {
              return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(ChevronLeft, { className: cn("size-4", className2), ...props2 });
            }
            if (orientation === "right") {
              return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                ChevronRight,
                {
                  className: cn("size-4", className2),
                  ...props2
                }
              );
            }
            return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(ChevronDown, { className: cn("size-4", className2), ...props2 });
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props2 }) => {
            return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("td", { ...props2, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
          },
          ...components
        },
        ...props
      }
    );
  }
  function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
  }) {
    const defaultClassNames = getDefaultClassNames();
    const ref = React57.useRef(null);
    React57.useEffect(() => {
      if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);
    return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
      Button2,
      {
        ref,
        variant: "ghost",
        size: "icon",
        "data-day": day.date.toLocaleDateString(),
        "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
        "data-range-start": modifiers.range_start,
        "data-range-end": modifiers.range_end,
        "data-range-middle": modifiers.range_middle,
        className: cn(
          "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
          defaultClassNames.day,
          className
        ),
        ...props
      }
    );
  }

  // src/components/ui/popover.tsx
  init_define_import_meta_env();

  // node_modules/@radix-ui/react-popover/dist/index.mjs
  init_define_import_meta_env();
  var React60 = __toESM(require_react_shim(), 1);

  // node_modules/@radix-ui/react-presence/dist/index.mjs
  init_define_import_meta_env();
  var React210 = __toESM(require_react_shim(), 1);
  var React58 = __toESM(require_react_shim(), 1);
  function useStateMachine(initialState, machine) {
    return React58.useReducer((state, event) => {
      const nextState = machine[state][event];
      return nextState ?? state;
    }, initialState);
  }
  var Presence = (props) => {
    const { present, children } = props;
    const presence = usePresence(present);
    const child = typeof children === "function" ? children({ present: presence.isPresent }) : React210.Children.only(children);
    const ref = useComposedRefs(presence.ref, getElementRef3(child));
    const forceMount = typeof children === "function";
    return forceMount || presence.isPresent ? React210.cloneElement(child, { ref }) : null;
  };
  Presence.displayName = "Presence";
  function usePresence(present) {
    const [node, setNode] = React210.useState();
    const stylesRef = React210.useRef(null);
    const prevPresentRef = React210.useRef(present);
    const prevAnimationNameRef = React210.useRef("none");
    const initialState = present ? "mounted" : "unmounted";
    const [state, send] = useStateMachine(initialState, {
      mounted: {
        UNMOUNT: "unmounted",
        ANIMATION_OUT: "unmountSuspended"
      },
      unmountSuspended: {
        MOUNT: "mounted",
        ANIMATION_END: "unmounted"
      },
      unmounted: {
        MOUNT: "mounted"
      }
    });
    React210.useEffect(() => {
      const currentAnimationName = getAnimationName(stylesRef.current);
      prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
    }, [state]);
    useLayoutEffect2(() => {
      const styles = stylesRef.current;
      const wasPresent = prevPresentRef.current;
      const hasPresentChanged = wasPresent !== present;
      if (hasPresentChanged) {
        const prevAnimationName = prevAnimationNameRef.current;
        const currentAnimationName = getAnimationName(styles);
        if (present) {
          send("MOUNT");
        } else if (currentAnimationName === "none" || styles?.display === "none") {
          send("UNMOUNT");
        } else {
          const isAnimating = prevAnimationName !== currentAnimationName;
          if (wasPresent && isAnimating) {
            send("ANIMATION_OUT");
          } else {
            send("UNMOUNT");
          }
        }
        prevPresentRef.current = present;
      }
    }, [present, send]);
    useLayoutEffect2(() => {
      if (node) {
        let timeoutId;
        const ownerWindow = node.ownerDocument.defaultView ?? window;
        const handleAnimationEnd = (event) => {
          const currentAnimationName = getAnimationName(stylesRef.current);
          const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
          if (event.target === node && isCurrentAnimation) {
            send("ANIMATION_END");
            if (!prevPresentRef.current) {
              const currentFillMode = node.style.animationFillMode;
              node.style.animationFillMode = "forwards";
              timeoutId = ownerWindow.setTimeout(() => {
                if (node.style.animationFillMode === "forwards") {
                  node.style.animationFillMode = currentFillMode;
                }
              });
            }
          }
        };
        const handleAnimationStart = (event) => {
          if (event.target === node) {
            prevAnimationNameRef.current = getAnimationName(stylesRef.current);
          }
        };
        node.addEventListener("animationstart", handleAnimationStart);
        node.addEventListener("animationcancel", handleAnimationEnd);
        node.addEventListener("animationend", handleAnimationEnd);
        return () => {
          ownerWindow.clearTimeout(timeoutId);
          node.removeEventListener("animationstart", handleAnimationStart);
          node.removeEventListener("animationcancel", handleAnimationEnd);
          node.removeEventListener("animationend", handleAnimationEnd);
        };
      } else {
        send("ANIMATION_END");
      }
    }, [node, send]);
    return {
      isPresent: ["mounted", "unmountSuspended"].includes(state),
      ref: React210.useCallback((node2) => {
        stylesRef.current = node2 ? getComputedStyle(node2) : null;
        setNode(node2);
      }, [])
    };
  }
  function getAnimationName(styles) {
    return styles?.animationName || "none";
  }
  function getElementRef3(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }

  // node_modules/@radix-ui/react-popover/node_modules/@radix-ui/react-slot/dist/index.mjs
  init_define_import_meta_env();
  var React59 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime18 = __toESM(require_react_shim(), 1);
  // @__NO_SIDE_EFFECTS__
  function createSlot3(ownerName) {
    const SlotClone = /* @__PURE__ */ createSlotClone3(ownerName);
    const Slot22 = React59.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      const childrenArray = React59.Children.toArray(children);
      const slottable = childrenArray.find(isSlottable3);
      if (slottable) {
        const newElement = slottable.props.children;
        const newChildren = childrenArray.map((child) => {
          if (child === slottable) {
            if (React59.Children.count(newElement) > 1) return React59.Children.only(null);
            return React59.isValidElement(newElement) ? newElement.props.children : null;
          } else {
            return child;
          }
        });
        return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children: React59.isValidElement(newElement) ? React59.cloneElement(newElement, void 0, newChildren) : null });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children });
    });
    Slot22.displayName = `${ownerName}.Slot`;
    return Slot22;
  }
  // @__NO_SIDE_EFFECTS__
  function createSlotClone3(ownerName) {
    const SlotClone = React59.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      if (React59.isValidElement(children)) {
        const childrenRef = getElementRef4(children);
        const props2 = mergeProps3(slotProps, children.props);
        if (children.type !== React59.Fragment) {
          props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
        }
        return React59.cloneElement(children, props2);
      }
      return React59.Children.count(children) > 1 ? React59.Children.only(null) : null;
    });
    SlotClone.displayName = `${ownerName}.SlotClone`;
    return SlotClone;
  }
  var SLOTTABLE_IDENTIFIER3 = /* @__PURE__ */ Symbol("radix.slottable");
  function isSlottable3(child) {
    return React59.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER3;
  }
  function mergeProps3(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
      const slotPropValue = slotProps[propName];
      const childPropValue = childProps[propName];
      const isHandler = /^on[A-Z]/.test(propName);
      if (isHandler) {
        if (slotPropValue && childPropValue) {
          overrideProps[propName] = (...args) => {
            const result = childPropValue(...args);
            slotPropValue(...args);
            return result;
          };
        } else if (slotPropValue) {
          overrideProps[propName] = slotPropValue;
        }
      } else if (propName === "style") {
        overrideProps[propName] = { ...slotPropValue, ...childPropValue };
      } else if (propName === "className") {
        overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
      }
    }
    return { ...slotProps, ...overrideProps };
  }
  function getElementRef4(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }

  // node_modules/@radix-ui/react-popover/dist/index.mjs
  var import_jsx_runtime19 = __toESM(require_react_shim(), 1);
  var POPOVER_NAME = "Popover";
  var [createPopoverContext, createPopoverScope] = createContextScope(POPOVER_NAME, [
    createPopperScope
  ]);
  var usePopperScope = createPopperScope();
  var [PopoverProvider, usePopoverContext] = createPopoverContext(POPOVER_NAME);
  var Popover = (props) => {
    const {
      __scopePopover,
      children,
      open: openProp,
      defaultOpen,
      onOpenChange,
      modal = false
    } = props;
    const popperScope = usePopperScope(__scopePopover);
    const triggerRef = React60.useRef(null);
    const [hasCustomAnchor, setHasCustomAnchor] = React60.useState(false);
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: POPOVER_NAME
    });
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Root22, { ...popperScope, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      PopoverProvider,
      {
        scope: __scopePopover,
        contentId: useId(),
        triggerRef,
        open,
        onOpenChange: setOpen,
        onOpenToggle: React60.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        hasCustomAnchor,
        onCustomAnchorAdd: React60.useCallback(() => setHasCustomAnchor(true), []),
        onCustomAnchorRemove: React60.useCallback(() => setHasCustomAnchor(false), []),
        modal,
        children
      }
    ) });
  };
  Popover.displayName = POPOVER_NAME;
  var ANCHOR_NAME2 = "PopoverAnchor";
  var PopoverAnchor = React60.forwardRef(
    (props, forwardedRef) => {
      const { __scopePopover, ...anchorProps } = props;
      const context = usePopoverContext(ANCHOR_NAME2, __scopePopover);
      const popperScope = usePopperScope(__scopePopover);
      const { onCustomAnchorAdd, onCustomAnchorRemove } = context;
      React60.useEffect(() => {
        onCustomAnchorAdd();
        return () => onCustomAnchorRemove();
      }, [onCustomAnchorAdd, onCustomAnchorRemove]);
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Anchor, { ...popperScope, ...anchorProps, ref: forwardedRef });
    }
  );
  PopoverAnchor.displayName = ANCHOR_NAME2;
  var TRIGGER_NAME = "PopoverTrigger";
  var PopoverTrigger = React60.forwardRef(
    (props, forwardedRef) => {
      const { __scopePopover, ...triggerProps } = props;
      const context = usePopoverContext(TRIGGER_NAME, __scopePopover);
      const popperScope = usePopperScope(__scopePopover);
      const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
      const trigger = /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        Primitive2.button,
        {
          type: "button",
          "aria-haspopup": "dialog",
          "aria-expanded": context.open,
          "aria-controls": context.contentId,
          "data-state": getState(context.open),
          ...triggerProps,
          ref: composedTriggerRef,
          onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
        }
      );
      return context.hasCustomAnchor ? trigger : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Anchor, { asChild: true, ...popperScope, children: trigger });
    }
  );
  PopoverTrigger.displayName = TRIGGER_NAME;
  var PORTAL_NAME2 = "PopoverPortal";
  var [PortalProvider, usePortalContext] = createPopoverContext(PORTAL_NAME2, {
    forceMount: void 0
  });
  var PopoverPortal = (props) => {
    const { __scopePopover, forceMount, children, container } = props;
    const context = usePopoverContext(PORTAL_NAME2, __scopePopover);
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(PortalProvider, { scope: __scopePopover, forceMount, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Portal, { asChild: true, container, children }) }) });
  };
  PopoverPortal.displayName = PORTAL_NAME2;
  var CONTENT_NAME2 = "PopoverContent";
  var PopoverContent = React60.forwardRef(
    (props, forwardedRef) => {
      const portalContext = usePortalContext(CONTENT_NAME2, props.__scopePopover);
      const { forceMount = portalContext.forceMount, ...contentProps } = props;
      const context = usePopoverContext(CONTENT_NAME2, props.__scopePopover);
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(PopoverContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(PopoverContentNonModal, { ...contentProps, ref: forwardedRef }) });
    }
  );
  PopoverContent.displayName = CONTENT_NAME2;
  var Slot2 = createSlot3("PopoverContent.RemoveScroll");
  var PopoverContentModal = React60.forwardRef(
    (props, forwardedRef) => {
      const context = usePopoverContext(CONTENT_NAME2, props.__scopePopover);
      const contentRef = React60.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, contentRef);
      const isRightClickOutsideRef = React60.useRef(false);
      React60.useEffect(() => {
        const content = contentRef.current;
        if (content) return hideOthers(content);
      }, []);
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Combination_default, { as: Slot2, allowPinchZoom: true, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        PopoverContentImpl,
        {
          ...props,
          ref: composedRefs,
          trapFocus: context.open,
          disableOutsidePointerEvents: true,
          onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
            event.preventDefault();
            if (!isRightClickOutsideRef.current) context.triggerRef.current?.focus();
          }),
          onPointerDownOutside: composeEventHandlers(
            props.onPointerDownOutside,
            (event) => {
              const originalEvent = event.detail.originalEvent;
              const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
              const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
              isRightClickOutsideRef.current = isRightClick;
            },
            { checkForDefaultPrevented: false }
          ),
          onFocusOutside: composeEventHandlers(
            props.onFocusOutside,
            (event) => event.preventDefault(),
            { checkForDefaultPrevented: false }
          )
        }
      ) });
    }
  );
  var PopoverContentNonModal = React60.forwardRef(
    (props, forwardedRef) => {
      const context = usePopoverContext(CONTENT_NAME2, props.__scopePopover);
      const hasInteractedOutsideRef = React60.useRef(false);
      const hasPointerDownOutsideRef = React60.useRef(false);
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        PopoverContentImpl,
        {
          ...props,
          ref: forwardedRef,
          trapFocus: false,
          disableOutsidePointerEvents: false,
          onCloseAutoFocus: (event) => {
            props.onCloseAutoFocus?.(event);
            if (!event.defaultPrevented) {
              if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
              event.preventDefault();
            }
            hasInteractedOutsideRef.current = false;
            hasPointerDownOutsideRef.current = false;
          },
          onInteractOutside: (event) => {
            props.onInteractOutside?.(event);
            if (!event.defaultPrevented) {
              hasInteractedOutsideRef.current = true;
              if (event.detail.originalEvent.type === "pointerdown") {
                hasPointerDownOutsideRef.current = true;
              }
            }
            const target = event.target;
            const targetIsTrigger = context.triggerRef.current?.contains(target);
            if (targetIsTrigger) event.preventDefault();
            if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
              event.preventDefault();
            }
          }
        }
      );
    }
  );
  var PopoverContentImpl = React60.forwardRef(
    (props, forwardedRef) => {
      const {
        __scopePopover,
        trapFocus,
        onOpenAutoFocus,
        onCloseAutoFocus,
        disableOutsidePointerEvents,
        onEscapeKeyDown,
        onPointerDownOutside,
        onFocusOutside,
        onInteractOutside,
        ...contentProps
      } = props;
      const context = usePopoverContext(CONTENT_NAME2, __scopePopover);
      const popperScope = usePopperScope(__scopePopover);
      useFocusGuards();
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            DismissableLayer,
            {
              asChild: true,
              disableOutsidePointerEvents,
              onInteractOutside,
              onEscapeKeyDown,
              onPointerDownOutside,
              onFocusOutside,
              onDismiss: () => context.onOpenChange(false),
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                Content,
                {
                  "data-state": getState(context.open),
                  role: "dialog",
                  id: context.contentId,
                  ...popperScope,
                  ...contentProps,
                  ref: forwardedRef,
                  style: {
                    ...contentProps.style,
                    // re-namespace exposed content custom properties
                    ...{
                      "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                      "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                      "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                      "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                      "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                    }
                  }
                }
              )
            }
          )
        }
      );
    }
  );
  var CLOSE_NAME = "PopoverClose";
  var PopoverClose = React60.forwardRef(
    (props, forwardedRef) => {
      const { __scopePopover, ...closeProps } = props;
      const context = usePopoverContext(CLOSE_NAME, __scopePopover);
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        Primitive2.button,
        {
          type: "button",
          ...closeProps,
          ref: forwardedRef,
          onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
        }
      );
    }
  );
  PopoverClose.displayName = CLOSE_NAME;
  var ARROW_NAME2 = "PopoverArrow";
  var PopoverArrow = React60.forwardRef(
    (props, forwardedRef) => {
      const { __scopePopover, ...arrowProps } = props;
      const popperScope = usePopperScope(__scopePopover);
      return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Arrow2, { ...popperScope, ...arrowProps, ref: forwardedRef });
    }
  );
  PopoverArrow.displayName = ARROW_NAME2;
  function getState(open) {
    return open ? "open" : "closed";
  }
  var Root23 = Popover;
  var Trigger = PopoverTrigger;
  var Portal2 = PopoverPortal;
  var Content2 = PopoverContent;

  // src/components/ui/popover.tsx
  var import_jsx_runtime20 = __toESM(require_react_shim());
  function Popover2({
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Root23, { "data-slot": "popover", ...props });
  }
  function PopoverTrigger2({
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Trigger, { "data-slot": "popover-trigger", ...props });
  }
  function PopoverContent2({
    className,
    align = "center",
    sideOffset = 4,
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
      Content2,
      {
        "data-slot": "popover-content",
        align,
        sideOffset,
        className: cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        ),
        ...props
      }
    ) });
  }

  // src/components/ui/textarea.tsx
  init_define_import_meta_env();
  var import_jsx_runtime21 = __toESM(require_react_shim());

  // src/components/ui/checkbox.tsx
  init_define_import_meta_env();
  var import_jsx_runtime22 = __toESM(require_react_shim());

  // src/components/ui/disclosure.tsx
  init_define_import_meta_env();
  var React61 = __toESM(require_react_shim());
  var import_react38 = __toESM(require_react_shim());
  var import_jsx_runtime23 = __toESM(require_react_shim());
  var DisclosureContext = (0, import_react38.createContext)(
    void 0
  );

  // src/components/ui/multi-select.tsx
  init_define_import_meta_env();

  // node_modules/cmdk/dist/index.mjs
  init_define_import_meta_env();

  // node_modules/cmdk/dist/chunk-NZJY6EH4.mjs
  init_define_import_meta_env();
  var U = 1;
  var Y = 0.9;
  var H = 0.8;
  var J = 0.17;
  var p = 0.1;
  var u = 0.999;
  var $ = 0.9999;
  var k = 0.99;
  var m = /[\\\/_+.#"@\[\(\{&]/;
  var B = /[\\\/_+.#"@\[\(\{&]/g;
  var K = /[\s-]/;
  var X2 = /[\s-]/g;
  function G(_, C, h, P2, A, f, O) {
    if (f === C.length) return A === _.length ? U : k;
    var T2 = `${A},${f}`;
    if (O[T2] !== void 0) return O[T2];
    for (var L2 = P2.charAt(f), c = h.indexOf(L2, A), S = 0, E, N2, R, M; c >= 0; ) E = G(_, C, h, P2, c + 1, f + 1, O), E > S && (c === A ? E *= U : m.test(_.charAt(c - 1)) ? (E *= H, R = _.slice(A, c - 1).match(B), R && A > 0 && (E *= Math.pow(u, R.length))) : K.test(_.charAt(c - 1)) ? (E *= Y, M = _.slice(A, c - 1).match(X2), M && A > 0 && (E *= Math.pow(u, M.length))) : (E *= J, A > 0 && (E *= Math.pow(u, c - A))), _.charAt(c) !== C.charAt(f) && (E *= $)), (E < p && h.charAt(c - 1) === P2.charAt(f + 1) || P2.charAt(f + 1) === P2.charAt(f) && h.charAt(c - 1) !== P2.charAt(f)) && (N2 = G(_, C, h, P2, c + 1, f + 2, O), N2 * p > E && (E = N2 * p)), E > S && (S = E), c = h.indexOf(L2, c + 1);
    return O[T2] = S, S;
  }
  function D(_) {
    return _.toLowerCase().replace(X2, " ");
  }
  function W(_, C, h) {
    return _ = h && h.length > 0 ? `${_ + " " + h.join(" ")}` : _, G(_, C, D(_), D(C), 0, 0, {});
  }

  // node_modules/@radix-ui/react-dialog/dist/index.mjs
  init_define_import_meta_env();
  var React63 = __toESM(require_react_shim(), 1);

  // node_modules/@radix-ui/react-dialog/node_modules/@radix-ui/react-slot/dist/index.mjs
  init_define_import_meta_env();
  var React62 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime24 = __toESM(require_react_shim(), 1);
  // @__NO_SIDE_EFFECTS__
  function createSlot4(ownerName) {
    const SlotClone = /* @__PURE__ */ createSlotClone4(ownerName);
    const Slot22 = React62.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      const childrenArray = React62.Children.toArray(children);
      const slottable = childrenArray.find(isSlottable4);
      if (slottable) {
        const newElement = slottable.props.children;
        const newChildren = childrenArray.map((child) => {
          if (child === slottable) {
            if (React62.Children.count(newElement) > 1) return React62.Children.only(null);
            return React62.isValidElement(newElement) ? newElement.props.children : null;
          } else {
            return child;
          }
        });
        return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children: React62.isValidElement(newElement) ? React62.cloneElement(newElement, void 0, newChildren) : null });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children });
    });
    Slot22.displayName = `${ownerName}.Slot`;
    return Slot22;
  }
  // @__NO_SIDE_EFFECTS__
  function createSlotClone4(ownerName) {
    const SlotClone = React62.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      if (React62.isValidElement(children)) {
        const childrenRef = getElementRef5(children);
        const props2 = mergeProps4(slotProps, children.props);
        if (children.type !== React62.Fragment) {
          props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
        }
        return React62.cloneElement(children, props2);
      }
      return React62.Children.count(children) > 1 ? React62.Children.only(null) : null;
    });
    SlotClone.displayName = `${ownerName}.SlotClone`;
    return SlotClone;
  }
  var SLOTTABLE_IDENTIFIER4 = /* @__PURE__ */ Symbol("radix.slottable");
  function isSlottable4(child) {
    return React62.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER4;
  }
  function mergeProps4(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
      const slotPropValue = slotProps[propName];
      const childPropValue = childProps[propName];
      const isHandler = /^on[A-Z]/.test(propName);
      if (isHandler) {
        if (slotPropValue && childPropValue) {
          overrideProps[propName] = (...args) => {
            const result = childPropValue(...args);
            slotPropValue(...args);
            return result;
          };
        } else if (slotPropValue) {
          overrideProps[propName] = slotPropValue;
        }
      } else if (propName === "style") {
        overrideProps[propName] = { ...slotPropValue, ...childPropValue };
      } else if (propName === "className") {
        overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
      }
    }
    return { ...slotProps, ...overrideProps };
  }
  function getElementRef5(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }

  // node_modules/@radix-ui/react-dialog/dist/index.mjs
  var import_jsx_runtime25 = __toESM(require_react_shim(), 1);
  var DIALOG_NAME = "Dialog";
  var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
  var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
  var Dialog = (props) => {
    const {
      __scopeDialog,
      children,
      open: openProp,
      defaultOpen,
      onOpenChange,
      modal = true
    } = props;
    const triggerRef = React63.useRef(null);
    const contentRef = React63.useRef(null);
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: DIALOG_NAME
    });
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
      DialogProvider,
      {
        scope: __scopeDialog,
        triggerRef,
        contentRef,
        contentId: useId(),
        titleId: useId(),
        descriptionId: useId(),
        open,
        onOpenChange: setOpen,
        onOpenToggle: React63.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        modal,
        children
      }
    );
  };
  Dialog.displayName = DIALOG_NAME;
  var TRIGGER_NAME2 = "DialogTrigger";
  var DialogTrigger = React63.forwardRef(
    (props, forwardedRef) => {
      const { __scopeDialog, ...triggerProps } = props;
      const context = useDialogContext(TRIGGER_NAME2, __scopeDialog);
      const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
        Primitive2.button,
        {
          type: "button",
          "aria-haspopup": "dialog",
          "aria-expanded": context.open,
          "aria-controls": context.contentId,
          "data-state": getState2(context.open),
          ...triggerProps,
          ref: composedTriggerRef,
          onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
        }
      );
    }
  );
  DialogTrigger.displayName = TRIGGER_NAME2;
  var PORTAL_NAME3 = "DialogPortal";
  var [PortalProvider2, usePortalContext2] = createDialogContext(PORTAL_NAME3, {
    forceMount: void 0
  });
  var DialogPortal = (props) => {
    const { __scopeDialog, forceMount, children, container } = props;
    const context = useDialogContext(PORTAL_NAME3, __scopeDialog);
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(PortalProvider2, { scope: __scopeDialog, forceMount, children: React63.Children.map(children, (child) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Portal, { asChild: true, container, children: child }) })) });
  };
  DialogPortal.displayName = PORTAL_NAME3;
  var OVERLAY_NAME = "DialogOverlay";
  var DialogOverlay = React63.forwardRef(
    (props, forwardedRef) => {
      const portalContext = usePortalContext2(OVERLAY_NAME, props.__scopeDialog);
      const { forceMount = portalContext.forceMount, ...overlayProps } = props;
      const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
      return context.modal ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
    }
  );
  DialogOverlay.displayName = OVERLAY_NAME;
  var Slot3 = createSlot4("DialogOverlay.RemoveScroll");
  var DialogOverlayImpl = React63.forwardRef(
    (props, forwardedRef) => {
      const { __scopeDialog, ...overlayProps } = props;
      const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
      return (
        // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
        // ie. when `Overlay` and `Content` are siblings
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Combination_default, { as: Slot3, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
          Primitive2.div,
          {
            "data-state": getState2(context.open),
            ...overlayProps,
            ref: forwardedRef,
            style: { pointerEvents: "auto", ...overlayProps.style }
          }
        ) })
      );
    }
  );
  var CONTENT_NAME3 = "DialogContent";
  var DialogContent = React63.forwardRef(
    (props, forwardedRef) => {
      const portalContext = usePortalContext2(CONTENT_NAME3, props.__scopeDialog);
      const { forceMount = portalContext.forceMount, ...contentProps } = props;
      const context = useDialogContext(CONTENT_NAME3, props.__scopeDialog);
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
    }
  );
  DialogContent.displayName = CONTENT_NAME3;
  var DialogContentModal = React63.forwardRef(
    (props, forwardedRef) => {
      const context = useDialogContext(CONTENT_NAME3, props.__scopeDialog);
      const contentRef = React63.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
      React63.useEffect(() => {
        const content = contentRef.current;
        if (content) return hideOthers(content);
      }, []);
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
        DialogContentImpl,
        {
          ...props,
          ref: composedRefs,
          trapFocus: context.open,
          disableOutsidePointerEvents: true,
          onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
            event.preventDefault();
            context.triggerRef.current?.focus();
          }),
          onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
            const originalEvent = event.detail.originalEvent;
            const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
            const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
            if (isRightClick) event.preventDefault();
          }),
          onFocusOutside: composeEventHandlers(
            props.onFocusOutside,
            (event) => event.preventDefault()
          )
        }
      );
    }
  );
  var DialogContentNonModal = React63.forwardRef(
    (props, forwardedRef) => {
      const context = useDialogContext(CONTENT_NAME3, props.__scopeDialog);
      const hasInteractedOutsideRef = React63.useRef(false);
      const hasPointerDownOutsideRef = React63.useRef(false);
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
        DialogContentImpl,
        {
          ...props,
          ref: forwardedRef,
          trapFocus: false,
          disableOutsidePointerEvents: false,
          onCloseAutoFocus: (event) => {
            props.onCloseAutoFocus?.(event);
            if (!event.defaultPrevented) {
              if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
              event.preventDefault();
            }
            hasInteractedOutsideRef.current = false;
            hasPointerDownOutsideRef.current = false;
          },
          onInteractOutside: (event) => {
            props.onInteractOutside?.(event);
            if (!event.defaultPrevented) {
              hasInteractedOutsideRef.current = true;
              if (event.detail.originalEvent.type === "pointerdown") {
                hasPointerDownOutsideRef.current = true;
              }
            }
            const target = event.target;
            const targetIsTrigger = context.triggerRef.current?.contains(target);
            if (targetIsTrigger) event.preventDefault();
            if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
              event.preventDefault();
            }
          }
        }
      );
    }
  );
  var DialogContentImpl = React63.forwardRef(
    (props, forwardedRef) => {
      const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
      const context = useDialogContext(CONTENT_NAME3, __scopeDialog);
      const contentRef = React63.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, contentRef);
      useFocusGuards();
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(import_jsx_runtime25.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
          FocusScope,
          {
            asChild: true,
            loop: true,
            trapped: trapFocus,
            onMountAutoFocus: onOpenAutoFocus,
            onUnmountAutoFocus: onCloseAutoFocus,
            children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
              DismissableLayer,
              {
                role: "dialog",
                id: context.contentId,
                "aria-describedby": context.descriptionId,
                "aria-labelledby": context.titleId,
                "data-state": getState2(context.open),
                ...contentProps,
                ref: composedRefs,
                onDismiss: () => context.onOpenChange(false)
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(import_jsx_runtime25.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(TitleWarning, { titleId: context.titleId }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
        ] })
      ] });
    }
  );
  var TITLE_NAME = "DialogTitle";
  var DialogTitle = React63.forwardRef(
    (props, forwardedRef) => {
      const { __scopeDialog, ...titleProps } = props;
      const context = useDialogContext(TITLE_NAME, __scopeDialog);
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Primitive2.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
    }
  );
  DialogTitle.displayName = TITLE_NAME;
  var DESCRIPTION_NAME = "DialogDescription";
  var DialogDescription = React63.forwardRef(
    (props, forwardedRef) => {
      const { __scopeDialog, ...descriptionProps } = props;
      const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Primitive2.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
    }
  );
  DialogDescription.displayName = DESCRIPTION_NAME;
  var CLOSE_NAME2 = "DialogClose";
  var DialogClose = React63.forwardRef(
    (props, forwardedRef) => {
      const { __scopeDialog, ...closeProps } = props;
      const context = useDialogContext(CLOSE_NAME2, __scopeDialog);
      return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
        Primitive2.button,
        {
          type: "button",
          ...closeProps,
          ref: forwardedRef,
          onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
        }
      );
    }
  );
  DialogClose.displayName = CLOSE_NAME2;
  function getState2(open) {
    return open ? "open" : "closed";
  }
  var TITLE_WARNING_NAME = "DialogTitleWarning";
  var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
    contentName: CONTENT_NAME3,
    titleName: TITLE_NAME,
    docsSlug: "dialog"
  });
  var TitleWarning = ({ titleId }) => {
    const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
    const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
    React63.useEffect(() => {
      if (titleId) {
        const hasTitle = document.getElementById(titleId);
        if (!hasTitle) console.error(MESSAGE);
      }
    }, [MESSAGE, titleId]);
    return null;
  };
  var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
  var DescriptionWarning = ({ contentRef, descriptionId }) => {
    const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
    const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
    React63.useEffect(() => {
      const describedById = contentRef.current?.getAttribute("aria-describedby");
      if (descriptionId && describedById) {
        const hasDescription = document.getElementById(descriptionId);
        if (!hasDescription) console.warn(MESSAGE);
      }
    }, [MESSAGE, contentRef, descriptionId]);
    return null;
  };
  var Root4 = Dialog;
  var Portal3 = DialogPortal;
  var Overlay = DialogOverlay;
  var Content3 = DialogContent;

  // node_modules/cmdk/dist/index.mjs
  var t = __toESM(require_react_shim(), 1);
  var N = '[cmdk-group=""]';
  var Y2 = '[cmdk-group-items=""]';
  var be = '[cmdk-group-heading=""]';
  var le = '[cmdk-item=""]';
  var ce = `${le}:not([aria-disabled="true"])`;
  var Z = "cmdk-item-select";
  var T = "data-value";
  var Re = (r2, o, n) => W(r2, o, n);
  var ue = t.createContext(void 0);
  var K2 = () => t.useContext(ue);
  var de = t.createContext(void 0);
  var ee = () => t.useContext(de);
  var fe = t.createContext(void 0);
  var me = t.forwardRef((r2, o) => {
    let n = L(() => {
      var e, a;
      return { search: "", value: (a = (e = r2.value) != null ? e : r2.defaultValue) != null ? a : "", selectedItemId: void 0, filtered: { count: 0, items: /* @__PURE__ */ new Map(), groups: /* @__PURE__ */ new Set() } };
    }), u2 = L(() => /* @__PURE__ */ new Set()), c = L(() => /* @__PURE__ */ new Map()), d = L(() => /* @__PURE__ */ new Map()), f = L(() => /* @__PURE__ */ new Set()), p2 = pe(r2), { label: b, children: m2, value: R, onValueChange: x, filter: C, shouldFilter: S, loop: A, disablePointerSelection: ge = false, vimBindings: j = true, ...O } = r2, $2 = useId(), q = useId(), _ = useId(), I = t.useRef(null), v = ke();
    k2(() => {
      if (R !== void 0) {
        let e = R.trim();
        n.current.value = e, E.emit();
      }
    }, [R]), k2(() => {
      v(6, ne);
    }, []);
    let E = t.useMemo(() => ({ subscribe: (e) => (f.current.add(e), () => f.current.delete(e)), snapshot: () => n.current, setState: (e, a, s) => {
      var i, l, g, y;
      if (!Object.is(n.current[e], a)) {
        if (n.current[e] = a, e === "search") J2(), z(), v(1, W2);
        else if (e === "value") {
          if (document.activeElement.hasAttribute("cmdk-input") || document.activeElement.hasAttribute("cmdk-root")) {
            let h = document.getElementById(_);
            h ? h.focus() : (i = document.getElementById($2)) == null || i.focus();
          }
          if (v(7, () => {
            var h;
            n.current.selectedItemId = (h = M()) == null ? void 0 : h.id, E.emit();
          }), s || v(5, ne), ((l = p2.current) == null ? void 0 : l.value) !== void 0) {
            let h = a != null ? a : "";
            (y = (g = p2.current).onValueChange) == null || y.call(g, h);
            return;
          }
        }
        E.emit();
      }
    }, emit: () => {
      f.current.forEach((e) => e());
    } }), []), U2 = t.useMemo(() => ({ value: (e, a, s) => {
      var i;
      a !== ((i = d.current.get(e)) == null ? void 0 : i.value) && (d.current.set(e, { value: a, keywords: s }), n.current.filtered.items.set(e, te(a, s)), v(2, () => {
        z(), E.emit();
      }));
    }, item: (e, a) => (u2.current.add(e), a && (c.current.has(a) ? c.current.get(a).add(e) : c.current.set(a, /* @__PURE__ */ new Set([e]))), v(3, () => {
      J2(), z(), n.current.value || W2(), E.emit();
    }), () => {
      d.current.delete(e), u2.current.delete(e), n.current.filtered.items.delete(e);
      let s = M();
      v(4, () => {
        J2(), (s == null ? void 0 : s.getAttribute("id")) === e && W2(), E.emit();
      });
    }), group: (e) => (c.current.has(e) || c.current.set(e, /* @__PURE__ */ new Set()), () => {
      d.current.delete(e), c.current.delete(e);
    }), filter: () => p2.current.shouldFilter, label: b || r2["aria-label"], getDisablePointerSelection: () => p2.current.disablePointerSelection, listId: $2, inputId: _, labelId: q, listInnerRef: I }), []);
    function te(e, a) {
      var i, l;
      let s = (l = (i = p2.current) == null ? void 0 : i.filter) != null ? l : Re;
      return e ? s(e, n.current.search, a) : 0;
    }
    function z() {
      if (!n.current.search || p2.current.shouldFilter === false) return;
      let e = n.current.filtered.items, a = [];
      n.current.filtered.groups.forEach((i) => {
        let l = c.current.get(i), g = 0;
        l.forEach((y) => {
          let h = e.get(y);
          g = Math.max(h, g);
        }), a.push([i, g]);
      });
      let s = I.current;
      V().sort((i, l) => {
        var h, F;
        let g = i.getAttribute("id"), y = l.getAttribute("id");
        return ((h = e.get(y)) != null ? h : 0) - ((F = e.get(g)) != null ? F : 0);
      }).forEach((i) => {
        let l = i.closest(Y2);
        l ? l.appendChild(i.parentElement === l ? i : i.closest(`${Y2} > *`)) : s.appendChild(i.parentElement === s ? i : i.closest(`${Y2} > *`));
      }), a.sort((i, l) => l[1] - i[1]).forEach((i) => {
        var g;
        let l = (g = I.current) == null ? void 0 : g.querySelector(`${N}[${T}="${encodeURIComponent(i[0])}"]`);
        l == null || l.parentElement.appendChild(l);
      });
    }
    function W2() {
      let e = V().find((s) => s.getAttribute("aria-disabled") !== "true"), a = e == null ? void 0 : e.getAttribute(T);
      E.setState("value", a || void 0);
    }
    function J2() {
      var a, s, i, l;
      if (!n.current.search || p2.current.shouldFilter === false) {
        n.current.filtered.count = u2.current.size;
        return;
      }
      n.current.filtered.groups = /* @__PURE__ */ new Set();
      let e = 0;
      for (let g of u2.current) {
        let y = (s = (a = d.current.get(g)) == null ? void 0 : a.value) != null ? s : "", h = (l = (i = d.current.get(g)) == null ? void 0 : i.keywords) != null ? l : [], F = te(y, h);
        n.current.filtered.items.set(g, F), F > 0 && e++;
      }
      for (let [g, y] of c.current) for (let h of y) if (n.current.filtered.items.get(h) > 0) {
        n.current.filtered.groups.add(g);
        break;
      }
      n.current.filtered.count = e;
    }
    function ne() {
      var a, s, i;
      let e = M();
      e && (((a = e.parentElement) == null ? void 0 : a.firstChild) === e && ((i = (s = e.closest(N)) == null ? void 0 : s.querySelector(be)) == null || i.scrollIntoView({ block: "nearest" })), e.scrollIntoView({ block: "nearest" }));
    }
    function M() {
      var e;
      return (e = I.current) == null ? void 0 : e.querySelector(`${le}[aria-selected="true"]`);
    }
    function V() {
      var e;
      return Array.from(((e = I.current) == null ? void 0 : e.querySelectorAll(ce)) || []);
    }
    function X3(e) {
      let s = V()[e];
      s && E.setState("value", s.getAttribute(T));
    }
    function Q(e) {
      var g;
      let a = M(), s = V(), i = s.findIndex((y) => y === a), l = s[i + e];
      (g = p2.current) != null && g.loop && (l = i + e < 0 ? s[s.length - 1] : i + e === s.length ? s[0] : s[i + e]), l && E.setState("value", l.getAttribute(T));
    }
    function re2(e) {
      let a = M(), s = a == null ? void 0 : a.closest(N), i;
      for (; s && !i; ) s = e > 0 ? we(s, N) : De(s, N), i = s == null ? void 0 : s.querySelector(ce);
      i ? E.setState("value", i.getAttribute(T)) : Q(e);
    }
    let oe = () => X3(V().length - 1), ie = (e) => {
      e.preventDefault(), e.metaKey ? oe() : e.altKey ? re2(1) : Q(1);
    }, se = (e) => {
      e.preventDefault(), e.metaKey ? X3(0) : e.altKey ? re2(-1) : Q(-1);
    };
    return t.createElement(Primitive2.div, { ref: o, tabIndex: -1, ...O, "cmdk-root": "", onKeyDown: (e) => {
      var s;
      (s = O.onKeyDown) == null || s.call(O, e);
      let a = e.nativeEvent.isComposing || e.keyCode === 229;
      if (!(e.defaultPrevented || a)) switch (e.key) {
        case "n":
        case "j": {
          j && e.ctrlKey && ie(e);
          break;
        }
        case "ArrowDown": {
          ie(e);
          break;
        }
        case "p":
        case "k": {
          j && e.ctrlKey && se(e);
          break;
        }
        case "ArrowUp": {
          se(e);
          break;
        }
        case "Home": {
          e.preventDefault(), X3(0);
          break;
        }
        case "End": {
          e.preventDefault(), oe();
          break;
        }
        case "Enter": {
          e.preventDefault();
          let i = M();
          if (i) {
            let l = new Event(Z);
            i.dispatchEvent(l);
          }
        }
      }
    } }, t.createElement("label", { "cmdk-label": "", htmlFor: U2.inputId, id: U2.labelId, style: Te }, b), B2(r2, (e) => t.createElement(de.Provider, { value: E }, t.createElement(ue.Provider, { value: U2 }, e))));
  });
  var he = t.forwardRef((r2, o) => {
    var _, I;
    let n = useId(), u2 = t.useRef(null), c = t.useContext(fe), d = K2(), f = pe(r2), p2 = (I = (_ = f.current) == null ? void 0 : _.forceMount) != null ? I : c == null ? void 0 : c.forceMount;
    k2(() => {
      if (!p2) return d.item(n, c == null ? void 0 : c.id);
    }, [p2]);
    let b = ve(n, u2, [r2.value, r2.children, u2], r2.keywords), m2 = ee(), R = P((v) => v.value && v.value === b.current), x = P((v) => p2 || d.filter() === false ? true : v.search ? v.filtered.items.get(n) > 0 : true);
    t.useEffect(() => {
      let v = u2.current;
      if (!(!v || r2.disabled)) return v.addEventListener(Z, C), () => v.removeEventListener(Z, C);
    }, [x, r2.onSelect, r2.disabled]);
    function C() {
      var v, E;
      S(), (E = (v = f.current).onSelect) == null || E.call(v, b.current);
    }
    function S() {
      m2.setState("value", b.current, true);
    }
    if (!x) return null;
    let { disabled: A, value: ge, onSelect: j, forceMount: O, keywords: $2, ...q } = r2;
    return t.createElement(Primitive2.div, { ref: composeRefs(u2, o), ...q, id: n, "cmdk-item": "", role: "option", "aria-disabled": !!A, "aria-selected": !!R, "data-disabled": !!A, "data-selected": !!R, onPointerMove: A || d.getDisablePointerSelection() ? void 0 : S, onClick: A ? void 0 : C }, r2.children);
  });
  var Ee = t.forwardRef((r2, o) => {
    let { heading: n, children: u2, forceMount: c, ...d } = r2, f = useId(), p2 = t.useRef(null), b = t.useRef(null), m2 = useId(), R = K2(), x = P((S) => c || R.filter() === false ? true : S.search ? S.filtered.groups.has(f) : true);
    k2(() => R.group(f), []), ve(f, p2, [r2.value, r2.heading, b]);
    let C = t.useMemo(() => ({ id: f, forceMount: c }), [c]);
    return t.createElement(Primitive2.div, { ref: composeRefs(p2, o), ...d, "cmdk-group": "", role: "presentation", hidden: x ? void 0 : true }, n && t.createElement("div", { ref: b, "cmdk-group-heading": "", "aria-hidden": true, id: m2 }, n), B2(r2, (S) => t.createElement("div", { "cmdk-group-items": "", role: "group", "aria-labelledby": n ? m2 : void 0 }, t.createElement(fe.Provider, { value: C }, S))));
  });
  var ye = t.forwardRef((r2, o) => {
    let { alwaysRender: n, ...u2 } = r2, c = t.useRef(null), d = P((f) => !f.search);
    return !n && !d ? null : t.createElement(Primitive2.div, { ref: composeRefs(c, o), ...u2, "cmdk-separator": "", role: "separator" });
  });
  var Se = t.forwardRef((r2, o) => {
    let { onValueChange: n, ...u2 } = r2, c = r2.value != null, d = ee(), f = P((m2) => m2.search), p2 = P((m2) => m2.selectedItemId), b = K2();
    return t.useEffect(() => {
      r2.value != null && d.setState("search", r2.value);
    }, [r2.value]), t.createElement(Primitive2.input, { ref: o, ...u2, "cmdk-input": "", autoComplete: "off", autoCorrect: "off", spellCheck: false, "aria-autocomplete": "list", role: "combobox", "aria-expanded": true, "aria-controls": b.listId, "aria-labelledby": b.labelId, "aria-activedescendant": p2, id: b.inputId, type: "text", value: c ? r2.value : f, onChange: (m2) => {
      c || d.setState("search", m2.target.value), n == null || n(m2.target.value);
    } });
  });
  var Ce = t.forwardRef((r2, o) => {
    let { children: n, label: u2 = "Suggestions", ...c } = r2, d = t.useRef(null), f = t.useRef(null), p2 = P((m2) => m2.selectedItemId), b = K2();
    return t.useEffect(() => {
      if (f.current && d.current) {
        let m2 = f.current, R = d.current, x, C = new ResizeObserver(() => {
          x = requestAnimationFrame(() => {
            let S = m2.offsetHeight;
            R.style.setProperty("--cmdk-list-height", S.toFixed(1) + "px");
          });
        });
        return C.observe(m2), () => {
          cancelAnimationFrame(x), C.unobserve(m2);
        };
      }
    }, []), t.createElement(Primitive2.div, { ref: composeRefs(d, o), ...c, "cmdk-list": "", role: "listbox", tabIndex: -1, "aria-activedescendant": p2, "aria-label": u2, id: b.listId }, B2(r2, (m2) => t.createElement("div", { ref: composeRefs(f, b.listInnerRef), "cmdk-list-sizer": "" }, m2)));
  });
  var xe = t.forwardRef((r2, o) => {
    let { open: n, onOpenChange: u2, overlayClassName: c, contentClassName: d, container: f, ...p2 } = r2;
    return t.createElement(Root4, { open: n, onOpenChange: u2 }, t.createElement(Portal3, { container: f }, t.createElement(Overlay, { "cmdk-overlay": "", className: c }), t.createElement(Content3, { "aria-label": r2.label, "cmdk-dialog": "", className: d }, t.createElement(me, { ref: o, ...p2 }))));
  });
  var Ie = t.forwardRef((r2, o) => P((u2) => u2.filtered.count === 0) ? t.createElement(Primitive2.div, { ref: o, ...r2, "cmdk-empty": "", role: "presentation" }) : null);
  var Pe = t.forwardRef((r2, o) => {
    let { progress: n, children: u2, label: c = "Loading...", ...d } = r2;
    return t.createElement(Primitive2.div, { ref: o, ...d, "cmdk-loading": "", role: "progressbar", "aria-valuenow": n, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": c }, B2(r2, (f) => t.createElement("div", { "aria-hidden": true }, f)));
  });
  var _e = Object.assign(me, { List: Ce, Item: he, Input: Se, Group: Ee, Separator: ye, Dialog: xe, Empty: Ie, Loading: Pe });
  function we(r2, o) {
    let n = r2.nextElementSibling;
    for (; n; ) {
      if (n.matches(o)) return n;
      n = n.nextElementSibling;
    }
  }
  function De(r2, o) {
    let n = r2.previousElementSibling;
    for (; n; ) {
      if (n.matches(o)) return n;
      n = n.previousElementSibling;
    }
  }
  function pe(r2) {
    let o = t.useRef(r2);
    return k2(() => {
      o.current = r2;
    }), o;
  }
  var k2 = typeof window == "undefined" ? t.useEffect : t.useLayoutEffect;
  function L(r2) {
    let o = t.useRef();
    return o.current === void 0 && (o.current = r2()), o;
  }
  function P(r2) {
    let o = ee(), n = () => r2(o.snapshot());
    return t.useSyncExternalStore(o.subscribe, n, n);
  }
  function ve(r2, o, n, u2 = []) {
    let c = t.useRef(), d = K2();
    return k2(() => {
      var b;
      let f = (() => {
        var m2;
        for (let R of n) {
          if (typeof R == "string") return R.trim();
          if (typeof R == "object" && "current" in R) return R.current ? (m2 = R.current.textContent) == null ? void 0 : m2.trim() : c.current;
        }
      })(), p2 = u2.map((m2) => m2.trim());
      d.value(r2, f, p2), (b = o.current) == null || b.setAttribute(T, f), c.current = f;
    }), c;
  }
  var ke = () => {
    let [r2, o] = t.useState(), n = L(() => /* @__PURE__ */ new Map());
    return k2(() => {
      n.current.forEach((u2) => u2()), n.current = /* @__PURE__ */ new Map();
    }, [r2]), (u2, c) => {
      n.current.set(u2, c), o({});
    };
  };
  function Me(r2) {
    let o = r2.type;
    return typeof o == "function" ? o(r2.props) : "render" in o ? o.render(r2.props) : r2;
  }
  function B2({ asChild: r2, children: o }, n) {
    return r2 && t.isValidElement(o) ? t.cloneElement(Me(o), { ref: o.ref }, n(o.props.children)) : n(o);
  }
  var Te = { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" };

  // src/components/ui/multi-select.tsx
  var React64 = __toESM(require_react_shim());
  var import_react39 = __toESM(require_react_shim());

  // src/components/ui/badge.tsx
  init_define_import_meta_env();
  var import_jsx_runtime26 = __toESM(require_react_shim());
  var badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
      variants: {
        variant: {
          default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
          secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
          destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
          outline: "text-foreground"
        }
      },
      defaultVariants: {
        variant: "default"
      }
    }
  );
  function Badge({ className, variant, ...props }) {
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { className: cn(badgeVariants({ variant }), className), ...props });
  }

  // src/components/ui/command.tsx
  init_define_import_meta_env();

  // src/components/ui/dialog.tsx
  init_define_import_meta_env();
  var import_jsx_runtime27 = __toESM(require_react_shim());

  // src/components/ui/command.tsx
  var import_jsx_runtime28 = __toESM(require_react_shim());
  function Command({
    className,
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      _e,
      {
        "data-slot": "command",
        className: cn(
          "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
          className
        ),
        ...props
      }
    );
  }
  function CommandList({
    className,
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      _e.List,
      {
        "data-slot": "command-list",
        className: cn(
          "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
          className
        ),
        ...props
      }
    );
  }
  function CommandGroup({
    className,
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      _e.Group,
      {
        "data-slot": "command-group",
        className: cn(
          "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
          className
        ),
        ...props
      }
    );
  }
  function CommandItem({
    className,
    ...props
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      _e.Item,
      {
        "data-slot": "command-item",
        className: cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-[selected='true']:bg-accent aria-[selected='true']:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
          className
        ),
        ...props
      }
    );
  }

  // src/components/ui/multi-select.tsx
  var import_jsx_runtime29 = __toESM(require_react_shim());
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = React64.useState(value);
    (0, import_react39.useEffect)(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);
    return debouncedValue;
  }
  function transToGroupOption(options2, groupBy) {
    if (options2.length === 0) {
      return {};
    }
    if (!groupBy) {
      return {
        "": options2
      };
    }
    const groupOption = {};
    options2.forEach((option) => {
      const key = option[groupBy] || "";
      if (!groupOption[key]) {
        groupOption[key] = [];
      }
      groupOption[key].push(option);
    });
    return groupOption;
  }
  function removePickedOption(groupOption, picked) {
    const cloneOption = JSON.parse(JSON.stringify(groupOption));
    for (const [key, value] of Object.entries(cloneOption)) {
      cloneOption[key] = value.filter(
        (val) => !picked.find((p2) => p2.value === val.value)
      );
    }
    return cloneOption;
  }
  function isOptionsExist(groupOption, targetOption) {
    for (const [, value] of Object.entries(groupOption)) {
      if (value.some((option) => targetOption.find((p2) => p2.value === option.value))) {
        return true;
      }
    }
    return false;
  }
  var CommandEmpty = (0, import_react39.forwardRef)(({ className, ...props }, forwardedRef) => {
    const render = P((state) => state.filtered.count === 0);
    if (!render) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
      "div",
      {
        ref: forwardedRef,
        className: cn("py-6 text-center text-sm", className),
        "cmdk-empty": "",
        role: "presentation",
        ...props
      }
    );
  });
  CommandEmpty.displayName = "CommandEmpty";
  var MultipleSelector = React64.forwardRef(
    ({
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false
    }, ref) => {
      const inputRef = React64.useRef(null);
      const [open, setOpen] = React64.useState(false);
      const [onScrollbar, setOnScrollbar] = React64.useState(false);
      const [isLoading, setIsLoading] = React64.useState(false);
      const dropdownRef = React64.useRef(null);
      const [selected, setSelected] = React64.useState(value || []);
      const [options2, setOptions] = React64.useState(
        transToGroupOption(arrayDefaultOptions, groupBy)
      );
      const [inputValue, setInputValue] = React64.useState("");
      const debouncedSearchTerm = useDebounce(inputValue, delay || 500);
      React64.useImperativeHandle(
        ref,
        () => ({
          selectedValue: [...selected],
          input: inputRef.current,
          focus: () => inputRef?.current?.focus(),
          reset: () => setSelected([])
        }),
        [selected]
      );
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
          setOpen(false);
          inputRef.current.blur();
        }
      };
      const handleUnselect = React64.useCallback(
        (option) => {
          const newOptions = selected.filter((s) => s.value !== option.value);
          setSelected(newOptions);
          onChange?.(newOptions);
        },
        [onChange, selected]
      );
      const handleKeyDown = React64.useCallback(
        (e) => {
          const input = inputRef.current;
          if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
              if (input.value === "" && selected.length > 0) {
                const lastSelectOption = selected[selected.length - 1];
                if (lastSelectOption && !lastSelectOption.fixed) {
                  handleUnselect(lastSelectOption);
                }
              }
            }
            if (e.key === "Escape") {
              input.blur();
            }
          }
        },
        [handleUnselect, selected]
      );
      (0, import_react39.useEffect)(() => {
        if (open) {
          document.addEventListener("mousedown", handleClickOutside);
          document.addEventListener("touchend", handleClickOutside);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
          document.removeEventListener("touchend", handleClickOutside);
        }
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
          document.removeEventListener("touchend", handleClickOutside);
        };
      }, [open]);
      (0, import_react39.useEffect)(() => {
        if (value) {
          setSelected(value);
        }
      }, [value]);
      (0, import_react39.useEffect)(() => {
        if (!arrayOptions || onSearch) {
          return;
        }
        const newOption = transToGroupOption(arrayOptions || [], groupBy);
        if (JSON.stringify(newOption) !== JSON.stringify(options2)) {
          setOptions(newOption);
        }
      }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options2]);
      (0, import_react39.useEffect)(() => {
        const doSearchSync = () => {
          const res = onSearchSync?.(debouncedSearchTerm);
          setOptions(transToGroupOption(res || [], groupBy));
        };
        const exec = async () => {
          if (!onSearchSync || !open) return;
          if (triggerSearchOnFocus) {
            doSearchSync();
          }
          if (debouncedSearchTerm) {
            doSearchSync();
          }
        };
        void exec();
      }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);
      (0, import_react39.useEffect)(() => {
        const doSearch = async () => {
          setIsLoading(true);
          const res = await onSearch?.(debouncedSearchTerm);
          setOptions(transToGroupOption(res || [], groupBy));
          setIsLoading(false);
        };
        const exec = async () => {
          if (!onSearch || !open) return;
          if (triggerSearchOnFocus) {
            await doSearch();
          }
          if (debouncedSearchTerm) {
            await doSearch();
          }
        };
        void exec();
      }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);
      const CreatableItem = () => {
        if (!creatable) return void 0;
        if (isOptionsExist(options2, [{ value: inputValue, label: inputValue }]) || selected.find((s) => s.value === inputValue)) {
          return void 0;
        }
        const Item = /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          CommandItem,
          {
            value: inputValue,
            className: "cursor-pointer",
            onMouseDown: (e) => {
              e.preventDefault();
              e.stopPropagation();
            },
            onSelect: (value2) => {
              if (selected.length >= maxSelected) {
                onMaxSelected?.(selected.length);
                return;
              }
              setInputValue("");
              const newOptions = [...selected, { value: value2, label: value2 }];
              setSelected(newOptions);
              onChange?.(newOptions);
            },
            children: `Create "${inputValue}"`
          }
        );
        if (!onSearch && inputValue.length > 0) {
          return Item;
        }
        if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
          return Item;
        }
        return void 0;
      };
      const EmptyItem = React64.useCallback(() => {
        if (!emptyIndicator) return void 0;
        if (onSearch && !creatable && Object.keys(options2).length === 0) {
          return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(CommandItem, { value: "-", disabled: true, children: emptyIndicator });
        }
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(CommandEmpty, { children: emptyIndicator });
      }, [creatable, emptyIndicator, onSearch, options2]);
      const selectables = React64.useMemo(
        () => removePickedOption(options2, selected),
        [options2, selected]
      );
      const commandFilter = React64.useCallback(() => {
        if (commandProps?.filter) {
          return commandProps.filter;
        }
        if (creatable) {
          return (value2, search) => {
            return value2.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
          };
        }
        return void 0;
      }, [creatable, commandProps?.filter]);
      return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(
        Command,
        {
          ref: dropdownRef,
          ...commandProps,
          onKeyDown: (e) => {
            handleKeyDown(e);
            commandProps?.onKeyDown?.(e);
          },
          className: cn(
            "h-auto overflow-visible bg-transparent",
            commandProps?.className
          ),
          shouldFilter: commandProps?.shouldFilter !== void 0 ? commandProps.shouldFilter : !onSearch,
          filter: commandFilter(),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(
              "div",
              {
                className: cn(
                  "flex items-start justify-between rounded-md border border-input px-3 py-2 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 md:text-sm",
                  {
                    "cursor-text": !disabled && selected.length !== 0
                  },
                  className
                ),
                onClick: () => {
                  if (disabled) return;
                  inputRef?.current?.focus();
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("div", { className: "relative flex flex-wrap gap-1", children: [
                    selected.map((option) => {
                      return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(
                        Badge,
                        {
                          className: cn(
                            "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                            "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                            badgeClassName
                          ),
                          "data-fixed": option.fixed,
                          "data-disabled": disabled || void 0,
                          children: [
                            option.label,
                            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
                              "button",
                              {
                                type: "button",
                                className: cn(
                                  "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                  (disabled || option.fixed) && "hidden"
                                ),
                                onKeyDown: (e) => {
                                  if (e.key === "Enter") {
                                    handleUnselect(option);
                                  }
                                },
                                onMouseDown: (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                },
                                onClick: () => handleUnselect(option),
                                children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(X, { className: "h-3 w-3 text-muted-foreground hover:text-foreground" })
                              }
                            )
                          ]
                        },
                        option.value
                      );
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
                      _e.Input,
                      {
                        ...inputProps,
                        ref: inputRef,
                        value: inputValue,
                        disabled,
                        onValueChange: (value2) => {
                          setInputValue(value2);
                          inputProps?.onValueChange?.(value2);
                        },
                        onBlur: (event) => {
                          if (!onScrollbar) {
                            setOpen(false);
                          }
                          inputProps?.onBlur?.(event);
                        },
                        onFocus: (event) => {
                          setOpen(true);
                          inputProps?.onFocus?.(event);
                        },
                        placeholder: hidePlaceholderWhenSelected && selected.length !== 0 ? "" : placeholder,
                        className: cn(
                          "flex-1 self-baseline bg-transparent outline-none placeholder:text-muted-foreground",
                          {
                            "w-full": hidePlaceholderWhenSelected,
                            "ml-1": selected.length !== 0
                          },
                          inputProps?.className
                        )
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setSelected(selected.filter((s) => s.fixed));
                        onChange?.(selected.filter((s) => s.fixed));
                      },
                      className: cn(
                        "size-5",
                        (hideClearAllButton || disabled || selected.length < 1 || selected.filter((s) => s.fixed).length === selected.length) && "hidden"
                      ),
                      children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(X, {})
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
                    ChevronDown,
                    {
                      className: cn(
                        "size-5 text-muted-foreground/50",
                        (hideClearAllButton || disabled || selected.length >= 1 || selected.filter((s) => s.fixed).length !== selected.length) && "hidden"
                      )
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("div", { className: "relative", children: open && /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
              CommandList,
              {
                className: "absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in",
                onMouseLeave: () => {
                  setOnScrollbar(false);
                },
                onMouseEnter: () => {
                  setOnScrollbar(true);
                },
                onMouseUp: () => {
                  inputRef?.current?.focus();
                },
                children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(import_jsx_runtime29.Fragment, { children: loadingIndicator }) : /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(import_jsx_runtime29.Fragment, { children: [
                  EmptyItem(),
                  CreatableItem(),
                  !selectFirstItem && /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(CommandItem, { value: "-", className: "hidden" }),
                  Object.entries(selectables).map(([key, dropdowns]) => /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
                    CommandGroup,
                    {
                      heading: key,
                      className: "h-full overflow-auto",
                      children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(import_jsx_runtime29.Fragment, { children: dropdowns.map((option) => {
                        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
                          CommandItem,
                          {
                            value: option.label,
                            disabled: option.disable,
                            onMouseDown: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            },
                            onSelect: () => {
                              if (selected.length >= maxSelected) {
                                onMaxSelected?.(selected.length);
                                return;
                              }
                              setInputValue("");
                              const newOptions = [...selected, option];
                              setSelected(newOptions);
                              onChange?.(newOptions);
                            },
                            className: cn(
                              "cursor-pointer",
                              option.disable && "cursor-default text-muted-foreground"
                            ),
                            children: option.label
                          },
                          option.value
                        );
                      }) })
                    },
                    key
                  ))
                ] })
              }
            ) })
          ]
        }
      );
    }
  );
  MultipleSelector.displayName = "MultipleSelector";

  // src/components/ui/rich-text-editor.tsx
  init_define_import_meta_env();
  var React65 = __toESM(require_react_shim());

  // src/components/ui/separator.tsx
  init_define_import_meta_env();
  var import_jsx_runtime30 = __toESM(require_react_shim());

  // src/components/ui/rich-text-editor.tsx
  var import_jsx_runtime31 = __toESM(require_react_shim());

  // src/components/ui/field.tsx
  init_define_import_meta_env();
  var import_jsx_runtime32 = __toESM(require_react_shim());

  // src/components/form.tsx
  var import_jsx_runtime33 = __toESM(require_react_shim());
  function DatePicker({
    title,
    description,
    placeholder = "Select date",
    className = "",
    isRequired = false,
    errorMessage,
    value,
    onChange,
    disabled = false,
    fromDate
  }) {
    return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("div", { className: `space-y-2 ${className}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(Label2, { className: "text-base font-medium", children: [
        title,
        " ",
        isRequired && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("span", { className: "text-destructive", children: "*" })
      ] }),
      description && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("p", { className: "text-sm text-muted-foreground", children: description }),
      /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(Popover2, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(PopoverTrigger2, { asChild: true, children: /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(
          Button2,
          {
            variant: "outline",
            className: `w-full justify-between text-left font-normal ${!value && "text-muted-foreground"} ${errorMessage ? "border-destructive" : ""}`,
            disabled,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("div", { className: "flex items-center", children: [
                /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Calendar, { className: "mr-2 h-4 w-4" }),
                value ? format(value, "PPP") : /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("span", { children: placeholder })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(PopoverContent2, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
          Calendar2,
          {
            mode: "single",
            selected: value,
            onSelect: onChange,
            disabled,
            fromDate,
            initialFocus: true
          }
        ) })
      ] }),
      errorMessage && /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("p", { className: "text-sm text-destructive", children: errorMessage })
    ] });
  }

  // .design-sync/previews/DatePicker.tsx
  var import_jsx_runtime34 = __toESM(require_react_shim());
  function Empty() {
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      DatePicker,
      {
        title: "Start Date",
        placeholder: "Select start date",
        onChange: () => {
        }
      }
    );
  }
  function Selected() {
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      DatePicker,
      {
        title: "End Date",
        description: "Optional — leave blank if ongoing",
        value: /* @__PURE__ */ new Date("2026-08-15T00:00:00"),
        onChange: () => {
        }
      }
    );
  }
  function Required() {
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      DatePicker,
      {
        title: "Date of Birth",
        isRequired: true,
        placeholder: "Select date of birth",
        onChange: () => {
        }
      }
    );
  }
  function WithError() {
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      DatePicker,
      {
        title: "Start Date",
        isRequired: true,
        errorMessage: "Start date is required",
        onChange: () => {
        }
      }
    );
  }
  function Disabled() {
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      DatePicker,
      {
        title: "Start Date",
        value: /* @__PURE__ */ new Date("2026-01-10T00:00:00"),
        disabled: true,
        onChange: () => {
        }
      }
    );
  }
  return __toCommonJS(DatePicker_exports);
})();
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/calendar.js:
lucide-react/dist/esm/icons/chevron-down.js:
lucide-react/dist/esm/icons/chevron-left.js:
lucide-react/dist/esm/icons/chevron-right.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.525.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
