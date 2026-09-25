const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

let peerConnection = null;

export const createPeerConnection = (onIceCandidate, onTrack) => {
  console.log("🟢 Creating RTCPeerConnection");

  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("🧊 ICE candidate generated");

      onIceCandidate?.(event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    console.log("🎥🎤 REMOTE TRACK RECEIVED");
    console.log("Track kind:", event.track.kind);
    console.log("Streams:", event.streams);

    const [remoteStream] = event.streams;

    if (remoteStream) {
      console.log("✅ Remote stream received");

      onTrack?.(remoteStream);
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log(
      "🔗 WebRTC connection state:",
      peerConnection.connectionState
    );

    if (peerConnection.connectionState === "connected") {
      console.log("✅ WEBRTC CONNECTED");
    }

    if (peerConnection.connectionState === "failed") {
      console.error("❌ WEBRTC CONNECTION FAILED");
    }

    if (peerConnection.connectionState === "disconnected") {
      console.warn("⚠️ WEBRTC DISCONNECTED");
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log(
      "🧊 ICE connection state:",
      peerConnection.iceConnectionState
    );
  };

  peerConnection.onsignalingstatechange = () => {
    console.log(
      "📡 Signaling state:",
      peerConnection.signalingState
    );
  };

  return peerConnection;
};

export const getPeerConnection = () => {
  return peerConnection;
};

export const closePeerConnection = () => {
  if (!peerConnection) return;

  console.log("🔴 Closing WebRTC connection");

  peerConnection.onicecandidate = null;
  peerConnection.ontrack = null;
  peerConnection.onconnectionstatechange = null;
  peerConnection.oniceconnectionstatechange = null;
  peerConnection.onsignalingstatechange = null;

  peerConnection.close();

  peerConnection = null;
};
