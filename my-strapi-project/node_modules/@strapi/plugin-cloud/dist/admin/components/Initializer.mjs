import { useRef, useEffect } from 'react';
import { pluginId } from '../pluginId.mjs';

const Initializer = ({ setPlugin })=>{
    const ref = useRef(setPlugin);
    useEffect(()=>{
        ref.current(pluginId);
    }, []);
    return null;
};

export { Initializer };
//# sourceMappingURL=Initializer.mjs.map
