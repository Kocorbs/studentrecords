import { Student } from '../types';

/**
 * Socket Service - Simplified polling-based updates for Vercel deployment
 * 
 * Note: Socket.IO is not compatible with Vercel's serverless platform.
 * This service provides a simplified interface that components can use
 * for future real-time implementations or manual refresh triggers.
 */
class SocketService {
    private static instance: SocketService;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    private constructor() { }

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    // No-op connect for compatibility
    connect(): void {
        console.log('📡 Real-time updates disabled (serverless mode)');
    }

    // No-op disconnect for compatibility
    disconnect(): void { }

    // Subscribe to events (for future use or manual triggers)
    subscribe(event: string, callback: (data: any) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    // Subscribe to all student events
    onStudentChange(callback: (type: 'created' | 'updated' | 'deleted', data: any) => void): () => void {
        const unsubCreated = this.subscribe('student:created', (data) => callback('created', data));
        const unsubUpdated = this.subscribe('student:updated', (data) => callback('updated', data));
        const unsubDeleted = this.subscribe('student:deleted', (data) => callback('deleted', data));

        return () => {
            unsubCreated();
            unsubUpdated();
            unsubDeleted();
        };
    }

    // Manually trigger an event (useful for optimistic updates)
    emit(event: string, data: any): void {
        this.listeners.get(event)?.forEach(callback => callback(data));
    }

    // Trigger student change manually after API calls
    triggerStudentChange(type: 'created' | 'updated' | 'deleted', data: Student | { id: number }): void {
        this.emit(`student:${type}`, data);
    }

    isConnected(): boolean {
        return false; // Always false in serverless mode
    }
}

export default SocketService.getInstance();
