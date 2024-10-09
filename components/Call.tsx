"use client";
import React, { useEffect } from "react";
import AgoraRTC, {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    useRTCClient,
    IAgoraRTCRemoteUser, // Agora SDK에서 제공하는 타입 임포트
} from "agora-rtc-react";
import { LocalVideoTrack } from "agora-rtc-react";

const Call = (props: { appId: string; channelName: string }) => {
    const { appId, channelName } = props;

    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));
    const { localMicrophoneTrack } = useLocalMicrophoneTrack();
    const { localCameraTrack } = useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();

    const { data: uid, isLoading: isJoining, isConnected } = useJoin(
        {
            appid: appId,
            channel: channelName,
            token: null,
        },
        true
    );

    const { isLoading: isPublishing } = usePublish(
        [localMicrophoneTrack, localCameraTrack],
        true
    );

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

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold">Agora Video Call</h2>
            <div className="flex flex-col">
                {localCameraTrack ? (
                    <div>
                        <LocalVideoTrack
                            track={localCameraTrack}
                            style={{ width: "400px", height: "300px" }}
                            play
                        />
                    </div>
                ) : (
                    <p>카메라를 초기화 중입니다...</p>
                )}

                {remoteUsers.map((user) => (
                    <div key={user.uid}>
                        <h3>User ID: {user.uid}</h3>
                        <RemoteUser user={user} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const RemoteUser = ({ user }: { user: IAgoraRTCRemoteUser }) => {
    const { videoTrack } = user;

    return (
        <div>
            {videoTrack && (
                <video
                    ref={(ref) => {
                        if (ref) {
                            videoTrack.play(ref);
                        }
                    }}
                    style={{ width: "400px", height: "300px" }}
                />
            )}
        </div>
    );
};

const CallWrapper = (props: { appId: string; channelName: string }) => {
    const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));

    return (
        <AgoraRTCProvider client={client}>
            <Call appId={props.appId} channelName={props.channelName} />
        </AgoraRTCProvider>
    );
};

export default CallWrapper;
