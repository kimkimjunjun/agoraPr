"use client";

import AgoraRTC, { IAgoraRTCRemoteUser, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRTCClient } from "agora-rtc-react";
import { useEffect, useState } from "react";
import { RemoteUser } from './RemoteUser'; // RemoteUser 임포트

export const Call = (props: { appId: string; channelName: string }) => {
    const { appId, channelName } = props;

    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
    const { localMicrophoneTrack } = useLocalMicrophoneTrack();
    const { localCameraTrack } = useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();

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
            if (!isJoining && !isConnected) {
                await client.join(appId, channelName, null, uid);
            }
        };
        joinChannel();
    }, [appId, channelName, uid, isJoining, isConnected, client]);

    const handleAccept = async (user: IAgoraRTCRemoteUser) => {
        setAcceptedUsers(prev => ({ ...prev, [user.uid]: true }));
        // 비디오와 오디오 구독
        await client.subscribe(user, "video");
        await client.subscribe(user, "audio");
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold">Agora Video Call</h2>
            <div className="flex flex-col">
                <div id="remote-playerlist">
                    {remoteUsers.map((user) => (
                        <div key={user.uid} className="flex flex-col items-center">
                            {user.hasAudio && !acceptedUsers[user.uid] && (
                                <>
                                    <p>{`User ${user.uid}`}</p>
                                    <button onClick={() => handleAccept(user)}>수락</button>
                                </>
                            )}
                            {/* 수락된 경우에만 RemoteUser 컴포넌트 렌더링 */}
                            {acceptedUsers[user.uid] && <RemoteUser user={user} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
