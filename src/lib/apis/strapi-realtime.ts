export function connectToStrapiStream(
    onMessage: (data: any) => void,
    endpoint: string = '/api/strapi-stream'
) {
    let source: EventSource | null = null;
    let isActive = true;

    const connect = () => {
        if (!isActive) return;

        source = new EventSource(endpoint);

        source.onmessage = (event) => {
            if (!isActive || event.data === 'connected' || event.data === ': heartbeat') return;
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (err) {
                console.error('Failed to parse SSE data:', err);
            }
        };

        source.onerror = () => {
            if (!isActive) return;
            source?.close();
            // Reconnect after 1 second
            setTimeout(() => {
                if (isActive) connect();
            }, 1000);
        };
    };

    connect();

    return () => {
        isActive = false;
        source?.close();
    };
}
