import { useState } from "react";

const BRASIL_API_URL = "https://brasilapi.com.br/api/feriados/v1";

// informações por nome do feriado
const HOLIDAY_INFO = {
  "Confraternização mundial": {
    description:
      "Marca o início do ano civil e é um momento de celebração e renovação.",
    tip: "Bom dia para revisar contratos anuais com clientes e ajustar cronogramas de limpeza.",
    movable: false,
  },
  Carnaval: {
    description:
      "Feriado móvel ligado à tradição cristã, muito forte na cultura brasileira.",
    tip: "Muitos negócios fecham ou têm horários reduzidos. Ajuste escalas e plantões com antecedência.",
    movable: true,
  },
  "Sexta-feira Santa": {
    description:
      "Dia cristão que relembra a crucificação de Jesus Cristo. Feriado nacional em todo o país.",
    tip: "Alguns clientes podem antecipar ou postergar limpezas. Combine o cronograma da semana toda.",
    movable: true,
  },
  Páscoa: {
    description:
      "Celebração cristã da ressurreição de Jesus. A data varia todos os anos.",
    tip: "Muitos estabelecimentos trabalham em horário especial no final de semana.",
    movable: true,
  },
  Tiradentes: {
    description:
      "Homenagem a Joaquim José da Silva Xavier, mártir da Inconfidência Mineira.",
    tip: "Feriado fixo, bom para planejar folgas da equipe com antecedência.",
    movable: false,
  },
  "Dia do trabalho": {
    description:
      "Celebra os trabalhadores e a luta por direitos trabalhistas.",
    tip: "Excelente ocasião para reforçar comunicação interna com a equipe de limpeza.",
    movable: false,
  },
  "Corpus Christi": {
    description:
      "Celebração católica que ocorre 60 dias após a Páscoa, com procissões e tapetes de rua em muitas cidades.",
    tip: "Se você presta serviço para igrejas ou eventos, pode haver demanda extra de limpeza.",
    movable: true,
  },
  "Independência do Brasil": {
    description:
      "Comemora a declaração de independência do Brasil em 7 de setembro de 1822.",
    tip: "Muitos comércios fecham; aproveite para fazer limpezas mais pesadas em locais vazios.",
    movable: false,
  },
  "Nossa Senhora Aparecida": {
    description:
      "Padroeira do Brasil, feriado nacional de forte tradição religiosa.",
    tip: "Locais religiosos podem precisar de reforço na limpeza antes e depois das missas.",
    movable: false,
  },
  Finados: {
    description:
      "Dia de homenagens aos entes queridos falecidos, com grande movimento em cemitérios.",
    tip: "Empresas que atendem cemitérios ou floriculturas podem ter aumento de demanda.",
    movable: false,
  },
  "Proclamação da República": {
    description:
      "Marca a mudança do regime monárquico para república em 15 de novembro de 1889.",
    tip: "Bom dia para programar limpezas em prédios públicos fechados.",
    movable: false,
  },
  "Dia da consciência negra": {
    description:
      "Data que celebra a luta e a contribuição da população negra na formação do país.",
    tip: "Em algumas cidades é feriado municipal, em outras não; importante confirmar com cada cliente.",
    movable: false,
  },
  Natal: {
    description:
      "Comemoração do nascimento de Jesus Cristo, uma das datas mais importantes do calendário cristão.",
    tip: "Normalmente é feito um grande preparo antes (limpezas de fim de ano) e menos atividades no dia.",
    movable: false,
  },
};

function getHolidayExtra(holiday) {
  const base = HOLIDAY_INFO[holiday.name] || {};
  const movable = base.movable ?? false;

  return {
    description:
      base.description ||
      "Feriado nacional brasileiro. Você pode usar esta data para ajustar cronogramas e contratos.",
    tip:
      base.tip ||
      "Combine com antecedência se haverá atendimento normal, escala reduzida ou folga completa neste dia.",
    movable,
  };
}

function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("all");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [expandedId, setExpandedId] = useState(null); 

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setHolidays([]);
    setExpandedId(null);

    if (!year || year < 1900 || year > 2199) {
      setError("Ano deve estar entre 1900 e 2199.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${BRASIL_API_URL}/${year}`);
      if (!resp.ok) {
        setError(`Erro ao buscar feriados (status ${resp.status}).`);
        return;
      }

      const data = await resp.json();
      setHolidays(data);
      if (data.length === 0) {
        setStatus(`Nenhum feriado encontrado para ${year}.`);
      } else {
        setStatus(`Encontrados ${data.length} feriados para ${year}.`);
      }
    } catch (err) {
      console.error(err);
      setError("Não foi possível conectar à BrasilAPI.");
    } finally {
      setLoading(false);
    }
  }

  function getMonthNumber(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.getMonth() + 1;
  }

  function getWeekday(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", { weekday: "long" });
  }

  const filteredHolidays = holidays.filter((h) => {
    const m = getMonthNumber(h.date);
    if (month !== "all" && String(m) !== String(month)) return false;
    return true;
  });

  const total = holidays.length;
  const totalFiltered = filteredHolidays.length;

  const monthsMap = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
  };

  function toggleExpanded(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function handleCardKeyDown(e, id) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpanded(id);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="logo">
            <span className="logo-mark">FN</span>
            <span className="logo-text">Feriados BrasilAPI</span>
          </div>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <div className="hero-content">
            <h1>Calendário de Feriados Nacionais</h1>
            <p>
              Consulte os feriados nacionais brasileiros por ano e filtre por
              mês, usando a BrasilAPI como fonte de dados.
            </p>

            <form className="search-card" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="year">Ano</label>
                <input
                  id="year"
                  type="number"
                  min="1900"
                  max="2199"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>

              <div className="field">
                <label htmlFor="month">Mês</label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="all">Todos os meses</option>
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Março</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Carregando..." : "Buscar feriados"}
              </button>
            </form>
          </div>
        </section>

        <section className="status-section">
          {error && <p className="error">{error}</p>}
          {status && <p className="status">{status}</p>}
          {total > 0 && (
            <p className="status secondary">
              Mostrando <strong>{totalFiltered}</strong> de{" "}
              <strong>{total}</strong> feriados para {year}
              {month !== "all" && ` (${monthsMap[month]}).`}
            </p>
          )}
        </section>

        <section className="results-section">
          {filteredHolidays.length > 0 && (
            <div className="cards-list">
              {filteredHolidays.map((h) => {
                const m = getMonthNumber(h.date);
                const weekday = getWeekday(h.date);
                const id = h.date + h.name;
                const isExpanded = expandedId === id;
                const extra = getHolidayExtra(h);

                const day = new Date(h.date).getDate().toString().padStart(2, "0");

                return (
                  <article
                    key={id}
                    className={`holiday-card ${isExpanded ? "expanded" : ""}`}
                    onClick={() => toggleExpanded(id)}
                    tabIndex={0}
                    onKeyDown={(e) => handleCardKeyDown(e, id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="holiday-date">
                      <span className="day">{day}</span>
                      <span className="month">{monthsMap[m] || "Mês"}</span>
                      <span className="weekday">{weekday}</span>
                    </div>
                    <div className="holiday-info">
                      <h3>{h.name}</h3>
                      <p className="holiday-type">
                        Tipo: <span className="badge">{h.type}</span>{" "}
                        {extra.movable ? "• Feriado móvel" : "• Feriado fixo"}
                      </p>
                      <p className="holiday-date-full">
                        Data completa:{" "}
                        {new Date(h.date).toLocaleDateString("pt-BR")}
                      </p>

                      {isExpanded && (
                        <div className="holiday-extra">
                          <p className="holiday-description">
                            <strong>Sobre o feriado:</strong> {extra.description}
                          </p>
                          <p className="holiday-tip">
                            <strong>Dica para organização / empresas:</strong>{" "}
                            {extra.tip}
                          </p>
                          <p className="hint">
                            Clique novamente para esconder as informações.
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && holidays.length === 0 && !error && (
            <p className="empty">
              Busque um ano para carregar os feriados da BrasilAPI.
            </p>
          )}

          {!loading && holidays.length > 0 && filteredHolidays.length === 0 && (
            <p className="empty">
              Não há feriados para o mês selecionado nesse ano.
            </p>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Feriados BrasilAPI · Exemplo em React</p>
      </footer>
    </div>
  );
}


export default App;
