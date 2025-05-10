// // src/pages/UpcomingDrives.tsx
import { Card, Container, SimpleGrid, Text, Title, Skeleton, Alert } from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function UpcomingDrives() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/drives/upcoming')
      .then(res => {
        setDrives(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load upcoming drives.');
        setLoading(false);
      });
  }, []);

  return (
    <Container>
      <Title order={2} mb="lg">Upcoming Drives</Title>
      
      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height={200} radius="md" />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      ) : drives.length === 0 ? (
        <Text>No upcoming drives scheduled.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {drives.map((d) => (
            <Card key={d.id} withBorder shadow="sm">
              <Text><strong>Vaccine:</strong> {d.vaccine_name}</Text>
              <Text><strong>Date:</strong> {new Date(d.drive_date).toLocaleDateString()}</Text>
              <Text><strong>Doses:</strong> {d.doses_available}</Text>
              <Text><strong>Classes:</strong> {d.applicable_classes}</Text>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

