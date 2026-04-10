import { RewardsUniversalNav } from "@/components/RewardsUniversalNav";

function takeFirst(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-white">
      <RewardsUniversalNav
        userName={takeFirst(params.myasuName)}
        signOutUrl={takeFirst(params.signoutUrl)}
      />
    </div>
  );
}
