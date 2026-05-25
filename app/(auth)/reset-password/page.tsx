import ResetPasswordClient from "@/components/auth/ResetPasswordClient";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  return <ResetPasswordClient token={resolvedSearchParams.token ?? ""} email={resolvedSearchParams.email ?? ""} />;
}
