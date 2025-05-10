import {
  Button,
  Card,
  Container,
  Group,
  Input,
  SimpleGrid,
  Text,
  Title,
  Stack,
  Select,
  Modal,
  ActionIcon,
  Box,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { IconTrash } from '@tabler/icons-react';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [selectedDrives, setSelectedDrives] = useState<{ [key: number]: string }>({});
  const [popupOpened, setPopupOpened] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;
  const [csvFile, setCsvFile] = useState<File | null>(null);


  const fetchStudents = (params = {}) => {
    api.get('/students', { params }).then(res => setStudents(res.data));
  };

  const fetchDrives = () => {
    api.get('/drives').then(res => setDrives(res.data));
  };

  const handleAdd = () => {
    if (!name.trim() || !studentClass.trim()) {
      setPopupMessage('Please fill both Name and Class!');
      setPopupOpened(true);
      return;
    }

    api.post('/students', { name, student_class: studentClass })
      .then(() => {
        setPopupMessage('Student added successfully!');
        setPopupOpened(true);
        fetchStudents();
        setName('');
        setStudentClass('');
      })
      .catch((error) => {
        const message = error.response?.data?.detail || 'Error adding student';
        setPopupMessage(message);
        setPopupOpened(true);
      });
  };

  const handleVaccinate = (studentId: number) => {
    const driveId = selectedDrives[studentId];
    if (!driveId) {
      setPopupMessage('Please select a drive before vaccinating!');
      setPopupOpened(true);
      return;
    }

    api.post(`/students/${studentId}/vaccinate/${driveId}`)
      .then(() => {
        setPopupMessage('Student vaccinated successfully!');
        setPopupOpened(true);
        fetchStudents();
      })
      .catch((error) => {
        const message = error.response?.data?.detail || 'Error during vaccination';
        setPopupMessage(message);
        setPopupOpened(true);
      });
  };

  const handleDelete = (studentId: number) => {
    api.delete(`/students/${studentId}`)
      .then(() => {
        setPopupMessage('Student deleted successfully!');
        setPopupOpened(true);
        fetchStudents();
      })
      .catch((error) => {
        const message = error.response?.data?.detail || 'Error deleting student';
        setPopupMessage(message);
        setPopupOpened(true);
      });
  };

  const handleSearch = () => {
    const params: any = {};

    if (search.trim()) {
      if (!isNaN(Number(search))) {
        params.id = Number(search);
      } else {
        params.name = search;
      }
    }

    fetchStudents(params);
  };

  const handleBulkUpload = () => {
    if (!csvFile) {
      setPopupMessage('Please select a CSV file to upload.');
      setPopupOpened(true);
      return;
    }
  
    const formData = new FormData();
    formData.append('file', csvFile);
  
    api.post('/students/bulk-upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((res) => {
        setPopupMessage(res.data.message || 'Students uploaded successfully!');
        setPopupOpened(true);
        fetchStudents();
        setCsvFile(null);
      })
      .catch((error) => {
        const message = error.response?.data?.detail || 'Error uploading students';
        setPopupMessage(message);
        setPopupOpened(true);
      });
  };
  

  useEffect(() => {
    fetchStudents();
    fetchDrives();
  }, []);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  const totalPages = Math.ceil(students.length / studentsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <Container>
      <Title order={2} mb="lg">Manage Students</Title>

      <Modal
        opened={popupOpened}
        onClose={() => setPopupOpened(false)}
        centered
        size="md"
        overlayProps={{
          blur: 3,
          backgroundOpacity: 0.55,
        }}
      >
        <Text>{popupMessage}</Text>
      </Modal>

      <Stack mb="xl">
        <Group grow>
          <Input
            placeholder="Search by ID or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={handleSearch} color="#663399">Search</Button>
          <Button onClick={() => { setSearch(''); fetchStudents(); }} variant="outline" color="#663399">
            Reset
          </Button>
        </Group>
      </Stack>

      <Stack mb="xl">
        <Group grow>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Class"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
          />
          <Button onClick={handleAdd} color="#663399">Register Student</Button>
        </Group>

        {/* 🆕 Bulk Upload CSV Section */}
        <Stack mb="xl">
          <Title order={3}>Bulk Upload Students via CSV</Title>
          <Group grow>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setCsvFile(e.target.files[0]);
                }
              }}
            />
            <Button onClick={handleBulkUpload} color="#663399">
              Upload CSV
            </Button>
          </Group>
          <Text size="sm" c="dimmed">Expected Columns: <strong>name</strong> and <strong>student_class</strong></Text>
        </Stack>

        <Title order={2} mb="lg">Students Vaccination Status</Title>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {currentStudents.map((s) => (
            <Card key={s.id} withBorder shadow="sm">
              <Text><strong>Name:</strong> {s.name}</Text>
              <Text><strong>Class:</strong> {s.student_class}</Text>
              <Text>
                <strong>Vaccinated:</strong>
                <Box
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: s.vaccinated ? '#c8e6c9' : '#ffcdd2',
                    color: s.vaccinated ? '#388e3c' : '#d32f2f',
                    fontWeight: 500,
                    fontSize: '14px',
                  }}
                >
                  {s.vaccinated ? 'Yes' : 'No'}
                </Box>
              </Text>
              {/* Vaccination Details */}
      {s.vaccinated && s.vaccination_details && (
        <>
          <Text mt="sm"><strong>Vaccine:</strong> {s.vaccination_details.vaccine_name}</Text>
          <Text>
            <strong>Date:</strong> {new Date(s.vaccination_details.drive_date).toLocaleDateString()}
          </Text>
        </>
      )}

{!s.vaccinated && (
        <Select
          placeholder="Select Drive"
          data={drives.map((d: any) => ({
            label: `${d.vaccine_name} (${new Date(d.drive_date).toLocaleDateString()})`,
            value: d.id.toString(),
          }))}
          value={selectedDrives[s.id] || null}
          onChange={(value) =>
            setSelectedDrives((prev) => ({ ...prev, [s.id]: value || '' }))
          }
          mt="sm"
        />
      )}

              {/* Buttons Row */}
              <Group justify="flex-end" mt="sm">
                <Button
                  size="md"
                  onClick={() => handleVaccinate(s.id)}
                  disabled={s.vaccinated}
                  color="#663399"
                >
                  Vaccinate
                </Button>
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => handleDelete(s.id)}
                  size="sm"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        {/* Pagination */}
        {students.length > studentsPerPage && (
          <Group mt="md" justify="center">
            <Button onClick={handlePrevPage} disabled={currentPage === 1} color="#663399" variant="outline">
              Previous
            </Button>
            <Text>Page {currentPage} of {totalPages}</Text>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages} color="#663399" variant="outline">
              Next
            </Button>
          </Group>
        )}
      </Stack>
    </Container>
  );
}

