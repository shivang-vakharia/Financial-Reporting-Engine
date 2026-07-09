import { useState } from "react";
import { getReports } from "../services/reportService";

export default function useReports() {

    const [reports, setReports] = useState([]);

    async function refreshReports(companyId) {

        const data = await getReports(companyId);

        setReports(data);

    }

    return {

        reports,

        refreshReports,

        setReports

    };

}