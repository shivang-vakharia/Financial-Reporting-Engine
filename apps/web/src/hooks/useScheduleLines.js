import { useState } from "react";
import { getScheduleLines } from "../services/scheduleService";

export default function useScheduleLines() {

    const [scheduleLines, setScheduleLines] = useState([]);

    async function refreshScheduleLines() {

        const data = await getScheduleLines();

        setScheduleLines(data);

    }

    return {

        scheduleLines,

        refreshScheduleLines

    };

}