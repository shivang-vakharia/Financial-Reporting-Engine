import { useState } from "react";

export default function useAsyncStatus() {

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function run(action) {

        setLoading(true);
        setSuccess(false);

        try {

            const result = await action();

            setLoading(false);
            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
            }, 1500);

            return result;

        } catch (err) {

            setLoading(false);
            throw err;

        }

    }

    return {
        loading,
        success,
        run
    };

}