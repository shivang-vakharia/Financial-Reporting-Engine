import { useMemo, useState } from "react";
import { getCompanies } from "../services/companyService";

export default function useCompanies() {

    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState("");

    const selectedCompany = useMemo(() => {
        return companies.find(company => company.id === companyId);
    }, [companies, companyId]);

    async function refreshCompanies() {

        const data = await getCompanies();

        setCompanies(data);

        return data;
    }

    function clearCompanies() {
        setCompanies([]);
        setCompanyId("");
    }

    return {
        companies,
        companyId,
        setCompanyId,
        selectedCompany,
        refreshCompanies,
        clearCompanies
    };
}