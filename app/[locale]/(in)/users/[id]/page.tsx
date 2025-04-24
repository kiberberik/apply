import SingleUser from '@/components/(users)/SingleUser';

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function UserPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <SingleUser userId={resolvedParams.id} />;
}
