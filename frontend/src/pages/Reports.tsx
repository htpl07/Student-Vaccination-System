import { Button, Card, Container, Group, Input, SimpleGrid, Text, Title, Stack, Modal } from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useDisclosure } from '@mantine/hooks';

export default function Reports() {
  const [vaccine, setVaccine] = useState('');
  const [report, setReport] = useState<any[]>([]);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    isError: false
  });

  const fetchReport = () => {
    api.get(`/reports?vaccine_name=${vaccine}&skip=0&limit=10`).then(res => setReport(res.data.results));
  };

  const showModalMessage = (title: string, message: string, isError: boolean) => {
    setModalContent({
      title,
      message,
      isError
    });
    openModal();
  };

  const downloadCSV = () => {
    const downloadWindow = window.open(
      `http://127.0.0.1:8000/reports/download/csv?vaccine_name=${vaccine}`, 
      "_blank"
    );
    
    if (downloadWindow) {
      showModalMessage('Success', 'Reports downloaded successfully', false);
    } else {
      showModalMessage('Error', 'Failed to open download window', true);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <Container>
      <Title order={2} mb="lg">Vaccination Reports</Title>
      
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={modalContent.title}
        centered
        size="md"
        styles={{
          title: {
            color: modalContent.isError ? 'red' : 'green',
            fontWeight: 'bold'
          }
        }}
      >
        <Text>{modalContent.message}</Text>
        <Button 
          fullWidth 
          mt="md" 
          onClick={closeModal}
          color={modalContent.isError ? 'red' : 'green'}
        >
          OK
        </Button>
      </Modal>

      <Stack mb="xl">
        <Group grow>
          <Input 
            placeholder="Vaccine Name" 
            onChange={(e) => setVaccine(e.target.value)} 
          />
          <Button onClick={fetchReport} color="#663399">Filter</Button>
          <Button color="green" onClick={downloadCSV}>Download CSV</Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {report.map((r, i) => (
            <Card key={i} shadow="sm" withBorder>
              <Text><strong>Student:</strong> {r.student_name}</Text>
              <Text><strong>Class:</strong> {r.class}</Text>
              <Text><strong>Vaccine:</strong> {r.vaccine_name}</Text>
              <Text><strong>Date:</strong> {r.vaccination_date}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}