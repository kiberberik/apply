export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      Single Application: {id}
      <div>Applicant, Representative, Documents, Details, Status</div>
    </div>
  );
}
