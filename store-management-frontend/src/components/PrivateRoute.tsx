import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spin } from "antd";

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Bỏ authentication check - cho phép truy cập tất cả
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
