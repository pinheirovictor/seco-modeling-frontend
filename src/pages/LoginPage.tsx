import './LoginPage.css';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Network,
} from 'lucide-react';
import {
  FormEvent,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

export function LoginPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    /*
     * A integração com a API de autenticação
     * será adicionada posteriormente.
     */
  };

  return (
    <div className="login-page">
      <div className="login-page__container">
        <section className="login-card">
          <div className="login-card__header">
            <span className="login-card__eyebrow">
              ECOS Modeling 4.0
            </span>

            <h1>Entrar</h1>

            <p>
              Acesse sua conta para gerenciar seus
              modelos e utilizar os recursos da plataforma.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <label className="login-field">
              <span>E-mail</span>

              <div className="login-input">
                <Mail
                  size={16}
                  aria-hidden="true"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <div className="login-field__header">
                <span>Senha</span>

                <button
                  type="button"
                  className="login-forgot-password"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="login-input">
                <LockKeyhole
                  size={16}
                  aria-hidden="true"
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  name="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={16}
                      aria-hidden="true"
                    />
                  ) : (
                    <Eye
                      size={16}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            </label>

            <label className="login-remember">
              <input
                type="checkbox"
                name="remember"
              />

              <span>
                Manter conectado
              </span>
            </label>

            <button
              type="submit"
              className="login-submit"
            >
              Entrar
            </button>
          </form>

          <div className="login-register">
            <span>Ainda não possui uma conta?</span>

            <Link to="/cadastro">
              Criar conta
            </Link>
          </div>
        </section>

        <aside className="login-info">
          <div className="login-info__icon">
            <Network
              size={28}
              aria-hidden="true"
            />
          </div>

          <span className="login-info__eyebrow">
            ECOS Modeling
          </span>

          <h2>
            Modele e analise Ecossistemas de Software
          </h2>

          <p>
            Utilize um ambiente integrado para construir,
            armazenar e analisar modelos de Ecossistemas
            de Software.
          </p>

          <div className="login-info__highlight">
            <strong>
              ECOS Modeling 4.0
            </strong>

            <span>
              Modelagem, evolução, saúde e qualidade
              em um único ambiente.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}