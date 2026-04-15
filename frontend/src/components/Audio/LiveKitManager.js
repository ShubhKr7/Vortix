"use client";
import { useEffect, useState, useRef } from "react";
import { Room, RoomEvent, VideoPresets, Participant, Track, RemoteTrackPublication } from "livekit-client";
import useAuthStore from "@/store/authStore";
import usePresenceStore from "@/store/presenceStore";
import api from "@/lib/api";

export default function LiveKitManager({ workspaceId, muted, cameraEnabled, layout }) {
  const { user, token } = useAuthStore();
  const { users, setVideo } = usePresenceStore();
  const [room, setRoom] = useState(null);
  const audioRefs = useRef({});

  useEffect(() => {
    if (room && room.localParticipant) {
        if (cameraEnabled) {
            console.log("📸 Attempting to enable camera...");
            room.localParticipant.setCameraEnabled(true).then(() => {
                // Wait for the track to be published and available
                setTimeout(() => {
                    const publications = Array.from(room.localParticipant.videoTrackPublications.values());
                    const videoPub = publications.find(p => p.videoTrack);
                    
                    if (videoPub && videoPub.videoTrack) {
                        console.log("✅ Local video track found, attaching...");
                        const el = videoPub.videoTrack.attach();
                        el.style.display = 'none';
                        el.muted = true;
                        el.play().then(() => {
                            console.log(`🎥 Video playing! Size: ${el.videoWidth}x${el.videoHeight}`);
                            setVideo(user.id || user._id, el);
                        }).catch(e => console.error("❌ Video play failed:", e));
                        document.body.appendChild(el);
                    } else {
                        console.warn("⚠️ Camera enabled but no video track found in publications.");
                    }
                }, 1000);
            }).catch(err => {
                console.error("❌ setCameraEnabled failed:", err);
            });
        } else {
            console.log("📸 Turning camera off...");
            room.localParticipant.setCameraEnabled(false);
            setVideo(user.id || user._id, null);
        }
    }
  }, [cameraEnabled, room, user?.id, user?._id, setVideo]);

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
          } else if (track.kind === Track.Kind.Video) {
            const element = track.attach();
            element.classList.add('hidden-video');
            element.style.display = 'none';
            document.body.appendChild(element);
            setVideo(participant.identity, element);
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
          } else if (track.kind === Track.Kind.Video) {
            const tracks = track.detach();
            tracks.forEach(el => el.remove());
            setVideo(participant.identity, null);
          }
        });

        await activeRoom.connect(liveKitUrl, data.token);
        setRoom(activeRoom);

        // Publish local audio and video
        await activeRoom.localParticipant.setMicrophoneEnabled(!muted);
        await activeRoom.localParticipant.setCameraEnabled(cameraEnabled);
        
        // Store local video
        if (cameraEnabled) {
             const track = Array.from(activeRoom.localParticipant.videoTrackPublications.values())[0]?.track;
             if (track) {
                 const el = track.attach();
                 el.style.display = 'none';
                 document.body.appendChild(el);
                 setVideo(user.id || user._id, el);
             }
        }
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
      setVideo(user?.id || user?._id, null);
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
        const myRoomId = getRoomId(myPos.x, myPos.y);
        const otherRoomId = getRoomId(otherPos.x, otherPos.y);
        
        // Find audio and video track publications
        const audioPub = participant.getTrackPublication(Track.Source.Microphone);
        const videoPub = participant.getTrackPublication(Track.Source.Camera);

        if (distance < threshold && myRoomId === otherRoomId) {
            // Subscribe to both audio and video when nearby and in same room
            if (audioPub && !audioPub.isSubscribed) audioPub.setSubscribed(true);
            if (videoPub && !videoPub.isSubscribed) videoPub.setSubscribed(true);
            
            const element = audioRefs.current[participant.identity];
            if (element) {
                element.volume = Math.max(0, 1 - (distance / threshold));
            }
        } else {
            // Unsubscribe when far away OR in different rooms to save bandwidth/privacy
            if (audioPub && audioPub.isSubscribed) audioPub.setSubscribed(false);
            if (videoPub && videoPub.isSubscribed) videoPub.setSubscribed(false);
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [room, users, user?.id, user?._id]);

  return null;
}
