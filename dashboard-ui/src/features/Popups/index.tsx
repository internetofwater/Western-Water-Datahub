import useSessionStore from '@/stores/session';
import { useEffect, useState } from 'react';
import { SourceId } from '../Map/consts';
import { getReservoirConfig } from '../Map/utils';
import { ReservoirConfig } from '../Map/types';
import { Hover } from './Reservoir/Hover';

const Popups: React.FC = () => {
    const hoverFeature = useSessionStore((state) => state.hoverFeature);

    const [config, setConfig] = useState<ReservoirConfig | null>(null);

    useEffect(() => {
        if (hoverFeature && hoverFeature.source) {
            const config = getReservoirConfig(hoverFeature.source as SourceId);
            if (config) {
                setConfig(config);
            }
        } else {
            setConfig(null);
        }
    }, [hoverFeature]);

    if (!hoverFeature || !config) {
        return null;
    }

    return (
        <Hover reservoirProperties={hoverFeature.properties} config={config} />
    );
};

export default Popups;
