import { useState } from "react";
import { authApi } from "../../api/api";
import "./AuthScreen.css";

export default function AuthScreen({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = isRegister ? await authApi.register(form) : await authApi.login({ email: form.email, password: form.password });
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Project Planner</h1>
        <p className="auth-subtitle">{isRegister ? "Создайте аккаунт" : "Войдите в аккаунт"}</p>
        {isRegister && (
          <label>Имя<input name="name" value={form.name} onChange={updateField} required autoComplete="name" /></label>
        )}
        <label>Email<input name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" /></label>
        <label>Пароль<input name="password" type="password" value={form.password} onChange={updateField} required minLength={6} autoComplete={isRegister ? "new-password" : "current-password"} /></label>
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? "Подождите..." : isRegister ? "Зарегистрироваться" : "Войти"}</button>
        <button type="button" className="auth-switch" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
          {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
        </button>
      </form>
    </main>
  );
}