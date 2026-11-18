import { useState } from "react";
import { TelaDeEntrada } from "./components/TelaDeEntrada.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { CadastroSecretarioPage } from "./pages/CadastroSecretarioPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { PacientesPage } from "./pages/PacientesPage.tsx";

function App() {
  const [tela, setTela] = useState<"login" | "cadastro" | "home" | "pacientes">(
    "login",
  );
  const [nome, setNome] = useState("");

  if (tela === "home")
    return (
      <HomePage
        nome={nome}
        onSair={() => setTela("login")}
        onIrParaPacientes={() => setTela("pacientes")}
      />
    );

  if (tela === "pacientes")
    return (
      <PacientesPage
        nome={nome}
        onSair={() => setTela("login")}
        onIrParaConsultas={() => setTela("home")}
      />
    );

  return (
    <TelaDeEntrada>
      {tela === "login" && (
        <LoginPage
          onIrParaCadastro={() => setTela("cadastro")}
          onEntrar={(nomeDeQuemEntrou) => {
            setNome(nomeDeQuemEntrou);
            setTela("home");
          }}
        />
      )}
      {tela === "cadastro" && (
        <CadastroSecretarioPage onVoltarParaLogin={() => setTela("login")} />
      )}
    </TelaDeEntrada>
  );
}

export default App;
