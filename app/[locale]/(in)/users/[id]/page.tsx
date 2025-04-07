import SingleUser from '@/components/(users)/SingleUser';

export default async function Page({ params }: { params: { id: string } }) {
  return <SingleUser userId={params.id} />;
}
