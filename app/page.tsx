"use client";

import React, { useState } from 'react';
import CallWrapper from '@/components/CallWrapper';


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
      {typeof window !== 'undefined' && appId && channelName && <CallWrapper appId={appId} channelName={channelName} />}
    </div>
  );
}
