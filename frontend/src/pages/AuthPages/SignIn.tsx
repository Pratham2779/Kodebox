import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Kodebox | Signin"
        description="This is the official signin page of kodebox"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
