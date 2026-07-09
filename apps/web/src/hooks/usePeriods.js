import { useMemo, useState } from "react";
import { getPeriods } from "../components/services/periodService";

export default function usePeriods() {

    const [periods, setPeriods] = useState([]);
    const [periodId, setPeriodId] = useState("");

    const selectedPeriod = useMemo(() => {
        return periods.find(period => period.id === periodId);
    }, [periods, periodId]);

    async function refreshPeriods(companyId) {

        if (!companyId) {
            setPeriods([]);
            setPeriodId("");
            return [];
        }

        const data = await getPeriods(companyId);

        setPeriods(data);

        return data;
    }

    return {
        periods,
        periodId,
        setPeriodId,
        selectedPeriod,
        refreshPeriods
    };

}