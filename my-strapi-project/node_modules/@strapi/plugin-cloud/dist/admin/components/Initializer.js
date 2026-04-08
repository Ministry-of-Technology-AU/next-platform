'use strict';

var react = require('react');
var pluginId = require('../pluginId.js');

const Initializer = ({ setPlugin })=>{
    const ref = react.useRef(setPlugin);
    react.useEffect(()=>{
        ref.current(pluginId.pluginId);
    }, []);
    return null;
};

exports.Initializer = Initializer;
//# sourceMappingURL=Initializer.js.map
