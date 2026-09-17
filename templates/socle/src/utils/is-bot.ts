/**
 * Un robot, plutot qu un visiteur.
 *
 * L autre cadre lisait l en-tete de la requete, sur le serveur. Il n y a plus
 * de serveur : la meme chaine se lit sur le navigateur, ou elle est tout aussi
 * declarative — et tout aussi facile a contrefaire, ce qui n a jamais ete le
 * sujet. Elle ne sert qu a epargner a un robot le chargement d un morceau de
 * page qu il n emploie pas.
 */
export function isBot(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("lighthouse") ||
    ua.includes("googlebot") ||
    ua.includes("pagespeed") ||
    ua.includes("chrome-lighthouse") ||
    ua.includes("headlesschrome") ||
    ua.includes("gtmetrix") ||
    ua.includes("pingdom") ||
    ua.includes("bingbot") ||
    ua.includes("yandexbot")
  );
}
