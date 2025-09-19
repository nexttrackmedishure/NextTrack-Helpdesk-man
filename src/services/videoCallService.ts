// Simple video call service for managing call states
// This is a basic implementation - in a real app you'd use WebRTC

export interface VideoCall {
  id: string;
  callerEmail: string;
  callerName: string;
  receiverEmail: string;
  receiverName: string;
  status: 'ringing' | 'answered' | 'declined' | 'ended';
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

class VideoCallService {
  private calls: Map<string, VideoCall> = new Map();
  private callListeners: Map<string, (call: VideoCall) => void> = new Map();
  private userCallListeners: Map<string, (calls: VideoCall[]) => void> = new Map();

  // Start a video call
  startCall(callerEmail: string, callerName: string, receiverEmail: string, receiverName: string): string {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const call: VideoCall = {
      id: callId,
      callerEmail,
      callerName,
      receiverEmail,
      receiverName,
      status: 'ringing',
      startTime: new Date()
    };

    this.calls.set(callId, call);
    
    // Simulate sending call notification to receiver
    this.simulateCallNotification(call);
    
    return callId;
  }

  // Answer a call
  answerCall(callId: string): boolean {
    const call = this.calls.get(callId);
    if (call && call.status === 'ringing') {
      call.status = 'answered';
      this.notifyCallUpdate(call);
      return true;
    }
    return false;
  }

  // Decline a call
  declineCall(callId: string): boolean {
    const call = this.calls.get(callId);
    if (call && call.status === 'ringing') {
      call.status = 'declined';
      call.endTime = new Date();
      this.notifyCallUpdate(call);
      return true;
    }
    return false;
  }

  // End a call
  endCall(callId: string): boolean {
    const call = this.calls.get(callId);
    if (call && (call.status === 'answered' || call.status === 'ringing')) {
      call.status = 'ended';
      call.endTime = new Date();
      call.duration = call.endTime.getTime() - call.startTime.getTime();
      this.notifyCallUpdate(call);
      return true;
    }
    return false;
  }

  // Get call by ID
  getCall(callId: string): VideoCall | undefined {
    return this.calls.get(callId);
  }

  // Get active calls for a user
  getActiveCallsForUser(userEmail: string): VideoCall[] {
    return Array.from(this.calls.values()).filter(call => 
      (call.callerEmail === userEmail || call.receiverEmail === userEmail) &&
      (call.status === 'ringing' || call.status === 'answered')
    );
  }

  // Subscribe to call updates
  subscribeToCall(callId: string, callback: (call: VideoCall) => void): () => void {
    this.callListeners.set(callId, callback);
    
    // Return unsubscribe function
    return () => {
      this.callListeners.delete(callId);
    };
  }

  // Subscribe to user's call updates
  subscribeToUserCalls(userEmail: string, callback: (calls: VideoCall[]) => void): () => void {
    // Store the callback for this user
    this.userCallListeners.set(userEmail, callback);
    
    const checkForUpdates = () => {
      const userCalls = this.getActiveCallsForUser(userEmail);
      callback(userCalls);
    };

    // Check immediately
    checkForUpdates();

    // Set up interval to check for updates
    const interval = setInterval(checkForUpdates, 1000);

    // Return unsubscribe function
    return () => {
      clearInterval(interval);
      this.userCallListeners.delete(userEmail);
    };
  }

  // Simulate call notification (in a real app, this would be a WebSocket or push notification)
  private simulateCallNotification(call: VideoCall) {
    console.log(`📞 Video call notification sent to ${call.receiverEmail}`);
    
    // In a real implementation, this would trigger a notification on the receiver's device
    // For now, we'll simulate the notification by triggering the receiver's callback
    setTimeout(() => {
      // Trigger notification for the receiver
      this.triggerReceiverNotification(call);
    }, 100);
    
    setTimeout(() => {
      // Simulate auto-decline after 30 seconds if not answered
      if (call.status === 'ringing') {
        this.declineCall(call.id);
        console.log(`📞 Call ${call.id} auto-declined (timeout)`);
      }
    }, 30000);
  }

  // Trigger notification for the receiver
  private triggerReceiverNotification(call: VideoCall) {
    // Find any listeners for this user and trigger them
    for (const [userId, callback] of this.userCallListeners.entries()) {
      if (userId === call.receiverEmail) {
        // Get updated calls for this user
        const userCalls = this.getActiveCallsForUser(userId);
        callback(userCalls);
        console.log(`📞 Triggered notification for receiver: ${call.receiverEmail}`);
      }
    }
  }

  // Notify listeners of call updates
  private notifyCallUpdate(call: VideoCall) {
    const listener = this.callListeners.get(call.id);
    if (listener) {
      listener(call);
    }
  }

  // Clean up old calls
  cleanupOldCalls() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [callId, call] of this.calls.entries()) {
      if (call.startTime < oneHourAgo && (call.status === 'ended' || call.status === 'declined')) {
        this.calls.delete(callId);
        this.callListeners.delete(callId);
      }
    }
  }
}

// Create singleton instance
export const videoCallService = new VideoCallService();

// Clean up old calls every 5 minutes
setInterval(() => {
  videoCallService.cleanupOldCalls();
}, 5 * 60 * 1000);
