import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/f8-theme.css";
import { authService } from "../../../services/auth.service";
import { toast } from "sonner";
import { Spinner } from "../components/ui/spinner";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../../services/api";
import { GOOGLE_CLIENT_ID } from "../../../services/config";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      try {
        const res = await api.post("/auth/google", {
          tokenId: credentialResponse.credential,
        });

        if (res.data.success) {
          toast.success("Đăng nhập Google thành công!");
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          window.dispatchEvent(new Event("userUpdated"));
          navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
        }
      } catch (error) {
        toast.error("Đăng nhập Google thất bại!");
      }
    },
    [navigate]
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userUpdated"));

      toast.success(`Chào mừng trở lại, ${data.user.name}!`);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ width: "100%", maxWidth: "540px", padding: "16px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
                fontWeight: "bold",
                borderRadius: "8px",
                width: "48px",
                height: "48px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              HK
            </div>
          </Link>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              marginTop: "16px",
              color: "#292929",
            }}
          >
            Đăng nhập
          </h1>
        </div>

        <div style={{ padding: "0 20px" }}>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Email
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#f3f3f3",
                  border: "1px solid transparent",
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Mật khẩu
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#f3f3f3",
                  border: "1px solid transparent",
                }}
              />
              <div style={{ textAlign: "right", marginTop: "8px" }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: "var(--primary-color)",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                borderRadius: "40px",
                padding: "12px",
                fontSize: "16px",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Spinner /> Đang xử lý...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              margin: "24px 0",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Hoặc đăng nhập với
          </div>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Lỗi kết nối tới Google")}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              clientId={GOOGLE_CLIENT_ID}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "32px",
              fontSize: "14px",
            }}
          >
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--primary-color)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
