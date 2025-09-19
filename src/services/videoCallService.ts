// Video call service that uses backend API for cross-browser communication
// This enables video calls between different browser windows/instances

export interface VideoCall {
  _id?: string;
  callId: string;
  callerEmail: string;
  callerName: string;
  receiverEmail: string;
  receiverName: string;
  status: 'ringing' | 'answered' | 'declined' | 'ended';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class VideoCallService {
  private userCallListeners: Map<string, (calls: VideoCall[]) => void> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Start a video call
  async startCall(callerEmail: string, callerName: string, receiverEmail: string, receiverName: string): Promise<string> {
    try {
      const response = await fetch('/api/video-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callerEmail,
          callerName,
          receiverEmail,
          receiverName
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to start call');
      }

      console.log(`📞 Video call started: ${callerName} calling ${receiverName}`);
      return result.call.callId;
    } catch (error) {
      console.error('Failed to start video call:', error);
      throw error;
    }
  }

  // Answer a call
  async answerCall(callId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/video-calls/${callId}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Video call answered: ${callId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to answer call:', error);
      return false;
    }
  }

  // Decline a call
  async declineCall(callId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/video-calls/${callId}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`❌ Video call declined: ${callId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to decline call:', error);
      return false;
    }
  }

  // End a call
  async endCall(callId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/video-calls/${callId}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`📞 Video call ended: ${callId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to end call:', error);
      return false;
    }
  }

  // Get call by ID
  async getCall(callId: string): Promise<VideoCall | null> {
    try {
      const response = await fetch(`/api/video-calls/${callId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.call;
      }
      return null;
    } catch (error) {
      console.error('Failed to get call:', error);
      return null;
    }
  }

  // Get active calls for a user
  async getActiveCallsForUser(userEmail: string): Promise<VideoCall[]> {
    try {
      const response = await fetch(`/api/video-calls/user/${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      
      if (result.success) {
        return result.calls;
      }
      return [];
    } catch (error) {
      console.error('Failed to get active calls:', error);
      return [];
    }
  }

  // Subscribe to user's call updates
  subscribeToUserCalls(userEmail: string, callback: (calls: VideoCall[]) => void): () => void {
    // Store the callback for this user
    this.userCallListeners.set(userEmail, callback);
    
    const checkForUpdates = async () => {
      try {
        const userCalls = await this.getActiveCallsForUser(userEmail);
        callback(userCalls);
      } catch (error) {
        console.error('Error checking for call updates:', error);
      }
    };

    // Check immediately
    checkForUpdates();

    // Set up polling interval to check for updates every 2 seconds
    const interval = setInterval(checkForUpdates, 2000);
    this.pollingIntervals.set(userEmail, interval);

    // Return unsubscribe function
    return () => {
      const interval = this.pollingIntervals.get(userEmail);
      if (interval) {
        clearInterval(interval);
        this.pollingIntervals.delete(userEmail);
      }
      this.userCallListeners.delete(userEmail);
    };
  }

  // Clean up polling intervals
  cleanup() {
    for (const [userEmail, interval] of this.pollingIntervals.entries()) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
    this.userCallListeners.clear();
  }
}

// Create singleton instance
export const videoCallService = new VideoCallService();
