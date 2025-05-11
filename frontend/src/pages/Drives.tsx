import { Button, Card, Container, Input, SimpleGrid, Stack, Text, Title, Modal, NumberInput, Group, Pagination } from '@mantine/core';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../services/api';
import { useDisclosure } from '@mantine/hooks';
import { useLocation } from 'react-router-dom';

export default function Drives() {
  const [drives, setDrives] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: null,
    vaccine_name: '',
    drive_date: '',
    doses_available: '',
    applicable_classes: '',
  });

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    isError: false
  });
  const location = useLocation();

   // Add pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const drivesPerPage = 6; // Number of drives per page
 
   // Calculate paginated drives
   const indexOfLastDrive = currentPage * drivesPerPage;
   const indexOfFirstDrive = indexOfLastDrive - drivesPerPage;
   const currentDrives = drives.slice(indexOfFirstDrive, indexOfLastDrive);
   const totalPages = Math.ceil(drives.length / drivesPerPage);

  const fetchDrives = () => {
    api.get('/drives')
      .then(res => setDrives(res.data))
      .catch(err => {
        showModalMessage('Error', 'Failed to fetch drives', true);
      });
  };

  const showModalMessage = (title: string, message: string, isError: boolean) => {
    setModalContent({
      title,
      message,
      isError
    });
    openModal();
  };

  const handleAddOrUpdate = async () => {
    // Client-side validation
    if (!form.vaccine_name.trim() || !form.drive_date) {
      showModalMessage('', 'Vaccine name and date are required', true);
      return;
    }

    if (!form.doses_available || parseInt(form.doses_available) <= 0) {
      showModalMessage('Error', 'Please specify a valid number of doses (minimum 1)', true);
      return;
    }

    try {
      const payload = {
        ...form,
        doses_available: form.doses_available ? parseInt(form.doses_available) : null
      };

      const response = form.id
        ? await api.put(`/drives/${form.id}`, payload)
        : await api.post('/drives', payload);

      showModalMessage(
        'Success', 
        form.id ? 'Drive updated successfully!' : 'Drive created successfully!',
        false
      );
      
      fetchDrives();
      setForm({
        id: null,
        vaccine_name: '',
        drive_date: '',
        doses_available: '',
        applicable_classes: '',
      });
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred';
      
      // Handle different error response formats
      if (err.response?.data?.detail?.message) {
        errorMessage = err.response.data.detail.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showModalMessage('Uh-oh!', errorMessage, true);
    }
  };

  const handleEdit = (drive: any) => {
    // Prevent editing past drives
    if (dayjs(drive.drive_date).isBefore(dayjs(), 'day')) {
      showModalMessage('Cannot Edit', 'Past drives cannot be edited', true);
      return;
    }
    setForm({ 
      ...drive,
      drive_date: drive.drive_date.split('T')[0],
      doses_available: drive.doses_available?.toString() || ''
    });
  };

  // Add this useEffect to handle incoming edit state
  useEffect(() => {
    fetchDrives();
    
    // Check for drive data passed from dashboard
    if (location.state?.driveToEdit) {
      setForm(location.state.driveToEdit);
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state]);

  return (
    <Container>
      <Title order={2} mb="lg">Vaccination Drives</Title>

      {/* Notification Modal */}
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
        <Input
          placeholder="Vaccine Name"
          value={form.vaccine_name}
          onChange={(e) => setForm({ ...form, vaccine_name: e.target.value })}
          required
        />
        
        <Input
          type="date"
          placeholder="Drive Date"
          value={form.drive_date}
          onChange={(e) => setForm({ ...form, drive_date: e.target.value })}
          required
        />
        
        <NumberInput
          placeholder="Doses Available"
          value={form.doses_available ? parseInt(form.doses_available) : undefined}
          onChange={(value) => setForm({ ...form, doses_available: value?.toString() || '' })}
          min={1}
          required
          withAsterisk
        />
        
        <Input
          placeholder="Applicable Classes"
          value={form.applicable_classes}
          onChange={(e) => setForm({ ...form, applicable_classes: e.target.value })}
        />
        
        <Button
          onClick={handleAddOrUpdate}
          color="#663399"
          fullWidth
        >
          {form.id ? 'Update Drive' : 'Create Drive'}
        </Button>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {currentDrives.map((d) => (
          <Card key={d.id} withBorder shadow="sm">
            <Text><strong>Vaccine:</strong> {d.vaccine_name}</Text>
            <Text><strong>Date:</strong> {new Date(d.drive_date).toLocaleDateString()}</Text>
            <Text><strong>Doses:</strong> {d.doses_available}</Text>
            <Text><strong>Classes:</strong> {d.applicable_classes}</Text>
            <Button
              fullWidth
              mt="sm"
              onClick={() => handleEdit(d)}
              color="#663399"
            >
              Edit
            </Button>
          </Card>
        ))}
      </SimpleGrid>
      {/* Add Pagination component */}
      {drives.length > drivesPerPage && (
        <Group justify="center" mt="xl">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            color="#663399"
            withEdges
          />
        </Group>
      )}
    </Container>
  );
}
