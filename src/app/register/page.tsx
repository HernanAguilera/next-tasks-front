"use client";
import { useEffect, useState } from "react";
import { userRegistrationSchema } from "./userRegistration.schema";
import { register, RegisterData } from "@/http/Auth";
import { redirect } from "next/navigation";
import { useAuthStore } from "../state/auth";
import { useStore } from "zustand";
import { notifyError, notifySuccess } from "../utils/notifications";
import ClientSideWrapper from "../components/ClientSideWrapper";

type RegisterFormData = {
  name?: {
    _errors: string[];
  };
  email?: {
    _errors: string[];
  };
  password?: {
    _errors: string[];
  };
  confirmPassword?: {
    _errors: string[];
  };
};

enum RegisterFields {
  name = "name",
  email = "email",
  password = "password",
  confirmPassword = "confirmPassword",
}

export default function Register() {
  const [errors, setErrors] = useState<RegisterFormData>({});
  const { isAuthenticated } = useStore(useAuthStore);

  useEffect(() => {
    if (isAuthenticated()) {
      redirect("/");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    console.log({
      currentTarget: e.currentTarget,
      formData: formData.getAll("name"),
    });
    const { success, error } = userRegistrationSchema.safeParse(data);
    if (!success) {
      setErrors(error.format() as RegisterFormData);
      console.log(error.format());
      return;
    }
    try {
      const res = await register(data as RegisterData);
      notifySuccess("User created successfully");
    } catch (error: any) {
      console.log({ error });
      notifyError(
        error.code === 400
          ? error.error.map((e: any) => e.message).join(", ")
          : error.error
      );
      return;
    }
    redirect("/login");
  };

  const getErrorMessage = (fieldName: RegisterFields): string[] => {
    return errors[fieldName]?._errors || [];
  };

  return (
    <ClientSideWrapper>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Register</h1>
        <form
          className="flex flex-col gap-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
          onSubmit={handleSubmit}
        >
          <div>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name"
              className={`form-input ${errors?.name ? "error" : ""}`}
            />
            {errors?.name &&
              getErrorMessage(RegisterFields.name).map((error, index) => (
                <p key={index} className="text-red-500">
                  {error}
                </p>
              ))}
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`form-input ${errors?.email ? "error" : ""}`}
            />
            {errors?.email &&
              getErrorMessage(RegisterFields.email).map((error, index) => (
                <span key={index} className="text-red-500">
                  {error}
                </span>
              ))}
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`form-input ${errors?.password ? "error" : ""}`}
            />
            {errors?.password &&
              getErrorMessage(RegisterFields.password).map((error, index) => (
                <span key={index} className="text-red-500">
                  {error}
                </span>
              ))}
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`form-input ${errors?.confirmPassword ? "error" : ""}`}
            />
            {errors?.confirmPassword &&
              getErrorMessage(RegisterFields.confirmPassword).map(
                (error, index) => (
                  <span key={index} className="text-red-500">
                    {error}
                  </span>
                )
              )}
          </div>
          <button type="submit" className="w-full button light">
            Register
          </button>
        </form>
      </div>
    </ClientSideWrapper>
  );
}
