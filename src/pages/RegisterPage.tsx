import './RegisterPage.css';

import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Network,
  User,
} from 'lucide-react';
import {
  FormEvent,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showPasswordConfirmation, setShowPasswordConfirmation] =
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
    <div className="register-page">
      <div className="register-page__container">
        <section className="register-card">
          <div className="register-card__header">
            <span className="register-card__eyebrow">
              ECOS Modeling 4.0
            </span>

            <h1>Crie sua conta</h1>

            <p>
              Cadastre-se para armazenar,
              gerenciar e compartilhar seus
              modelos de Ecossistemas de Software.
            </p>
          </div>

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >
            <label className="register-field">
              <span>Nome</span>

              <div className="register-input">
                <User
                  size={16}
                  aria-hidden="true"
                />

                <input
                  type="text"
                  name="name"
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                />
              </div>
            </label>

            <label className="register-field">
              <span>E-mail</span>

              <div className="register-input">
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

            <label className="register-field">
              <span>Senha</span>

              <div className="register-input">
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
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
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

              <small>
                Utilize pelo menos 8 caracteres.
              </small>
            </label>

            <label className="register-field">
              <span>Confirmar senha</span>

              <div className="register-input">
                <LockKeyhole
                  size={16}
                  aria-hidden="true"
                />

                <input
                  type={
                    showPasswordConfirmation
                      ? 'text'
                      : 'password'
                  }
                  name="passwordConfirmation"
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  aria-label={
                    showPasswordConfirmation
                      ? 'Ocultar confirmação da senha'
                      : 'Mostrar confirmação da senha'
                  }
                  onClick={() =>
                    setShowPasswordConfirmation(
                      (value) => !value,
                    )
                  }
                >
                  {showPasswordConfirmation ? (
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

            <label className="register-terms">
              <input
                type="checkbox"
                required
              />

              <span>
                Concordo com os termos de uso
                da plataforma.
              </span>
            </label>

            <button
              type="submit"
              className="register-submit"
            >
              Criar conta
            </button>
          </form>

          <div className="register-login">
            <span>Já possui uma conta?</span>

            <Link to="/entrar">
              Entrar
            </Link>
          </div>
        </section>

        <aside className="register-info">
          <div className="register-info__icon">
            <Network
              size={27}
              aria-hidden="true"
            />
          </div>

          <span className="register-info__eyebrow">
            ECOS Modeling
          </span>

          <h2>
            Seus modelos em um único ambiente
          </h2>

          <p>
            Uma conta permite manter seus modelos
            organizados e acessar os recursos da
            plataforma.
          </p>

          <ul>
            <li>
              <Check
                size={15}
                aria-hidden="true"
              />

              <span>
                Armazene seus modelos de ECOS
              </span>
            </li>

            <li>
              <Check
                size={15}
                aria-hidden="true"
              />

              <span>
                Gerencie diferentes versões
              </span>
            </li>

            <li>
              <Check
                size={15}
                aria-hidden="true"
              />

              <span>
                Compartilhe modelos no repositório
              </span>
            </li>

            <li>
              <Check
                size={15}
                aria-hidden="true"
              />

              <span>
                Utilize as análises da plataforma
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}