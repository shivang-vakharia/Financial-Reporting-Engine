import { useState } from "react";
import { getUploads } from "../components/services/uploadService";

export default function useUploads() {

    const [uploads, setUploads] = useState([]);

    async function refreshUploads(periodId) {

        if (!periodId) {

            setUploads([]);

            return;

        }

        const data = await getUploads(periodId);

        setUploads(data);

    }

    return {

        uploads,

        refreshUploads

    };

}