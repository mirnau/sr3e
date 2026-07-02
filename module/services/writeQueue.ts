// Chains each write for a given key onto the completion of the previous one,
// so two near-simultaneous writes to the same target (a chat message, an
// actor's health) can never interleave — each write only ever runs after the
// one before it has fully applied, instead of racing on completion order.
const queues = new Map<string, Promise<unknown>>();

export function serializeByKey(key: string, task: () => Promise<void>): Promise<void> {
    const previous = queues.get(key) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(task);
    queues.set(key, next);
    return next;
}
