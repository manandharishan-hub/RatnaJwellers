import ResetPasswordClient from "@/components/auth/ResetPasswordClient";

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
    email?: string;
  };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return <ResetPasswordClient token={searchParams.token ?? ""} email={searchParams.email ?? ""} />;
}
