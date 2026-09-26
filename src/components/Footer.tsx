import AnuncioVieira from "./AnuncioVieira";
import FaixaCarrossel from "./FaixaCarrossel";

const PORTFOLIO = "https://portfolio-daniel-seckler.vercel.app/";
/**
 * Assinatura, nas duas superficies do projeto.
 *
 * O app e escuro e o painel e claro - publicos diferentes. Sem a variante, o
 * rodape do painel ficava em branco sobre papel bege: presente no HTML e
 * invisivel na tela.
 */
const TEMAS = {
  escuro: {
    borda: "border-white/10",
    texto: "text-white/35",
    link: "text-white/60 decoration-white/20 hover:text-white hover:decoration-white/50",
  },
  claro: {
    borda: "border-[#e6e1da]",
    texto: "text-[#86797d]",
    link: "text-[#453d3f] decoration-[#c9bfb8] hover:text-[#d70206] hover:decoration-[#d70206]",
  },
} as const;

export default function Footer({
  tema = "escuro",
}: {
  tema?: keyof typeof TEMAS;
}) {
  const t = TEMAS[tema];

  return (
    <footer className="mt-12 pb-10 sm:pb-14">
      {/* So nas telas do visitante: o painel e da secretaria, que nao e o
          publico dessa divulgacao. */}
      {/* Largura total no desktop: o rodape saiu do container estreito da
          pagina. No celular volta a margem e o canto arredondado, que e como
          ele foi aprovado. */}
      {/* Anuncio de cliente (Vieira & Associados). Fica dentro da mesma trava
          do tema escuro: so nas telas do visitante, nunca no painel. Vem antes
          do carrossel porque tem formulario proprio — os dois competindo pelo
          mesmo espaco o carrossel perde de qualquer jeito. */}
      {tema === "escuro" && (
        <div className="mx-4 mb-8">
          <AnuncioVieira />
        </div>
      )}

      {tema === "escuro" && (
        <div className="mx-4 mb-8 overflow-hidden rounded-2xl sm:mx-0 sm:rounded-none">
          <FaixaCarrossel />
        </div>
      )}

      <div className={`mx-auto max-w-2xl border-t px-4 ${t.borda} pt-5 text-center`}>
        <p className={`text-xs ${t.texto}`}>
          Desenvolvido por{" "}
          <a
            href={PORTFOLIO}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-4 transition ${t.link}`}
          >
            Seckler Digital
          </a>
        </p>
      </div>
    </footer>
  );
}
