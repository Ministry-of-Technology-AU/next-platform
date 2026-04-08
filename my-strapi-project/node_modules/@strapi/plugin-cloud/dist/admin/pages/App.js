'use strict';

var jsxRuntime = require('react/jsx-runtime');
var admin = require('@strapi/strapi/admin');
var reactRouterDom = require('react-router-dom');
var HomePage = require('./HomePage.js');

const App = ()=>{
    return /*#__PURE__*/ jsxRuntime.jsx("div", {
        children: /*#__PURE__*/ jsxRuntime.jsxs(reactRouterDom.Routes, {
            children: [
                /*#__PURE__*/ jsxRuntime.jsx(reactRouterDom.Route, {
                    index: true,
                    element: /*#__PURE__*/ jsxRuntime.jsx(HomePage.HomePage, {})
                }),
                /*#__PURE__*/ jsxRuntime.jsx(reactRouterDom.Route, {
                    path: "*",
                    element: /*#__PURE__*/ jsxRuntime.jsx(admin.Page.Error, {})
                })
            ]
        })
    });
};

exports.App = App;
//# sourceMappingURL=App.js.map
