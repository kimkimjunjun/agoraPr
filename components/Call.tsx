"use client";

import AgoraRTC, { IAgoraRTCRemoteUser, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRTCClient } from "agora-rtc-react";
import { useEffect, useState } from "react";
import { RemoteUser } from './RemoteUser'; // RemoteUser 임포트

export const Call = (props: { appId: string; channelName: string }) => {
    const { appId, channelName } = props;

    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
    const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack();
    const { localCameraTrack, error: camError } = useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();
    const [streamed, setStreamed] = useState(false)

    const { data: uid, isLoading: isJoining, isConnected } = useJoin({
        appid: appId,
        channel: channelName,
        token: null,
    }, true);

    const { isLoading: isPublishing } = usePublish(
        [localMicrophoneTrack, localCameraTrack],
        true
    );

    const [acceptedUsers, setAcceptedUsers] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const publishTracks = async () => {
            if (isConnected && localMicrophoneTrack && localCameraTrack && !isPublishing) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    });
                    await client.publish([localMicrophoneTrack, localCameraTrack]);
                } catch (e) {
                    console.error("Error publishing tracks:", e);
                }
            }
        };
        publishTracks();
    }, [localMicrophoneTrack, localCameraTrack, isPublishing, isConnected, client]);

    useEffect(() => {
        const joinChannel = async () => {
            if (!isJoining && !isConnected && uid) {
                try {
                    await client.join(appId, channelName, null, uid);
                } catch (e) {
                    console.error("Error joining channel:", e);
                }
            }
        };
        joinChannel();
    }, [appId, channelName, uid, isJoining, isConnected, client]);
    console.log(acceptedUsers)
    const handleAccept = async (user: IAgoraRTCRemoteUser) => {
        setAcceptedUsers(prev => ({ ...prev, [user.uid]: true }));
        setStreamed(true);
        // 클라이언트가 채널에 연결된 경우에만 구독
        if (isConnected) {
            try {
                const audioTrack = user.audioTrack;

                // 오디오 트랙이 존재하는 경우 비활성화
                if (audioTrack) {
                    const mediaStreamTrack = audioTrack.getMediaStreamTrack();
                    if (mediaStreamTrack) {
                        mediaStreamTrack.enabled = true; // 오디오 트랙 비활성화
                    }
                }
                await client.subscribe(user, "video");
                await client.subscribe(user, "audio");
            } catch (e) {
                console.error("Error subscribing to user:", e);
            }
        } else {
            console.warn("Cannot subscribe, client is not connected.");
        }
    };

    const handleRefuse = async (user: IAgoraRTCRemoteUser) => {
        setAcceptedUsers(prev => ({ ...prev, [user.uid]: true }));
        setStreamed(false);
        // 클라이언트가 채널에 연결된 경우에만 구독
        if (isConnected) {
            try {
                const audioTrack = user.audioTrack;

                // 오디오 트랙이 존재하는 경우 비활성화
                if (audioTrack) {
                    const mediaStreamTrack = audioTrack.getMediaStreamTrack();
                    if (mediaStreamTrack) {
                        mediaStreamTrack.enabled = false; // 오디오 트랙 비활성화
                    }
                }

                await client.unsubscribe(user, "video");
                await client.unsubscribe(user, "audio");
            } catch (e) {
                console.error("Error subscribing to user:", e);
            }
        } else {
            console.warn("Cannot subscribe, client is not connected.");
        }
    };
    console.log(remoteUsers)
    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold">Agora Video Call</h2>
            {micError && <p className="text-red-500">마이크 권한을 허용해주세요.</p>}
            {camError && <p className="text-red-500">카메라 권한을 허용해주세요.</p>}
            <div className="flex flex-col">
                <div className="flex flex-wrap" id="remote-playerlist">
                    {remoteUsers.map((user) => (
                        <div key={user.uid} className="flex flex-col items-center">
                            {user.hasAudio && !acceptedUsers[user.uid] && (
                                <>
                                    <p>{`User ${user.uid}`}</p>
                                    <button onClick={() => handleAccept(user)}>수락</button>
                                </>
                            )}
                            {/* 수락된 경우에만 RemoteUser 컴포넌트 렌더링 */}
                            {acceptedUsers[user.uid] && <RemoteUser user={user} acceptedUsers={acceptedUsers} />}
                            <button onClick={() => handleRefuse(user)}>거절</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
