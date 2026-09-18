/**
 * Typed client for same-origin `/api/*` endpoints.
 *
 * Il deballe l enveloppe `{ data }` / `{ error }` et leve `ApiClientError` en
 * cas d echec. Le navigateur ne doit appeler qu une adresse de la meme
 * origine — jamais une interface tierce en direct, qui exposerait sa cle.
 *
 * **Ce gabarit ne fournit pas le serveur.** La route `/api/contact` que le
 * formulaire de reservation appelle vivait dans l autre cadre ; il n y en a
 * plus. Le formulaire affiche donc son etat d erreur tant qu une origine ne
 * repond pas. Le socle `react-ts-server` de la ligne de commande pose un client
 * et un serveur cote a cote, et c est la que cette route doit renaitre.
 */

interface ApiFailure {
  error: {
    code: string;
    message: string;
    issues?: { path: string; message: string }[];
  };
}

/** Thrown by `apiFetch` when an endpoint responds with an error envelope. */
export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Calls a same-origin `/api` endpoint and returns the unwrapped `data`.
 * `path` must be a relative path (e.g. `/api/contact`).
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });

  const body = (await res.json().catch(() => null)) as
    | { data: T }
    | ApiFailure
    | null;

  if (!res.ok || !body || "error" in body) {
    const err =
      body && "error" in body
        ? body.error
        : { code: "request_failed", message: "Request failed." };
    throw new ApiClientError(err.code, err.message, res.status);
  }

  return body.data;
}
