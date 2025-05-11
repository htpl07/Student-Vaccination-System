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
  Modal,
  ActionIcon,
  Box,
  Menu,
  Flex,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { IconTrash, IconVaccine, IconVaccineOff } from '@tabler/icons-react';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [popupOpened, setPopupOpened] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const fetchStudents = (params = {}) => {
    api.get('/students', { params }).then(res => {
      // Sort students by ID in ascending order
      const sortedStudents = res.data.sort((a: any, b: any) => a.id - b.id);
      setStudents(sortedStudents);
    });
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

  const handleVaccinate = (studentId: number, driveId: number) => {
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

  // Get available drives for a student (excluding already vaccinated ones)
  const getAvailableDrives = (student: any) => {
    return drives.filter(drive => 
      !student.vaccinated || 
      (student.vaccinated && student.vaccination_details?.id !== drive.id)
    );
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
          {currentStudents.map((student) => (
            <Card key={student.id} withBorder shadow="sm" padding="lg" radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600} size="lg">{student.name}</Text>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => handleDelete(student.id)}
                    size="sm"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              
                <Text c="dimmed">Class: {student.student_class}</Text>

                <Group>
                  <Text>Status:</Text>

                  {/* Minimal status indicator */}
                  <Text size="sm" c={student.vaccinated ? 'green' : 'red'} mb="sm">
                    {student.vaccinated ? (
                      <Flex align="center" gap={4}>
                        <IconVaccine size={14} /> Vaccinated
                      </Flex>
                    ) : (
                      <Flex align="center" gap={4}>
                        <IconVaccineOff size={14} /> Not vaccinated
                      </Flex>
                    )}
                  </Text>
                </Group>

                {student.vaccinated && student.vaccination_details && (
                  <Box bg="gray.0" p="sm" style={{ borderRadius: '6px' }}>
                    <Text size="sm" fw={500}>Current Vaccination:</Text>
                    <Text size="sm">{student.vaccination_details.vaccine_name}</Text>
                    <Text size="sm" c="dimmed">
                      {new Date(student.vaccination_details.drive_date).toLocaleDateString()}
                    </Text>
                  </Box>
                )}

                {getAvailableDrives(student).length > 0 && (
                  <>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <Button 
                          variant="light" 
                          color="#663399" 
                          leftSection={<IconVaccine size={14} />}
                          fullWidth
                        >
                          Vaccinate Student
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {getAvailableDrives(student).map((drive) => (
                          <Menu.Item 
                            key={drive.id}
                            onClick={() => handleVaccinate(student.id, drive.id)}
                            leftSection={<IconVaccine size={14} />}
                          >
                            {drive.vaccine_name}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  </>
                )}
              </Stack>
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