"use client"

import AgoraRTC, { IAgoraRTCRemoteUser, RemoteUser, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRTCClient } from "agora-rtc-react";
import { useEffect, useState } from "react";

export const Call = (props: { appId: string; channelName: string }) => {
    const { appId, channelName } = props;

    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
    const { localMicrophoneTrack } = useLocalMicrophoneTrack();
    const { localCameraTrack } = useLocalCameraTrack();

    // 원격 사용자들을 가져옵니다.
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

    // 통화 수락 상태를 관리하는 상태 변수
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
            try {
                if (!isJoining && !isConnected) {
                    await client.join(appId, channelName, null, uid);
                }
            } catch (e) {
                console.error("Error joining channel:", e);
            }
        };
        joinChannel();
    }, [appId, channelName, uid, isJoining, isConnected, client]);

    // 사용자 수락 처리
    const handleAccept = async (user: IAgoraRTCRemoteUser) => {
        setAcceptedUsers(prev => ({ ...prev, [user.uid]: true }));
        await client.subscribe(user, "video");
        await client.subscribe(user, "audio");
    };
    console.log(remoteUsers)
    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold">Agora Video Call</h2>
            <div className="flex flex-col">
                <div id="remote-playerlist">
                    {remoteUsers.map((user) => (
                        <div key={user.uid} className="flex flex-col items-center">
                            {user.hasAudio && (
                                <>
                                    <p>{`User ${user.uid}`}</p>
                                    <button onClick={() => handleAccept(user)}>수락</button>
                                    {acceptedUsers[user.uid] && <RemoteUser user={user} />}
                                </>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};