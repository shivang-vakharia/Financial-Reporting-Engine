import { useState } from "react";
import { getUploads } from "../services/uploadService";

export default function useUploads() {

    const [uploads, setUploads] = useState([]);

    async function refreshUploads(periodId) {

        if (!periodId) {
            setUploads([]);
            return [];
        }

        const data = await getUploads(periodId);

        setUploads(data);

        return data;
    }

    function clearUploads() {
        setUploads([]);
    }

    return {
        uploads,
        refreshUploads,
        clearUploads
    };
}