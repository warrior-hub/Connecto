import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Camera,
  Loader2,
  UserRound,
  Signal,
} from "lucide-react";

const VideoCall = ({
  localStream,
  remoteStream,
  callingUser,
  onEndCall,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // =====================================================
  // USER INFO
  // =====================================================

  const callerName =
    callingUser?.name ||
    callingUser?.username ||
    "User";

  const callerImage =
    callingUser?.profilePicture ||
    callingUser?.avatar ||
    null;

  const initial = callerName
    .charAt(0)
    .toUpperCase();

  // =====================================================
  // LOCAL VIDEO
  // =====================================================

  useEffect(() => {
    const video = localVideoRef.current;

    if (!video) return;

    if (!localStream) {
      video.srcObject = null;
      return;
    }

    video.srcObject = localStream;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error(
          "Local video play failed:",
          error
        );
      }
    };

    playVideo();

    return () => {
      if (video.srcObject === localStream) {
        video.srcObject = null;
      }
    };
  }, [localStream]);

  // =====================================================
  // REMOTE VIDEO
  // =====================================================

  useEffect(() => {
    const video = remoteVideoRef.current;

    if (!video) return;

    if (!remoteStream) {
      video.srcObject = null;
      return;
    }

    video.srcObject = remoteStream;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error(
          "Remote video play failed:",
          error
        );
      }
    };

    playVideo();

    return () => {
      if (video.srcObject === remoteStream) {
        video.srcObject = null;
      }
    };
  }, [remoteStream]);

  // =====================================================
  // MUTE / UNMUTE
  // =====================================================

  const handleToggleMute = () => {
    if (!localStream) return;

    const audioTracks =
      localStream.getAudioTracks();

    if (!audioTracks.length) return;

    const shouldMute =
      audioTracks[0].enabled;

    audioTracks.forEach((track) => {
      track.enabled = !shouldMute;
    });

    setIsMuted(shouldMute);
  };

  // =====================================================
  // CAMERA ON / OFF
  // =====================================================

  const handleToggleCamera = () => {
    if (!localStream) return;

    const videoTracks =
      localStream.getVideoTracks();

    if (!videoTracks.length) return;

    const shouldTurnOff =
      videoTracks[0].enabled;

    videoTracks.forEach((track) => {
      track.enabled = !shouldTurnOff;
    });

    setIsCameraOff(shouldTurnOff);
  };

  // =====================================================
  // END CALL
  // =====================================================

  const handleEndCall = () => {
    onEndCall?.();
  };

  // =====================================================
  // AVATAR
  // =====================================================

  const Avatar = ({
    size = "large",
  }) => {
    const sizeClass =
      size === "small"
        ? "w-10 h-10 text-sm"
        : "w-24 h-24 sm:w-28 sm:h-28 text-4xl";

    if (callerImage) {
      return (
        <img
          src={callerImage}
          alt={callerName}
          className={`
            ${sizeClass}
            rounded-full
            object-cover
            border
            border-white/10
            shadow-2xl
          `}
        />
      );
    }

    return (
      <div
        className={`
          ${sizeClass}
          rounded-full
          bg-white/10
          backdrop-blur-md
          border
          border-white/10
          flex
          items-center
          justify-center
          text-white
          font-semibold
          shadow-2xl
        `}
      >
        {initial}
      </div>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[10000]
        w-full
        h-[100dvh]
        bg-black
        overflow-hidden
        select-none
      "
    >
      {/* =================================================
          REMOTE VIDEO
      ================================================= */}

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          bg-[#080b0d]
        "
      />

      {/* =================================================
          REMOTE DARK OVERLAY
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          bg-gradient-to-b
          from-black/70
          via-transparent
          to-black/80
        "
      />

      {/* =================================================
          REMOTE PLACEHOLDER
      ================================================= */}

      {!remoteStream && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-[#0b1013]
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_center,_rgba(0,168,132,0.12),_transparent_45%)]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-6
            "
          >
            {/* AVATAR */}

            <div className="mb-5">
              <Avatar />
            </div>

            {/* NAME */}

            <h2
              className="
                text-white
                text-xl
                sm:text-2xl
                font-semibold
                tracking-tight
              "
            >
              {callerName}
            </h2>

            {/* STATUS */}

            <div
              className="
                mt-2
                flex
                items-center
                gap-2
                text-sm
                text-white/60
              "
            >
              <span
                className="
                  w-2
                  h-2
                  rounded-full
                  bg-green-400
                  animate-pulse
                "
              />

              {localStream
                ? "Calling..."
                : "Connecting..."}
            </div>

            {/* LOADER */}

            {!localStream && (
              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-white/40
                "
              >
                <Loader2
                  size={14}
                  className="animate-spin"
                />

                Preparing camera
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          TOP HEADER
      ================================================= */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0
          z-30
          px-4
          sm:px-6
          pt-[calc(env(safe-area-inset-top)+14px)]
          pb-16
          bg-gradient-to-b
          from-black/80
          to-transparent
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            max-w-7xl
            mx-auto
          "
        >
          {/* USER */}

          <div
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >
            <Avatar size="small" />

            <div className="min-w-0">
              <h3
                className="
                  text-white
                  font-semibold
                  text-sm
                  sm:text-base
                  truncate
                  max-w-[180px]
                  sm:max-w-xs
                "
              >
                {callerName}
              </h3>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  mt-0.5
                  text-[11px]
                  sm:text-xs
                  text-white/60
                "
              >
                <Signal size={12} />

                {remoteStream
                  ? "Connected"
                  : "Video call"}
              </div>
            </div>
          </div>

          {/* CONNECTION */}

          {remoteStream && (
            <div
              className="
                hidden
                sm:flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-black/30
                backdrop-blur-md
                border
                border-white/10
                text-xs
                text-white/70
              "
            >
              <span
                className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-green-400
                "
              />

              Connected
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          LOCAL VIDEO PREVIEW
      ================================================= */}

      <div
        className="
          absolute
          z-40
          right-3
          sm:right-5
          top-[88px]
          sm:top-[96px]
          w-[108px]
          sm:w-[150px]
          md:w-[180px]
          aspect-[3/4]
          rounded-2xl
          overflow-hidden
          bg-[#1a2328]
          border
          border-white/20
          shadow-[0_12px_40px_rgba(0,0,0,0.5)]
        "
      >
        {/* LOCAL VIDEO */}

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            bg-[#1a2328]
            scale-x-[-1]
          "
        />

        {/* CAMERA OFF */}

        {localStream && isCameraOff && (
          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              bg-[#1a2328]
            "
          >
            <div
              className="
                w-11
                h-11
                rounded-full
                bg-white/10
                flex
                items-center
                justify-center
                mb-2
              "
            >
              <VideoOff
                size={20}
                className="text-white/80"
              />
            </div>

            <span
              className="
                text-[10px]
                text-white/60
              "
            >
              Camera off
            </span>
          </div>
        )}

        {/* NO CAMERA */}

        {!localStream && (
          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              bg-[#1a2328]
            "
          >
            <Camera
              size={22}
              className="text-white/50 mb-2"
            />

            <span
              className="
                text-[9px]
                text-white/50
              "
            >
              Starting...
            </span>
          </div>
        )}

        {/* YOU LABEL */}

        <div
          className="
            absolute
            left-2
            bottom-2
            px-2
            py-1
            rounded-md
            bg-black/60
            backdrop-blur-sm
            text-[10px]
            text-white/90
          "
        >
          You
        </div>

        {/* MIC STATUS */}

        {isMuted && (
          <div
            className="
              absolute
              right-2
              bottom-2
              w-6
              h-6
              rounded-full
              bg-black/70
              flex
              items-center
              justify-center
            "
          >
            <MicOff
              size={12}
              className="text-white"
            />
          </div>
        )}
      </div>

      {/* =================================================
          BOTTOM CONTROLS
      ================================================= */}

      <div
        className="
          absolute
          left-0
          right-0
          bottom-0
          z-50
          px-4
          sm:px-6
          pt-20
          pb-[calc(env(safe-area-inset-bottom)+18px)]
          bg-gradient-to-t
          from-black
          via-black/80
          to-transparent
        "
      >
        <div
          className="
            flex
            items-center
            justify-center
            gap-3
            sm:gap-5
          "
        >
          {/* =========================================
              MUTE
          ========================================= */}

          <button
            type="button"
            onClick={handleToggleMute}
            disabled={!localStream}
            className="
              group
              w-12
              h-12
              sm:w-14
              sm:h-14
              rounded-full
              bg-white/10
              hover:bg-white/20
              active:scale-95
              disabled:opacity-40
              disabled:cursor-not-allowed
              border
              border-white/10
              backdrop-blur-xl
              flex
              items-center
              justify-center
              text-white
              transition-all
              duration-200
              shadow-lg
            "
            title={
              isMuted
                ? "Unmute microphone"
                : "Mute microphone"
            }
          >
            {isMuted ? (
              <MicOff
                size={20}
                className="sm:w-[22px] sm:h-[22px]"
              />
            ) : (
              <Mic
                size={20}
                className="sm:w-[22px] sm:h-[22px]"
              />
            )}
          </button>

          {/* =========================================
              CAMERA
          ========================================= */}

          <button
            type="button"
            onClick={handleToggleCamera}
            disabled={!localStream}
            className="
              group
              w-12
              h-12
              sm:w-14
              sm:h-14
              rounded-full
              bg-white/10
              hover:bg-white/20
              active:scale-95
              disabled:opacity-40
              disabled:cursor-not-allowed
              border
              border-white/10
              backdrop-blur-xl
              flex
              items-center
              justify-center
              text-white
              transition-all
              duration-200
              shadow-lg
            "
            title={
              isCameraOff
                ? "Turn camera on"
                : "Turn camera off"
            }
          >
            {isCameraOff ? (
              <VideoOff
                size={20}
                className="sm:w-[22px] sm:h-[22px]"
              />
            ) : (
              <Video
                size={20}
                className="sm:w-[22px] sm:h-[22px]"
              />
            )}
          </button>

          {/* =========================================
              END CALL
          ========================================= */}

          <button
            type="button"
            onClick={handleEndCall}
            className="
              w-14
              h-14
              sm:w-16
              sm:h-16
              rounded-full
              bg-red-500
              hover:bg-red-600
              active:scale-95
              flex
              items-center
              justify-center
              text-white
              transition-all
              duration-200
              shadow-[0_8px_30px_rgba(239,68,68,0.35)]
            "
            title="End call"
          >
            <PhoneOff
              size={23}
              className="sm:w-[25px] sm:h-[25px]"
            />
          </button>
        </div>

        {/* MOBILE STATUS */}

        <div
          className="
            flex
            justify-center
            mt-4
            sm:mt-5
          "
        >
          <p
            className="
              text-[10px]
              sm:text-xs
              text-white/40
            "
          >
            {remoteStream
              ? "Secure video call"
              : "Connecting securely..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;