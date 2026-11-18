import { Alert, Button, Group, Table, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Paciente } from "@clinica/shared/paciente";
import { MenuLateral } from "../components/MenuLateral";
import { listarPacientes } from "../services/api";

type Props = {
  nome: string;
  onSair: () => void;
  onIrParaConsultas: () => void;
};

export function PacientesPage({ nome, onSair, onIrParaConsultas }: Props) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function buscarPacientes() {
    setErro("");
    setCarregando(true);
    try {
      const dados = await listarPacientes();
      setPacientes(dados);
    } catch {
      setErro("Não foi possível buscar os pacientes na API.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarPacientes();
  }, []);

  return (
    <MenuLateral
      nome={nome}
      onSair={onSair}
      abaAtiva="pacientes"
      onNavegar={(aba) => {
        if (aba === "consultas") onIrParaConsultas();
      }}
    >
      <Group justify="space-between" align="center" mb="xl">
        <Title order={1}>Pacientes</Title>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={18} />}
          onClick={onIrParaConsultas}
        >
          Ir para Consultas
        </Button>
      </Group>

      {erro && (
        <Alert color="red" mb="md">
          {erro}
        </Alert>
      )}

      <Table.ScrollContainer minWidth={560}>
        <Table bg="white" highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>CPF</Table.Th>
              <Table.Th>Telefone</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pacientes.length === 0 && !carregando ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed" ta="center" py="md">
                    Nenhum paciente cadastrado.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              pacientes.map((paciente) => (
                <Table.Tr key={paciente.id}>
                  <Table.Td>{paciente.nome}</Table.Td>
                  <Table.Td>{paciente.cpf}</Table.Td>
                  <Table.Td>{paciente.telefone}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </MenuLateral>
  );
}
