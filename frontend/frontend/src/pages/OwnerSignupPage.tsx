import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import {
  Store,
  UserPlus,
  Mail,
  Lock,
  MapPin,
  User,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export const OwnerSignupPage: React.FC = () => {
  // Current active step: 1 (Owner Info), 2 (Store Info), 3 (Review & Submit)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Owner personal info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Store business info state
  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Validate Step 1 (Owner Credentials)
  const validateStep1 = () => {
    if (name.length < 20 || name.length > 60) {
      return "Owner Full Name must be between 20 and 60 characters long.";
    }
    if (!email || !email.includes("@")) {
      return "Please enter a valid owner email address.";
    }
    if (password.length < 8 || password.length > 16) {
      return "Password must be between 8 and 16 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>_~\-+=\[\]\\\/]/.test(password)) {
      return "Password must contain at least one special character.";
    }
    if (!address.trim()) {
      return "Owner physical address is required.";
    }
    if (address.length > 400) {
      return "Owner address must not exceed 400 characters.";
    }
    return null;
  };

  // Validate Step 2 (Store Business Details)
  const validateStep2 = () => {
    if (!storeName.trim()) {
      return "Store Business Name is required.";
    }
    if (storeName.length > 100) {
      return "Store Name must not exceed 100 characters.";
    }
    if (!storeEmail || !storeEmail.includes("@")) {
      return "Please enter a valid store contact email address.";
    }
    if (!storeAddress.trim()) {
      return "Store Physical Location Address is required.";
    }
    if (storeAddress.length > 400) {
      return "Store Address must not exceed 400 characters.";
    }
    return null;
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err1 = validateStep1();
    if (err1) {
      setCurrentStep(1);
      setError(err1);
      return;
    }

    const err2 = validateStep2();
    if (err2) {
      setCurrentStep(2);
      setError(err2);
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/auth/owner-signup", {
        name,
        email,
        address,
        password,
        storeName,
        storeEmail,
        storeAddress,
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      const resp = err.response?.data;
      if (resp?.details) {
        const firstErr = Object.values(resp.details)[0] as string[];
        setError(firstErr?.[0] || "Validation error");
      } else {
        setError(
          resp?.error ||
            "Vendor registration failed. Please check details and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-10 px-8 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 text-center space-y-5">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Clock size={36} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Registration Submitted!
            </h2>

            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-left text-sm text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-semibold">
                <CheckCircle2 size={18} className="text-amber-600 shrink-0" />
                <span>Store Owner & Store Listing Registered</span>
              </div>
              <p className="text-amber-800 text-xs leading-relaxed">
                Your vendor application for <strong>{storeName}</strong> has
                been created with status{" "}
                <span className="font-bold text-amber-900 underline">
                  PENDING
                </span>
                .
              </p>
              <p className="text-amber-800 text-xs leading-relaxed">
                An Administrator must approve your vendor account before you can
                sign in to access your Store Owner Dashboard.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center space-x-2 py-3 px-4 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all text-sm shadow-sm"
              >
                <span>Return to Login Page</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Store Owner Registration
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Complete the 3-step vendor application process below.
        </p>

        {/* STEP-WISE PROGRESS BAR INDICATOR */}
        <div className="mt-6 bg-white p-4 rounded-3xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Step 1 Indicator */}
            <button
              onClick={() => {
                if (currentStep > 1) setCurrentStep(1);
              }}
              className={`flex items-center space-x-2 text-xs font-bold transition-colors ${
                currentStep === 1
                  ? "text-amber-600"
                  : currentStep > 1
                    ? "text-emerald-600 cursor-pointer"
                    : "text-slate-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 1
                    ? "bg-amber-600 text-white shadow-md"
                    : currentStep > 1
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 size={16} /> : "1"}
              </div>
              <span className="hidden sm:inline">1. Owner Details</span>
            </button>

            <div
              className={`flex-1 h-1 mx-3 rounded-full transition-colors ${
                currentStep > 1 ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />

            {/* Step 2 Indicator */}
            <button
              onClick={() => {
                if (currentStep > 2) setCurrentStep(2);
                else if (currentStep === 1 && !validateStep1())
                  setCurrentStep(2);
              }}
              className={`flex items-center space-x-2 text-xs font-bold transition-colors ${
                currentStep === 2
                  ? "text-amber-600"
                  : currentStep > 2
                    ? "text-emerald-600 cursor-pointer"
                    : "text-slate-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2
                    ? "bg-amber-600 text-white shadow-md"
                    : currentStep > 2
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {currentStep > 2 ? <CheckCircle2 size={16} /> : "2"}
              </div>
              <span className="hidden sm:inline">2. Store Details</span>
            </button>

            <div
              className={`flex-1 h-1 mx-3 rounded-full transition-colors ${
                currentStep > 2 ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />

            {/* Step 3 Indicator */}
            <div
              className={`flex items-center space-x-2 text-xs font-bold transition-colors ${
                currentStep === 3 ? "text-amber-600" : "text-slate-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 3
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">3. Review & Submit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 flex items-start space-x-2 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: OWNER PERSONAL CREDENTIALS */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-amber-800 font-bold text-base">
                  <User size={20} className="text-amber-600" />
                  <span>Step 1: Store Owner Personal Credentials</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Owner Full Name ({name.length}/60 chars - min 20)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elizabeth Charlotte Montgomery"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Min 20, max 60 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Owner Personal Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Owner Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8-16 chars, 1 Upper, 1 Special"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    8-16 characters, at least 1 uppercase letter & 1 special
                    character.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Owner Residence / Physical Address ({address.length}/400
                    chars)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                      <MapPin size={18} />
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter owner complete physical address"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 py-3 px-6 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all text-sm shadow-sm"
                  >
                    <span>Proceed to Step 2: Store Details</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: STORE BUSINESS DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-amber-800 font-bold text-base">
                  <Store size={20} className="text-amber-600" />
                  <span>Step 2: Store & Commercial Details</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Store Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Apex Supermarket & Electronics"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Store Contact Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      placeholder="contact@apexsupermarket.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Store Commercial Location Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                      <MapPin size={18} />
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="Enter store commercial location address"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center space-x-1 py-3 px-5 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                  >
                    <ArrowLeft size={18} />
                    <span>Back to Step 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 py-3 px-6 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all text-sm shadow-sm"
                  >
                    <span>Proceed to Step 3: Review</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT APPLICATION */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-amber-800 font-bold text-base">
                  <ShieldCheck size={20} className="text-amber-600" />
                  <span>Step 3: Review & Submit Application</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Summary Card 1: Owner Details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Owner Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-amber-700 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="text-slate-400">Name:</span>{" "}
                        <strong>{name}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400">Email:</span>{" "}
                        <strong>{email}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400">Address:</span>{" "}
                        <strong>{address}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Summary Card 2: Store Details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Store Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs text-amber-700 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="text-slate-400">Store Name:</span>{" "}
                        <strong>{storeName}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400">Store Email:</span>{" "}
                        <strong>{storeEmail}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400">Store Address:</span>{" "}
                        <strong>{storeAddress}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start space-x-2">
                  <Clock size={18} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Upon submitting, your account will be marked as{" "}
                    <strong className="underline">PENDING</strong> approval. You
                    will be able to log in as soon as a System Administrator
                    approves your vendor request.
                  </span>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center space-x-1 py-3 px-5 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                  >
                    <ArrowLeft size={18} />
                    <span>Back to Step 2</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 py-3.5 px-6 rounded-2xl font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all text-sm shadow-md disabled:opacity-50"
                  >
                    <UserPlus size={18} />
                    <span>
                      {loading
                        ? "Submitting Application..."
                        : "Submit Vendor Registration"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 text-center space-y-2 pt-4 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500">
                Normal User instead?{" "}
              </span>
              <Link
                to="/signup"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                User Signup Page
              </Link>
            </div>
            <div>
              <span className="text-xs text-slate-500">
                Already registered?{" "}
              </span>
              <Link
                to="/login"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
