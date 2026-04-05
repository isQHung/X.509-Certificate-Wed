"use client";
import { LoadingProvider } from "@/context/LoadingContext";
import React from "react";
import { ToastContainer } from "react-toastify";
import Spinner from "./Spinner";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LoadingProvider>
            {children}
            <Spinner />
            <ToastContainer position="top-right" theme="colored" />
        </LoadingProvider>
    );
}
