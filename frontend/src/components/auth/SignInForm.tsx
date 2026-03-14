// // src/components/auth/SignInForm.tsx
// import { useState, FormEvent } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AxiosError } from "axios";

// import { EyeCloseIcon, EyeIcon } from "../../icons";
// import Label from "../form/Label";
// import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
// import Button from "../ui/button/Button";

// import { useAuth } from "../../context/AuthContext";

// export default function SignInForm() {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (loading) return;

//     setError(null);

//     if (!email || !password) {
//       setError("Email and password are required");
//       return;
//     }

//     setLoading(true);

//     try {
//       //  login updates tokenStorage + AuthContext state
//       await login(email, password, rememberMe);

//       //  ProtectedRoute will now allow dashboard
//       navigate("/", { replace: true });
//     } catch (err) {
//       if (err instanceof AxiosError) {
//         const status = err.response?.status;
//         const message = err.response?.data?.message;

//         if (status === 401) {
//           setError("Invalid email or password");
//         } else if (status === 403) {
//           setError("Please verify your email before signing in");
//         } else {
//           setError(message || "Login failed");
//         }
//       } else {
//         setError("Something went wrong. Please try again.");
//       }
//     } finally {

//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col flex-1">
//       <div className="w-full max-w-md pt-10 mx-auto" />

//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign In
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Enter your email and password to sign in.
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 text-sm text-red-600">{error}</div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="space-y-6">
//               {/* Email */}
//               <div>
//                 <Label>
//                   Email <span className="text-error-500">*</span>
//                 </Label>
//                 <Input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={loading}
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <Label>
//                   Password <span className="text-error-500">*</span>
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     disabled={loading}
//                   />
//                   <span
//                     onClick={() => !loading && setShowPassword((p) => !p)}
//                     className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2"
//                   >
//                     {showPassword ? (
//                       <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
//                     ) : (
//                       <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
//                     )}
//                   </span>
//                 </div>
//               </div>

//               {/* Remember Me */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <Checkbox
//                     checked={rememberMe}
//                     onChange={setRememberMe}
//                     disabled={loading}
//                   />
//                   <span className="text-sm text-gray-700 dark:text-gray-400">
//                     Remember me
//                   </span>
//                 </div>

//                 <Link
//                   to="/reset-password"
//                   className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               <Button className="w-full" size="sm" disabled={loading}>
//                 {loading ? "Signing in..." : "Sign In"}
//               </Button>
//             </div>
//           </form>

//           <p className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400 sm:text-start">
//             Don&apos;t have an account?{" "}
//             <Link
//               to="/signup"
//               className="text-brand-500 hover:text-brand-600"
//             >
//               Sign Up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }






import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      await login(email, password, rememberMe);
      // Redirect to /dashboard instead of /
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 401) {
          setError("Invalid email or password");
        } else if (status === 403) {
          setError("Please verify your email before signing in");
        } else {
          setError(message || "Login failed");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <span
                    onClick={() => !loading && setShowPassword((p) => !p)}
                    className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={rememberMe}
                    onChange={setRememberMe}
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-400">
                    Remember me
                  </span>
                </div>

                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          <p className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-500 hover:text-brand-600"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
