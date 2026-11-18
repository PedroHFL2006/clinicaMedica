import {
  Alert,
  Button,
  Group,
  Modal,
  NativeSelect,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import axios from "axios";
import type { Consulta } from "@clinica/shared/consulta";
import { consultaSchema } from "@clinica/shared/consulta";
import type { Medico } from "@clinica/shared/medico";
import type { Paciente } from "@clinica/shared/paciente";
import { MenuLateral } from "../components/MenuLateral";
import {
  cadastrarConsulta,
  listarConsultas,
  listarMedicos,
  listarPacientes,
} from "../services/api";

type Props = {
  nome: string;
  onSair: () => void;
  onIrParaPacientes: () => void;
};

export function HomePage({ nome, onSair, onIrParaPacientes }: Props) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [erro, setErro] = useState("");

  // Dados para o formulário de nova consulta
  const [modalAberto, setModalAberto] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);

  const [pacienteId, setPacienteId] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [data, setData] = useState("");
  const [turno, setTurno] = useState("");

  const [erroForm, setErroForm] = useState("");
  const [erroPaciente, setErroPaciente] = useState("");
  const [erroMedico, setErroMedico] = useState("");
  const [erroData, setErroData] = useState("");
  const [erroTurno, setErroTurno] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function buscarConsultas() {
    setErro("");
    try {
      setConsultas(await listarConsultas());
    } catch {
      setErro("Não foi possível buscar as consultas na API");
    }
  }

  async function carregarOpcoes() {
    try {
      const [listaPacientes, listaMedicos] = await Promise.all([
        listarPacientes(),
        listarMedicos(),
      ]);
      setPacientes(listaPacientes);
      setMedicos(listaMedicos);
    } catch {
      setErroForm("Não foi possível carregar os pacientes ou médicos da API.");
    }
  }

  function abrirModalNovaConsulta() {
    setErroForm("");
    setErroPaciente("");
    setErroMedico("");
    setErroData("");
    setErroTurno("");
    setModalAberto(true);
    carregarOpcoes();
  }

  function fecharModalNovaConsulta() {
    setModalAberto(false);
    setPacienteId("");
    setMedicoId("");
    setData("");
    setTurno("");
    setErroForm("");
    setErroPaciente("");
    setErroMedico("");
    setErroData("");
    setErroTurno("");
  }

  async function salvarConsulta(evento: React.FormEvent) {
    evento.preventDefault();
    setErroForm("");
    setErroPaciente("");
    setErroMedico("");
    setErroData("");
    setErroTurno("");

    const pId = Number(pacienteId);
    const mId = Number(medicoId);

    // Validação de formulário com Zod schema
    const validacao = consultaSchema.safeParse({
      data,
      turno,
      medicoId: mId,
      pacienteId: pId,
    });

    if (!validacao.success) {
      for (const issue of validacao.error.issues) {
        const campo = issue.path[0];
        if (campo === "pacienteId") setErroPaciente(issue.message);
        if (campo === "medicoId") setErroMedico(issue.message);
        if (campo === "data") setErroData(issue.message);
        if (campo === "turno") setErroTurno(issue.message);
      }
      return;
    }

    setSalvando(true);
    try {
      await cadastrarConsulta({
        data,
        turno: turno as "M" | "T",
        medicoId: mId,
        pacienteId: pId,
      });

      fecharModalNovaConsulta();
      await buscarConsultas();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        setErroForm(e.response.data?.mensagem || "Erro ao agendar consulta.");
      } else {
        setErroForm("Não foi possível conectar à API.");
      }
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    buscarConsultas();
  }, []);

  return (
    <MenuLateral
      nome={nome}
      onSair={onSair}
      abaAtiva="consultas"
      onNavegar={(aba) => {
        if (aba === "pacientes") onIrParaPacientes();
      }}
    >
      <Group justify="space-between" align="center" mb="xl">
        <Title order={1}>Consultas</Title>
        <Group>
          <Button
            variant="light"
            leftSection={<IconUsers size={18} />}
            onClick={onIrParaPacientes}
          >
            Ver Pacientes
          </Button>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={abrirModalNovaConsulta}
          >
            Nova consulta
          </Button>
        </Group>
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
              <Table.Th>Data</Table.Th>
              <Table.Th>Turno</Table.Th>
              <Table.Th>Paciente</Table.Th>
              <Table.Th>Médico</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {consultas.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center" py="md">
                    Nenhuma consulta cadastrada.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              consultas.map((consulta) => (
                <Table.Tr key={consulta.id}>
                  <Table.Td>{consulta.data}</Table.Td>
                  <Table.Td>
                    {consulta.turno === "M" ? "Manhã" : "Tarde"}
                  </Table.Td>
                  <Table.Td>{consulta.paciente.nome}</Table.Td>
                  <Table.Td>{consulta.medico.nome}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal
        opened={modalAberto}
        onClose={fecharModalNovaConsulta}
        title={<Text fw={700} size="lg">Nova Consulta</Text>}
        centered
      >
        <form onSubmit={salvarConsulta}>
          <Stack gap="md">
            {erroForm && <Alert color="red">{erroForm}</Alert>}

            <NativeSelect
              label="Paciente"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.currentTarget.value)}
              error={erroPaciente}
              data={[
                { label: "Selecione um paciente...", value: "" },
                ...pacientes.map((p) => ({
                  label: p.nome,
                  value: String(p.id),
                })),
              ]}
            />

            <NativeSelect
              label="Médico"
              value={medicoId}
              onChange={(e) => setMedicoId(e.currentTarget.value)}
              error={erroMedico}
              data={[
                { label: "Selecione um médico...", value: "" },
                ...medicos.map((m) => ({
                  label: `${m.nome} (${m.especialidade})`,
                  value: String(m.id),
                })),
              ]}
            />

            <TextInput
              label="Data da consulta"
              placeholder="DD/MM/AAAA (ex: 15/10/2026)"
              value={data}
              onChange={(e) => setData(e.currentTarget.value)}
              error={erroData}
            />

            <NativeSelect
              label="Turno"
              value={turno}
              onChange={(e) => setTurno(e.currentTarget.value)}
              error={erroTurno}
              data={[
                { label: "Selecione o turno...", value: "" },
                { label: "Manhã (M)", value: "M" },
                { label: "Tarde (T)", value: "T" },
              ]}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={fecharModalNovaConsulta}>
                Cancelar
              </Button>
              <Button type="submit" loading={salvando}>
                Salvar Consulta
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </MenuLateral>
  );
}
