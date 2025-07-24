// Notification Service for PWA
export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check if notifications are supported
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Check current permission status
  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Register service worker
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Send notification to all users
  public async sendNotificationToAll(title: string, body: string, data?: any): Promise<void> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (this.getPermissionStatus() !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    try {
      // For now, we'll send a local notification
      // In a real implementation, you'd send this to all registered users via a server
      await this.sendLocalNotification(title, body, data);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Send local notification
  public async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    if (this.getPermissionStatus() !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      data: data || {}
    };

    if (this.registration) {
      await this.registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }

  // Send push notification (for server-side implementation)
  public async sendPushNotification(subscription: PushSubscription, payload: any): Promise<void> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    try {
      await fetch('/api/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          payload
        })
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Get push subscription
  public async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    try {
      const subscription = await this.registration!.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  // Subscribe to push notifications
  public async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    try {
      const subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  public async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Convert VAPID public key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 