import { useState } from "react";
import {
    getMapping,
    updateMapping
} from "../services/mappingService";

export default function useMapping() {

    const [mapping, setMapping] = useState({
        mappings: [],
        summary: {
            total: 0,
            mapped: 0,
            unmapped: 0
        }
    });

    async function refreshMapping(periodId) {

        if (!periodId) {

            setMapping({
                mappings: [],
                summary: {
                    total: 0,
                    mapped: 0,
                    unmapped: 0
                }
            });

            return;

        }

        const data = await getMapping(periodId);

        setMapping(data);

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

        await refreshMapping(periodId);

    }

    return {

        mapping,

        refreshMapping,

        updateMappingResult

    };

}