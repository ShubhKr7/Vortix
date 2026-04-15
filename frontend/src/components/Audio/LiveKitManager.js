"use client";
import { useEffect, useState, useRef } from "react";
import { Room, RoomEvent, VideoPresets, Participant, Track, RemoteTrackPublication } from "livekit-client";
import useAuthStore from "@/store/authStore";
import usePresenceStore from "@/store/presenceStore";
import api from "@/lib/api";

export default function LiveKitManager({ workspaceId, muted }) {
  const { user, token } = useAuthStore();
  const { users } = usePresenceStore();
  const [room, setRoom] = useState(null);
  const audioRefs = useRef({});

  useEffect(() => {
    let activeRoom = null;

    const connectToRoom = async () => {
      try {
        const { data } = await api.get(`/workspaces/${workspaceId}/token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';
        
        activeRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        });

        activeRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            const element = track.attach();
            audioRefs.current[participant.identity] = element;
            document.body.appendChild(element);
          }
        });

        activeRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            track.detach();
            const element = audioRefs.current[participant.identity];
            if (element) {
              element.remove();
              delete audioRefs.current[participant.identity];
            }
          }
        });

        await activeRoom.connect(liveKitUrl, data.token);
        setRoom(activeRoom);

        // Publish local audio
        await activeRoom.localParticipant.setMicrophoneEnabled(!muted);
      } catch (err) {
        console.warn("LiveKit connection skipped (Server offline?):", err.message);
      }
    };

    connectToRoom();

    return () => {
      if (activeRoom) {
        activeRoom.disconnect();
      }
      Object.values(audioRefs.current).forEach(el => el.remove());
    };
  }, [workspaceId, token]);

  useEffect(() => {
    if (room && room.localParticipant) {
      room.localParticipant.setMicrophoneEnabled(!muted);
    }
  }, [muted, room]);

  // Proximity Logic
  useEffect(() => {
    if (!room || !user) return;

    const interval = setInterval(() => {
      const myPos = users[user.id || user._id];
      if (!myPos) return;

      room.remoteParticipants.forEach((participant) => {
        const otherPos = users[participant.identity];
        if (!otherPos) return;

        const distance = Math.sqrt(
          Math.pow(myPos.x - otherPos.x, 2) + Math.pow(myPos.y - otherPos.y, 2)
        );

        const threshold = 310; // Proximity threshold
        
        // Find audio track publication
        const audioPub = participant.getTrackPublication(Track.Source.Microphone);
        
        if (audioPub) {
            if (distance < threshold) {
                if (!audioPub.isSubscribed) {
                    audioPub.setSubscribed(true);
                }
                const element = audioRefs.current[participant.identity];
                if (element) {
                    element.volume = Math.max(0, 1 - (distance / threshold));
                }
            } else {
                if (audioPub.isSubscribed) {
                    audioPub.setSubscribed(false);
                }
            }
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [room, users, user?.id, user?._id]);

  return null;
}
