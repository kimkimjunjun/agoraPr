import CallWrapper from "@/components/Call";

export default function Page({ params }: { params: { channelName: string } }) {
    return (
        <main className="flex w-full flex-col">
            <p className="absolute z-10 mt-2 ml-12 text-2xl font-bold text-gray-900">
                {params.channelName}
            </p>
            <CallWrapper appId={process.env.NEXT_PUBLIC_AGORA_APP_ID!} channelName={params.channelName} />
        </main>
    );
}
