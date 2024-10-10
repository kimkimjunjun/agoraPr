"use client";

import React, { useEffect, useState } from 'react';
import AgoraRTC, { AgoraRTCProvider, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRTCClient, IAgoraRTCRemoteUser, useRemoteUserTrack } from 'agora-rtc-react';

const Call = (props: { appId: string; channelName: string }) => {
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


const RemoteUser = ({ user }: { user: IAgoraRTCRemoteUser }) => {
  const { track: videoTrack, isLoading: isVideoLoading } = useRemoteUserTrack(user, "video");
  const { track: audioTrack, isLoading: isAudioLoading } = useRemoteUserTrack(user, "audio");

  // 비디오 재생
  useEffect(() => {
    if (videoTrack) {
      const videoRef = document.getElementById(`video-${user.uid}`);
      if (videoRef) {
        videoTrack.play(videoRef);
      }
    }
  }, [videoTrack, user.uid]);

  // 오디오 재생
  useEffect(() => {
    if (audioTrack) {
      audioTrack.play();  // 오디오 트랙을 자동으로 재생
    }
  }, [audioTrack]);

  return (
    <div id={`player-${user.uid}`}>
      {isVideoLoading ? (
        <p>비디오를 로드 중입니다...</p>
      ) : videoTrack ? (
        <video
          id={`video-${user.uid}`}
          style={{ width: "800px", height: "500px" }}
        />
      ) : (
        <p>사용자가 비디오를 전송하지 않습니다.</p>
      )}

      {isAudioLoading ? (
        <p>오디오를 로드 중입니다...</p>
      ) : audioTrack ? (
        <p>오디오가 활성화되었습니다.</p>
      ) : (
        <p>사용자가 오디오를 전송하지 않습니다.</p>
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

export default function Home() {
  const [appId, setAppId] = useState('');
  const [channelName, setChannelName] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    setAppId(form.appId.value);
    setChannelName(form.channel.value);
  };

  return (
    <div className="container">
      <form onSubmit={handleJoin}>
        <input name="appId" type="text" placeholder="Enter App ID" required />
        <input name="channel" type="text" placeholder="Enter Channel Name" required />
        <button type="submit">Join</button>
      </form>
      {appId && channelName && <CallWrapper appId={appId} channelName={channelName} />}
    </div>
  );
}
