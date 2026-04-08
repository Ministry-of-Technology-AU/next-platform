import { jsx, jsxs } from 'react/jsx-runtime';
import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './HomePage.mjs';

const App = ()=>{
    return /*#__PURE__*/ jsx("div", {
        children: /*#__PURE__*/ jsxs(Routes, {
            children: [
                /*#__PURE__*/ jsx(Route, {
                    index: true,
                    element: /*#__PURE__*/ jsx(HomePage, {})
                }),
                /*#__PURE__*/ jsx(Route, {
                    path: "*",
                    element: /*#__PURE__*/ jsx(Page.Error, {})
                })
            ]
        })
    });
};

export { App };
//# sourceMappingURL=App.mjs.map
