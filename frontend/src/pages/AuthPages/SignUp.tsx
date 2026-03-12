import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Kodebox | Signup"
        description="This is the official signup page of kodebox"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
