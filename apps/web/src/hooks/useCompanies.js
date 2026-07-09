import { useMemo, useState } from "react";
import { getCompanies } from "../components/services/companyService";

export default function useCompanies() {

    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState("");

    const selectedCompany = useMemo(() => {
        return companies.find(c => c.id === companyId);
    }, [companies, companyId]);

    async function refreshCompanies() {

        const data = await getCompanies();

        setCompanies(data);

        return data;
    }

    return {

        companies,

        setCompanies,

        companyId,

        setCompanyId,

        selectedCompany,

        refreshCompanies

    };

}