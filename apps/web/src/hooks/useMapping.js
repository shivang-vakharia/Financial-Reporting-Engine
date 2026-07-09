import { useState } from "react";
import {
    getMapping,
    updateMapping
} from "../components/services/mappingService";

const EMPTY_MAPPING = {
    mappings: [],
    summary: {
        total: 0,
        mapped: 0,
        unmapped: 0
    }
};

export default function useMapping() {

    const [mapping, setMapping] = useState(EMPTY_MAPPING);

    async function refreshMapping(periodId) {

        if (!periodId) {
            setMapping(EMPTY_MAPPING);
            return EMPTY_MAPPING;
        }

        const data = await getMapping(periodId);

        setMapping(data);

        return data;
    }

    async function updateMappingResult(
        periodId,
        mappingId,
        scheduleLineId
    ) {

        if (
            !periodId ||
            !mappingId ||
            !scheduleLineId
        ) {
            return;
        }

        await updateMapping(
            mappingId,
            periodId,
            scheduleLineId
        );

        return refreshMapping(periodId);
    }

    function clearMapping() {
        setMapping(EMPTY_MAPPING);
    }

    return {
        mapping,
        refreshMapping,
        updateMappingResult,
        clearMapping
    };
}