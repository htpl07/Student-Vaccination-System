// // src/pages/Dashboard.tsx

// import { Card, Container, Text, Title, SimpleGrid, Stack, Paper, Progress, Group } from '@mantine/core';
// import { useEffect, useState } from 'react';
// import api from '../services/api';
// import { IconCalendarEvent, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

// export default function Dashboard() {
//   const [data, setData] = useState<any>(null);
//   const [upcomingDrives, setUpcomingDrives] = useState<any[]>([]);
//   const [showDrives, setShowDrives] = useState(false);

//   useEffect(() => {
//     // Fetch dashboard stats
//     api.get('/dashboard')
//       .then(res => setData(res.data))
//       .catch(() => setData(null));

//     // Fetch upcoming drives
//     api.get('/drives/upcoming')
//       .then(res => setUpcomingDrives(res.data))
//       .catch(() => setUpcomingDrives([]));
//   }, []);

//   if (!data) return <Text style={{ textAlign: 'center' }} mt="xl">Loading...</Text>;

//   return (
//     <Container size="lg" pt="xl">
//       <Title order={2} mb="xl">Dashboard</Title>

//       <Stack gap="md">
//         {/* Health Check Section */}
//         <Paper withBorder p="md" shadow="sm" bg="#F5F5FF">
//           <Title order={4} mb="sm">How is your health?</Title>
//           <Text fw={500}>Are you vaccinated?</Text>
//         </Paper>

//         <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg" mt="xl">
//           <Card shadow="md" padding="lg" radius="md" withBorder>
//             <Title order={4} style={{ color: 'purple' }}>Total Students Registered</Title>
//             <Text size="xl" fw={700}>{data.total_students}</Text>
//           </Card>

//           <Card shadow="md" padding="lg" radius="md" withBorder>
//             <Title order={4} style={{ color: 'purple' }}>Vaccinated Students</Title>
//             <Text size="xl" fw={700}>{data.vaccinated_students}</Text>
//           </Card>

//           <Card shadow="md" padding="lg" radius="md" withBorder>
//             <Title order={4} style={{ color: 'purple' }}>Vaccination Rate</Title>
//             <Progress value={data.vaccinated_percentage} size="lg" mt="sm" />
//             <Text size="xl" fw={700} mt="sm">{data.vaccinated_percentage}%</Text>
//           </Card>

//           <Card
//             shadow="md"
//             padding="lg"
//             radius="md"
//             withBorder
//             style={{
//               cursor: 'pointer',
//               border: '#800080',
//               backgroundColor: showDrives ? '#E6E6FA' : 'Lavender',
//             }}
//             onClick={() => setShowDrives(!showDrives)}
//           >
//             <Group justify="space-between">
//               <Title order={4} style={{ color: '#800080' }}>
//                 <Group gap="sm">
//                   <IconCalendarEvent size={24} />
//                   <span>Upcoming Drives</span>
//                   <Text size="xs" c="black">Drives in the next 30 days</Text>
//                 </Group>
//               </Title>
//               {showDrives ? <IconChevronUp /> : <IconChevronDown />}
//             </Group>
//             <Text size="xl" fw={700} mt="sm">{upcomingDrives.length}</Text>
//           </Card>
//         </SimpleGrid>

//         {/* Upcoming Drives Section */}
//         {showDrives && (
//           <Paper withBorder p="md" shadow="sm" mt="xl" style={{ borderLeft: '4px solid #800080' }}>
//             <Title order={4} mb="md" style={{ color: '#800080' }}>Upcoming Vaccination Drives</Title>
//             <Text size="xs" c="dimmed">Drives in the next 30 days</Text>

//             {upcomingDrives.length === 0 ? (
//               <Text mt="md" ta="center" fw={500} c="black">
//                 No upcoming drives.
//               </Text>
//             ) : (
//               <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="md">
//                 {upcomingDrives.map((drive: any) => (
//                   <Card
//                     key={drive.id}
//                     shadow="sm"
//                     padding="lg"
//                     radius="md"
//                     withBorder
//                     style={{ borderTop: '3px solid #800080' }}
//                   >
//                     <Title order={5}>{drive.vaccine_name}</Title>
//                     <Text mt="sm"><b>Date:</b> {new Date(drive.drive_date).toLocaleDateString()}</Text>
//                     <Text><b>Doses Available:</b> {drive.doses_available}</Text>
//                     <Text><b>For Classes:</b> {drive.applicable_classes}</Text>
//                   </Card>
//                 ))}
//               </SimpleGrid>
//             )}
//           </Paper>
//         )}
//       </Stack>
//     </Container>
//   );
// }

// src/pages/Dashboard.tsx

import { Card, Container, Text, Title, SimpleGrid, Stack, Paper, Progress, Group, Button } from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { IconCalendarEvent, IconChevronDown, IconChevronUp, IconEdit } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';


export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [upcomingDrives, setUpcomingDrives] = useState<any[]>([]);
  const [showDrives, setShowDrives] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dashboard stats
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setData(null));

    // Fetch upcoming drives
    api.get('/drives/upcoming')
      .then(res => setUpcomingDrives(res.data))
      .catch(() => setUpcomingDrives([]));
  }, []);

  const handleEditFromDashboard = (drive: any) => {
    navigate('/drives', {
      state: {
        driveToEdit: {
          ...drive,
          drive_date: drive.drive_date.split('T')[0], // Format date for input
          doses_available: drive.doses_available?.toString() || ''
        }
      }
    });
  };

  if (!data) return <Text style={{ textAlign: 'center' }} mt="xl">Loading...</Text>;

  return (
    <Container size="lg" pt="xl">
      <Title order={2} mb="xl">Dashboard</Title>

      <Stack gap="md">
        {/* Health Check Section */}
        <Paper withBorder p="md" shadow="sm" bg="#F5F5FF">
          <Title order={4} mb="sm">How is your health?</Title>
          <Text fw={500}>Are you vaccinated?</Text>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg" mt="xl">
          <Card shadow="md" padding="lg" radius="md" withBorder>
            <Title order={4} style={{ color: 'purple' }}>Total Students Registered</Title>
            <Text size="xl" fw={700}>{data.total_students}</Text>
          </Card>

          <Card shadow="md" padding="lg" radius="md" withBorder>
            <Title order={4} style={{ color: 'purple' }}>Vaccinated Students</Title>
            <Text size="xl" fw={700}>{data.vaccinated_students}</Text>
          </Card>

          <Card shadow="md" padding="lg" radius="md" withBorder>
            <Title order={4} style={{ color: 'purple' }}>Vaccination Rate</Title>
            <Progress value={data.vaccinated_percentage} size="lg" mt="sm" />
            <Text size="xl" fw={700} mt="sm">{data.vaccinated_percentage}%</Text>
          </Card>

          <Card
            shadow="md"
            padding="lg"
            radius="md"
            withBorder
            style={{
              cursor: 'pointer',
              border: '#800080',
              backgroundColor: showDrives ? '#E6E6FA' : 'Lavender',
            }}
            onClick={() => setShowDrives(!showDrives)}
          >
            <Group justify="space-between">
              <Title order={4} style={{ color: '#800080' }}>
                <Group gap="sm">
                  <IconCalendarEvent size={24} />
                  <span>Upcoming Drives</span>
                  <Text size="xs" c="black">Drives in the next 30 days</Text>
                </Group>
              </Title>
              {showDrives ? <IconChevronUp /> : <IconChevronDown />}
            </Group>
            <Text size="xl" fw={700} mt="sm">{upcomingDrives.length}</Text>
          </Card>
        </SimpleGrid>

        {/* Upcoming Drives Section */}
        {showDrives && (
          <Paper withBorder p="md" shadow="sm" mt="xl" style={{ borderLeft: '4px solid #800080' }}>
            <Title order={4} mb="md" style={{ color: '#800080' }}>Upcoming Vaccination Drives</Title>
            <Text size="xs" c="dimmed">Drives in the next 30 days</Text>

            {upcomingDrives.length === 0 ? (
              <Text mt="md" ta="center" fw={500} c="black">
                No upcoming drives.
              </Text>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="md">
                {upcomingDrives.map((drive: any) => (
                  <Card
                  key={drive.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ borderTop: '3px solid #800080', position: 'relative' }}
                >
                  <Title order={5}>{drive.vaccine_name}</Title>
                  <Text mt="sm"><b>Date:</b> {new Date(drive.drive_date).toLocaleDateString()}</Text>
                  <Text><b>Doses Available:</b> {drive.doses_available}</Text>
                  <Group justify="space-between" mt="xs">
                  <Text mb={0}>
                    <b>For Classes:</b> {drive.applicable_classes}
                  </Text>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    color="gray"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFromDashboard(drive);
                    }}
                    px={4}
                  >
                    <IconEdit size={14} />
                  </Button>
                </Group>
                </Card>
                ))}
              </SimpleGrid>
            )}
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

