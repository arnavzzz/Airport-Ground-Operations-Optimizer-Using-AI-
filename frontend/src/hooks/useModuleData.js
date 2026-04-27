import { useCallback, useEffect, useState } from "react";

export function useModuleData(fetcher) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshedAt, setRefreshedAt] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const next = await fetcher();
            setData(next);
            setRefreshedAt(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load module data.");
        } finally {
            setLoading(false);
        }
    }, [fetcher]);

    useEffect(() => {
        let mounted = true;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const next = await fetcher();
                if (mounted) {
                    setData(next);
                    setRefreshedAt(new Date());
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : "Unable to load module data.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            mounted = false;
        };
    }, [fetcher]);

    return { data, loading, error, refreshedAt, refresh: load };
}
